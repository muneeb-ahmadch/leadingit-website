// Site-wide constants used for SEO (canonical URLs, Open Graph, JSON-LD).
// IMPORTANT: change SITE_URL to the real production domain once it is live.
// It is currently set to the design-review URL on Surge.
export const SITE_URL = 'https://leadingit-design.surge.sh';
export const SITE_NAME = 'Leading IT';
export const SITE_TAGLINE = 'Premium Automation Distribution · Gulf & Pakistan';

// Primary WhatsApp lead channel for PK/UAE. PLACEHOLDER — replace with the real
// business number (international format, digits only, no +) once provided.
export const WHATSAPP_NUMBER = '971500000000';

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}
