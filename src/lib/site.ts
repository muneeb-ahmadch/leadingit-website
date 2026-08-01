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

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}
