<?php

declare(strict_types=1);

/**
 * Minimal KEY=VALUE file parser for /api/enquiry.php's runtime configuration.
 *
 * Deliberately hand-rolled instead of pulling in vlucas/dotenv: the endpoint
 * has to run on stock HostGator shared PHP with no Composer install step
 * guaranteed (CLAUDE.md / phase-5 brief — "no Node runtime", minimal deps).
 * This never touches $_ENV/putenv() and never reads from inside the web
 * root; the caller (config.php) is responsible for locating a path outside
 * public/ and handing it to load().
 */
final class Env
{
    /**
     * @return array<string, string>
     */
    public static function load(string $path): array
    {
        if (!is_file($path) || !is_readable($path)) {
            throw new RuntimeException('Env: file not found or unreadable: ' . $path);
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            throw new RuntimeException('Env: could not read file: ' . $path);
        }

        $vars = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') {
                continue;
            }
            if (strpos($line, '=') === false) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            $len = strlen($value);
            if ($len >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[$len - 1] === $value[0]) {
                $value = substr($value, 1, $len - 2);
            }
            if ($key !== '') {
                $vars[$key] = $value;
            }
        }

        return $vars;
    }
}
