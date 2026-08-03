import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { KeypadDesigner } from '@/features/keypadDesigner/KeypadDesigner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EnquiryCta } from '@/components/EnquiryCta';
import { SITE_PREFILLS } from '@/lib/prefill';
import { Seo } from '@/seo/Seo';
import { keypadDesignerMeta } from '@/seo/meta';
import { keypadDesignerCrumbs } from '@/seo/breadcrumbs';
import { buildWebApplication } from '@/seo/jsonld/webApplication';
import { buildWebPage } from '@/seo/jsonld/webpage';
import { buildBreadcrumbList } from '@/seo/jsonld/breadcrumbList';
import { breadcrumbNodeId } from '@/seo/jsonld/ids';

export function KeypadDesignerPage() {
  const { t } = useTranslation();
  const meta = keypadDesignerMeta();
  const crumbs = keypadDesignerCrumbs();

  return (
    <>
      <Seo
        meta={meta}
        jsonLd={[
          buildWebApplication({
            path: meta.path,
            name: t('designer.seoTitle'),
            description: t('designer.seoDescription'),
            applicationCategory: 'DesignApplication',
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
      <section className="relative pt-40 pb-14 container-luxe">
        <Reveal>
          <Breadcrumbs crumbs={crumbs} />
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>{t('designer.entryEyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-4xl">{t('designer.heroTitle')}</h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">{t('designer.heroBody')}</p>
        </Reveal>
      </section>

      {/* designer */}
      <section className="container-luxe pb-16">
        <KeypadDesigner />
      </section>

      {/*
       * ONE placement on this route, not the usual two, and it sits below the
       * tool rather than in the first viewport. That is deliberate.
       *
       * The page's prefill (`SITE_PREFILLS.keypadDesigner`) says "I've
       * configured a Black Nova keypad and I'd like a quotation for it" — a
       * sentence that is only true once the designer has been used. Rendering
       * it above the tool would put words in a visitor's mouth about something
       * they have not done yet, which is the one thing a prefill must never do
       * (`_CONVENTIONS.md` §7: it has to read like something a human would
       * actually send). A second, higher block would also duplicate the
       * designer's own summary-step WhatsApp button, which carries the full
       * configured specification and is strictly better wherever it applies.
       *
       * This block exists because that summary button is behind client state:
       * it is not in the prerendered HTML, so with JavaScript disabled this
       * route would otherwise offer no WhatsApp path at all. This one is static.
       */}
      <section className="container-luxe pb-32">
        <Reveal>
          <EnquiryCta
            title={t('designer.ctaTitle')}
            prefill={SITE_PREFILLS.keypadDesigner}
            brand="Black Nova"
          />
        </Reveal>
      </section>
    </>
  );
}
