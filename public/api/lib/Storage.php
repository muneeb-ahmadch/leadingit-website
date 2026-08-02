<?php

declare(strict_types=1);

/**
 * Filesystem helpers shared by RateLimiter and Logger. Every path this class
 * touches has already been proven outside the web root by
 * contact_assert_outside_webroot() in config.php — this file does not
 * re-derive that guarantee, it just creates directories/files safely once a
 * caller hands it a trusted path.
 */
final class Storage
{
    public static function ensureDir(string $dir): void
    {
        if (is_dir($dir)) {
            return;
        }
        if (!mkdir($dir, 0770, true) && !is_dir($dir)) {
            throw new RuntimeException('Storage: could not create directory: ' . $dir);
        }
    }

    /**
     * Appends one line to $file, creating it if needed, serialised against
     * concurrent PHP-FPM/mod_php workers with flock(). Shared hosting has no
     * queue/database available for this, so a locked append is the
     * lowest-dependency safe primitive.
     */
    public static function appendLine(string $file, string $line): void
    {
        self::ensureDir(dirname($file));
        $handle = fopen($file, 'ab');
        if ($handle === false) {
            throw new RuntimeException('Storage: could not open for append: ' . $file);
        }
        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Storage: could not lock: ' . $file);
            }
            fwrite($handle, $line . "\n");
            fflush($handle);
            flock($handle, LOCK_UN);
        } finally {
            fclose($handle);
        }
    }

    /**
     * Reads a small JSON file under an exclusive lock, lets the caller mutate
     * it, writes it back, then releases — a minimal compare-and-swap for the
     * per-IP rate-limit counters (one file per hashed IP, so contention is
     * per-visitor, not global).
     *
     * @param callable(array<int,int>): array<int,int> $mutate
     * @return array<int,int>
     */
    public static function withLockedJsonArray(string $file, callable $mutate): array
    {
        self::ensureDir(dirname($file));
        $handle = fopen($file, 'c+b');
        if ($handle === false) {
            throw new RuntimeException('Storage: could not open: ' . $file);
        }
        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Storage: could not lock: ' . $file);
            }
            $raw = stream_get_contents($handle);
            $data = [];
            if ($raw !== false && $raw !== '') {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }

            $data = $mutate($data);

            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, json_encode($data));
            fflush($handle);
            flock($handle, LOCK_UN);
        } finally {
            fclose($handle);
        }

        return $data;
    }
}
