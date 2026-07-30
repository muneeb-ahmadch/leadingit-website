#!/usr/bin/env node
// Regenerates scripts/schema-vocab-subset.json — the compact schema.org
// vocabulary excerpt scripts/validate-seo.mjs checks every emitted @type and
// property against. Needs network access; the validator itself never fetches
// anything, so CI stays offline and fast.
//
// Run this whenever a JSON-LD builder in src/seo/jsonld/ starts emitting a
// @type or property it didn't before (a new template, a new field on an
// existing type). The validator fails loudly — not silently — the moment it
// meets a type or property absent from the committed subset, specifically so
// that "I added a field and forgot to run this" cannot ship quietly.
//
// What this script does NOT do: decide whether a new type/property is
// *correct* to emit. It only confirms the type/property pair is real,
// current schema.org vocabulary (via rdfs:domainIncludes + rdfs:subClassOf)
// and records it. Whether the site *should* emit it is a code-review
// question, same as any other JSON-LD change.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { collectEmittedVocabulary, collectPages } from './lib/jsonld-scan.mjs';
import { ancestorsOf, buildSchemaIndex, propertyAppliesTo } from './lib/schema-graph.mjs';

const SCHEMA_ORG_URL = 'https://schema.org/version/latest/schemaorg-current-https.jsonld';
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const distDir = resolve(repoRoot, 'dist');
const outFile = resolve(here, 'schema-vocab-subset.json');

function fail(message) {
  console.error(`gen-schema-vocab-subset: ${message}`);
  process.exit(1);
}

let pages;
try {
  pages = collectPages(distDir);
} catch (error) {
  fail(
    `could not read dist/ (${error instanceof Error ? error.message : error}). ` +
      'Run "npm run build" first — this script derives the emitted-vocabulary ' +
      'list from the actual build output, not from source.',
  );
}
if (pages.length === 0) fail('dist/ contains no HTML files — run "npm run build" first.');

const emitted = collectEmittedVocabulary(pages);
if (emitted.size === 0) fail('no JSON-LD @graph nodes found anywhere in dist/ — nothing to derive.');

console.log(`Fetching ${SCHEMA_ORG_URL} ...`);
const response = await fetch(SCHEMA_ORG_URL).catch((error) => {
  fail(`could not fetch schema.org vocabulary: ${error.message}`);
});
if (!response.ok) fail(`schema.org returned HTTP ${response.status}`);
const vocab = await response.json();
console.log(`Loaded ${vocab['@graph'].length} schema.org vocabulary nodes.`);

const index = buildSchemaIndex(vocab);

/** @type {Record<string, { ancestors: string[], properties: string[] }>} */
const types = {};
const problems = [];

for (const [typeName, properties] of [...emitted.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (!index.classes.has(typeName)) {
    problems.push(`"${typeName}" is not a class in schema.org's current vocabulary — typo, or a real type under a different casing?`);
    continue;
  }
  const ancestors = [...ancestorsOf(typeName, index.classes)].sort();
  const validatedProperties = [];
  for (const prop of [...properties].sort()) {
    if (!propertyAppliesTo(prop, typeName, index)) {
      problems.push(
        `"${prop}" is not a valid schema.org property for "${typeName}" (checked rdfs:domainIncludes ` +
          `against ${typeName}'s ancestor chain: ${ancestors.join(' < ')}). Either this is a typo, or the ` +
          `property genuinely needs a different/additional @type on that node.`,
      );
      continue;
    }
    validatedProperties.push(prop);
  }
  types[typeName] = { ancestors, properties: validatedProperties };
}

if (problems.length > 0) {
  console.error('\ngen-schema-vocab-subset: refusing to write a subset containing invalid entries:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nFix the JSON-LD builder (or the property name) and re-run.');
  process.exit(1);
}

const subset = {
  note:
    'Compact excerpt of https://schema.org — only the @types and properties ' +
    "this site's JSON-LD builders (src/seo/jsonld/*) actually emit, each one " +
    'verified against the real schema.org rdfs:domainIncludes/rdfs:subClassOf ' +
    'graph. Regenerate with "npm run gen:schema-vocab" (needs network) after ' +
    'adding a new @type or property — scripts/validate-seo.mjs fails loudly, ' +
    'not silently, on anything emitted that is absent from this file.',
  source: SCHEMA_ORG_URL,
  generatedAt: new Date().toISOString(),
  types,
};

writeFileSync(outFile, `${JSON.stringify(subset, null, 2)}\n`);
console.log(
  `\nWrote ${outFile.replace(repoRoot + '/', '')}: ${Object.keys(types).length} types, ` +
    `${Object.values(types).reduce((n, t) => n + t.properties.length, 0)} type/property pairs.`,
);
