import { SITE_NAME, SITE_URL, WHATSAPP_NUMBER, absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from './types';
import { ORG_ID } from './ids';

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
 * Deliberately omitted (unverified — see docs/OPEN-QUESTIONS.md #8): `sameAs`
 * (no confirmed social profile URLs), `foundingDate`, `numberOfEmployees`,
 * `legalName` (no confirmed trade-licence entity name). Do not add any of
 * these without a confirmed source — an absent property is safe, a fabricated
 * one is a liability.
 */
export function buildOrganization(input: OrganizationInput = {}): JsonLdNode {
  const node: JsonLdNode = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description:
      'Leading IT sells and installs premium home, cinema and industrial automation across Pakistan and the UAE.',
    areaServed: ['United Arab Emirates', 'Pakistan'],
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
