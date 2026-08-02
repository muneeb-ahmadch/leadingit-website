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
 * ## It ships empty, and that is load-bearing
 *
 * No Turnstile keys exist yet — the pair has never been created and was never
 * raised as a question in Phases 0–4 (logged as OPEN-QUESTIONS #44).
 *
 * `/api/contact.php` **requires** a valid Turnstile token and rejects any
 * submission without one. So a contact form that POSTed to it today would fail
 * 100% of the time. Rather than ship a form that is guaranteed to be broken,
 * `Contact.tsx` reads `isTurnstileConfigured()` and keeps the pre-Phase-5
 * behaviour — composing an honest `mailto:` draft, never a fake "message sent"
 * — until a real key is pasted in here. The moment it is, the same form starts
 * POSTing to the endpoint with no other change.
 *
 * That is deliberate: the handoff's standing rule is that the working mailto
 * path is never deleted without a working replacement in place.
 */
export const TURNSTILE_SITE_KEY = '';

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
