import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { useSeo } from '@/lib/useSeo';

const TEAM = [
  { name: 'Jonathan', roleKey: 'about.roleManagingDirector' },
  { name: 'Mihajlo', roleKey: 'about.roleDirectorEngineering' },
  { name: 'Liaquat', roleKey: 'about.roleTerritoryDirector' },
];

export function About() {
  const { t } = useTranslation();
  useSeo({
    title: 'About — Engineers, Not a Sales Team',
    description:
      'Leading IT is a team of engineers with over 60 years of experience, helping clients select, procure and integrate quality automation across the Gulf and Pakistan.',
    path: '/about',
    keywords: 'Leading IT, about, automation engineers, value-added distributor Gulf Pakistan',
  });
  const stats = [
    { value: t('about.stat1Value'), label: t('about.stat1Label') },
    { value: t('about.stat2Value'), label: t('about.stat2Label') },
    { value: t('about.stat3Value'), label: t('about.stat3Label') },
  ];

  return (
    <>
      {/* hero */}
      <section className="relative pt-44 pb-24 container-luxe">
        <Reveal>
          <Eyebrow>{t('about.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{t('about.title')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-10 text-lg leading-relaxed text-bone-300 max-w-3xl">
            {t('about.lead')}
          </p>
        </Reveal>
      </section>

      {/* stats */}
      <section className="container-luxe pb-24">
        <div className="grid sm:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="bg-ink-900 p-10 h-full">
                <div className="font-serif text-6xl text-gold">{s.value}</div>
                <div className="mt-4 text-sm uppercase tracking-luxe text-bone-500 leading-relaxed">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* team */}
      <section className="bg-ink-900 py-28">
        <div className="container-luxe">
          <Reveal>
            <Eyebrow>{t('about.teamEyebrow')}</Eyebrow>
            <h2 className="mt-4 font-serif text-hero max-w-2xl">{t('about.teamTitle')}</h2>
          </Reveal>

          <div className="mt-16 grid md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <div className="bg-ink-950 p-10 h-full">
                  {/* monogram placeholder — swap for a portrait in build phase */}
                  <div className="aspect-[4/5] bg-ink-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-warm-radial opacity-40" />
                    <span className="relative font-serif text-7xl text-gold/80">{m.name[0]}</span>
                  </div>
                  <div className="mt-6 font-serif text-3xl">{m.name}</div>
                  <div className="mt-2 text-sm uppercase tracking-luxe text-bone-500">
                    {t(m.roleKey)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="container-luxe py-32">
        <Reveal>
          <div className="relative border border-white/5 bg-ink-900 p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-warm-radial opacity-50" />
            <div className="relative max-w-2xl">
              <h2 className="font-serif text-hero">{t('about.ctaTitle')}</h2>
              <p className="mt-6 text-lg leading-relaxed text-bone-300">{t('about.ctaBody')}</p>
              <div className="mt-10">
                <ButtonLink to="/contact">{t('about.ctaButton')}</ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
