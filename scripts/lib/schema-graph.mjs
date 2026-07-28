// Parses schema.org's own JSON-LD vocabulary graph (as fetched from
// https://schema.org/version/latest/schemaorg-current-https.jsonld) into
// lookup tables — used only by scripts/gen-schema-vocab-subset.mjs, which
// runs on demand (needs network), never by the committed validator.
const SCHEMA_PREFIX = 'schema:';

function stripPrefix(id) {
  if (typeof id !== 'string') return id;
  if (id.startsWith(SCHEMA_PREFIX)) return id.slice(SCHEMA_PREFIX.length);
  if (id.startsWith('https://schema.org/')) return id.slice('https://schema.org/'.length);
  if (id.startsWith('http://schema.org/')) return id.slice('http://schema.org/'.length);
  return id;
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function idsOf(value) {
  return toArray(value)
    .map((v) => (v && typeof v === 'object' ? v['@id'] : v))
    .map(stripPrefix)
    .filter((v) => typeof v === 'string');
}

/**
 * @param {{ '@graph': Array<Record<string, unknown>> }} vocab the full parsed schemaorg-current-https.jsonld
 */
export function buildSchemaIndex(vocab) {
  /** @type {Map<string, { label: string, subClassOf: string[] }>} */
  const classes = new Map();
  /** @type {Map<string, { label: string, domainIncludes: string[] }>} */
  const properties = new Map();

  for (const node of vocab['@graph']) {
    const id = stripPrefix(node['@id']);
    const type = node['@type'];
    const types = toArray(type).map(stripPrefix);
    if (types.includes('rdfs:Class') || types.includes('Class')) {
      classes.set(id, {
        label: node['rdfs:label'] ?? id,
        subClassOf: idsOf(node['rdfs:subClassOf']),
      });
    }
    if (types.includes('rdf:Property') || types.includes('Property')) {
      properties.set(id, {
        label: node['rdfs:label'] ?? id,
        domainIncludes: idsOf(node['schema:domainIncludes'] ?? node['domainIncludes']),
      });
    }
  }

  return { classes, properties };
}

/** `className` plus every transitive `rdfs:subClassOf` ancestor (schema.org has single- and, rarely, multi-inheritance). */
export function ancestorsOf(className, classes) {
  const seen = new Set();
  const queue = [className];
  while (queue.length > 0) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    const entry = classes.get(current);
    if (entry) queue.push(...entry.subClassOf);
  }
  return seen;
}

/** True if `propertyName` may legally appear on `className` per schema.org's `domainIncludes` + inheritance. */
export function propertyAppliesTo(propertyName, className, index) {
  const prop = index.properties.get(propertyName);
  if (!prop) return false;
  const ancestry = ancestorsOf(className, index.classes);
  return prop.domainIncludes.some((domainClass) => ancestry.has(domainClass));
}
