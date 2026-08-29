<?php

declare(strict_types=1);

/**
 * POST /api/enquiry.php — the leadingit.me contact endpoint.
 *
 * Order of operations is deliberate and cheapest-first, so an obvious bot never
 * costs a Cloudflare API round trip or a rate-limit slot:
 *
 *   method -> origin -> parse -> honeypot -> time-trap -> rate limit ->
 *   Turnstile -> field validation -> LOG -> notify -> acknowledge -> respond
 *
 * The log write sits before both sends on purpose: an enquiry that is recorded
 * but not emailed is recoverable, an enquiry that is emailed but not recorded
 * is not, and one that is neither is a lost customer. See §"Failure posture".
 *
 * ## Failure posture
 *
 * This endpoint never reports success it cannot stand behind. If the
 * notification mail fails, the visitor is told plainly that it failed and is
 * given the direct email address and WhatsApp link, even though the submission
 * IS safely on disk — because a log file nobody is watching is not a delivered
 * enquiry, and `/contact/`'s pre-Phase-5 behaviour (an honest mailto draft,
 * never a fake "message sent") set the standard this must not regress from.
 * The acknowledgement is the one exception: it is best-effort, and its failure
 * never turns a received enquiry into an error for the visitor.
 *
 * ## What is NOT here, and why
 *
 * No ticket creation. OPEN-QUESTIONS #5 is unresolved — nobody has confirmed
 * whether services@leadingit.me is a Workspace mailbox, a Group, or
 * Freshdesk-routed (the `services` subdomain CNAMEs to Freshdesk). Building
 * ticket logic against an unconfirmed routing path would be assuming a business
 * fact. The mail body is written to read correctly either way. What would
 * change if it turns out to be Freshdesk is scoped in
 * docs/12-PROVENANCE/phase5-endpoint.md.
 */

/**
 * This endpoint answers JSON and nothing else, so no PHP diagnostic may ever
 * reach the response body. On the first real execution (Phase 7, PHP 8.5.9) a
 * single Deprecated notice from curl_close() in Turnstile.php was printed ahead
 * of the JSON: every response became unparseable by the front end AND the
 * client was handed the absolute server path. The notice is fixed at source;
 * these two lines make the CLASS of failure impossible on any host config,
 * because the shared-hosting PHP settings are not ours to rely on. Diagnostics
 * still reach error_log, and the endpoint reports its own faults as JSON.
 */
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ob_start();

/**
 * Tracks whether a JSON reply has already been written, so the shutdown handler
 * below can tell "finished normally" from "died before answering".
 */
$GLOBALS['contact_responded'] = false;

/**
 * Last-resort JSON reply for a fatal that kills the request before
 * contact_respond() can run — a missing require, a parse error in a dependency
 * on an older PHP, an allocation failure mid-send. Without this the buffer is
 * flushed at shutdown with no Content-Type and no status, and the browser gets
 * an unparseable body: the same visitor-facing symptom the display_errors fix
 * was added to remove. Registered BEFORE the requires, because those are
 * exactly what it has to survive.
 */
register_shutdown_function(static function (): void {
    if (($GLOBALS['contact_responded'] ?? false) === true) {
        return;
    }
    $fatal = error_get_last();
    if ($fatal === null || !in_array($fatal['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    error_log('enquiry.php fatal: ' . $fatal['message'] . ' in ' . $fatal['file'] . ':' . $fatal['line']);
    while (ob_get_level() > 0 && @ob_end_clean()) {
        // discard
    }
    if (ob_get_level() > 0) {
        @ob_clean();
    }
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8', true);
        header('Cache-Control: no-store', true);
        header('X-Robots-Tag: noindex, nofollow', true);
    }
    // Deliberately says nothing about the fault: the detail is in error_log.
    echo json_encode([
        'status' => 'server_error',
        'message' => 'The contact endpoint is unavailable. Please email services@leadingit.me or message us on WhatsApp.',
    ], JSON_UNESCAPED_SLASHES);
});

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Storage.php';
require_once __DIR__ . '/lib/Spam.php';
require_once __DIR__ . '/lib/RateLimiter.php';
require_once __DIR__ . '/lib/Turnstile.php';
require_once __DIR__ . '/lib/Mailer.php';

header('X-Robots-Tag: noindex, nofollow', true);
header('Content-Type: application/json; charset=utf-8', true);
header('Referrer-Policy: no-referrer', true);
header('X-Content-Type-Options: nosniff', true);
header('Cache-Control: no-store', true);

/**
 * Single exit point. `status` is the machine-readable key the front end
 * switches its aria-live announcement on; `message` is human-readable fallback
 * copy only — the front end owns the visitor-facing wording.
 */
function contact_respond(int $httpStatus, string $status, string $message, array $extra = []): never
{
    // Discard anything that reached an output buffer before us. Nothing in this
    // endpoint prints, but a notice or warning raised inside PHPMailer or any
    // future dependency would otherwise be prepended to the body and break
    // JSON.parse() in the browser — the exact failure observed on first
    // execution. The buffer is opened at the top of this file.
    //
    // The return value of ob_end_clean() is the loop's terminating condition and
    // MUST be tested. It returns false WITHOUT decrementing the level when the
    // topmost buffer is not removable — one installed by a host output_handler,
    // an auto_prepend_file or an APM agent. `while (ob_get_level() > 0)` alone
    // therefore spins until max_execution_time on such a host, writing one
    // Notice per iteration into error_log: a disk-fill on shared hosting, on a
    // path where the enquiry mail has ALREADY been sent. QA reproduced it.
    while (ob_get_level() > 0 && @ob_end_clean()) {
        // discard and continue
    }
    // A buffer that refused to close still gets its contents cleared, so stray
    // output is dropped even where the buffer itself cannot be removed.
    if (ob_get_level() > 0) {
        @ob_clean();
    }

    $GLOBALS['contact_responded'] = true;
    http_response_code($httpStatus);
    echo json_encode(['status' => $status, 'message' => $message] + $extra, JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Cloudflare sits in front of this origin, so REMOTE_ADDR is a Cloudflare edge
 * IP and rate-limiting on it would bucket the entire internet together.
 * CF-Connecting-IP is the real client.
 *
 * Documented limitation: this header is spoofable by anyone who can reach the
 * origin directly, bypassing Cloudflare. That is accepted rather than hidden —
 * the rate limit is a cheap secondary control layered UNDER Turnstile, which is
 * the actual bot defence and cannot be bypassed this way. Locking it down
 * properly means restricting origin access to Cloudflare's IP ranges at the
 * host, which is a deploy-time concern (Phase 6), not an application one.
 */
function contact_client_ip(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'REMOTE_ADDR'] as $key) {
        $value = $_SERVER[$key] ?? '';
        if (is_string($value) && $value !== '' && filter_var($value, FILTER_VALIDATE_IP)) {
            return $value;
        }
    }
    return 'unknown';
}

/** Collapses CR/LF and trims — used on every field before it reaches a header or a log line. */
function contact_clean(mixed $value, int $maxLength): string
{
    if (!is_scalar($value)) {
        return '';
    }
    $s = trim((string) $value);
    $s = str_replace(["\r\n", "\r"], "\n", $s);
    if (function_exists('mb_substr')) {
        return mb_substr($s, 0, $maxLength);
    }
    return substr($s, 0, $maxLength);
}

// ---------------------------------------------------------------- 1. method
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST', true);
    contact_respond(405, 'method_not_allowed', 'This endpoint accepts POST only.');
}

// ---------------------------------------------------------------- 2. config
try {
    $config = contact_config();
} catch (Throwable $e) {
    // Misconfiguration must never leak the resolved path or any value to the
    // client; it is a server fault and is reported as one.
    error_log('enquiry.php config error: ' . $e->getMessage());
    contact_respond(500, 'server_error', 'The contact endpoint is not configured correctly.');
}

// ---------------------------------------------------------------- 3. origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (is_string($origin) && $origin !== '' && rtrim($origin, '/') !== rtrim($config['allowed_origin'], '/')) {
    contact_respond(403, 'forbidden', 'Cross-origin submissions are not accepted.');
}

// ---------------------------------------------------------------- 4. parse
$raw = file_get_contents('php://input');
$input = [];
$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
if (str_contains($contentType, 'application/json')) {
    $decoded = json_decode((string) $raw, true);
    $input = is_array($decoded) ? $decoded : [];
} else {
    $input = $_POST;
}
if ($input === []) {
    contact_respond(400, 'invalid', 'No form data was received.');
}

$ip = contact_client_ip();
$submittedAt = gmdate('c');
$reference = strtoupper(bin2hex(random_bytes(4)));

// Cleaned up-front, BEFORE any rejection path, so every log line can carry the
// actual submission. This used to happen at validation (step 9), which meant the
// honeypot and time-trap paths logged `{ref, at, ip, outcome}` and nothing else —
// so a false positive on a real enquiry was destroyed, not merely rejected, while
// the visitor was told it had been received. The comment on the honeypot branch
// claimed the trip was "recoverable from the log"; it was not. It is now.
$name = contact_clean($input['name'] ?? '', 120);
$email = contact_clean($input['email'] ?? '', 254);
$company = contact_clean($input['company'] ?? '', 160);
$message = contact_clean($input['message'] ?? '', 5000);

/** The submitted content, for logging on any path including a rejection. */
$submittedFields = [
    'name' => $name,
    'email' => $email,
    'company' => $company,
    'message' => $message,
];

$storageDir = $config['storage_dir'];
try {
    Storage::ensureDir($storageDir);
} catch (Throwable $e) {
    error_log('enquiry.php storage error: ' . $e->getMessage());
    contact_respond(500, 'server_error', 'The contact endpoint could not open its storage.');
}
$logFile = $storageDir . '/submissions.log';

/** Appends one JSON line. Used for accepted AND rejected submissions. */
$logLine = static function (string $outcome, array $fields) use ($logFile, $ip, $submittedAt, $reference): void {
    $record = [
            'ref' => $reference,
            'at' => $submittedAt,
            'ip' => $ip,
            'outcome' => $outcome,
        ] + $fields;
    try {
        Storage::appendLine($logFile, (string) json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    } catch (Throwable $e) {
        // Logging must never take down a live submission.
        error_log('enquiry.php log write failed: ' . $e->getMessage());
    }
};

// ------------------------------------------------------------- 5. honeypot
if (Spam::honeypotTripped($input)) {
    $logLine('spam_honeypot', $submittedFields);
    // Deliberately answers 200 with the ordinary success shape. Telling a bot
    // which control caught it is how the next version of that bot gets past it.
    //
    // The real-user risk is accepted and mitigated rather than ignored: the
    // field name (`hp_note`) matches no browser autofill heuristic, and every
    // trip is logged with outcome `spam_honeypot` **and the full submitted
    // content**, so a false positive is recoverable from the log rather than
    // silently destroyed. That last part is load-bearing and was missing in the
    // first version of this file: without the fields, answering 200 to a real
    // person meant telling them it had been received while discarding it. If
    // you ever change `$submittedFields` back to `[]` here, this branch becomes
    // indefensible and must return an error instead.
    contact_respond(200, 'success', 'Thank you — your enquiry has been received.');
}

// ------------------------------------------------------------ 6. time-trap
$timeTrap = Spam::timeTrapResult($input, $config['time_trap_min_ms'], $config['time_trap_max_ms']);
if ($timeTrap === 'missing') {
    $logLine('invalid_timestamp', $submittedFields);
    contact_respond(400, 'invalid', 'The form did not submit correctly. Please reload the page and try again.');
}
if ($timeTrap === 'too_fast') {
    $logLine('spam_too_fast', $submittedFields);
    contact_respond(200, 'success', 'Thank you — your enquiry has been received.');
}
if ($timeTrap === 'too_stale') {
    // NOT treated as spam: the overwhelmingly likely cause is a real person who
    // left the tab open. Silently swallowing this would lose a genuine enquiry,
    // so it asks for a resubmit instead.
    $logLine('stale_form', $submittedFields);
    contact_respond(400, 'stale', 'This form has been open for a while. Please reload the page and send it again.');
}

// ----------------------------------------------------------- 7. rate limit
$limiter = new RateLimiter($storageDir, $config['rate_limit_max'], $config['rate_limit_window_s']);
if (!$limiter->allow($ip)) {
    $logLine('rate_limited', $submittedFields);
    contact_respond(429, 'rate_limited', 'Too many enquiries from this connection. Please try again shortly, or message us on WhatsApp.');
}

// ------------------------------------------------------------ 8. Turnstile
$token = contact_clean($input['turnstile_token'] ?? ($input['cf-turnstile-response'] ?? ''), 4096);
if ($token === '') {
    $logLine('turnstile_missing', $submittedFields);
    contact_respond(403, 'captcha', 'Please complete the verification and try again.');
}
$turnstile = new Turnstile($config['turnstile_verify_token']);
if (!$turnstile->verify($token, $ip)) {
    $logLine('turnstile_failed', $submittedFields);
    contact_respond(403, 'captcha', 'Verification failed. Please reload the page and try again.');
}

// ----------------------------------------------------------- 9. validation
$errors = [];
if ($name === '') {
    $errors['name'] = 'Please tell us your name.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please give us an email address we can reply to.';
}
if ($message === '') {
    $errors['message'] = 'Please tell us what you need.';
} elseif (mb_strlen($message) < 10) {
    $errors['message'] = 'Please add a little more detail so we can reply usefully.';
}
if ($errors !== []) {
    $logLine('validation_failed', ['fields' => array_keys($errors)]);
    contact_respond(400, 'invalid', 'Some details need correcting.', ['errors' => $errors]);
}

$submission = [
    'name' => $name,
    'email' => $email,
    'company' => $company,
    'message' => $message,
    'ip' => $ip,
    'submitted_at' => $submittedAt,
    'reference' => $reference,
];

// --------------------------------------------------- 10. log before sending
$logLine('received', $submittedFields);

// ------------------------------------------------------------- 11. notify
$mailer = new Mailer($config);
$mailError = null;
$notified = $mailer->sendNotification($submission, $mailError);

if (!$notified) {
    error_log('enquiry.php notification failed [' . $reference . ']: ' . (string) $mailError);
    $logLine('mail_failed', ['error' => (string) $mailError]);
    // Honest failure. The submission is on disk under $reference and is
    // recoverable, but nobody is watching that file, so this does NOT report
    // success. The visitor gets the two channels that definitely work.
    contact_respond(502, 'error', 'We could not send your enquiry just now. Please email services@leadingit.me or message us on WhatsApp.', [
        'reference' => $reference,
    ]);
}

// -------------------------------------------------------- 12. acknowledge
$ackError = null;
if (!$mailer->sendAcknowledgement($submission, $ackError)) {
    // Best-effort by design: the enquiry reached Leading IT, which is what the
    // visitor actually needed. Recorded so a pattern of failures is visible.
    error_log('enquiry.php acknowledgement failed [' . $reference . ']: ' . (string) $ackError);
    $logLine('ack_failed', ['error' => (string) $ackError]);
}

// ------------------------------------------------------------- 13. respond
contact_respond(200, 'success', 'Thank you — your enquiry has been received.', ['reference' => $reference]);
