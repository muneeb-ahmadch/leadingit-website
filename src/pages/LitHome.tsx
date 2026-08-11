import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Parallax } from '@/components/primitives/Parallax';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { PageHero, PAGE_HERO_SIZES } from '@/components/PageHero';
import { buildLcpImagePreload } from '@/components/media/imageSrcSet';
import { DeviceFrame } from '@/features/litHome/DeviceFrame';
import { LitHomeDemo } from '@/features/litHome/LitHomeDemo';
import { BRANDS } from '@/data/brands';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EnquiryCta } from '@/components/EnquiryCta';
import { SITE_PREFILLS } from '@/lib/prefill';
import { Seo } from '@/seo/Seo';
import { litHomeMeta } from '@/seo/meta';
import { simplePageCrumbs } from '@/seo/breadcrumbs';
import { buildWebApplication } from '@/seo/jsonld/webApplication';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

const FEATURES = [
  {
    title: 'One interface, every system',
    body:
      'Lighting, climate, blinds, audio, cinema, security — controlled from a single, considered surface designed to disappear when not in use.',
  },
  {
    title: 'Wall panel, tablet, phone',
    body:
      'The same experience, beautifully adapted to every surface in the residence. Designed in concert with the architecture, never imposed on it.',
  },
  {
    title: 'Tuned for the region',
    body:
      'Built for the climate, networks and habits of Pakistan and the UAE. Bilingual interface (Arabic, Urdu) and local installer support.',
  },
  {
    title: 'Open to your brands',
    body:
      'Compatible with Crestron, KNX, Lutron, BACnet, DALI, and the audio and cinema systems you trust — orchestrated under one identity.',
  },
];

// Real Basalte lifestyle photography (raw/products/basalte/**,
// manufacturer/dealer-sourced — docs/12-PROVENANCE/image-url-map.md), reused
// here as decorative full-bleed bands (`alt=""`, no product named/claimed).
// Both resolve to `''` through `altFor()` independently, so the empty alt
// agrees with the canonical resolution rather than overriding it.
//
// The hero is an evening living room under warm light — the *result* of one
// interface running a residence, which is what this page sells, rather than a
// screenshot of the interface itself (the `DeviceFrame` demo below does that
// job, and does it interactively).
const HERO_IMAGE = '/products/basalte/sentido-scene.jpg';
const LIFESTYLE = '/products/basalte/deseo-sfeer.jpg';

export function LitHomePage() {
  const { t } = useTranslation();
  const meta = litHomeMeta();
  const crumbs = simplePageCrumbs(t('nav.litHome'), meta.path);

  return (
    <>
      <Seo
        meta={meta}
        jsonLd={[
          buildWebApplication({
            path: meta.path,
            name: t('litHome.eyebrow'),
            description: meta.description,
            applicationCategory: 'HomeApplication',
          }),
          buildWebPage({
            path: meta.path,
            name: meta.title,
            description: meta.description,
            breadcrumbId: breadcrumbNodeId(meta.path),
          }),
          buildBreadcrumbList(crumbs, meta.path),
        ]}
        // Matches the `PageHero` band below (`src`, `sizes`). The second band
        // (`LIFESTYLE`) is far below the fold and stays lazy.
        lcpImage={buildLcpImagePreload(HERO_IMAGE, PAGE_HERO_SIZES)}
      />

      {/* hero */}
      <PageHero image={HERO_IMAGE}>
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('litHome.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-5xl">{t('litHome.title')}</h1>
        </Reveal>
      </PageHero>

      {/* Intro and the first-viewport conversion path (`_CONVENTIONS.md` §7),
          on solid ink directly under the band — never over the photograph. */}
      <section className="container-luxe pt-14 pb-20">
        <Reveal>
          <p className="max-w-2xl text-lg leading-relaxed text-bone-300">
            {t('litHome.subtitle')}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <EnquiryCta
            title={t('litHome.ctaTitle')}
            prefill={SITE_PREFILLS.litHome}
            className="mt-14 max-w-3xl"
          />
        </Reveal>
      </section>

      {/* try the interface */}
      <section className="bg-ink-900 py-28">
        <div className="container-luxe">
          <Reveal>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
              <div>
                <Eyebrow>{t('litHome.demoEyebrow')}</Eyebrow>
                <h2 className="mt-4 font-serif text-hero">{t('litHome.demoTitle')}</h2>
              </div>
              <p className="text-lg leading-relaxed text-bone-300 self-end max-w-xl">
                {t('litHome.demoSub')}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="mt-16">
            <DeviceFrame variant="ipad" className="!max-w-[1100px]">
              <LitHomeDemo surface="ipad" />
            </DeviceFrame>
          </Reveal>
        </div>
      </section>

      {/*
       * features — CARD GRID REMOVED 2026-08-01 (Phase 4).
       *
       * `docs/02-DESIGN-SOURCE-OF-TRUTH.md` obliges removing "the three-card
       * cliché grids on Home / About / LIT Home". Recorded honestly: what was
       * here was a **four**-card grid (`md:grid-cols-2`, four FEATURES), not a
       * three-card one. The doc's count did not match the code. The ban is on
       * the numbered-card marketing cliché — `0{i+1}` + heading + paragraph in
       * a bordered tile — not on the number three, so this was in scope and the
       * discrepancy is noted rather than quietly reinterpreted.
       *
       * The copy is unchanged and stays: it describes our own product, is
       * defensible, and was never the problem. Only the presentation changed,
       * and it is assembled from existing system pieces (`Eyebrow`, serif
       * heading, `rule-gold`, body text) — no new visual decisions, per
       * CLAUDE.md rule 5.
       */}
      <section className="container-luxe py-32">
        <Reveal>
          <Eyebrow>{t('litHome.featuresTitle')}</Eyebrow>
        </Reveal>
        <div className="mt-12 max-w-4xl">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className={i === 0 ? '' : 'mt-14'}>
                <div className="rule-gold" />
                <h3 className="mt-7 font-serif text-3xl">{f.title}</h3>
                <p className="mt-4 text-bone-500 leading-relaxed max-w-2xl">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* lifestyle */}
      <section className="relative h-[70svh] min-h-[460px] overflow-hidden grain">
        <Parallax distance={60} className="absolute inset-0">
          <ResponsiveImage
            src={LIFESTYLE}
            alt=""
            sizes="100vw"
            className="h-full w-full object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      </section>

      {/* compatibility strip */}
      <section className="container-luxe py-28">
        <Reveal>
          <Eyebrow>{t('litHome.compatTitle')}</Eyebrow>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/5 border border-white/5">
          {BRANDS.map((b) => (
            <div
              key={b.slug}
              className="bg-ink-900 aspect-[3/2] flex items-center justify-center px-6"
            >
              <span className="font-serif text-lg tracking-wider2 text-bone-300">{b.wordmark}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Second placement, after the body (`_CONVENTIONS.md` §7). No FAQ block
          on this page, so two placements, not a padded third. */}
      <section className="container-luxe pb-32">
        <Reveal>
          <EnquiryCta title={t('litHome.footCtaTitle')} prefill={SITE_PREFILLS.litHome} />
        </Reveal>
      </section>
    </>
  );
}
