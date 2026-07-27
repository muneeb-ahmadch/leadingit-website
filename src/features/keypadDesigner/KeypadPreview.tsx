/**
 * Live CSS/SVG render of a Black Nova keypad from the current design config.
 * The plate is tinted with the chosen finish, engraved icons are drawn from a
 * curated lucide set, and the RGB backlight glows in the chosen colour when the
 * ambient toggle is lit. Purely illustrative — see the disclaimer in the UI.
 */
import { useMemo } from 'react';
import {
  Sun, SunDim, Lightbulb, Blinds, Thermometer, Snowflake, Fan, Tv, Music,
  Volume2, Film, Leaf, Flower2, Wine, Moon, Sunrise, DoorOpen, Bell, Power,
  ChevronUp, ChevronDown, type LucideIcon,
} from 'lucide-react';
import { BACKLIGHT_BY_ID, COLLECTION_BY_ID, finishesFor, layoutById } from './catalog';
import type { DesignConfig } from './state';

const ICON_MAP: Record<string, LucideIcon> = {
  sun: Sun, 'sun-dim': SunDim, lightbulb: Lightbulb, blinds: Blinds,
  thermometer: Thermometer, snowflake: Snowflake, fan: Fan, tv: Tv, music: Music,
  volume: Volume2, film: Film, leaf: Leaf, flower: Flower2, wine: Wine, moon: Moon,
  sunrise: Sunrise, door: DoorOpen, bell: Bell, power: Power,
};

// Light-toned plates take dark engraving; everything else takes light engraving.
const LIGHT_FINISHES = new Set(['ice-white', 'silver', 'silver-ice', 'marble']);

export function KeypadPreview({ config }: { config: DesignConfig }) {
  const collection = COLLECTION_BY_ID[config.collection];
  const layout = layoutById(config.collection, config.layout);
  const finish = finishesFor(config.collection).find((f) => f.id === config.finish)
    ?? finishesFor(config.collection)[0];
  const backlight = BACKLIGHT_BY_ID[config.backlight.color] ?? BACKLIGHT_BY_ID.amber;
  const lit = config.ambient;
  const glow = config.backlight.intensity / 100;

  const isLightPlate = finish ? LIGHT_FINISHES.has(finish.id) : false;
  const restColor = isLightPlate ? 'rgba(28,26,22,0.68)' : 'rgba(245,241,232,0.66)';
  const engrave = lit ? backlight.color : restColor;
  const engraveShadow = lit
    ? `0 0 ${6 + glow * 14}px ${hexA(backlight.color, 0.4 + glow * 0.5)}`
    : 'none';

  const plateStyle = useMemo(
    () => ({
      background: finish?.swatch ?? 'linear-gradient(135deg,#2b2b2d,#0a0a0a)',
      boxShadow: lit
        ? `0 30px 70px -30px rgba(0,0,0,0.8), 0 0 ${40 * glow}px ${hexA(backlight.color, 0.18 * glow)}`
        : '0 30px 70px -30px rgba(0,0,0,0.8)',
    }),
    [finish?.swatch, lit, glow, backlight.color],
  );

  if (!collection || !layout || !finish) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[320px]">
        {/* backlight bleed */}
        {lit && (
          <div
            className="absolute -inset-6 rounded-[28px] blur-2xl transition-opacity duration-700"
            style={{ background: hexA(backlight.color, 0.14 * glow), opacity: glow }}
          />
        )}
        {/* plate */}
        <div
          className="relative rounded-[18px] p-4 transition-all duration-700 border border-white/10"
          style={plateStyle}
        >
          {/* glass gloss */}
          <div className="pointer-events-none absolute inset-0 rounded-[18px] overflow-hidden">
            <div className="absolute -top-1/3 -left-1/4 h-2/3 w-2/3 rotate-[20deg] bg-white/10 blur-2xl" />
          </div>

          {layout.type === 'buttons' && (
            <div
              className="relative grid gap-2"
              style={{ gridTemplateColumns: `repeat(${layout.cols ?? 1}, minmax(0,1fr))` }}
            >
              {config.buttons.map((b, i) => {
                const Icon = ICON_MAP[b.icon] ?? Sun;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-md px-2 py-3 min-h-[64px] transition-all duration-500"
                    style={{
                      background: isLightPlate ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25)',
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      style={{ color: engrave, filter: engraveShadow !== 'none' ? `drop-shadow(${engraveShadow})` : undefined }}
                      className="transition-all duration-500"
                    />
                    {b.label && (
                      <span
                        className="text-[9px] uppercase tracking-[0.12em] text-center leading-tight transition-all duration-500"
                        style={{ color: engrave, textShadow: engraveShadow }}
                      >
                        {b.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {layout.type === 'display' && (
            <div className="relative flex flex-col gap-3">
              {/* OLED */}
              <div className="rounded-md bg-black/85 px-4 py-5 flex items-center justify-center gap-2 border border-white/5">
                <span
                  className="font-mono text-4xl"
                  style={{ color: lit ? backlight.color : restColor, textShadow: engraveShadow }}
                >
                  23°
                </span>
                <Snowflake size={20} style={{ color: lit ? backlight.color : restColor }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[Fan, Power].map((Ic, i) => (
                  <div key={i} className="flex items-center justify-center rounded-md py-3"
                    style={{ background: isLightPlate ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}>
                    <Ic size={18} strokeWidth={1.5} style={{ color: engrave, filter: engraveShadow !== 'none' ? `drop-shadow(${engraveShadow})` : undefined }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[ChevronUp, ChevronDown].map((Ic, i) => (
                  <div key={i} className="flex items-center justify-center rounded-md py-3"
                    style={{ background: isLightPlate ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}>
                    <Ic size={18} strokeWidth={1.5} style={{ color: engrave }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {layout.type === 'matrix' && (
            <div className="relative aspect-square flex items-center justify-center p-6">
              <div
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: 'repeat(12, minmax(0,1fr))' }}
              >
                {Array.from({ length: 144 }).map((_, i) => {
                  // radial falloff from centre so the matrix reads as a glowing bloom
                  const x = (i % 12) - 5.5;
                  const y = Math.floor(i / 12) - 5.5;
                  const d = Math.sqrt(x * x + y * y) / 8.5;
                  const on = lit && d < 0.6 + glow * 0.4;
                  return (
                    <span
                      key={i}
                      className="block h-[6px] w-[6px] rounded-full transition-all duration-500"
                      style={{
                        background: on ? backlight.color : restColor,
                        opacity: on ? Math.max(0.25, (1 - d) * (0.4 + glow)) : 0.12,
                        boxShadow: on ? `0 0 ${4 + glow * 6}px ${hexA(backlight.color, 0.7)}` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="font-mono text-xs text-bone-500">{collection.name} · {layout.name}</div>
        <div className="mt-1 text-sm text-bone-300">{finish.name}</div>
      </div>
    </div>
  );
}

/** Convert #rrggbb + alpha to an rgba() string. */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
