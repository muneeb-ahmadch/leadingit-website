import { useTranslation } from 'react-i18next';
import { Projector, Settings, RadioReceiver, Power, VolumeX, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { DetailShell } from './DetailShell';
import { CINEMA_SOURCES } from '../data';
import type { LitAction, RoomState } from '../state';

type Props = {
  room: RoomState;
  roomName: string;
  kind: 'cinema' | 'video';
  dispatch: (a: LitAction) => void;
  onClose: () => void;
};

/** "Select Source" picker — used by both Cinema and Video tiles. */
export function CinemaSourceDetail({ room, roomName, kind, dispatch, onClose }: Props) {
  const { t } = useTranslation();
  const current = kind === 'cinema' ? room.cinema : room.video;
  const pickAction = kind === 'cinema'
    ? (source: string): LitAction => ({ type: 'cinema_pick_source', source })
    : (source: string): LitAction => ({ type: 'video_pick_source', source });
  const volAction = kind === 'cinema'
    ? (value: number): LitAction => ({ type: 'cinema_volume', value })
    : (value: number): LitAction => ({ type: 'video_volume', value });
  const volStepAction = kind === 'cinema'
    ? (delta: number): LitAction => ({ type: 'cinema_step_volume', delta })
    : (delta: number): LitAction => ({ type: 'video_step_volume', delta });

  return (
    <DetailShell
      eyebrow={t('litHome.selectSource')}
      roomName={roomName}
      onClose={onClose}
      topRight={
        <div className="flex items-center gap-4 text-bone-500">
          <IconButton aria-label="Projector"><Projector size={14} strokeWidth={1.5} aria-hidden="true" /></IconButton>
          <IconButton aria-label="Settings"><Settings size={14} strokeWidth={1.5} aria-hidden="true" /></IconButton>
          <IconButton aria-label="Remote"><RadioReceiver size={14} strokeWidth={1.5} aria-hidden="true" /></IconButton>
          <IconButton aria-label="Power"><Power size={14} strokeWidth={1.5} aria-hidden="true" /></IconButton>
        </div>
      }
    >
      <div className="px-7 py-6 flex flex-col h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 content-start">
          {CINEMA_SOURCES.map((s) => {
            const active = current.source === s.name;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => dispatch(pickAction(s.name))}
                aria-pressed={active}
                className={`aspect-square rounded-md border bg-ink-800/60 flex items-center justify-center transition-colors overflow-hidden p-5
                  ${active ? 'border-gold/55 bg-gold/5' : 'border-white/[0.06] hover:border-gold/30'}`}
              >
                <span className={`font-serif text-center text-lg leading-tight tracking-wider2 transition-colors
                  ${active ? 'text-gold' : 'text-bone-300'}`}>
                  {s.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Volume */}
        <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center gap-4">
          <button
            onClick={() => dispatch(volAction(0))}
            className="text-bone-500 hover:text-gold transition-colors"
            aria-label="Mute"
          >
            <VolumeX size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button onClick={() => dispatch(volStepAction(-1))} aria-label="Decrease volume" className="text-bone-500 hover:text-gold transition-colors">
            <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={current.volume}
            onChange={(e) => dispatch(volAction(Number(e.target.value)))}
            className="lit-slider flex-1"
            aria-label="Volume"
          />
          <button onClick={() => dispatch(volStepAction(1))} aria-label="Increase volume" className="text-bone-500 hover:text-gold transition-colors">
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>
    </DetailShell>
  );
}

function IconButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="hover:text-gold transition-colors">
      {children}
    </button>
  );
}
