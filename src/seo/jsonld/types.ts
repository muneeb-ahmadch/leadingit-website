/**
 * A single hand-authored JSON-LD node. Deliberately untyped beyond
 * `Record<string, unknown>` — schema.org's vocabulary is far larger than is
 * useful to model in TypeScript here, and every builder in this directory is
 * responsible for only ever emitting real schema.org properties (enforced by
 * code review + the Rich Results / schema.org validator gate, not the type
 * system).
 */
export type JsonLdNode = Record<string, unknown>;

/** The single per-page `<script type="application/ld+json">` payload. */
export type JsonLdGraph = {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
};
