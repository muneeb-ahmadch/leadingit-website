import { useRef, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Power, ChevronDown, Check, X } from 'lucide-react';
import { DetailShell } from './DetailShell';
import type { FanMode, LitAction, RoomState } from '../state';

type Props = {
  room: RoomState;
  roomName: string;
  modal: 'fan' | null;
  dispatch: (a: LitAction) => void;
  onClose: () => void;
};

const MIN = 16;
const MAX = 32;
/** SVG dial geometry — half-circle arc from 220° (8 o'clock) round through top to 320° (4 o'clock). */
const SIZE = 280;
const STROKE = 12;
const R = SIZE / 2 - STROKE;
/** Arc opens at the bottom: starts at bottom-left (225°), sweeps CW through top, ends at bottom-right (135° + 360°). */
const START_DEG = 225;
const END_DEG = 495;

function tempToAngle(t: number): number {
  const ratio = (t - MIN) / (MAX - MIN);
  return START_DEG + ratio * (END_DEG - START_DEG);
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Build an SVG arc path from `a0` to `a1` (degrees, CW). */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const start = polar(cx, cy, r, a0);
  const end = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function ClimateDetail({ room, roomName, modal, dispatch, onClose }: Props) {
  const { t } = useTranslation();
  const dialRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const { current, target, on, fan } = room.climate;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const angle = tempToAngle(target);
  const handle = polar(cx, cy, R, angle);

  const setFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const svg = dialRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      // angle from top, going CW
      let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
      // normalize to [0, 360)
      deg = (deg + 360) % 360;
      // points in the upper half (deg 0..180) belong to the wrapped end of the arc
      // (i.e. they're past 360° in the START_DEG=225 → END_DEG=495 sweep)
      const adjusted = deg < 180 ? deg + 360 : deg;
      const clamped = Math.max(START_DEG, Math.min(END_DEG, adjusted));
      const ratio = (clamped - START_DEG) / (END_DEG - START_DEG);
      const next = Math.round(MIN + ratio * (MAX - MIN));
      dispatch({ type: 'climate_set', value: next });
    },
    [dispatch],
  );

  // global pointer listeners while dragging
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromPointer(e.clientX, e.clientY);
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging, setFromPointer]);

  return (
    <DetailShell eyebrow={t('litHome.tileClimate')} roomName={roomName} onClose={onClose}>
      <div className="px-7 py-6">
        <div className="relative mx-auto rounded-md bg-ink-800/60 border border-white/[0.06] p-7 max-w-3xl">
          {/* corners: current temp + fan */}
          <div className="absolute top-5 left-5">
            <div className="text-[10px] tracking-luxe uppercase text-bone-500">{t('litHome.currentTemp')}</div>
            <div className="font-mono text-bone-100 mt-1">{current}°</div>
          </div>
          <button
            onClick={() => dispatch({ type: 'open_modal', modal: 'fan' })}
            className="absolute top-5 right-5 text-end"
          >
            <div className="text-[10px] tracking-luxe uppercase text-bone-500 flex items-center justify-end gap-1">
              {t('litHome.fan')}
              <ChevronDown size={11} strokeWidth={1.75} />
            </div>
            <div className="text-bone-100 mt-1 text-[13px]">{t(`litHome.fan${fan}`)}</div>
          </button>

          {/* the dial itself */}
          <div className="flex items-center justify-center gap-2 pt-7 pb-4">
            <button
              onClick={() => dispatch({ type: 'climate_step', delta: -1 })}
              className="w-12 h-12 rounded-full bg-ink-700/50 text-bone-300 hover:text-gold hover:bg-ink-700 transition-colors flex items-center justify-center"
              aria-label="Decrease setpoint"
            >
              <Minus size={16} strokeWidth={1.5} />
            </button>

            <svg
              ref={dialRef}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              className="shrink-0 select-none touch-none"
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
                setFromPointer(e.clientX, e.clientY);
              }}
            >
              {/* full track */}
              <path d={arcPath(cx, cy, R, START_DEG, END_DEG)} stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} fill="none" strokeLinecap="round" />
              {/* progress */}
              <path
                d={arcPath(cx, cy, R, START_DEG, angle)}
                stroke="#C9A961"
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
              />
              {/* endpoints labels */}
              <text x={polar(cx, cy, R - 26, START_DEG).x} y={polar(cx, cy, R - 26, START_DEG).y} fill="#A39E94" textAnchor="middle" alignmentBaseline="middle" className="font-mono" fontSize="11">
                {MIN}°
              </text>
              <text x={polar(cx, cy, R - 26, END_DEG).x} y={polar(cx, cy, R - 26, END_DEG).y} fill="#A39E94" textAnchor="middle" alignmentBaseline="middle" className="font-mono" fontSize="11">
                {MAX}°
              </text>
              {/* handle */}
              <circle cx={handle.x} cy={handle.y} r={11} fill="#F5F1E8" stroke="#C9A961" strokeWidth={2} />
              {/* center label */}
              <text x={cx} y={cy - 6} fill="#F5F1E8" textAnchor="middle" className="font-serif" fontSize="40">
                {target.toFixed(1)}°
              </text>
              <text x={cx} y={cy + 22} fill="#A39E94" textAnchor="middle" className="font-medium" fontSize="10" letterSpacing="2.5">
                {t('litHome.setpoint').toUpperCase()}
              </text>
            </svg>

            <button
              onClick={() => dispatch({ type: 'climate_step', delta: 1 })}
              className="w-12 h-12 rounded-full bg-ink-700/50 text-bone-300 hover:text-gold hover:bg-ink-700 transition-colors flex items-center justify-center"
              aria-label="Increase setpoint"
            >
              <Plus size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* power */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => dispatch({ type: 'climate_toggle' })}
              className={`flex flex-col items-center gap-1.5 px-7 py-3 rounded-full transition-colors
                ${on ? 'text-gold' : 'text-bone-500 hover:text-bone-100'}`}
              aria-pressed={on}
            >
              <Power size={22} strokeWidth={1.5} />
              <span className="text-[10px] tracking-luxe uppercase">{on ? t('litHome.acOn') : t('litHome.acOff')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fan modal */}
      <AnimatePresence>
        {modal === 'fan' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm flex items-center justify-center"
            onClick={() => dispatch({ type: 'close_modal' })}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg bg-ink-900 border border-white/[0.08] w-64 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="text-[13px] text-bone-100">{t('litHome.fan')}</div>
                <button onClick={() => dispatch({ type: 'close_modal' })} className="text-bone-500 hover:text-gold">
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {(['Auto', 'High', 'Medium', 'Low', 'Off'] as FanMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      dispatch({ type: 'climate_fan', fan: m });
                      dispatch({ type: 'close_modal' });
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between text-[12px] uppercase tracking-luxe transition-colors
                      ${fan === m ? 'text-gold bg-gold/5' : 'text-bone-300 hover:text-bone-100 hover:bg-white/[0.03]'}`}
                  >
                    {t(`litHome.fan${m}`)}
                    {fan === m && <Check size={14} strokeWidth={1.75} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DetailShell>
  );
}
