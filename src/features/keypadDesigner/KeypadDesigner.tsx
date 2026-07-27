/**
 * On-site Black Nova keypad designer. Mirrors Black Nova's own "Create your
 * keypad" pipeline (Collection → Layout → Finish → Engraving → Backlight →
 * Summary) so visitors never leave the site, re-skinned in the dark-luxury
 * design language. Reuses the site primitives and the litHome reducer pattern.
 */
import { useEffect, useReducer, useState, type ReactNode, type Dispatch } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Copy, Link as LinkIcon, MessageCircle,
  Sun, SunDim, Lightbulb, Blinds, Thermometer, Snowflake, Fan, Tv, Music,
  Volume2, Film, Leaf, Flower2, Wine, Moon, Sunrise, DoorOpen, Bell, Power,
  type LucideIcon,
} from 'lucide-react';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Button } from '@/components/primitives/Button';
import { useHydrated } from '@/lib/hydration';
import { WHATSAPP_NUMBER } from '@/lib/site';
import {
  COLLECTIONS, COLLECTION_BY_ID, BACKLIGHTS, ICONS, ICON_BY_ID,
  finishesFor, layoutById, buttonCount,
} from './catalog';
import {
  designerReducer, fromParams, initialConfig, toQueryString, STEPS,
  type Step, type DesignConfig, type DesignerAction,
} from './state';
import { KeypadPreview } from './KeypadPreview';

const EASE = [0.16, 1, 0.3, 1] as const;

export function KeypadDesigner() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const [params, setParams] = useSearchParams();
  // The page is prerendered without a query string, so the reducer always starts
  // from the default design — server and first client render are identical. A
  // shared `?c=…` link is adopted right after mount instead of during render,
  // which keeps hydration free of mismatches.
  const [config, dispatch] = useReducer(designerReducer, undefined, () => initialConfig());
  const [stepIndex, setStepIndex] = useState(0);
  const [urlRead, setUrlRead] = useState(false);

  useEffect(() => {
    if (Array.from(params.keys()).length > 0) {
      dispatch({ type: 'hydrate', config: fromParams(params) });
    }
    setUrlRead(true);
    // Runs once, on mount: `params` is read from the real browser URL there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync so any shared / bookmarked link restores the design —
  // but never before the incoming link has been read.
  useEffect(() => {
    if (!urlRead) return;
    setParams(new URLSearchParams(toQueryString(config)), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, urlRead]);

  const step: Step = STEPS[stepIndex];
  const collection = COLLECTION_BY_ID[config.collection];
  const layout = layoutById(config.collection, config.layout);
  const finishes = finishesFor(config.collection);
  const finish = finishes.find((f) => f.id === config.finish) ?? finishes[0];
  const hasButtons = buttonCount(layout) > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-12 lg:gap-16">
      {/* preview column — first in DOM so it's visible on mobile while editing */}
      <div className="lg:order-2 min-w-0">
        <div className="lg:sticky lg:top-24">
          <div className="relative border border-white/5 bg-ink-900 p-8 md:p-10 grain overflow-hidden">
            <div className="absolute inset-0 bg-warm-radial opacity-60" />
            <div className="relative">
              <KeypadPreview config={config} />
              <button
                onClick={() => dispatch({ type: 'toggle_ambient' })}
                className="mt-8 mx-auto flex items-center gap-2 text-xs uppercase tracking-luxe text-bone-500 hover:text-gold transition-colors"
              >
                <span className={`block h-2 w-2 rounded-full ${config.ambient ? 'bg-gold' : 'bg-bone-500/40'}`} />
                {config.ambient ? t('designer.ambientOn') : t('designer.ambientOff')}
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-bone-500/80">{t('designer.disclaimer')}</p>
        </div>
      </div>

      {/* step column */}
      <div className="lg:order-1 min-w-0">
        {/* step rail */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-white/5 pb-5">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStepIndex(i)}
              className={`flex items-center gap-2 text-xs uppercase tracking-luxe transition-colors ${
                i === stepIndex ? 'text-gold' : 'text-bone-500 hover:text-bone-300'
              }`}
            >
              <span className="font-mono">{String(i + 1).padStart(2, '0')}</span>
              {t(`designer.step_${s}`)}
            </button>
          ))}
        </div>

        <div className="mt-10 min-h-[360px]">
          <AnimatePresence mode="wait">
            {/* The first step panel is part of the prerendered HTML, so it must
                not carry a hidden initial state; step changes animate normally. */}
            <motion.div
              key={step}
              initial={hydrated ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {step === 'collection' && (
                <StepShell title={t('designer.step_collection')} hint={t('designer.collectionHint')}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {COLLECTIONS.map((c) => {
                      const active = c.id === config.collection;
                      return (
                        <button
                          key={c.id}
                          onClick={() => dispatch({ type: 'set_collection', collection: c.id })}
                          className={`text-start p-5 border transition-all duration-500 ${
                            active ? 'border-gold bg-ink-800' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`font-serif text-2xl ${active ? 'text-gold' : 'text-bone-100'}`}>{c.name}</div>
                          <div className="mt-1 text-xs uppercase tracking-luxe text-bone-500">{c.kind}</div>
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              )}

              {step === 'layout' && collection && (
                <StepShell title={t('designer.step_layout')} hint={t('designer.layoutHint', { collection: collection.name })}>
                  <div className="flex flex-col gap-3">
                    {collection.layouts.map((l) => {
                      const active = l.id === config.layout;
                      return (
                        <button
                          key={l.id}
                          onClick={() => dispatch({ type: 'set_layout', layout: l.id })}
                          className={`flex items-center justify-between gap-4 p-4 border transition-all duration-500 ${
                            active ? 'border-gold bg-ink-800' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="text-start">
                            <div className={`text-sm uppercase tracking-luxe ${active ? 'text-gold' : 'text-bone-300'}`}>{l.name}</div>
                            <div className="mt-1 text-xs text-bone-500 font-mono">{l.note}</div>
                          </div>
                          {active && <Check size={16} className="text-gold shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              )}

              {step === 'finish' && (
                <StepShell title={t('designer.step_finish')} hint={t('designer.finishHint')}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {finishes.map((f) => {
                      const active = f.id === config.finish;
                      return (
                        <button
                          key={f.id}
                          onClick={() => dispatch({ type: 'set_finish', finish: f.id })}
                          className={`flex items-center gap-4 p-4 border transition-all duration-500 ${
                            active ? 'border-gold bg-ink-800' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="block h-10 w-10 rounded-full border border-white/10 shrink-0" style={{ background: f.swatch }} />
                          <span className={`text-sm uppercase tracking-luxe text-start ${active ? 'text-gold' : 'text-bone-300'}`}>{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </StepShell>
              )}

              {step === 'engraving' && (
                <StepShell title={t('designer.step_engraving')} hint={t('designer.engravingHint')}>
                  {hasButtons ? (
                    <EngravingEditor config={config} dispatch={dispatch} />
                  ) : (
                    <div className="border border-white/5 bg-ink-900 p-8 text-bone-500 leading-relaxed">
                      {t('designer.noEngraving', { layout: layout?.name ?? '' })}
                    </div>
                  )}
                </StepShell>
              )}

              {step === 'backlight' && (
                <StepShell title={t('designer.step_backlight')} hint={t('designer.backlightHint')}>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {BACKLIGHTS.map((b) => {
                      const active = b.id === config.backlight.color;
                      return (
                        <button
                          key={b.id}
                          onClick={() => dispatch({ type: 'set_backlight_color', color: b.id })}
                          className={`flex flex-col items-center gap-2 p-3 border transition-all duration-500 ${
                            active ? 'border-gold bg-ink-800' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span
                            className="block h-9 w-9 rounded-full border border-white/10"
                            style={{ background: b.color, boxShadow: `0 0 14px ${b.color}88` }}
                          />
                          <span className="text-[10px] uppercase tracking-luxe text-center text-bone-500 leading-tight">{b.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8">
                    <div className="flex items-center justify-between text-xs uppercase tracking-luxe text-bone-500">
                      <span>{t('designer.intensity')}</span>
                      <span className="font-mono text-gold">{config.backlight.intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={config.backlight.intensity}
                      onChange={(e) => dispatch({ type: 'set_backlight_intensity', intensity: Number(e.target.value) })}
                      className="lit-slider mt-4"
                    />
                  </div>
                </StepShell>
              )}

              {step === 'summary' && collection && layout && finish && (
                <SummaryStep config={config} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* nav */}
        <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
          <button
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="text-xs uppercase tracking-luxe text-bone-500 hover:text-gold transition-colors disabled:opacity-30 disabled:hover:text-bone-500"
          >
            {t('designer.back')}
          </button>
          {stepIndex < STEPS.length - 1 && (
            <Button onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}>
              {t('designer.next')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepShell({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div>
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-4 mb-8 text-bone-300 leading-relaxed max-w-xl">{hint}</p>
      {children}
    </div>
  );
}

function EngravingEditor({ config, dispatch }: { config: DesignConfig; dispatch: Dispatch<DesignerAction> }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const active = config.buttons[selected];

  return (
    <div>
      {/* button tabs */}
      <div className="flex flex-wrap gap-2">
        {config.buttons.map((b, i) => {
          const isSel = i === selected;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`h-10 min-w-10 gap-1.5 px-2 flex items-center justify-center border font-mono text-xs transition-all duration-300 ${
                isSel ? 'border-gold text-gold bg-ink-800' : 'border-white/10 text-bone-500 hover:border-white/25'
              }`}
              title={b.label || ICON_BY_ID[b.icon]?.label}
            >
              {String(i + 1).padStart(2, '0')}
              <IconGlyph id={b.icon} />
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-8">
          <label className="field-label">{t('designer.labelField')}</label>
          <input
            type="text"
            maxLength={14}
            value={active.label}
            onChange={(e) => dispatch({ type: 'set_button', index: selected, label: e.target.value })}
            placeholder={t('designer.labelPlaceholder')}
            className="input-luxe"
          />

          <div className="mt-8 field-label">{t('designer.iconField')}</div>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {ICONS.map((ic) => {
              const isSel = ic.id === active.icon;
              return (
                <button
                  key={ic.id}
                  onClick={() => dispatch({ type: 'set_button', index: selected, icon: ic.id })}
                  className={`aspect-square flex items-center justify-center border transition-all duration-300 ${
                    isSel ? 'border-gold bg-ink-800 text-gold' : 'border-white/5 text-bone-500 hover:border-white/25 hover:text-bone-300'
                  }`}
                  title={ic.label}
                >
                  <IconGlyph id={ic.id} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Small icon renderer reused in the engraving picker.
const GLYPHS: Record<string, LucideIcon> = {
  sun: Sun, 'sun-dim': SunDim, lightbulb: Lightbulb, blinds: Blinds, thermometer: Thermometer,
  snowflake: Snowflake, fan: Fan, tv: Tv, music: Music, volume: Volume2, film: Film, leaf: Leaf,
  flower: Flower2, wine: Wine, moon: Moon, sunrise: Sunrise, door: DoorOpen, bell: Bell, power: Power,
};
function IconGlyph({ id }: { id: string }) {
  const Icon = GLYPHS[id] ?? Sun;
  return <Icon size={18} strokeWidth={1.5} />;
}

function SummaryStep({ config }: { config: DesignConfig }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const collection = COLLECTION_BY_ID[config.collection];
  const layout = layoutById(config.collection, config.layout);
  const finish = finishesFor(config.collection).find((f) => f.id === config.finish);
  const backlight = BACKLIGHTS.find((b) => b.id === config.backlight.color);
  const hasButtons = buttonCount(layout) > 0;

  const designUrl = typeof window !== 'undefined' ? window.location.href : '';

  const spec = [
    t('designer.specHeading'),
    `${t('designer.step_collection')}: ${collection?.name ?? ''}`,
    `${t('designer.step_layout')}: ${layout?.name ?? ''} (${layout?.note ?? ''})`,
    `${t('designer.step_finish')}: ${finish?.name ?? ''}`,
    `${t('designer.step_backlight')}: ${backlight?.name ?? ''} · ${config.backlight.intensity}%`,
    ...(hasButtons
      ? [`${t('designer.step_engraving')}:`, ...config.buttons.map((b, i) => `  ${i + 1}. ${b.label || '—'} [${ICON_BY_ID[b.icon]?.label ?? b.icon}]`)]
      : []),
    '',
    `${t('designer.designLink')}: ${designUrl}`,
  ].join('\n');

  const contactHref = `/contact?message=${encodeURIComponent(spec)}`;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(spec)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(designUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-6 border-b border-white/5 py-3 font-mono text-sm">
      <dt className="text-bone-500">{label}</dt>
      <dd className="text-bone-100 text-end">{value}</dd>
    </div>
  );

  return (
    <div>
      <Eyebrow>{t('designer.step_summary')}</Eyebrow>
      <p className="mt-4 mb-8 text-bone-300 leading-relaxed max-w-xl">{t('designer.summaryHint')}</p>

      <dl className="border-t border-gold/30">
        <Row label={t('designer.step_collection')} value={collection?.name ?? ''} />
        <Row label={t('designer.step_layout')} value={layout?.name ?? ''} />
        <Row label={t('designer.step_finish')} value={finish?.name ?? ''} />
        <Row label={t('designer.step_backlight')} value={`${backlight?.name ?? ''} · ${config.backlight.intensity}%`} />
      </dl>

      {hasButtons && (
        <div className="mt-6">
          <div className="eyebrow mb-3">{t('designer.step_engraving')}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 font-mono text-xs text-bone-300">
            {config.buttons.map((b, i) => (
              <div key={i} className="flex gap-2 border-b border-white/5 py-1.5">
                <span className="text-bone-500">{String(i + 1).padStart(2, '0')}</span>
                <span>{b.label || ICON_BY_ID[b.icon]?.label || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* outcomes */}
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={contactHref} className="btn-gold group flex-1 justify-center">
            <span>{t('designer.requestDesign')}</span>
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-gold group flex-1 justify-center">
            <MessageCircle size={16} />
            <span>{t('designer.sendWhatsApp')}</span>
          </a>
        </div>
        <button onClick={copyLink} className="btn-ghost self-start">
          {copied ? <Check size={15} /> : <LinkIcon size={15} />}
          <span>{copied ? t('designer.linkCopied') : t('designer.copyLink')}</span>
          {!copied && <Copy size={13} className="opacity-60" />}
        </button>
      </div>
    </div>
  );
}
