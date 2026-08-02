<?php

declare(strict_types=1);

/**
 * Resolves runtime configuration for /api/contact.php from a KEY=VALUE file
 * that lives OUTSIDE the web root. This file only locates, parses and
 * validates that config — it holds no secret value itself, and nothing here
 * is ever safe to log verbatim (see contact_config(), which returns the
 * decoded values).
 *
 * cPanel docroot placement for the leadingit.me addon domain is UNRESOLVED
 * (docs/OPEN-QUESTIONS.md #10 — sibling of public_html vs nested inside it),
 * so the env-file path is resolved from an explicit override first, then
 * from candidates that cover both possible layouts. Once #10 is answered:
 * delete the losing candidate (or better, just set CONTACT_ENV_PATH on the
 * server and stop relying on candidates at all) — nothing else in this file
 * needs to change.
 */

require_once __DIR__ . '/lib/Env.php';

/**
 * Absolute path to this script's directory === public/api under whichever
 * docroot Apache actually serves. Used both to build candidate secret paths
 * and, in contact_assert_outside_webroot(), to prove a resolved storage path
 * is NOT inside it.
 */
function contact_api_dir(): string
{
    return __DIR__;
}

function contact_resolve_env_path(): string
{
    $override = getenv('CONTACT_ENV_PATH');
    if ($override !== false && $override !== '' && is_file($override)) {
        return $override;
    }

    $apiDir = contact_api_dir();

    // __DIR__ here is .../<docroot>/api. Candidates walk upward looking for a
    // sibling directory named "leadingit-secrets" that sits OUTSIDE any
    // web-served tree, covering both possible addon-domain layouts:
    $candidates = [
        // Layout A — addon docroot is a subdirectory INSIDE the account's
        // public_html (today's default on HostGator addon domains, until
        // OQ #10 is answered): public_html/<addon>/api -> public_html/../leadingit-secrets
        dirname($apiDir, 3) . '/leadingit-secrets/contact.env',
        // Layout B — addon docroot promoted to a SIBLING of public_html (the
        // fix OQ #10 asks about): <account-root>/<addon>/api -> <account-root>/leadingit-secrets
        dirname($apiDir, 2) . '/leadingit-secrets/contact.env',
    ];

    foreach ($candidates as $candidate) {
        if (is_file($candidate)) {
            return $candidate;
        }
    }

    throw new RuntimeException(
        'contact.php: no env file found. Set the CONTACT_ENV_PATH server environment ' .
        'variable to an absolute path outside the web root, or place a populated copy of ' .
        '.env.example at leadingit-secrets/contact.env next to (Layout A) or beside ' .
        '(Layout B) public_html — see docs/12-PROVENANCE/phase5-endpoint.md.'
    );
}

/**
 * Throws unless $path is provably outside $webRoot. Walks up to the nearest
 * EXISTING ancestor of $path before calling realpath(), so the guard cannot
 * be defeated by pointing CONTACT_STORAGE_DIR at a not-yet-created directory
 * inside public/ — the ancestor-of check still catches it once any parent
 * segment exists. Fails closed: if realpath() cannot resolve either side, the
 * relationship cannot be proven safe, so this rejects rather than assumes.
 */
function contact_assert_outside_webroot(string $path, string $webRoot): void
{
    $probe = $path;
    while (!file_exists($probe)) {
        $parent = dirname($probe);
        if ($parent === $probe) {
            break; // reached filesystem root without finding an existing ancestor
        }
        $probe = $parent;
    }

    $realProbe = realpath($probe);
    $realWebRoot = realpath($webRoot);

    if ($realProbe === false || $realWebRoot === false) {
        throw new RuntimeException(
            'contact.php: could not resolve a real path for "' . $path . '" or the web root ' .
            'to verify it is outside it; refusing to use it for secrets/logs.'
        );
    }

    if ($realProbe === $realWebRoot || strpos($realProbe . '/', $realWebRoot . '/') === 0) {
        throw new RuntimeException(
            'contact.php: storage path "' . $path . '" resolves inside the web root (' .
            $realWebRoot . '); refusing to store secrets/logs where HTTP can reach them.'
        );
    }
}

/**
 * @return array{
 *   smtp_host: string, smtp_port: int, smtp_user: string, smtp_auth_token: string,
 *   turnstile_verify_token: string, contact_to: string, storage_dir: string,
 *   rate_limit_max: int, rate_limit_window_s: int, time_trap_min_ms: int,
 *   time_trap_max_ms: int, allowed_origin: string
 * }
 */
function contact_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $envPath = contact_resolve_env_path();
    $vars = Env::load($envPath);

    $required = [
        'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_AUTH_TOKEN',
        'TURNSTILE_VERIFY_TOKEN', 'CONTACT_TO_EMAIL',
    ];
    foreach ($required as $key) {
        if (!isset($vars[$key]) || $vars[$key] === '') {
            throw new RuntimeException("contact.php: required env var $key is missing or empty in $envPath");
        }
    }

    // Rate-limit and submission-log storage defaults to a sibling of the env
    // file itself (same outside-web-root guarantee) but can be pointed
    // elsewhere independently via CONTACT_STORAGE_DIR.
    $storageDir = getenv('CONTACT_STORAGE_DIR');
    if ($storageDir === false || $storageDir === '') {
        $storageDir = dirname($envPath) . '/storage';
    }
    contact_assert_outside_webroot($storageDir, dirname(contact_api_dir()));

    $config = [
        'smtp_host' => $vars['SMTP_HOST'],
        'smtp_port' => (int) $vars['SMTP_PORT'],
        'smtp_user' => $vars['SMTP_USER'],
        'smtp_auth_token' => $vars['SMTP_AUTH_TOKEN'],
        'turnstile_verify_token' => $vars['TURNSTILE_VERIFY_TOKEN'],
        'contact_to' => $vars['CONTACT_TO_EMAIL'],
        'storage_dir' => rtrim($storageDir, '/'),
        'rate_limit_max' => isset($vars['RATE_LIMIT_MAX']) && $vars['RATE_LIMIT_MAX'] !== ''
            ? (int) $vars['RATE_LIMIT_MAX'] : 5,
        'rate_limit_window_s' => isset($vars['RATE_LIMIT_WINDOW_S']) && $vars['RATE_LIMIT_WINDOW_S'] !== ''
            ? (int) $vars['RATE_LIMIT_WINDOW_S'] : 900,
        'time_trap_min_ms' => isset($vars['TIME_TRAP_MIN_MS']) && $vars['TIME_TRAP_MIN_MS'] !== ''
            ? (int) $vars['TIME_TRAP_MIN_MS'] : 3000,
        'time_trap_max_ms' => isset($vars['TIME_TRAP_MAX_MS']) && $vars['TIME_TRAP_MAX_MS'] !== ''
            ? (int) $vars['TIME_TRAP_MAX_MS'] : 7200000,
        'allowed_origin' => isset($vars['CONTACT_ALLOWED_ORIGIN']) && $vars['CONTACT_ALLOWED_ORIGIN'] !== ''
            ? $vars['CONTACT_ALLOWED_ORIGIN'] : 'https://leadingit.me',
    ];

    return $config;
}
