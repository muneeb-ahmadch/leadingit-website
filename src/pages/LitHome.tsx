import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Parallax } from '@/components/primitives/Parallax';
import { DeviceFrame } from '@/features/litHome/DeviceFrame';
import { LitHomeDemo } from '@/features/litHome/LitHomeDemo';
import { BRANDS } from '@/data/brands';
import { Breadcrumbs } from '@/components/Breadcrumbs';
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

const LIFESTYLE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=85';

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
      />

      {/* hero */}
      <section className="relative pt-44 pb-20 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <Eyebrow>{t('litHome.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-5xl">{t('litHome.title')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">
            {t('litHome.subtitle')}
          </p>
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

      {/* features */}
      <section className="container-luxe py-32">
        <Reveal>
          <Eyebrow>{t('litHome.featuresTitle')}</Eyebrow>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-2 gap-px bg-white/5 border border-white/5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="bg-ink-900 p-10 h-full">
                <div className="font-mono text-xs text-gold">0{i + 1}</div>
                <h3 className="mt-4 font-serif text-3xl">{f.title}</h3>
                <p className="mt-4 text-bone-500 leading-relaxed">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* lifestyle */}
      <section className="relative h-[70svh] min-h-[460px] overflow-hidden grain">
        <Parallax distance={60} className="absolute inset-0">
          <img src={LIFESTYLE} alt="" className="h-full w-full object-cover" loading="lazy" />
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
    </>
  );
}
