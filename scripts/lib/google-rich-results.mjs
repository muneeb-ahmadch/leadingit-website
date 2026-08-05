// Google Search Central's documented required/recommended structured-data
// properties for the six @types this site emits (Product, BreadcrumbList,
// Organization, WebSite, ItemList, WebApplication) — transcribed by hand from
// the live docs on 2026-07-28. There is no public API for these tables, so
// they are not auto-fetched; re-check the URLs below if Google's guidance
// changes and this file drifts.
//
// ## The one deliberate deviation from "assert everything Google recommends"
//
// Google's Product snippet and Software App specs each require *at least one*
// of a pricing/review group (Product: offers|review|aggregateRating;
// WebApplication: offers.price, plus separately aggregateRating|review) for
// the type to earn its rich result at all. This project's locked rule
// (CLAUDE.md, src/seo/jsonld/product.ts, src/seo/jsonld/webApplication.ts) is
// the opposite: never emit a price, availability or rating without a real,
// user-approved source — an absent property is safe, a fabricated one is a
// liability. Those two rules cannot both be satisfied at once, and fabricating
// data to close the gap is exactly what this project exists to refuse.
//
// So: those specific items are modelled as `requiredAcknowledgedGaps` /
// `recommendedAcknowledgedGaps` — printed loudly, every run, under their own
// non-blocking report section — rather than silently asserted away *or*
// treated as a build-breaking warning that could only ever be "fixed" by
// inventing a price or a review. docs/11-SEO-VALIDATION.md spells this out.
//
// ## Why a gap entry is not a free-form excuse
//
// An adversarial audit found this escape hatch honest in substance but
// structurally weak: (1) a gap's prose was printed unconditionally, even if
// the property it describes were somehow present — a fabricated value could
// hide behind truthful-sounding gap text forever; (2) nothing stopped a gap
// entry from being added without ever saying *why*, turning "move a check
// into a gap" into a one-line, unreviewed way to silence any check. Both are
// closed structurally, not by convention:
//
// - every gap entry must carry `props` (the real schema.org property name(s)
//   it claims are absent) — `checkGoogleRichResults()` verifies every matching
//   node genuinely lacks all of them, and raises a hard `error` (not a gap) if
//   any node actually carries one. A gap can only ever assert an absence it
//   has checked, never merely narrate one.
// - every gap entry must carry a non-empty `reason` and a `ref` that cites
//   either a `docs/OPEN-QUESTIONS.md #<n>` item or `CLAUDE.md` — enforced by
//   `assertGapEntryShape()`, which fails the build if either is missing. A gap
//   with no citation is a hidden decision; this makes it an impossible one.
export const GOOGLE_SPECS = [
  {
    type: 'Organization',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/organization',
    // Only the sitewide identity node — Product.manufacturer's inline
    // `{ "@type": "Organization", "name": ... }` stub (src/seo/jsonld/product.ts)
    // is a distinct, deliberately minimal value, not a claim to have filled
    // out Organization's own recommended fields.
    matchNode: (node, ref) => node['@id'] === ref.ORG_ID,
    requiredChecked: [],
    requiredAcknowledgedGaps: [],
    // Google: "There are no required properties; instead, we recommend adding
    // as many properties that are relevant to your organization."
    // foundingDate joined the checked set 2026-08-05: Muneeb confirmed 2018
    // (OQ #8), and legalName/numberOfEmployees/location shipped in the same
    // change (src/seo/jsonld/organization.ts).
    recommendedChecked: ['name', 'url', 'description', 'contactPoint', 'foundingDate'],
    recommendedAcknowledgedGaps: [
      {
        props: ['logo'],
        reason:
          'no real Leading IT logo asset exists in the repo yet (src/seo/jsonld/organization.ts) — the 1200×630 og:image is a social-share image, not a logo, and asserting it as one would mischaracterise it.',
        ref: 'docs/OPEN-QUESTIONS.md #8; CLAUDE.md — never invent a value to satisfy a schema property.',
      },
      {
        props: ['address'],
        reason:
          'deliberate placement, not a gap in the data: the confirmed NAP (2026-08-05) lives on the LocalBusiness showroom node that Organization.location references — duplicating the PostalAddress onto Organization would be a second copy to drift.',
        ref: 'docs/OPEN-QUESTIONS.md #1 (answered); src/data/nap.ts',
      },
    ],
  },
  {
    type: 'BreadcrumbList',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
    matchNode: () => true,
    requiredChecked: ['itemListElement'],
    requiredAcknowledgedGaps: [],
    recommendedChecked: [],
    recommendedAcknowledgedGaps: [],
  },
  {
    type: 'Product',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/product-snippet',
    matchNode: () => true, // range pages never carry a Product node — checked separately
    requiredChecked: ['name'],
    requiredAcknowledgedGaps: [
      {
        props: ['offers', 'review', 'aggregateRating'],
        description: 'one of offers, review or aggregateRating (Google: "Required" — at least one)',
        reason:
          'no user-approved pricing stance exists yet and no real customer reviews exist to source a review or ' +
          "aggregateRating from. Product pages on this site cannot earn Google's Product rich result until a " +
          'pricing stance is set — a tracked, accepted gap, not a defect of this harness.',
        ref: 'CLAUDE.md — never default to a price or InStock; src/seo/jsonld/product.ts never emits offers/price.',
      },
    ],
    recommendedChecked: ['image', 'description', 'brand'],
    recommendedAcknowledgedGaps: [
      {
        props: ['sku', 'mpn', 'gtin'],
        description: 'sku / mpn / gtin',
        reason: 'no manufacturer part number on file for any catalog record — never synthesised from the slug.',
        ref: 'CLAUDE.md — never invent a value to satisfy a schema property.',
      },
    ],
  },
  {
    type: 'WebSite',
    docUrl: null,
    note:
      '"Sitelinks search box" — the only Google rich result WebSite ever powered — was removed ' +
      '2024-11-29 (Search Central changelog: "The sitelinks search box feature is no longer ' +
      'available in Google Search results"). WebSite carries no documented Google rich-result ' +
      'requirement today; only generic schema.org vocabulary validity applies (checked separately).',
    matchNode: (node, ref) => node['@id'] === ref.WEBSITE_ID,
    requiredChecked: [],
    requiredAcknowledgedGaps: [],
    recommendedChecked: [],
    recommendedAcknowledgedGaps: [],
  },
  {
    type: 'ItemList',
    docUrl: null,
    note:
      'Google only processes ItemList inside a Course/Movie/Recipe/Restaurant carousel ' +
      '(developers.google.com/search/docs/appearance/structured-data/carousel) — none of which ' +
      'this site has. Standalone ItemList (the brand and product listings here) has no documented ' +
      'Google rich result; only generic schema.org vocabulary validity applies.',
    matchNode: () => true,
    requiredChecked: [],
    requiredAcknowledgedGaps: [],
    recommendedChecked: [],
    recommendedAcknowledgedGaps: [],
  },
  {
    type: 'WebApplication',
    docUrl: 'https://developers.google.com/search/docs/appearance/structured-data/software-app',
    // Google's guide documents "Software App" for schema.org SoftwareApplication,
    // of which WebApplication is a subtype.
    matchNode: () => true,
    requiredChecked: ['name'],
    requiredAcknowledgedGaps: [
      {
        props: ['offers'],
        description: 'offers.price (Google: "Required")',
        reason:
          'LIT Home and the Black Nova keypad designer are free in-browser tools ' +
          '(isAccessibleForFree: true, src/seo/jsonld/webApplication.ts) — inventing an Offer ' +
          'to satisfy this would misstate that fact.',
        ref: 'CLAUDE.md — never invent a value to satisfy a schema property.',
      },
      {
        props: ['aggregateRating', 'review'],
        description: 'aggregateRating or review (Google: "Required" — one of)',
        reason: 'no real reviews exist for either tool — never fabricated.',
        ref: 'CLAUDE.md — never invent a value to satisfy a schema property.',
      },
    ],
    recommendedChecked: ['applicationCategory'],
    recommendedAcknowledgedGaps: [
      {
        props: ['operatingSystem'],
        reason: 'a browser tool has no OS-specific packaging to claim (src/seo/jsonld/webApplication.ts).',
        ref: 'CLAUDE.md — never invent a value to satisfy a schema property.',
      },
    ],
  },
];

const GAP_REF_PATTERN = /OPEN-QUESTIONS\.md #\d+|CLAUDE\.md/;

/**
 * Fails loudly (via `error`, not `gap`) if a gap entry is missing the shape
 * the harness needs to trust it: real property name(s) to verify absent, a
 * reason, and a traceable citation. This is what makes "move a check into a
 * gap" an accountable action instead of a one-line unreviewed silencing.
 */
/** @returns {boolean} `true` only if the entry is well-formed enough to process safely. */
function assertGapEntryShape(type, entry, error) {
  let valid = true;
  if (!Array.isArray(entry.props) || entry.props.length === 0) {
    valid = false;
    error(
      'gap-shape',
      `(type: ${type})`,
      `an acknowledged-gap entry has no non-empty "props" array — the harness cannot verify the property is ` +
        'genuinely absent without knowing its real schema.org name(s).',
    );
  }
  if (typeof entry.reason !== 'string' || entry.reason.trim().length === 0) {
    valid = false;
    error(
      'gap-shape',
      `(type: ${type})`,
      'an acknowledged-gap entry has no non-empty "reason" — every acknowledged gap must explain why the ' +
        'property is absent, not just that it is.',
    );
  }
  if (typeof entry.ref !== 'string' || !GAP_REF_PATTERN.test(entry.ref)) {
    valid = false;
    error(
      'gap-shape',
      `(type: ${type})`,
      `an acknowledged-gap entry's "ref" (${JSON.stringify(entry.ref ?? null)}) does not cite ` +
        '"docs/OPEN-QUESTIONS.md #<n>" or "CLAUDE.md" — every acknowledged gap must be traceable to a documented ' +
        'reason, not just an inline comment nobody has to justify.',
    );
  }
  return valid;
}

/**
 * @param {Array<{ type: string, node: Record<string, unknown>, file: string }>} typedNodeOccurrences
 *   every `{ type, node, file }` found anywhere in dist/, across all pages
 * @param {{ ORG_ID: string, WEBSITE_ID: string }} ref
 * @param {{ error: Function, warn: Function, gap: Function }} sink
 */
export function checkGoogleRichResults(typedNodeOccurrences, ref, { error, warn, gap }) {
  for (const spec of GOOGLE_SPECS) {
    const occurrences = typedNodeOccurrences.filter(
      (o) => o.type === spec.type && spec.matchNode(o.node, ref),
    );

    if (spec.docUrl === null) {
      gap(
        'google-rich-results',
        `(type: ${spec.type})`,
        `${spec.type}: ${spec.note} — ${occurrences.length} node(s) found in dist/, vocabulary-checked only.`,
      );
      continue;
    }

    for (const { node, file } of occurrences) {
      for (const prop of spec.requiredChecked) {
        if (!(prop in node)) {
          error(
            'google-required',
            file,
            `${spec.type} is missing "${prop}", which Google documents as required (${spec.docUrl}).`,
          );
        }
      }
      for (const prop of spec.recommendedChecked) {
        if (!(prop in node)) {
          warn(
            'google-recommended',
            file,
            `${spec.type} is missing "${prop}", which Google documents as recommended (${spec.docUrl}) — ` +
              'the phase gate is zero errors AND zero warnings.',
          );
        }
      }
    }

    for (const g of spec.requiredAcknowledgedGaps) {
      // A malformed entry is reported via `gap-shape` and skipped rather than
      // processed further — `g.props`/`g.reason`/`g.ref` cannot be trusted
      // enough to safely check absence or print a gap message from.
      if (!assertGapEntryShape(spec.type, g, error)) continue;
      for (const { node, file } of occurrences) {
        const fabricated = g.props.find((prop) => prop in node);
        if (fabricated) {
          error(
            'google-gap-violated',
            file,
            `${spec.type} carries "${fabricated}", but scripts/lib/google-rich-results.mjs declares that ` +
              `property an acknowledged, must-be-absent gap ("${g.reason}"). Either the value is fabricated and ` +
              'must be removed, or the gap entry is stale and must be deleted now that a real source exists.',
          );
        }
      }
      gap(
        'google-required-acknowledged',
        `(type: ${spec.type}, ${occurrences.length} page(s))`,
        `${spec.type}: Google requires ${g.description ?? g.props.join('/')}. Not emitted — ${g.reason} [${g.ref}]`,
      );
    }
    for (const g of spec.recommendedAcknowledgedGaps) {
      if (!assertGapEntryShape(spec.type, g, error)) continue;
      for (const { node, file } of occurrences) {
        const fabricated = g.props.find((prop) => prop in node);
        if (fabricated) {
          error(
            'google-gap-violated',
            file,
            `${spec.type} carries "${fabricated}", but scripts/lib/google-rich-results.mjs declares that ` +
              `property an acknowledged, must-be-absent gap ("${g.reason}"). Either the value is fabricated and ` +
              'must be removed, or the gap entry is stale and must be deleted now that a real source exists.',
          );
        }
      }
      gap(
        'google-recommended-acknowledged',
        `(type: ${spec.type}, ${occurrences.length} page(s))`,
        `${spec.type}: Google recommends "${g.description ?? g.props.join('/')}". Not emitted — ${g.reason} [${g.ref}]`,
      );
    }
  }
}
