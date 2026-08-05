// Site-wide constants used for SEO (canonical URLs, Open Graph, JSON-LD).
export const SITE_URL = 'https://leadingit.me';
export const SITE_NAME = 'Leading IT';
export const SITE_TAGLINE = 'Premium Automation Distribution · Gulf & Pakistan';

// Organization identity facts, confirmed by Muneeb 2026-08-05
// (docs/OPEN-QUESTIONS.md #2 and #8, answered in one batch). These live here —
// not in src/data/ — because the JSON-LD builders consume them and the builder
// rule is "no src/data value imports" (src/seo/jsonld/index.ts). The trade
// licence NUMBER was not supplied and is omitted everywhere, not guessed.
export const ORG_LEGAL_NAME = 'Leading IT Middle East LLC';
export const ORG_FOUNDING_YEAR = '2018';
export const ORG_EMPLOYEES_MIN = 11;
export const ORG_EMPLOYEES_MAX = 50;

// Verified 2026-08-05: the Instagram handle is the domain itself and the
// LinkedIn company page lists website leadingit.me + founded 2018, matching
// Muneeb's confirmed facts — ownership is unambiguous. (LinkedIn's own page
// data is stale — "Abu Dhabi, 2–10 employees" — flagged to Muneeb to update;
// that staleness does not make the profile any less officially Leading IT's.)
export const ORG_SOCIAL_PROFILES: readonly string[] = [
  'https://www.instagram.com/leadingit.me/',
  'https://www.linkedin.com/company/leadingit-me',
];

// Primary WhatsApp lead channel for PK/UAE (international format, digits only, no +).
export const WHATSAPP_NUMBER = '971585865222';

/**
 * The one WhatsApp deep-link builder. Callers pass **plain text** and never
 * encode it themselves — a hand-encoded prefill is how a message ends up with a
 * literal `%20` in it, or worse, a broken `&` that truncates the sentence
 * (`docs/10-CONTENT-BRIEFS/_CONVENTIONS.md` §7: the number and the encoder live
 * in one file, a page specifies the plain-text prefill only).
 */
export function whatsappHref(prefillText: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(prefillText)}`;
}

/**
 * The mailto counterpart of `whatsappHref()`, and it exists for the same reason:
 * one encoder, callers pass plain text.
 *
 * Phase 5 shipped WhatsApp with 128 page-specific prefills and email as a bare
 * `mailto:services@leadingit.me` on all 124 pages — so the two channels
 * "mirrored" each other structurally but not functionally, and a visitor who
 * preferred email arrived at a blank message having to re-explain which page
 * they came from. This closes that: the same plain-text prefill fills the body,
 * so the reply can skip the same round-trip either way.
 *
 * `subject` is separate from `body` because mail clients show them differently
 * and a first-person sentence makes a poor subject line.
 */
export function mailtoHref(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}
