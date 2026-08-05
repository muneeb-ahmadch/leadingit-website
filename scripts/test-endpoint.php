<?php

declare(strict_types=1);

/**
 * Dependency-free tests for the /api/contact.php support classes.
 *
 * Run: php scripts/test-endpoint.php   (exits non-zero on failure)
 *
 * Why this file exists: the Phase 7 first-execution work verified the rate-limit
 * GC and the spam guards with ad-hoc one-liners, and the commit claimed they were
 * "unit-tested". QA's objection was correct — a claim with no artefact in the
 * repository is not reproducible by anyone else, and the split of
 * maybeCollectGarbage()/collectGarbage() was justified as "so the sweep is
 * testable" while both stayed private. This makes the claim true.
 *
 * Deliberately no PHPUnit: the endpoint has to run on stock shared hosting with
 * no Composer step guaranteed, and adding a dev dependency to test six small
 * classes is a worse trade than thirty lines of harness.
 *
 * Not covered here, on purpose: anything needing a live SMTP or a real Turnstile
 * token. Those are exercised by the deploy smoke test against the real server.
 */

require_once __DIR__ . '/../public/api/lib/Storage.php';
require_once __DIR__ . '/../public/api/lib/RateLimiter.php';
require_once __DIR__ . '/../public/api/lib/Spam.php';
require_once __DIR__ . '/../public/api/lib/Env.php';

$passed = 0;
$failed = 0;

function ok(string $label, bool $condition, string $detail = ''): void
{
    global $passed, $failed;
    if ($condition) {
        $passed++;
        printf("  PASS  %s\n", $label);
    } else {
        $failed++;
        printf("  FAIL  %s%s\n", $label, $detail !== '' ? "  ($detail)" : '');
    }
}

function tempDir(string $prefix): string
{
    $dir = sys_get_temp_dir() . '/' . $prefix . '-' . bin2hex(random_bytes(4));
    mkdir($dir, 0770, true);
    return $dir;
}

function rmTree(string $dir): void
{
    if (!is_dir($dir)) {
        return;
    }
    foreach (array_diff(scandir($dir) ?: [], ['.', '..']) as $entry) {
        $path = $dir . '/' . $entry;
        is_dir($path) ? rmTree($path) : @unlink($path);
    }
    @rmdir($dir);
}

/** Invokes a private method. The alternative is making internals public purely for tests. */
function callPrivate(object $object, string $method, array $args): mixed
{
    $ref = new ReflectionMethod($object, $method);
    return $ref->invokeArgs($object, $args);
}

echo "\nSpam::honeypotTripped\n";
ok('absent field is not spam', Spam::honeypotTripped([]) === false);
ok('empty field is not spam', Spam::honeypotTripped(['hp_note' => '']) === false);
ok('whitespace-only field is not spam', Spam::honeypotTripped(['hp_note' => "  \n "]) === false);
ok('filled field is spam', Spam::honeypotTripped(['hp_note' => 'x']) === true);

echo "\nSpam::timeTrapResult\n";
$now = static fn (int $offsetMs): array => ['form_ts' => (microtime(true) * 1000) - $offsetMs];
ok('missing form_ts', Spam::timeTrapResult([], 3000, 7200000) === 'missing');
ok('non-numeric form_ts', Spam::timeTrapResult(['form_ts' => 'abc'], 3000, 7200000) === 'missing');
ok('submitted instantly is too_fast', Spam::timeTrapResult($now(0), 3000, 7200000) === 'too_fast');
ok('submitted after 10s is accepted', Spam::timeTrapResult($now(10000), 3000, 7200000) === null);
ok('submitted after 3h is too_stale', Spam::timeTrapResult($now(10800000), 3000, 7200000) === 'too_stale');

echo "\nEnv::load\n";
$envDir = tempDir('env-test');
file_put_contents($envDir . '/t.env', <<<'ENV'
# a comment
SMTP_HOST=smtp.example.com
QUOTED="quoted value"
SINGLE='single value'
EMPTY=
WITH_EQUALS=a=b=c
   SPACED   =   trimmed
no_equals_line
ENV);
$vars = Env::load($envDir . '/t.env');
ok('comments skipped', !isset($vars['# a comment']));
ok('plain value', ($vars['SMTP_HOST'] ?? null) === 'smtp.example.com');
ok('double quotes stripped', ($vars['QUOTED'] ?? null) === 'quoted value');
ok('single quotes stripped', ($vars['SINGLE'] ?? null) === 'single value');
ok('empty value preserved', ($vars['EMPTY'] ?? null) === '');
ok('value containing = kept whole', ($vars['WITH_EQUALS'] ?? null) === 'a=b=c');
ok('key and value trimmed', ($vars['SPACED'] ?? null) === 'trimmed');
ok('line without = ignored', !array_key_exists('no_equals_line', $vars));
$threw = false;
try {
    Env::load($envDir . '/missing.env');
} catch (RuntimeException) {
    $threw = true;
}
ok('missing file throws rather than returning []', $threw);
rmTree($envDir);

echo "\nRateLimiter::allow\n";
$base = tempDir('rl-test');
$limiter = new RateLimiter($base, 5, 900);
$verdicts = [];
for ($i = 0; $i < 7; $i++) {
    $verdicts[] = $limiter->allow('203.0.113.1') ? 'allow' : 'limit';
}
ok('first 5 allowed, 6th and 7th limited',
    $verdicts === ['allow', 'allow', 'allow', 'allow', 'allow', 'limit', 'limit'],
    implode(',', $verdicts));
ok('a different IP is unaffected', (new RateLimiter($base, 5, 900))->allow('203.0.113.2') === true);
$stateFiles = glob($base . '/rate-limit/*.json') ?: [];
ok('raw IP never appears in a filename',
    count($stateFiles) === 2 && !str_contains(implode(' ', $stateFiles), '203.0.113'));
rmTree($base);

echo "\nRateLimiter garbage collection\n";
$base = tempDir('gc-test');
$dir = $base . '/rate-limit';
mkdir($dir, 0770, true);
foreach (['old1', 'old2', 'old3'] as $name) {
    file_put_contents("$dir/$name.json", '[1]');
    touch("$dir/$name.json", time() - 5000);          // older than 2x the 900s window
}
file_put_contents("$dir/edge.json", '[1]');
touch("$dir/edge.json", time() - 1700);                // inside 2x the window -> keep
file_put_contents("$dir/fresh.json", '[1]');           // now -> keep
file_put_contents("$dir/keep.txt", 'not ours');
touch("$dir/keep.txt", time() - 99999);                // not .json -> never touched

$gcLimiter = new RateLimiter($base, 5, 900);
callPrivate($gcLimiter, 'collectGarbage', [$dir, time()]);
$remaining = array_map('basename', glob("$dir/*") ?: []);
sort($remaining);
ok('expired state swept, in-window and non-json kept',
    $remaining === ['edge.json', 'fresh.json', 'keep.txt'],
    implode(',', $remaining));
rmTree($base);

// The failure that matters: GC must never hand an abuser a fresh allowance.
$base = tempDir('gc-live');
$liveLimiter = new RateLimiter($base, 5, 900);
$verdicts = [];
for ($i = 0; $i < 6; $i++) {
    $verdicts[] = $liveLimiter->allow('203.0.113.9') ? 'allow' : 'limit';
    callPrivate($liveLimiter, 'collectGarbage', [$base . '/rate-limit', time()]);
}
ok('sweeping on every call does not reset a live counter',
    $verdicts === ['allow', 'allow', 'allow', 'allow', 'allow', 'limit'],
    implode(',', $verdicts));
rmTree($base);

echo "\nOutput-buffer discard idiom (contact_respond)\n";
// Regression test for the loop that QA found could never terminate: ob_end_clean()
// returns false WITHOUT decrementing the level when the buffer is not removable,
// so the return value has to be the loop's terminating condition.
$depth = ob_get_level();
ob_start();
ob_start(null, 0, PHP_OUTPUT_HANDLER_CLEANABLE); // deliberately NOT removable
echo 'stray output that must never reach a JSON body';
$iterations = 0;
while (ob_get_level() > $depth && @ob_end_clean()) {
    if (++$iterations > 100) {
        break;
    }
}
if (ob_get_level() > $depth) {
    @ob_clean();
}
$leaked = ob_get_level() > $depth ? (string) ob_get_contents() : '';
// Bounded on purpose. ob_end_flush() fails on a non-removable buffer for exactly
// the same reason ob_end_clean() does, so an unbounded teardown loop here would
// hang the test suite — which is precisely how this got written the first time.
$teardown = 0;
while (ob_get_level() > $depth && @ob_end_flush() && ++$teardown < 100) {
    // unwind
}
ok('discard loop terminates against a non-removable buffer', $iterations <= 100, "iterations=$iterations");
ok('stray output is cleared even when the buffer cannot be closed', $leaked === '');

printf("\n%d passed, %d failed\n\n", $passed, $failed);
exit($failed === 0 ? 0 : 1);
