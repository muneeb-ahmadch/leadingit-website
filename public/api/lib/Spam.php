<?php

declare(strict_types=1);

/**
 * Honeypot + time-trap: the two zero-dependency spam defences that run
 * before rate-limit or Turnstile, so an obvious bot never costs an API call
 * or a rate-limit slot.
 *
 * Field contract (owned by frontend-engineer, documented here + in
 * docs/12-PROVENANCE/phase5-endpoint.md so the two sides can't drift):
 *
 * - `hp_note` — a hidden text input, off-screen via CSS (not display:none
 *   alone, and not type="hidden" — both are trivially detected by scrapers
 *   that read field types), with aria-hidden="true" and tabindex="-1" so
 *   assistive tech never lands on it. Must arrive empty. Browser autofill
 *   should not populate it because the name doesn't match any autofill
 *   heuristic. Absent field = not spam (tolerates the field not being wired
 *   yet); present-and-non-empty = spam.
 *
 * - `form_ts` — integer milliseconds since epoch (JS `Date.now()`), captured
 *   once when the form mounts and submitted unchanged. Unlike the honeypot,
 *   this field is REQUIRED once wired: its absence fails validation rather
 *   than being silently treated as a pass, because a missing time-trap is a
 *   broken integration, not a legitimate no-JS submission (no-JS submitters
 *   can't pass Turnstile either, so this endpoint already requires JS).
 *
 * Known limitation, documented rather than hidden: `form_ts` is
 * client-supplied and therefore spoofable by a bot that simply lies about
 * it. It is a cheap deterrent layered under rate-limit + Turnstile, not the
 * primary defence.
 */
final class Spam
{
    public static function honeypotTripped(array $input): bool
    {
        return isset($input['hp_note']) && trim((string) $input['hp_note']) !== '';
    }

    /**
     * @return string|null null if fine, else a machine-readable reason:
     *   'missing' | 'too_fast' | 'too_stale'
     */
    public static function timeTrapResult(array $input, int $minMs, int $maxMs): ?string
    {
        if (!isset($input['form_ts']) || !is_numeric($input['form_ts'])) {
            return 'missing';
        }
        $formTs = (float) $input['form_ts'];
        $nowMs = microtime(true) * 1000;
        $elapsed = $nowMs - $formTs;

        if ($elapsed < $minMs) {
            return 'too_fast';
        }
        if ($elapsed > $maxMs) {
            return 'too_stale';
        }
        return null;
    }
}
