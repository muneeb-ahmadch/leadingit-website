import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { whatsappHref } from '@/lib/site';

/**
 * The two-channel conversion block: WhatsApp with a page-specific prefill, and
 * the contact form / email address. Both paths on every page, never one alone
 * (`docs/10-CONTENT-BRIEFS/_CONVENTIONS.md` §7).
 *
 * `prefill` is **plain text**. It is encoded once, by `whatsappHref()` in
 * `src/lib/site.ts`, which also owns the number — no page hand-encodes a
 * message and no page hard-codes the number.
 *
 * Renders as static HTML with no client state, so it is present and clickable
 * with JavaScript disabled: the WhatsApp path is a plain `<a href>` (external,
 * so it cannot be a router `<Link>`), and the enquiry path is a `ButtonLink`,
 * which server-renders to an anchor.
 */
export function EnquiryCta({
  title,
  prefill,
  className = '',
}: {
  /** The ask, in this page's own words. */
  title: string;
  /** Plain-text WhatsApp prefill — one first-person sentence naming the subject. */
  prefill: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const email = t('contact.email');

  return (
    <div className={`border-t border-gold/20 pt-10 ${className}`}>
      <Eyebrow>{t('solutions.ctaEyebrow')}</Eyebrow>
      {/* Deliberately not a heading. This block appears in the first viewport,
          above the page's first h2, and a heading there would either skip a
          level (h1 → h3, which the SEO gate rejects outright) or insert a
          non-question h2 into an outline whose h2s are the page's questions
          (`_CONVENTIONS.md` §6). The Eyebrow above already labels the block. */}
      <p className="mt-4 font-serif text-3xl max-w-2xl text-bone-100">{title}</p>
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <a
          href={whatsappHref(prefill)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold group"
        >
          <MessageCircle size={16} />
          <span>{t('solutions.ctaWhatsApp')}</span>
        </a>
        <ButtonLink to="/contact" variant="ghost">
          {t('solutions.ctaEnquiry')}
        </ButtonLink>
      </div>
      <p className="mt-6 text-sm text-bone-500">
        {t('solutions.ctaEmailPrefix')}{' '}
        <a href={`mailto:${email}`} className="text-bone-300 hover:text-gold transition-colors">
          {email}
        </a>
      </p>
    </div>
  );
}
