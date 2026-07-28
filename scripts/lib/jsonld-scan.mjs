// Shared JSON-LD graph analysis for scripts/validate-seo.mjs and
// scripts/gen-schema-vocab-subset.mjs — one walker, so "what does this site
// emit" is answered identically by both the generator and the validator.
import { extractJsonLdBlocks, readText, urlPathForFile, walkHtmlFiles } from './html.mjs';

/**
 * Recursively walks a parsed `@graph` array (or any JSON-LD value nested
 * inside it), classifying every object into exactly one of:
 *
 * - a **bare reference** — `{ "@id": "..." }` and nothing else. This is a
 *   pointer that must resolve to a node defined *somewhere else* in the same
 *   document.
 * - a **node** — anything else carrying an `@id` and/or `@type`. A node that
 *   happens to repeat another node's `@id` alongside real properties (e.g.
 *   `Product.brand`'s inline `{ "@type": "Brand", "@id": ..., "name": ... }`
 *   stub — see `src/seo/jsonld/product.ts`) is a self-sufficient definition,
 *   not a dangling pointer, by design: that inline duplication is exactly how
 *   this codebase keeps a single page's graph valid in isolation, per
 *   Google's Rich Results Test evaluating one page at a time.
 *
 * @param {unknown[]} graph the page's `@graph` array
 */
export function analyzeGraph(graph) {
  const definedIds = new Set();
  const bareReferences = []; // { id }
  const typedNodes = []; // { type, node, topLevel }
  const topLevelIdCounts = new Map(); // id -> count, top-level @graph entries only

  for (const entry of graph) {
    if (entry && typeof entry === 'object' && typeof entry['@id'] === 'string') {
      topLevelIdCounts.set(entry['@id'], (topLevelIdCounts.get(entry['@id']) ?? 0) + 1);
    }
  }

  function visit(value, topLevel) {
    if (Array.isArray(value)) {
      value.forEach((v) => visit(v, topLevel));
      return;
    }
    if (!value || typeof value !== 'object') return;

    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === '@id') {
      bareReferences.push({ id: value['@id'] });
      return;
    }

    if (typeof value['@id'] === 'string') definedIds.add(value['@id']);
    if (typeof value['@type'] === 'string') {
      typedNodes.push({ type: value['@type'], node: value, topLevel });
    }

    for (const [key, v] of Object.entries(value)) {
      if (key === '@id' || key === '@type') continue;
      visit(v, false);
    }
  }

  graph.forEach((node) => visit(node, true));

  return { definedIds, bareReferences, typedNodes, topLevelIdCounts };
}

/**
 * Reads every `*.html` file under `distDir` and extracts its JSON-LD. Each
 * script block's raw text is `JSON.parse`d defensively — a parse failure is
 * reported as `parseError`, never thrown, so one bad page doesn't abort the
 * whole scan.
 */
export function collectPages(distDir) {
  return walkHtmlFiles(distDir).map((file) => {
    const html = readText(file);
    const { path: urlPath, isMirror, unexpectedShape } = urlPathForFile(distDir, file);
    const blocks = extractJsonLdBlocks(html).map((raw) => {
      try {
        return { raw, parsed: JSON.parse(raw), parseError: null };
      } catch (error) {
        return { raw, parsed: null, parseError: error instanceof Error ? error.message : String(error) };
      }
    });
    return { file, html, urlPath, isMirror, unexpectedShape, blocks };
  });
}

/**
 * Every `{ type, properties: Set }` this dist/ build actually emits, unioned
 * across all pages and all nesting depths. This is the exact input
 * `scripts/gen-schema-vocab-subset.mjs` needs to derive the committed
 * subset, and what `scripts/validate-seo.mjs` diffs against it.
 */
export function collectEmittedVocabulary(pages) {
  /** @type {Map<string, Set<string>>} */
  const propsByType = new Map();
  for (const page of pages) {
    for (const block of page.blocks) {
      if (!block.parsed || !Array.isArray(block.parsed['@graph'])) continue;
      const { typedNodes } = analyzeGraph(block.parsed['@graph']);
      for (const { type, node } of typedNodes) {
        if (!propsByType.has(type)) propsByType.set(type, new Set());
        const set = propsByType.get(type);
        for (const key of Object.keys(node)) {
          if (key === '@type' || key === '@id') continue;
          set.add(key);
        }
      }
    }
  }
  return propsByType;
}
