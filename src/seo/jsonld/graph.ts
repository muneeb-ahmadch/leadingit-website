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
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter((node): node is JsonLdNode => Boolean(node)),
  };
}
