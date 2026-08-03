import { useTranslation } from 'react-i18next';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { EnquiryCta } from '@/components/EnquiryCta';
import { SITE_PREFILLS } from '@/lib/prefill';
import { Seo } from '@/seo/Seo';
import { href } from '@/seo/paths';
import { notFoundMeta } from '@/seo/meta';

/**
 * Real 404 page. Prerendered to its own file (`/404/index.html`, mirrored to
 * `dist/404.html` for Apache's `ErrorDocument`) so a missing URL never resolves
 * to a duplicate of the homepage. `noindex` keeps the prerendered copy of the
 * error page itself out of the index.
 *
 * No structured data and no breadcrumb: an error page is not an entity worth
 * describing to a knowledge graph, and a `BreadcrumbList` on it would claim a
 * position in a hierarchy this page does not occupy.
 */
export function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Seo meta={notFoundMeta()} noindex />

      <section className="relative pt-44 pb-32 container-luxe">
        <Reveal>
          <Eyebrow>{t('notFound.eyebrow')}</Eyebrow>
          <h1 className="mt-5 font-serif text-display max-w-3xl">{t('notFound.title')}</h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone-300">
            {t('notFound.body')}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <ButtonLink to="/">{t('notFound.homeCta')}</ButtonLink>
            <ButtonLink to="/brands" variant="ghost">
              {t('notFound.brandsCta')}
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={0.45}>
          <p className="mt-14 text-sm text-bone-500">
            {t('notFound.contactPrompt')}{' '}
            <a href={href('/contact')} className="text-gold hover:underline underline-offset-4">
              {t('notFound.contactLink')}
            </a>
          </p>
        </Reveal>
        {/*
         * ONE placement on this route rather than the usual two. This page is
         * three short paragraphs long: a second block would sit in the same
         * viewport as the first with nothing between them, which is exactly the
         * broken-template reading `_CONVENTIONS.md` §7 warns against.
         *
         * It follows the "talk to our team" line rather than replacing it —
         * that line is the page's own copy — and its prefill leads with the
         * failure ("I was looking for something on your site and couldn't find
         * it") rather than a pitch, because the only useful thing an error page
         * can do is hand the visitor a human.
         */}
        <Reveal delay={0.6}>
          <EnquiryCta
            title={t('notFound.ctaTitle')}
            prefill={SITE_PREFILLS.notFound}
            className="mt-12 max-w-3xl"
          />
        </Reveal>
      </section>
    </>
  );
}
