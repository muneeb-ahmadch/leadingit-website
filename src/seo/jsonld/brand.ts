import type { Brand } from '@/data/brands';
import type { JsonLdNode } from './types';
import { brandId, pageUrl } from './ids';

/**
 * `Brand` node for a brand hub (`/brands/<slug>/`).
 *
 * Deliberately omitted: `logo`. `Brand.heroImage` in `src/data/brands.ts` is
 * lifestyle/stock photography (several are still Unsplash hotlinks — see
 * docs/OPEN-QUESTIONS.md #4), not an official brand mark; asserting it as
 * `logo` would mischaracterise a photo as a trademark. Wire a real logo asset
 * once brand logo packs are cleared for use.
 *
 * No dealer-authorisation wording anywhere here (docs/OPEN-QUESTIONS.md #3
 * pending) — `name`/`slogan`/`description` are reproduced from
 * `src/data/brands.ts` as-is; that copy is already neutral supply/distribution
 * language, not an "authorized dealer" claim.
 */
export function buildBrand(brand: Brand): JsonLdNode {
  return {
    '@type': 'Brand',
    '@id': brandId(brand.slug),
    name: brand.name,
    slogan: brand.tagline,
    description: brand.story,
    url: pageUrl(`/brands/${brand.slug}`),
  };
}
