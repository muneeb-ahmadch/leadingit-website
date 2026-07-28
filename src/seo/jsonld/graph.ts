import type { JsonLdGraph, JsonLdNode } from './types';

/**
 * Assembles the single `@graph` payload for a page's one
 * `<script type="application/ld+json">` tag. Falsy entries (`null`,
 * `undefined`, `false`) are dropped silently so callers can inline a
 * conditional builder call — e.g. a gated `buildLocalBusiness()` result, or a
 * range product that intentionally returns `null` — without an `if` block at
 * every call site.
 */
export function buildGraph(nodes: Array<JsonLdNode | null | undefined | false>): JsonLdGraph {
  const present = nodes.filter((node): node is JsonLdNode => Boolean(node));

  // De-duplicate by `@id`, first occurrence winning. `<Seo>` prepends the
  // sitewide Organization and WebSite nodes to every page's graph, so a page
  // that also builds one explicitly (the home page does, and it reads better
  // there) would otherwise emit the same `@id` twice — which is malformed:
  // two nodes sharing an `@id` are two contradictory descriptions of one
  // entity. Nodes without an `@id` are always kept; several legitimately
  // repeat (ListItem, PropertyValue, ImageObject).
  const seen = new Set<string>();
  const deduped = present.filter((node) => {
    const id = typeof node['@id'] === 'string' ? node['@id'] : null;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return { '@context': 'https://schema.org', '@graph': deduped };
}
