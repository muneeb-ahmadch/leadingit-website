import { useEffect, useState, type ReactNode } from 'react';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';

/**
 * The photographic hero band for campaign landing pages (`/go/*`).
 *
 * A slow crossfade between three interiors, behind the locked ink gradient.
 * It is `PageHero` with a second and third frame — same `ResponsiveImage`, same
 * `bg-warm-radial`, same `grain`, same ink gradient stops. Nothing new is
 * invented here, which is the point: campaign pages use Direction B unchanged
 * (`docs/02-DESIGN-SOURCE-OF-TRUTH.md` Amendment 2).
 *
 * ## Why a slideshow instead of `PageHero`
 *
 * Paid traffic lands here once and decides in about four seconds. One still
 * carries the room; three carry the range — living room, cinema, corridor —
 * without a word of copy claiming it. It is also the difference between a page
 * that reads *dark* and one that reads *gloomy*, which was the note that
 * produced this component.
 *
 * ## The three frames, and why these three
 *
 * Chosen by looking at twelve candidates, not by filename — the failure mode
 * recorded in the marketing OS (`ad-formats/format-library.md`, t5-photo) was
 * three rejects that a filename made look fine: a public multiplex, a room with
 * the projector and the air-conditioner in shot, mid-market furniture. Rejected
 * here for the same reasons: `cinema-installation` (visible projector and AC
 * unit), `reserve-home-theatre-insitu` (mid-market), `cinema-wall` (reads as an
 * AV dealership rather than a home).
 *
 * All three below resolve to `''` through `altFor()`, verified by running it —
 * so `alt=""` agrees with the canonical resolution rather than silencing a
 * caption. `horizon-keypad-bedroom-brass` was the fourth candidate and is
 * excluded on exactly that test: `altFor()` captions it, so it is making a
 * claim and does not belong in a decorative band.
 */
/**
 * The lead frame: fireplace at dusk, warm lamplight, someone reading. The most
 * "lively" image in the library and the closest to the concept the ads run on
 * ("the room remembers you"). It is also the only frame that is preloaded and
 * eager — see the LCP note below.
 *
 * Declared as a literal and reused as `SLIDES[0]` rather than read back out of
 * the array, so the page's `<Seo lcpImage>` preload and the frame that actually
 * renders first are the same string by construction and cannot drift apart.
 */
export const CAMPAIGN_HERO_LEAD = '/products/basalte/sentido-scene.jpg';

/** Full-bleed at every breakpoint. Exported for the same
 * cannot-drift-from-the-preload reason as the lead frame. */
export const CAMPAIGN_HERO_SIZES = '100vw';

const SLIDES = [
  CAMPAIGN_HERO_LEAD,
  '/products/uandksound/cinema-theatre.jpg',
  '/products/basalte/fibonacci-scene.jpg',
] as const;

const SLIDE_MS = 7000;
const FADE_MS = 2000;

type Props = { children: ReactNode };

export function CampaignHero({ children }: Props) {
  /*
   * `active` drives the crossfade. `enhanced` gates frames 2 and 3 into the DOM
   * at all.
   *
   * Both start off, and that is a performance decision rather than a
   * hydration one. The lead frame is this page's LCP element and is preloaded;
   * mounting two more full-bleed images in the same paint would put three
   * requests in front of a 2.0s LCP budget for two frames nobody sees for
   * seven seconds. They are added after mount, so they cost nothing until the
   * page has already rendered.
   */
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Reduced motion gets the lead frame and nothing else — no fade, no timer,
    // no extra bytes. Same call the site shell makes before loading Lenis.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setEnhanced(true);
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  const frames = enhanced ? SLIDES : SLIDES.slice(0, 1);

  return (
    // Full viewport, not a 62svh band. The band left a tall black section
    // underneath it and the page read as "too black" — the fix is more
    // photograph, not more gradient. The form now lives inside this section, so
    // the whole first screen is the image.
    <section className="relative flex min-h-[92svh] items-center overflow-hidden grain lg:min-h-screen">
      <div className="absolute inset-0">
        {frames.map((src, i) => (
          <div
            key={src}
            // Opacity only — a compositor property, so the crossfade cannot move
            // layout and contributes nothing to CLS. `aria-hidden` because the
            // whole band is decorative and a screen reader should meet the h1,
            // not three empty images.
            aria-hidden="true"
            className="absolute inset-0 transition-opacity ease-out-luxe"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
          >
            <ResponsiveImage
              src={src}
              alt=""
              sizes={CAMPAIGN_HERO_SIZES}
              className="h-full w-full object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/*
       * Two scrims, and the split between them is what makes the photograph
       * readable instead of merely dark.
       *
       * The HORIZONTAL one does the accessibility work. Copy sits in the left
       * column, so that side stays at 92% ink and the ratio is deterministic:
       * over a worst-case pure-white pixel, 92% #0A0A0A composites to #262626,
       * and bone.100 on that is 12.6:1. The right side falls to 25% so the room
       * is actually visible — the form that sits there is on an OPAQUE panel and
       * needs no scrim of its own.
       *
       * The VERTICAL one is now mostly transparent through the middle. It was
       * `from-80% via-55% to-100%`, which stacked with the horizontal scrim and
       * buried the image under roughly 1.4 scrims' worth of ink at the bottom
       * left. It now only darkens the top (so the wordmark holds) and the last
       * stretch (so the section below joins without a seam).
       *
       * `bg-warm-radial` is the gold glow the home page hero already uses, and
       * it is the single element that stops an ink page reading as a black one.
       */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/45 via-transparent to-ink-950/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/92 via-ink-950/70 to-ink-950/25" />
      <div className="absolute inset-0 bg-warm-radial" />

      <div className="relative w-full container-luxe pt-28 pb-16 lg:py-32">{children}</div>
    </section>
  );
}
