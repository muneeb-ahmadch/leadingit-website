// Site-wide constants used for SEO (canonical URLs, Open Graph, JSON-LD).
export const SITE_URL = 'https://leadingit.me';
export const SITE_NAME = 'Leading IT';
export const SITE_TAGLINE = 'Premium Automation Distribution · Gulf & Pakistan';

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
