/**
 * GA4 conversion-event layer for leadingit.me.
 *
 * The site's only meaningful outcomes are a WhatsApp enquiry, an email enquiry or a
 * contact-form submission — everything below exists to measure whether traffic becomes
 * one of those. See `docs/15-ANALYTICS-SETUP.md` for the click-by-click setup guide and
 * `plans/phase-5-conversion-forms.md` for the six events this layer implements.
 *
 * ## Inertness contract
 *
 * `GA4_MEASUREMENT_ID` below ships **empty** because no GA4 property exists yet. While it
 * is empty this entire module is a no-op: no `<script>` tag is ever injected, no request is
 * ever sent to `googletagmanager.com`, and no cookie is ever set. Every exported tracking
 * function funnels through `sendEvent()`, which returns immediately if the ID is empty —
 * before anything touches the DOM or the network. The day a real `G-XXXXXXXXXX` is pasted
 * into the constant, all six events start reporting with no other code change required.
 *
 * ## SSG safety
 *
 * This site prerenders with `vite-react-ssg`, which executes route modules in Node, where
 * `window`/`document` do not exist. Nothing in this file touches either at module scope —
 * only inside function bodies, each of which starts with a `typeof window === 'undefined'`
 * guard. That makes this file safe to import from a component that also renders during the
 * SSG build pass, not just from client-only code.
 *
 * ## Non-blocking contract
 *
 * `whatsapp_click` in particular must fire without ever delaying or risking the WhatsApp
 * link's own navigation — the `<a href target="_blank" rel="noopener">` must keep working
 * with JS disabled, and must never wait on this module. Every tracking call here is
 * fire-and-forget: it does at most a synchronous array push (`dataLayer.push`) plus, on the
 * very first call, appending one `async` script tag. Nothing here calls
 * `preventDefault()`, returns a Promise a caller must await, or throws on failure — a
 * caller may fire it from a plain `onClick` and let the browser's default navigation
 * proceed on the same tick.
 *
 * ## Consent posture (UNDECIDED — OQ #43. Muneeb decides; see docs/15-ANALYTICS-SETUP.md)
 *
 * The site has no cookie-consent banner today. This module wires Google's Consent Mode v2
 * signals regardless, because that costs nothing and keeps the door open: `ad_storage`,
 * `ad_user_data` and `ad_personalization` default to `'denied'` unconditionally (this site
 * runs no ads/remarketing, so there is no reason to ever grant them from here).
 *
 * `analytics_storage` defaults to `CONSENT_DEFAULT`, which ships `'denied'`. That is a
 * deliberate reversal of this file's first draft, which shipped `'granted'` on the argument
 * that a UAE/Pakistan B2B site has no established GDPR exposure. That argument is sound as
 * far as it goes, and it is *not* why this is `'denied'`. Two reasons override it:
 *
 * 1. **The posture is an open question, not a settled one (OQ #43).** Shipping `'granted'`
 *    is not "no decision" — it is silently taking the permissive side of a decision that
 *    was explicitly logged as Muneeb's to make. A default that pre-empts the question is
 *    the one thing OQ #43 says must not happen.
 * 2. **`'granted'` fails open at exactly the wrong moment.** This layer is inert only while
 *    `GA4_MEASUREMENT_ID` is empty. The instant a real ID is pasted in — by someone
 *    following a setup guide, months from now, who has never read this comment — a
 *    `'granted'` default starts dropping analytics cookies on every visitor with no banner
 *    anywhere on the site. `'denied'` still measures: Consent Mode sends cookieless pings,
 *    so conversions are still counted (modelled rather than exact, and cross-session
 *    attribution is weaker) while nothing is stored on the visitor's device. Losing some
 *    attribution precision is reversible by editing one word; having already set cookies on
 *    real visitors is not.
 *
 * `setAnalyticsConsent()` is exported so a consent banner (a component-layer decision, out
 * of this file's scope) can flip the signal per-visitor without touching this file. If
 * Muneeb decides the permissive posture is right, this is a one-word change.
 */

/**
 * GA4 measurement ID. Empty until a GA4 property exists — see "Inertness contract" above
 * and docs/15-ANALYTICS-SETUP.md for exactly where to paste the real value.
 *
 * Deliberately a plain exported constant, not an environment variable. This is a static
 * SSG build with no server at request time (HostGator shared cPanel, no Node) — a GA4
 * measurement ID is not a secret (it ships in the HTML `<head>` of every page on every GA4
 * site by design; Google does not treat it as confidential), and the repo is public either
 * way. An env var would add a build-time indirection with no confidentiality benefit and
 * one more way to accidentally ship an empty build (missing `.env`) or leak a populated one
 * into a log. A constant here is the one file to edit, is grep-able for audit, and matches
 * the existing `src/lib/site.ts` precedent (`WHATSAPP_NUMBER` is a plain constant for the
 * same reason).
 */
export const GA4_MEASUREMENT_ID = '';

/**
 * Consent Mode v2 default for `analytics_storage`. See "Consent posture" above. Not a
 * secret, not a per-visitor value — a single site-wide default until a real consent banner
 * ships and starts calling `setAnalyticsConsent()` per visitor.
 */
const CONSENT_DEFAULT: 'granted' | 'denied' = 'denied';

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (...args: unknown[]) => void;
  }
}

let gtagLoaded = false;

/**
 * Lazily injects the GA4 loader script exactly once, after seeding `dataLayer`/`gtag` and
 * the Consent Mode v2 defaults. No-ops entirely — no DOM access, no script tag, no request —
 * if `GA4_MEASUREMENT_ID` is empty or this is running outside a browser (SSG/Node).
 */
function ensureGtagLoaded(): void {
  if (gtagLoaded) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!GA4_MEASUREMENT_ID) return;

  gtagLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Consent Mode v2 — set before `js`/`config` so the first hit already carries it.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: CONSENT_DEFAULT,
  });

  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Lets a future consent-banner component grant or revoke analytics storage per visitor,
 * without touching this file again. Safe to call even if GA4 hasn't loaded yet (it will
 * simply be a no-op) or ever loads at all (empty measurement ID).
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  });
}

/** Current path, browser-only. Empty string during SSG/Node — never used there. */
function getPagePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

/**
 * Every event funnels through here: prepends `page_path`, drops `undefined` values (GA4
 * rejects/ignores malformed params — better to omit than send `"undefined"`), lazily loads
 * gtag on first real call, and pushes the event. No-op before an ID exists or outside a
 * browser. Never throws, never returns a value a caller must handle.
 */
function sendEvent<T extends object>(eventName: string, params: T): void {
  if (typeof window === 'undefined') return;
  if (!GA4_MEASUREMENT_ID) return;

  ensureGtagLoaded();

  const payload: Record<string, string | number | boolean> = { page_path: getPagePath() };
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined) payload[key] = value as string | number | boolean;
  }

  window.gtag('event', eventName, payload);
}

/**
 * Known placement values used across the site today, for autocomplete. Not exhaustive by
 * design — `Placement` also accepts any other string so `frontend-engineer`'s retrofit
 * across 114 pages is never blocked waiting on this file to add a literal. Keep this list
 * roughly current as new placements appear; it is documentation, not a runtime allowlist.
 */
export type Placement =
  | 'header-nav'
  | 'sticky-mobile-bar'
  | 'hero'
  | 'footer'
  | 'product-card'
  | 'product-detail'
  | 'brand-card'
  | 'brand-detail'
  | 'contact-section'
  | 'inline-cta'
  | 'case-study'
  | 'journal-article'
  | (string & {});

export interface WhatsAppClickParams {
  /** Where on the page the click originated — required, see `Placement`. */
  placement: Placement;
  /** Brand name if this click happened on/about a specific brand, e.g. "Crestron". */
  brand?: string;
  /** Product name if this click happened on/about a specific product. */
  product?: string;
}

/**
 * Fire on every click of a WhatsApp deep link (`whatsappHref()` in `src/lib/site.ts`).
 * Call from a plain `onClick` on the real `<a target="_blank" rel="noopener">` — do not
 * `preventDefault()` and do not await this call. See "Non-blocking contract" above.
 */
export function trackWhatsAppClick(params: WhatsAppClickParams): void {
  sendEvent('whatsapp_click', params);
}

export interface EmailClickParams {
  placement: Placement;
  /** Mailbox this `mailto:` points at, e.g. "services@leadingit.me". Optional: today every
   * mailto on the site points at the same address, but this keeps the event future-proof if
   * a page ever targets a different mailbox (e.g. a role inbox). */
  destination?: string;
}

/** Fire on every click of a `mailto:` conversion link. */
export function trackEmailClick(params: EmailClickParams): void {
  sendEvent('email_click', params);
}

export interface PhoneClickParams {
  placement: Placement;
}

/** Fire on every click of a `tel:` link, if/when one ships. */
export function trackPhoneClick(params: PhoneClickParams): void {
  sendEvent('phone_click', params);
}

export interface FormSubmitParams {
  /** Which form, e.g. "contact". Lets a second form (if one ever ships) be segmented from
   * the Phase 5 contact form without a new event name. */
  form_name: string;
  /** Outcome of the submission — mirrors the contact form's thank-you states
   * (`plans/phase-5-conversion-forms.md`: success, error, rate-limited). */
  status: 'success' | 'error' | 'rate_limited';
}

/**
 * Fire once per submission attempt of the PHP contact endpoint, after the endpoint
 * responds — not on button click (that would count retries and abandoned attempts as
 * conversions). `status` should reflect what the aria-live region actually announced.
 */
export function trackFormSubmit(params: FormSubmitParams): void {
  sendEvent('form_submit', params);
}

export interface SpecDownloadParams {
  placement: Placement;
  brand?: string;
  product?: string;
  /** File name or slug of the downloaded asset, e.g. "crestron-ha-1-datasheet.pdf". Not a
   * full URL — keep it stable if the asset ever moves. */
  file_name: string;
}

/** Fire when a visitor downloads a spec sheet/datasheet/brochure PDF. */
export function trackSpecDownload(params: SpecDownloadParams): void {
  sendEvent('spec_download', params);
}

export interface BrandPageEngagedParams {
  brand: string;
  /** What crossed the engagement threshold, e.g. "dwell_15s", "scroll_50pct". Freeform by
   * design — the trigger logic (dwell timer, IntersectionObserver, etc.) belongs to
   * whichever component wires this, not to this library. */
  trigger: string;
}

/**
 * Fire once per page view when a visitor demonstrates real interest in a brand page (e.g.
 * a dwell-time or scroll-depth threshold) — a softer signal than a click, useful for
 * measuring brand-page quality even on visits that don't convert. Debounce/guard
 * against firing more than once per page view in the calling component; this function
 * does not deduplicate.
 */
export function trackBrandPageEngaged(params: BrandPageEngagedParams): void {
  sendEvent('brand_page_engaged', params);
}
