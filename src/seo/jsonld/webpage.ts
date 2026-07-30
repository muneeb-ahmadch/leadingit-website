import { absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from './types';
import { WEBSITE_ID, pageUrl, webpageId } from './ids';

export type WebPageType = 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage';

export type WebPageInput = {
  /** Site-relative canonical path, e.g. `/brands/marantz` or `/`. */
  path: string;
  name: string;
  /** Defaults to `'WebPage'`. Use `'CollectionPage'` for `/brands/`, brand hubs
   * and range pages; `'ContactPage'` for `/contact`; `'AboutPage'` for `/about`. */
  type?: WebPageType;
  description?: string;
  /** `@id` of this page's `BreadcrumbList` node (see breadcrumbList.ts). Omit
   * on the home page — it carries no breadcrumb by design (see breadcrumbs.ts). */
  breadcrumbId?: string;
  /** Site-relative or absolute URL of the page's primary image, if any. */
  primaryImage?: string;
};

/**
 * Generic `WebPage`-family node. Every indexable page gets exactly one of
 * these, cross-linked to `WebSite` via `isPartOf` and to its own
 * `BreadcrumbList` via `breadcrumb` (when one exists).
 */
export function buildWebPage(input: WebPageInput): JsonLdNode {
  const url = pageUrl(input.path);
  const node: JsonLdNode = {
    '@type': input.type ?? 'WebPage',
    '@id': webpageId(input.path),
    url,
    name: input.name,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'en',
  };

  if (input.description) node.description = input.description;
  if (input.breadcrumbId) node.breadcrumb = { '@id': input.breadcrumbId };
  if (input.primaryImage) {
    node.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: absoluteUrl(input.primaryImage),
    };
  }

  return node;
}
