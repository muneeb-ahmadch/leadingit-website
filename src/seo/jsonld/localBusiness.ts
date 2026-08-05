import type { JsonLdNode } from './types';
import { ORG_ID, SHOWROOM_DUBAI_ID, pageUrl } from './ids';

/**
 * UNLOCKED 2026-08-05. Muneeb confirmed the NAP (docs/OPEN-QUESTIONS.md #1/#2/#8
 * answered in one batch): Shop 6, International Business Tower, **Business Bay**
 * — he answered the Business-Bay-vs-Sheikh-Zayed-Road ambiguity directly. The
 * one real `DubaiNap` value lives in `src/data/nap.ts` and is passed in by
 * `<Seo>` sitewide; never retype an address inline.
 *
 * What stays deliberately absent, and why that is not a regression of the old
 * gate: the showroom is **by appointment only**, so there is no honest
 * `openingHours` day/time string and none is emitted — the policy is stated in
 * page copy instead. PO Box and street line were not supplied and are omitted,
 * not guessed. Geo comes from OpenStreetMap (one unambiguous match for the
 * tower in Business Bay — see nap.ts).
 *
 * Dubai only. No Pakistan place, address or geo — ever.
 */
export const NAP_CONFIRMED = true;

export type DubaiNap = {
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  /** ISO 3166-1 alpha-2 — always `'AE'` for this node. */
  addressCountry: 'AE';
  latitude?: number;
  longitude?: number;
  /** schema.org day-range + time-range strings, e.g. `'Mo-Th 09:00-18:00'`. */
  openingHours?: string[];
  telephone?: string;
};

export function buildLocalBusiness(nap: DubaiNap): JsonLdNode | null {
  if (!NAP_CONFIRMED) return null;

  const node: JsonLdNode = {
    '@type': 'LocalBusiness',
    '@id': SHOWROOM_DUBAI_ID,
    name: 'Leading IT — Dubai Showroom',
    url: pageUrl('/locations/dubai'),
    parentOrganization: { '@id': ORG_ID },
    address: {
      '@type': 'PostalAddress',
      streetAddress: nap.streetAddress,
      addressLocality: nap.addressLocality,
      addressCountry: nap.addressCountry,
      ...(nap.addressRegion ? { addressRegion: nap.addressRegion } : {}),
      ...(nap.postalCode ? { postalCode: nap.postalCode } : {}),
    },
  };

  if (nap.latitude !== undefined && nap.longitude !== undefined) {
    node.geo = { '@type': 'GeoCoordinates', latitude: nap.latitude, longitude: nap.longitude };
  }
  if (nap.openingHours && nap.openingHours.length > 0) node.openingHours = nap.openingHours;
  if (nap.telephone) node.telephone = nap.telephone;

  return node;
}
