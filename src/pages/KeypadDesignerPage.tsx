import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { KeypadDesigner } from '@/features/keypadDesigner/KeypadDesigner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
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
      <section className="container-luxe pb-32">
        <KeypadDesigner />
      </section>
    </>
  );
}
