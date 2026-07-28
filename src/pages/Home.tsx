import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Parallax } from '@/components/primitives/Parallax';
import { BRANDS } from '@/data/brands';
import { DeviceFrame } from '@/features/litHome/DeviceFrame';
import { LitHomeDemo } from '@/features/litHome/LitHomeDemo';
import { useHydrated } from '@/lib/hydration';
import { Seo } from '@/seo/Seo';
import { homeMeta } from '@/seo/meta';
import { buildWebPage } from '@/seo/jsonld/webpage';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1758915753332-cab59126742c?auto=format&fit=crop&w=2400&q=85';

const LIFESTYLE_IMAGE =
  'https://images.unsplash.com/photo-1724582586529-62622e50c0b3?auto=format&fit=crop&w=2400&q=85';

export function Home() {
  const { t } = useTranslation();
  // The site's identity graph is anchored here: `Organization` and `WebSite` are
  // sitewide nodes every other page references by `@id`, and the home page is
  // where they are actually defined. No `BreadcrumbList` — a breadcrumb on the
  // root of the site is a single-item trail, which is not a trail
  // (`src/seo/breadcrumbs.ts`).
  const meta = homeMeta();
  const heroRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const heroFade = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <>
      {/* Organization and WebSite are prepended to every page's graph by
          <Seo>, so the home page does not restate them. */}
      <Seo
        meta={meta}
        jsonLd={[
          buildWebPage({ path: meta.path, name: meta.title, description: meta.description }),
        ]}
      />

      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[680px] overflow-hidden grain">
        {/* Scroll transforms attach after hydration so the prerendered hero ships
            without inline opacity/transform state. `scale-105` keeps the resting
            frame identical either side of that hand-off. */}
        <motion.div
          style={hydrated ? { y: heroY, scale: heroScale, opacity: heroFade } : undefined}
          className="absolute inset-0 scale-105"
        >
          <img
            src={HERO_IMAGE}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/30 to-ink-950" />
          <div className="absolute inset-0 bg-warm-radial" />
        </motion.div>

        <div className="relative h-full container-luxe flex flex-col justify-end pb-24">
          <Reveal>
            <Eyebrow>{t('home.eyebrow')}</Eyebrow>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="mt-6 font-serif text-display max-w-4xl text-bone-100">
              {t('home.headline')}
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">
              {t('home.subline')}
            </p>
          </Reveal>
          <Reveal delay={0.45}>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <ButtonLink to="/lit-home">{t('home.secondaryCta')}</ButtonLink>
              <ButtonLink to="/brands" variant="ghost">{t('home.cta')}</ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xs uppercase tracking-luxe text-bone-500"
          >
            scroll
          </motion.span>
        </div>
      </section>

      {/* BRAND WALL */}
      <section className="container-luxe py-32">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 mb-16">
          <Reveal>
            <Eyebrow>{t('home.brandWallEyebrow')}</Eyebrow>
            <h2 className="mt-5 font-serif text-hero">{t('home.brandWallTitle')}</h2>
          </Reveal>
          <Reveal delay={0.15} className="self-end">
            <p className="text-bone-500 leading-relaxed text-lg max-w-xl">
              {t('home.brandWallSub')}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {BRANDS.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.04}>
              <a
                href={`/brands/${b.slug}`}
                className="group block bg-ink-900 aspect-[5/3] flex items-center justify-center p-8 relative overflow-hidden transition-colors duration-700 hover:bg-ink-800"
              >
                <span className="font-serif text-2xl tracking-wider2 text-bone-300 group-hover:text-gold transition-colors duration-500">
                  {b.wordmark}
                </span>
                <span className="absolute bottom-4 start-6 text-[10px] uppercase tracking-luxe text-bone-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {b.tagline}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* LIT HOME TEASER */}
      <section className="relative bg-ink-900 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-warm-radial opacity-60" />
        <div className="container-luxe relative grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <Eyebrow>{t('home.litTeaserEyebrow')}</Eyebrow>
              <h2 className="mt-5 font-serif text-hero">{t('home.litTeaserTitle')}</h2>
              <p className="mt-6 text-lg leading-relaxed text-bone-300 max-w-xl">
                {t('home.litTeaserBody')}
              </p>
              <div className="mt-10">
                <ButtonLink to="/lit-home">{t('home.litTeaserCta')}</ButtonLink>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Parallax distance={40}>
              <DeviceFrame variant="ipad">
                <LitHomeDemo />
              </DeviceFrame>
            </Parallax>
          </Reveal>
        </div>
      </section>

      {/* LIFESTYLE MOMENT */}
      <section className="relative h-[80svh] min-h-[520px] overflow-hidden grain">
        <Parallax distance={60} className="absolute inset-0">
          <img
            src={LIFESTYLE_IMAGE}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
        <div className="relative h-full container-luxe flex flex-col justify-end pb-24">
          <Reveal>
            <blockquote className="font-serif text-3xl md:text-5xl leading-tight max-w-3xl text-bone-100">
              "{t('home.lifestyleQuote')}"
            </blockquote>
            <div className="mt-6 text-sm uppercase tracking-luxe text-gold">
              {t('home.lifestyleAttribution')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED PRODUCTS — minimal placeholder strip */}
      <section className="container-luxe py-32">
        <Reveal>
          <Eyebrow>{t('home.featuredEyebrow')}</Eyebrow>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {BRANDS.slice(0, 3).map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.1}>
              <a href={`/brands/${b.slug}`} className="group block">
                <div className="aspect-[4/5] bg-ink-800 overflow-hidden">
                  <img
                    src={b.heroImage}
                    alt={b.name}
                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out-luxe"
                    loading="lazy"
                  />
                </div>
                <div className="mt-5">
                  <div className="eyebrow">{b.category === 'interfaces' ? 'Architectural' : 'Cinema'}</div>
                  <div className="mt-2 font-serif text-2xl group-hover:text-gold transition-colors">
                    {b.name}
                  </div>
                  <div className="mt-1 text-bone-500 text-sm">{b.tagline}</div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
