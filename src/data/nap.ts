import type { DubaiNap } from '@/seo/jsonld/localBusiness';

/**
 * The confirmed Dubai NAP — the single source every rendered address comes
 * from. Confirmed by Muneeb 2026-08-05: the premises is Shop 6, International
 * Business Tower in **Business Bay** (he was asked the Business Bay vs Sheikh
 * Zayed Road question directly and answered "business bay one"). Legal entity
 * "Leading IT Middle East LLC", founded 2018, 11–50 employees, showroom open
 * **by appointment only** — same batch of answers.
 *
 * Rules that keep this file honest:
 * - **Character-identical everywhere.** Footer, contact page, location page
 *   and JSON-LD all render `NAP_ADDRESS_LINE` / fields below verbatim. Never
 *   retype the address at a call site — "Shop 6" vs "Shop No. 6" reads as two
 *   businesses to a citation aggregator.
 * - **Absent fields stay absent.** The PO Box, the street line and the trade
 *   licence number were not supplied; they are omitted, not guessed. If they
 *   arrive, they are added here and flow everywhere in one edit.
 * - **Geo is a geographic fact, not a business fact**: OpenStreetMap resolves
 *   exactly one "International Business Tower" in Business Bay
 *   (nominatim.openstreetmap.org, fetched 2026-08-05 → 25.1781724, 55.2671909).
 * - **Hours are "by appointment only"** (Muneeb, verbatim intent). There is no
 *   honest `openingHours` day/time string for that policy, so none is emitted
 *   in schema; the policy is stated in page copy instead.
 */
export const DUBAI_NAP: DubaiNap = {
  streetAddress: 'Shop 6, International Business Tower',
  addressLocality: 'Business Bay',
  addressRegion: 'Dubai',
  addressCountry: 'AE',
  latitude: 25.17817,
  longitude: 55.26719,
  telephone: '+971585865222',
};

/** The one display string for body copy and address blocks. */
export const NAP_ADDRESS_LINE =
  'Shop 6, International Business Tower, Business Bay, Dubai, United Arab Emirates';

/** Display phone, matching the WhatsApp number everywhere else on the site. */
export const NAP_PHONE_DISPLAY = '+971 58 586 5222';

/** Stated wherever a visitor might plan a visit. Instagram and LinkedIn
 * profiles exist per Muneeb but no URLs were supplied — `sameAs` therefore
 * stays absent from schema until verified links exist (absent is safe,
 * guessed is a liability). */
export const SHOWROOM_VISIT_POLICY = 'By appointment only';
