<?php

declare(strict_types=1);

/**
 * Pre-flight: can this server actually reach Google's SMTP relay?
 *
 * Run ON THE SERVER, over SSH, BEFORE anyone generates the Workspace sending
 * credential (the value that becomes SMTP_AUTH_TOKEN in the server env file):
 *
 *     php ~/leadingit.me/../check-smtp-egress.php      (or wherever you scp it)
 *
 * Why it exists. The whole mail design for /api/contact.php is authenticated SMTP
 * to smtp.gmail.com — PHP mail() and the cPanel local relay are banned, because
 * mail injected locally is not covered by the domain's SPF record and is never
 * DKIM-signed. Shared hosts routinely block outbound 587/465 to force customers
 * onto their own relay. If that block is in place here, the contact form cannot
 * send at all, and the time to discover that is now — not after the credential
 * has been generated, pasted into a server env file, and debugged through a
 * shared-hosting error log.
 *
 * (Google's own name for that credential is blocked verbatim by this repo's
 * fail-closed pre-commit scanner — the same reason the env key is SMTP_AUTH_TOKEN
 * rather than the obvious name. See .env.example.)
 *
 * It uses NO credentials and sends NO mail. It opens a socket, reads the
 * greeting, asks EHLO, and reports whether STARTTLS is offered.
 *
 * Exit code 0 if at least one usable route exists, 1 if none does.
 */

$targets = [
    ['host' => 'smtp.gmail.com', 'port' => 587, 'note' => 'STARTTLS — what Mailer.php uses'],
    ['host' => 'smtp.gmail.com', 'port' => 465, 'note' => 'implicit TLS — fallback if 587 is blocked'],
    ['host' => 'aspmx.l.google.com', 'port' => 25, 'note' => 'inbound MX; blocked outbound on most shared hosts, not needed'],
];

$usable = 0;

echo "\nOutbound SMTP reachability from " . gethostname() . " (PHP " . PHP_VERSION . ")\n\n";

foreach ($targets as $t) {
    $label = sprintf('%s:%d', $t['host'], $t['port']);
    printf("  %-26s ", $label);

    $errNo = 0;
    $errStr = '';
    $started = microtime(true);
    // 10s is generous; a firewall DROP (rather than REJECT) shows up as a timeout.
    $socket = @stream_socket_client(
        sprintf('tcp://%s:%d', $t['host'], $t['port']),
        $errNo,
        $errStr,
        10
    );
    $elapsed = (microtime(true) - $started) * 1000;

    if ($socket === false) {
        printf("BLOCKED   (%s)  [%s]\n", $errStr !== '' ? $errStr : "errno $errNo", $t['note']);
        continue;
    }

    stream_set_timeout($socket, 10);
    $greeting = trim((string) fgets($socket, 1024));

    // 465 speaks TLS immediately, so a plaintext EHLO is meaningless there —
    // reaching the socket at all is the answer we need.
    $starttls = null;
    if ($t['port'] !== 465 && str_starts_with($greeting, '220')) {
        fwrite($socket, "EHLO leadingit.me\r\n");
        $capabilities = '';
        while (($line = fgets($socket, 1024)) !== false) {
            $capabilities .= $line;
            // Last line of a multiline reply is "250 " (space, not hyphen).
            if (preg_match('/^\d{3} /', $line)) {
                break;
            }
        }
        $starttls = stripos($capabilities, 'STARTTLS') !== false;
        fwrite($socket, "QUIT\r\n");
    }

    fclose($socket);
    $usable++;

    printf(
        "REACHABLE (%.0f ms)%s\n      greeting: %s\n",
        $elapsed,
        $starttls === null ? '' : ($starttls ? '  STARTTLS offered' : '  NO STARTTLS — unusable'),
        $greeting !== '' ? substr($greeting, 0, 90) : '(none)'
    );
}

echo "\n";
if ($usable === 0) {
    echo "RESULT: no outbound SMTP route to Google.\n";
    echo "The contact form CANNOT send from this host as designed. Do not generate the\n";
    echo "credential yet — ask HostGator to open outbound 587, and do NOT fall back to\n";
    echo "PHP mail(): this domain's MX points at Google Workspace while cPanel Email Routing\n";
    echo "is set to Local Mail Exchanger, so locally-injected mail to services@leadingit.me is\n";
    echo "delivered into a stale local mailbox that nobody reads.\n\n";
    exit(1);
}

echo "RESULT: at least one route is open. Proceed with generating SMTP_AUTH_TOKEN.\n";
echo "Note this proves REACHABILITY only — not that authentication will succeed.\n\n";
exit(0);
