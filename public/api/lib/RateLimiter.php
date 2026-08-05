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

        $this->maybeCollectGarbage($dir, $now);

        return $allowed;
    }

    /**
     * Deletes state files that can no longer affect any decision.
     *
     * Without this the directory grows by one file per distinct visitor IP and
     * never shrinks — on shared hosting that is an inode leak measured in years,
     * and it was accepted into Phase 7 as a known gap rather than shipped
     * unnoticed. A file is only removed once it is older than TWICE the window,
     * so a file that is merely idle mid-window is never taken out from under a
     * concurrent request; and because a returning visitor simply gets a fresh
     * file, deleting an expired one can never let anyone exceed the limit.
     *
     * The 1-in-50 gate keeps the directory scan off the critical path of a
     * normal submission. It lives in this wrapper and NOT in collectGarbage()
     * so the sweep itself can be exercised deterministically — folding the two
     * together makes the only interesting logic here untestable, and a sweep
     * nobody can test is how an inode leak gets "fixed" twice.
     */
    private function maybeCollectGarbage(string $dir, int $now): void
    {
        if (random_int(1, 50) !== 1) {
            return;
        }

        $this->collectGarbage($dir, $now);
    }

    /**
     * The sweep itself. unlink() failures are ignored on purpose: another
     * worker collecting the same file concurrently is the expected race, and
     * housekeeping must never take down a live enquiry.
     */
    private function collectGarbage(string $dir, int $now): void
    {
        $entries = @scandir($dir);
        if ($entries === false) {
            return;
        }

        $expiresBefore = $now - ($this->windowSeconds * 2);
        foreach ($entries as $entry) {
            if (!str_ends_with($entry, '.json')) {
                continue;
            }
            $path = $dir . '/' . $entry;
            $mtime = @filemtime($path);
            if ($mtime !== false && $mtime < $expiresBefore) {
                @unlink($path);
            }
        }
    }
}
