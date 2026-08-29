<?php

declare(strict_types=1);

/**
 * Server-side verification of a Cloudflare Turnstile token against
 * https://challenges.cloudflare.com/turnstile/v0/siteverify. The client-side
 * widget (site key, not a secret) posts its response in the standard
 * `cf-turnstile-response` field — that name is Cloudflare's own default for
 * the implicit `<div class="cf-turnstile">` render, so no custom field-name
 * contract has to be agreed with frontend-engineer.
 */
final class Turnstile
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function __construct(private readonly string $secretKey)
    {
    }

    public function verify(string $token, string $remoteIp): bool
    {
        if ($token === '') {
            return false;
        }

        $payload = http_build_query([
            'secret' => $this->secretKey,
            'response' => $token,
            'remoteip' => $remoteIp,
        ]);

        $result = null;
        if (function_exists('curl_init')) {
            $ch = curl_init(self::VERIFY_URL);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 8,
                CURLOPT_CONNECTTIMEOUT => 5,
            ]);
            $result = curl_exec($ch);
            if ($result === false) {
                $result = null;
            }
            // No curl_close(). Since PHP 8.0 the handle is an object freed when
            // $ch goes out of scope, so the call is a no-op on 8.0-8.4 and
            // raises a Deprecated notice on 8.5+. On a host with display_errors
            // on, that notice printed itself INTO this endpoint's JSON response
            // body — making every reply unparseable by the front end and leaking
            // the absolute server path to the client. Found on the endpoint's
            // first-ever execution (Phase 7, PHP 8.5.9); enquiry.php now also
            // buffers defensively, but the correct fix is not to call it.
        }

        if ($result === null) {
            // cURL unavailable or failed — fall back to a stream-context POST.
            // Stock HostGator PHP ships cURL, so this branch is defence in
            // depth, not the expected path.
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                    'content' => $payload,
                    'timeout' => 8,
                ],
            ]);
            $result = @file_get_contents(self::VERIFY_URL, false, $context);
        }

        if ($result === false || $result === null || $result === '') {
            return false;
        }

        $decoded = json_decode($result, true);
        return is_array($decoded) && ($decoded['success'] ?? false) === true;
    }
}
