import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { ButtonLink } from '@/components/primitives/Button';
import { whatsappHref, mailtoHref } from '@/lib/site';
import { trackWhatsAppClick, trackEmailClick, type Placement } from '@/lib/analytics';

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
  placement = 'inline-cta',
  brand,
  product,
}: {
  /** The ask, in this page's own words. */
  title: string;
  /** Plain-text WhatsApp prefill — one first-person sentence naming the subject. */
  prefill: string;
  className?: string;
  /**
   * Analytics context only — never affects what renders. Where on the page this
   * block sits, so `whatsapp_click` can distinguish a hero CTA from an FAQ one.
   */
  placement?: Placement;
  /** Analytics context only: brand this block is about, if any. */
  brand?: string;
  /** Analytics context only: product this block is about, if any. */
  product?: string;
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
          // Fire-and-forget. No preventDefault, nothing awaited: the browser's
          // own navigation proceeds on this same tick, so the link keeps working
          // if analytics is absent, blocked, or never loaded — and it still
          // works with JavaScript disabled entirely, which is the hard gate on
          // every indexable route. Analytics must never become a precondition
          // for the conversion path it measures.
          onClick={() => trackWhatsAppClick({ placement, brand, product })}
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
        <a
          // Carries the same page-specific prefill as the WhatsApp path. Both
          // channels now open with the subject already named, so choosing email
          // over WhatsApp no longer costs the visitor a round-trip explaining
          // which page they came from.
          href={mailtoHref(email, t('solutions.ctaEmailSubject'), prefill)}
          className="text-bone-300 hover:text-gold transition-colors"
          onClick={() => trackEmailClick({ placement, destination: email })}
        >
          {email}
        </a>
      </p>
    </div>
  );
}
