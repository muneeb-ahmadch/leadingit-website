import { absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from './types';
import { ORG_ID, WEBSITE_ID, pageUrl } from './ids';

export type ArticleInput = {
  /** Site-relative canonical path, e.g. `/journal/some-post-slug`. */
  path: string;
  headline: string;
  description: string;
  /** ISO 8601. Must be the real publish date — never a build-time timestamp. */
  datePublished: string;
  dateModified?: string;
  image: string;
  /** Real name of a real credentialed author — never invent one. */
  authorName: string;
  authorUrl?: string;
};

/**
 * AWAITING CONTENT — the journal (`/journal/`, `/journal/<slug>/`) does not
 * exist yet. `.claude/skills/schema-jsonld/SKILL.md` requires "Article +
 * author Person (real credentials)" — never wire this with a placeholder
 * author name or a fabricated `datePublished`; both must come from the real
 * post's frontmatter once the journal template exists.
 */
export function buildArticle(input: ArticleInput): JsonLdNode {
  const url = pageUrl(input.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: input.headline,
    description: input.description,
    url,
    image: [absoluteUrl(input.image)],
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      '@type': 'Person',
      name: input.authorName,
      ...(input.authorUrl ? { url: input.authorUrl } : {}),
    },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}
