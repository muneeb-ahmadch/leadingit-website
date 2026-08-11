/**
 * The photographic hero band used by the hub pages (`/brands/`, `/solutions/`,
 * `/lit-home/`, `/about/`).
 *
 * It exists so those four pages share **one** visual decision rather than four
 * improvised ones (CLAUDE.md rule 5). Every part of it is already in the
 * shipped system — the same full-bleed `ResponsiveImage`, the same `Parallax`,
 * the same `bg-warm-radial` and `grain` the home page's hero and lifestyle
 * bands use. Nothing new was invented here except the gradient stops, which are
 * tuned versions of Home's (`from-ink-950/40 via-ink-950/30 to-ink-950`) and
 * use no colour outside the locked ink token.
 *
 * ## The image is always decorative
 *
 * `alt=""`, hardcoded, and that is not a shortcut. Every photograph passed in
 * here resolves to `''` through `altFor()` as well (each is either shared
 * across product records or an un-viewed single-owner lifestyle shot), so the
 * empty alt agrees with the canonical resolution rather than overriding it —
 * unlike the documented `/brands/` tile exception in
 * `src/components/media/altText.ts`. **Keep it that way:** if a future caller
 * wants a photograph that `altFor()` captions (a product hero, a `CURATED`
 * brand shot), that image is making a claim and does not belong in a
 * decorative band. Pick another file rather than silencing its caption.
 *
 * ## Why the children are only the breadcrumb, eyebrow and h1
 *
 * The lead paragraph and the `EnquiryCta` stay in a normal section *below* the
 * band, on solid ink. Two reasons, both load-bearing:
 *   1. Contrast. A CTA panel and body copy over a photograph is where WCAG 2.2
 *      AA quietly fails at some viewport nobody tested.
 *   2. `docs/10-CONTENT-BRIEFS/_CONVENTIONS.md` §7 wants the primary CTA in the
 *      first viewport. The band is 70svh, so the CTA immediately under it is
 *      still there — but only because the band does not also have to hold it.
 *
 * ## Layout notes that look arbitrary and are not
 *
 * - The moving layer is `-inset-y-16` (64px bleed top and bottom), which is
 *   larger than `Parallax`'s 40px travel. Without that, the parallax slides the
 *   image off its own box and exposes a strip of page background at one edge.
 * - `items-end` bottom-anchors the text, so it sits in the solid part of the
 *   gradient at every viewport height. `pt-40` is clearance for the fixed
 *   transparent header when the content grows taller than the band.
 */
import type { ReactNode } from 'react';
import { Parallax } from '@/components/primitives/Parallax';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';

/**
 * The band is full-bleed at every breakpoint. Exported so a page's
 * `<Seo lcpImage>` preload and the `<ResponsiveImage sizes>` below are read
 * from one constant and cannot drift into preloading the wrong candidate.
 */
export const PAGE_HERO_SIZES = '100vw';

type Props = {
  /** Decorative full-bleed photograph. Must resolve to `''` through `altFor()`. */
  image: string;
  /** Breadcrumb, eyebrow and h1 only — see the note above. */
  children: ReactNode;
};

export function PageHero({ image, children }: Props) {
  return (
    <section className="relative flex min-h-[70svh] items-end overflow-hidden grain">
      <Parallax distance={40} className="absolute -inset-y-16 inset-x-0">
        <ResponsiveImage
          src={image}
          alt=""
          sizes={PAGE_HERO_SIZES}
          className="h-full w-full object-cover"
          priority
        />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/75 via-ink-950/45 to-ink-950" />
      <div className="absolute inset-0 bg-warm-radial" />
      <div className="relative w-full container-luxe pt-40 pb-16">{children}</div>
    </section>
  );
}
