import type { Crumb } from '../breadcrumbs';
import type { JsonLdNode } from './types';
import { breadcrumbNodeId, pageUrl } from './ids';

/**
 * `BreadcrumbList` built from the exact same `Crumb[]` that renders the
 * visible breadcrumb UI (see `src/seo/breadcrumbs.ts`) — the two must always
 * match, and sharing one array is how that is guaranteed rather than
 * asserted.
 *
 * The final crumb is the current page. Google explicitly accepts a
 * self-referencing final `ListItem.item` (the current page linking to
 * itself), so every crumb — including the last — gets a real `item` URL for
 * consistency; the UI layer is responsible for rendering that last crumb as
 * plain text rather than a link.
 *
 * Returns `null` for 0 or 1 crumbs: the home page carries no breadcrumb at all
 * (see breadcrumbs.ts), and a single-item list is not a real breadcrumb trail.
 */
export function buildBreadcrumbList(crumbs: Crumb[], pagePath: string): JsonLdNode | null {
  if (crumbs.length < 2) return null;

  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbNodeId(pagePath),
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: pageUrl(crumb.path),
    })),
  };
}
