import {
  ORG_EMPLOYEES_MAX,
  ORG_EMPLOYEES_MIN,
  ORG_FOUNDING_YEAR,
  ORG_LEGAL_NAME,
  ORG_SOCIAL_PROFILES,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_NUMBER,
  absoluteUrl,
} from '@/lib/site';
import type { JsonLdNode } from './types';
import { ORG_ID, SHOWROOM_DUBAI_ID } from './ids';

export type OrganizationInput = {
  /**
   * Absolute or site-relative URL to a genuine Leading IT logo image (square,
   * per Google's Logo guidelines). No such asset exists in the repo yet — omit
   * unless the caller has a real one. Never point this at `/og-default.jpg`;
   * that is a 1200×630 social-share image, not a logo, and asserting it as one
   * is exactly the kind of fabricated-to-fit-the-schema value this project
   * forbids.
   */
  logo?: string;
  /**
   * `@id` of the Dubai LocalBusiness node, wired in once
   * `localBusiness.ts`'s `NAP_CONFIRMED` flips to `true` (docs/OPEN-QUESTIONS.md
   * #1, #8). Omitted by default so `Organization.location` never references a
   * node this page's graph doesn't actually contain.
   */
  locationId?: string;
};

/**
 * `Organization` — sitewide identity node, referenced by `WebSite.publisher`
 * and every page's `WebPage.isPartOf` chain.
 *
 * `legalName`, `foundingDate` and `numberOfEmployees` were confirmed by Muneeb
 * on 2026-08-05 (docs/OPEN-QUESTIONS.md #2/#8) and come from `@/lib/site`.
 * `location` references the Dubai showroom node, which `<Seo>` now emits on
 * every page alongside this one — the reference is never dangling.
 *
 * `sameAs` carries the two profiles verified on 2026-08-05 (see
 * `ORG_SOCIAL_PROFILES` in `@/lib/site` for the verification note). "Industrial
 * automation" left the description the same day: Muneeb dropped that line of
 * business outright ("not doing this anymore").
 */
export function buildOrganization(input: OrganizationInput = {}): JsonLdNode {
  const node: JsonLdNode = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: ORG_LEGAL_NAME,
    url: `${SITE_URL}/`,
    description:
      'Leading IT sells and installs premium home and cinema automation across Pakistan and the UAE.',
    foundingDate: ORG_FOUNDING_YEAR,
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: ORG_EMPLOYEES_MIN,
      maxValue: ORG_EMPLOYEES_MAX,
    },
    areaServed: ['United Arab Emirates', 'Pakistan'],
    sameAs: [...ORG_SOCIAL_PROFILES],
    location: { '@id': SHOWROOM_DUBAI_ID },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: `+${WHATSAPP_NUMBER}`,
        email: 'services@leadingit.me',
        areaServed: ['AE', 'PK'],
        availableLanguage: ['en'],
      },
    ],
  };

  if (input.logo) node.logo = absoluteUrl(input.logo);
  if (input.locationId) node.location = { '@id': input.locationId };

  return node;
}
