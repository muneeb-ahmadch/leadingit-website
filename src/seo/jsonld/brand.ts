import type { Brand } from '@/data/brands';
import type { JsonLdNode } from './types';
import { brandId, pageUrl } from './ids';

/**
 * `Brand` node for a brand hub (`/brands/<slug>/`).
 *
 * Deliberately omitted: `logo`, and `image` too. `Brand.heroImage` in
 * `src/data/brands.ts` is lifestyle/stock photography (several are still
 * Unsplash hotlinks — see docs/OPEN-QUESTIONS.md #4), not an official brand
 * mark or a verified photograph of the brand itself; asserting it as `logo`
 * or `image` would fabricate a claim that this photo depicts the
 * Crestron/Blustream/Basalte/etc. entity — exactly the failure a live audit
 * caught in `itemList.ts`'s brand `ItemList` (fixed there via
 * `firstPartyImage()`). This builder never touches `brand.heroImage` at all,
 * so it was already clear of that defect; if an `image`/`logo` property is
 * ever added here, gate it through the same first-party-only rule, never a
 * bare `absoluteUrl(brand.heroImage)`. Wire a real logo asset once brand logo
 * packs are cleared for use.
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
