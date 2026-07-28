import type { JsonLdNode } from './types';
import { ORG_ID, SHOWROOM_DUBAI_ID } from './ids';

/**
 * GATED — NOT wired into any page yet. `NAP_CONFIRMED` stays `false` until
 * Muneeb confirms the exact registered Dubai NAP, geo-coordinates and opening
 * hours (docs/OPEN-QUESTIONS.md #1, #8). Do not flip this flag as part of
 * routine wiring work.
 *
 * Why gate rather than emit a partial node: Google's LocalBusiness rich
 * result treats a missing `address`/`openingHours`/`geo` as a WARNING, not an
 * error, and this project's structured-data gate (docs/HANDOFF-PHASE-2.md,
 * .claude/skills/schema-jsonld/SKILL.md) is zero errors AND zero warnings. A
 * half-populated LocalBusiness would fail that gate while also publishing an
 * unverified NAP — the exact "fabricated value" failure mode this project
 * forbids, just via omission-shaped fields instead of invented text.
 *
 * To unlock in Phase 6: flip `NAP_CONFIRMED` to `true`, source a real
 * `DubaiNap` value from the (to-be-created) NAP constants file — never retype
 * it inline — and call `buildLocalBusiness()` from the `/locations/dubai/`
 * page and from `Organization.location` / breadcrumb wiring on other pages
 * that reference the showroom.
 *
 * Dubai only. No Pakistan place, address or geo — ever, gated or not.
 */
export const NAP_CONFIRMED = false;

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
