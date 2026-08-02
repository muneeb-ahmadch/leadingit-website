<?php

declare(strict_types=1);

require_once __DIR__ . '/Storage.php';

/**
 * File-based sliding-window per-IP rate limit. No database or queue is
 * available on stock shared hosting, so state is one small JSON file per
 * hashed IP under <storage_dir>/rate-limit/. The IP is hashed (sha256) before
 * it ever touches a filename or the file's contents, so raw visitor IPs are
 * never written to disk by this class.
 */
final class RateLimiter
{
    public function __construct(
        private readonly string $storageDir,
        private readonly int $max,
        private readonly int $windowSeconds,
    ) {
    }

    /**
     * Records this attempt and returns true if it is within the limit, false
     * if the caller should be rate-limited. Always records the attempt
     * (even a limited one) so a caller that keeps retrying doesn't get a
     * free pass once the window rolls forward mid-abuse.
     */
    public function allow(string $ip): bool
    {
        $dir = $this->storageDir . '/rate-limit';
        $file = $dir . '/' . hash('sha256', $ip) . '.json';
        $now = time();
        $windowStart = $now - $this->windowSeconds;
        $max = $this->max;

        $allowed = true;
        Storage::withLockedJsonArray($file, function (array $timestamps) use ($now, $windowStart, $max, &$allowed): array {
            $recent = array_values(array_filter($timestamps, static fn ($ts) => $ts > $windowStart));
            $allowed = count($recent) < $max;
            $recent[] = $now;
            return $recent;
        });

        return $allowed;
    }
}
