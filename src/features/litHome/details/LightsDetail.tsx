import { useTranslation } from 'react-i18next';
import { Minus, Plus, Pencil } from 'lucide-react';
import { DetailShell } from './DetailShell';
import type { LitAction, RoomState } from '../state';

type Props = {
  room: RoomState;
  roomName: string;
  dispatch: (a: LitAction) => void;
  onClose: () => void;
};

export function LightsDetail({ room, roomName, dispatch, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <DetailShell eyebrow={t('litHome.tileLights')} roomName={roomName} onClose={onClose}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-7 px-7 py-6">
        {/* Left column — scenes / all-lights / sensors */}
        <div className="space-y-7">
          {/* Scenes */}
          <section>
            <SectionHeader title={t('litHome.scenes')} action />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => {
                const active = room.lights.activeScene === i;
                return (
                  <button
                    key={i}
                    onClick={() => dispatch({ type: 'lights_apply_scene', sceneIndex: i })}
                    aria-pressed={active}
                    className={`py-4 rounded-md border text-[11px] tracking-luxe uppercase transition-colors
                      ${active ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/[0.06] bg-ink-800/60 text-bone-300 hover:border-gold/30 hover:text-bone-100'}`}
                  >
                    {t('litHome.scene')} {i}
                  </button>
                );
              })}
            </div>
          </section>

          {/* All Lights */}
          <section>
            <SectionHeader title={t('litHome.allLights')} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => dispatch({ type: 'lights_step_all', delta: -1 })}
                aria-label="Dim all lights"
                className="py-4 rounded-md border border-white/[0.06] bg-ink-800/60 text-bone-300 hover:border-gold/30 hover:text-gold transition-colors flex items-center justify-center"
              >
                <Minus size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                onClick={() => dispatch({ type: 'lights_step_all', delta: 1 })}
                aria-label="Brighten all lights"
                className="py-4 rounded-md border border-white/[0.06] bg-ink-800/60 text-bone-300 hover:border-gold/30 hover:text-gold transition-colors flex items-center justify-center"
              >
                <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                onClick={() => dispatch({ type: 'lights_all_off' })}
                className="py-3 rounded-md border border-white/[0.06] bg-ink-800/60 text-[11px] tracking-luxe uppercase text-bone-300 hover:text-bone-100 hover:border-gold/30 transition-colors"
              >
                {t('litHome.allOff')}
              </button>
              <button
                onClick={() => dispatch({ type: 'lights_all_on' })}
                className="py-3 rounded-md border border-white/[0.06] bg-ink-800/60 text-[11px] tracking-luxe uppercase text-bone-300 hover:text-bone-100 hover:border-gold/30 transition-colors"
              >
                {t('litHome.allOn')}
              </button>
            </div>
          </section>

          {/* Sensors */}
          <section>
            <SectionHeader title={t('litHome.sensors')} />
            <div className="mt-3 rounded-md border border-white/[0.06] bg-ink-800/60 divide-y divide-white/[0.04]">
              {room.lights.sensors.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-bone-100">{s.name}</span>
                  <Toggle
                    on={s.on}
                    label={s.name}
                    onClick={() => dispatch({ type: 'lights_sensor_toggle', sensorId: s.id })}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — per-light controls */}
        <section>
          <SectionHeader title={t('litHome.controls')} />
          <div className="mt-3 rounded-md border border-white/[0.06] bg-ink-800/60 divide-y divide-white/[0.04]">
            {room.lights.items.map((l) => (
              <div key={l.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] text-bone-100 truncate">{l.name}</div>
                    {l.on && (
                      <div className="text-[10px] tracking-luxe uppercase text-bone-500 mt-0.5 font-mono normal-case tracking-normal">
                        {l.brightness}%
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {l.color && (
                      <span
                        aria-hidden="true"
                        className="inline-block w-4 h-4 rounded-full ring-1 ring-white/10"
                        style={{ background: l.color }}
                      />
                    )}
                    <Toggle
                      on={l.on}
                      label={l.name}
                      onClick={() => dispatch({ type: 'lights_toggle', lightId: l.id })}
                    />
                  </div>
                </div>
                {l.on && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={l.brightness}
                    onChange={(e) => dispatch({ type: 'lights_brightness', lightId: l.id, value: Number(e.target.value) })}
                    className="lit-slider mt-3"
                    aria-label={`${l.name} brightness`}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </DetailShell>
  );
}

function SectionHeader({ title, action }: { title: string; action?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[10px] tracking-luxe uppercase text-bone-500 font-medium">{title}</div>
      {action && (
        <button className="text-bone-500 hover:text-gold transition-colors" aria-label="Edit">
          <Pencil size={12} strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      // The button's only visible content is a sliding dot — no text of its
      // own, so without this it had no accessible name at all beyond the
      // on/off state `aria-pressed` exposes.
      aria-label={label}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-gold' : 'bg-ink-700'}`}
      aria-pressed={on}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-bone-100 shadow transition-all
          ${on ? 'left-[1.375rem]' : 'left-0.5'}`}
      />
    </button>
  );
}
