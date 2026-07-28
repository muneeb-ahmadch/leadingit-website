import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Button } from '@/components/primitives/Button';
import { useSeo } from '@/lib/useSeo';

export function Contact() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [params] = useSearchParams();
  // A design serialised from the keypad designer arrives here as ?message=… .
  // The page is prerendered without a query string, so the field starts empty and
  // adopts the incoming message after mount — identical first render either side
  // of hydration.
  const [message, setMessage] = useState('');
  useEffect(() => {
    const incoming = params.get('message');
    if (incoming) setMessage(incoming);
  }, [params]);
  useSeo({
    title: 'Contact — Begin a Project',
    description:
      'Tell us about the residence, development or installation you have in mind. Leading IT engineers respond personally across the Gulf and Pakistan.',
    path: '/contact',
    keywords: 'contact Leading IT, home automation enquiry Gulf Pakistan, custom cinema consultation',
  });

  // No backend yet (Phase 5 ships the hardened PHP endpoint). Until then the
  // form composes a real email draft — never a fake "message sent" state.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const company = String(data.get('company') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const subject = `Website enquiry${name ? ` — ${name}` : ''}${company ? ` (${company})` : ''}`;
    const body = `${message}\n\n— ${name}${company ? `, ${company}` : ''}`;
    window.location.href = `mailto:${t('contact.email')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section className="relative pt-44 pb-32 container-luxe">
      <Reveal>
        <Eyebrow>{t('contact.eyebrow')}</Eyebrow>
        <h1 className="mt-5 font-serif text-display max-w-3xl">{t('contact.title')}</h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-8 text-lg leading-relaxed text-bone-300 max-w-2xl">
          {t('contact.subtitle')}
        </p>
      </Reveal>

      <div className="mt-20 grid lg:grid-cols-[1.4fr_1fr] gap-16 lg:gap-24">
        {/* form */}
        <Reveal>
          <div className="relative min-h-[420px]">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="border border-gold/30 bg-ink-900 p-12 h-full flex flex-col justify-center"
              >
                <div className="font-serif text-4xl text-gold">{t('contact.formSuccessTitle')}</div>
                <p className="mt-5 text-lg leading-relaxed text-bone-300 max-w-md">
                  {t('contact.formSuccessBody')}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-10">
                <div className="grid sm:grid-cols-2 gap-10">
                  <div>
                    <label htmlFor="name" className="field-label">{t('contact.formName')}</label>
                    <input id="name" name="name" type="text" required className="input-luxe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="field-label">{t('contact.formEmail')}</label>
                    <input id="email" name="email" type="email" required className="input-luxe" />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="field-label">{t('contact.formCompany')}</label>
                  <input id="company" name="company" type="text" className="input-luxe" />
                </div>
                <div>
                  <label htmlFor="message" className="field-label">{t('contact.formMessage')}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={message ? 10 : 4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-luxe resize-none"
                  />
                </div>
                <div>
                  <Button type="submit">{t('contact.formSubmit')}</Button>
                </div>
              </form>
            )}
          </div>
        </Reveal>

        {/* details */}
        <Reveal delay={0.15}>
          <div className="border-s border-white/5 ps-10 lg:ps-16 space-y-12">
            <div className="eyebrow">{t('contact.detailsEyebrow')}</div>

            <div className="flex gap-4">
              <MapPin size={18} className="mt-1 shrink-0 text-gold" />
              <div>
                <div className="text-sm uppercase tracking-luxe text-bone-500">{t('contact.officeGulfLabel')}</div>
                <div className="mt-2 font-serif text-2xl">{t('contact.officeGulfCity')}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail size={18} className="mt-1 shrink-0 text-gold" />
              <div>
                <div className="text-sm uppercase tracking-luxe text-bone-500">{t('contact.emailLabel')}</div>
                <a
                  href={`mailto:${t('contact.email')}`}
                  className="mt-2 block font-serif text-2xl hover:text-gold transition-colors"
                >
                  {t('contact.email')}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
