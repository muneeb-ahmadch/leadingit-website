import { SITE_NAME, SITE_URL } from '@/lib/site';
import type { JsonLdNode } from './types';
import { ORG_ID, WEBSITE_ID } from './ids';

/**
 * `WebSite` — one per site, referenced by every page's `WebPage.isPartOf`.
 *
 * No `SearchAction` / sitelinks-searchbox: the site has no internal search, so
 * emitting one would be a fabricated capability, not an SEO nicety.
 */
export function buildWebSite(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}
