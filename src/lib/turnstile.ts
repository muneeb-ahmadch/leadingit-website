/**
 * Cloudflare Turnstile — the client half.
 *
 * `TURNSTILE_SITE_KEY` is the **public** half of the pair and is baked into the
 * static build, exactly like the GA4 measurement ID. Its secret counterpart
 * (`TURNSTILE_VERIFY_TOKEN`) lives only in the server env file outside the web
 * root and never enters this repo. Do not move this constant into
 * `.env.example`: that file documents real secrets, and mixing a public value
 * into it teaches the next maintainer that the file is not sensitive.
 *
 * ## Configured 2026-08-05 — and that has a deploy precondition
 *
 * The widget is named `leadingit.me contact form` in Cloudflare: mode
 * **Managed**, hostnames `leadingit.me` and `www.leadingit.me`, pre-clearance
 * off. Its site key is the constant below (OPEN-QUESTIONS #44; full setup
 * write-up in the local `docs/17-TURNSTILE-SETUP.md`).
 *
 * Because that constant is now non-empty, `isTurnstileConfigured()` returns
 * true, and `Contact.tsx` takes the **live POST path** to `/api/contact.php`
 * instead of the `mailto:` fallback it used through Phases 0–5.
 *
 * `/api/contact.php` **requires** a valid Turnstile token and rejects any
 * submission without one — verified against Cloudflare using the paired
 * server-side key, which lives ONLY in the server env file outside the web
 * root, under `TURNSTILE_VERIFY_TOKEN`, and never in this repo. **Therefore:
 * do not deploy a build of this site until that env value is populated on the
 * server.** With the site key present and the server value missing, every
 * submission fails — which is louder than the fallback it replaced.
 *
 * Emptying this constant is still a valid rollback: it restores the `mailto:`
 * path, which composes an honest draft and never claims a message was sent.
 * The standing rule that produced that design holds — the working mailto path
 * is never deleted without a working replacement in place.
 */
// Annotated `: string` deliberately. Without it TypeScript narrows this to the
// literal type `""`, and `isTurnstileConfigured()`'s comparison below becomes
// error TS2367 ("no overlap") the moment a real key is pasted in — i.e. the
// build would break for whoever configures it, long after anyone remembers why.
// Verified by pasting a test key in and watching `npm run lint` fail.
// The widened type costs nothing: Rollup still sees the literal value and
// dead-code-eliminates the unreachable branch at build time.
export const TURNSTILE_SITE_KEY: string = '0x4AAAAAAEHAKltFGPHTvMqV';

/**
 * Turnstile's own script, loaded only when a key exists. Implicit rendering:
 * the script finds any `.cf-turnstile` element, renders the widget into it, and
 * writes the token into a hidden `cf-turnstile-response` input inside the form —
 * which `/api/contact.php` already accepts under that exact name.
 */
export const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

/**
 * Whether the live endpoint path is available. False ships the mailto fallback.
 * Checked at render time rather than build time so the two paths stay in one
 * component and cannot drift apart.
 */
export function isTurnstileConfigured(): boolean {
  return TURNSTILE_SITE_KEY !== '';
}
