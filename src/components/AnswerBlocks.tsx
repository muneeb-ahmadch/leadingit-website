import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SolutionFaq, SolutionSection, SolutionTable } from '@/data/solutions';
import { Reveal } from '@/components/primitives/Reveal';
import { href } from '@/seo/paths';

/**
 * The AEO body of a solutions page, as markup.
 *
 * `docs/10-CONTENT-BRIEFS/_CONVENTIONS.md` §6 is a *structural* rule, not a
 * stylistic one, so it is implemented once here and shared by the index and the
 * solution template rather than re-typed per page:
 *
 *  - one question-shaped `<h2>` per section, in the words the audience uses;
 *  - the answer as the **first paragraph directly beneath it**, never further
 *    down and never behind a table — this is the sentence an answer engine
 *    quotes, and it names Leading IT, the subject and Dubai;
 *  - supporting paragraphs after it, each already trimmed to 3–4 sentences in
 *    `src/data/solutions.ts`.
 *
 * Everything renders as plain prose elements, so it is complete and readable
 * with JavaScript disabled. `Reveal` is used exactly as the rest of the site
 * uses it: it never ships a hidden initial state into the prerendered HTML, and
 * it honours `prefers-reduced-motion` through `useReducedMotion()`.
 */
function DataTable({ table }: { table: SolutionTable }) {
  return (
    <div className="mt-10 overflow-x-auto">
      <table className="w-full border-collapse text-start">
        <caption className="eyebrow text-start mb-5">{table.caption}</caption>
        <thead>
          <tr className="border-b border-gold/30">
            {table.columns.map((column, i) => (
              <th
                key={`${column}-${i}`}
                scope="col"
                className="py-3 pe-6 text-start text-xs uppercase tracking-luxe text-bone-500 font-medium align-bottom"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0].text} className="border-b border-white/5 align-top">
              {row.map((cell, columnIndex) => {
                const content = cell.to ? (
                  <Link to={href(cell.to)} className="text-gold hover:text-bone-100 transition-colors">
                    {cell.text}
                  </Link>
                ) : (
                  cell.text
                );
                return columnIndex === 0 ? (
                  <th
                    key={cell.text}
                    scope="row"
                    className="py-4 pe-6 text-start font-serif text-lg text-bone-100 font-normal"
                  >
                    {content}
                  </th>
                ) : (
                  <td key={cell.text} className="py-4 pe-6 text-bone-300 leading-relaxed">
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnswerSections({ sections }: { sections: SolutionSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="container-luxe py-16 scroll-mt-24">
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="font-serif text-hero text-bone-100">{section.question}</h2>
              {/* The extractable answer. First paragraph, no exceptions. */}
              <p className="mt-6 text-xl leading-relaxed text-bone-100">{section.answer}</p>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="mt-6 text-lg leading-relaxed text-bone-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
          {section.table && (
            <Reveal delay={0.1}>
              <DataTable table={section.table} />
            </Reveal>
          )}
        </section>
      ))}
    </>
  );
}

/**
 * The visible FAQ. Every question and answer here is rendered in the **same
 * words** as the page's `FAQPage` JSON-LD, because both read the one `faq` array
 * in `src/data/solutions.ts`. Structured data a visitor cannot read on the page
 * is undisclosed markup and a Google structured-data spam policy violation —
 * sharing the array is how that is made impossible rather than merely promised.
 */
export function FaqBlock({ faq }: { faq: SolutionFaq[] }) {
  const { t } = useTranslation();
  if (faq.length === 0) return null;

  return (
    <section id="faq" className="container-luxe py-16 scroll-mt-24">
      <Reveal>
        <h2 className="font-serif text-hero text-bone-100">{t('solutions.faqTitle')}</h2>
      </Reveal>
      <dl className="mt-12 max-w-3xl">
        {faq.map((item, i) => (
          <Reveal key={item.question} delay={i * 0.05}>
            <div className="border-t border-white/5 py-8">
              <dt>
                <h3 className="font-serif text-2xl text-bone-100">{item.question}</h3>
              </dt>
              <dd className="mt-4 text-lg leading-relaxed text-bone-300">{item.answer}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
