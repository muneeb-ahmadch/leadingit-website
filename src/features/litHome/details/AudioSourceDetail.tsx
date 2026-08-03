import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipBack, SkipForward, VolumeX, Plus, Minus, Radio } from 'lucide-react';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { DetailShell } from './DetailShell';
import { NOW_PLAYING, formatTime } from '../data';
import type { LitAction, RoomState } from '../state';

type Props = {
  room: RoomState;
  roomName: string;
  dispatch: (a: LitAction) => void;
  onClose: () => void;
};

export function AudioSourceDetail({ room, roomName, dispatch, onClose }: Props) {
  const { t } = useTranslation();
  const { playing, volume, progress, duration } = room.audio;
  return (
    <DetailShell
      eyebrow={t('litHome.selectSource')}
      roomName={roomName}
      onClose={onClose}
      topRight={
        <button className="text-bone-500 hover:text-gold transition-colors" aria-label="Radio">
          <Radio size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
      }
    >
      <div className="px-7 py-6 flex flex-col h-full">
        <div className="grid md:grid-cols-2 gap-10 items-center flex-1">
          {/* Album art */}
          <div className="mx-auto w-full max-w-[280px] aspect-square rounded-md overflow-hidden border border-white/[0.06] bg-ink-800/60">
            {/* Procedurally generated gradient (scripts/build-images.mjs
                buildSyntheticAssets), not real album art — decorative demo
                chrome, so alt="" rather than asserting a fictional album cover. */}
            <ResponsiveImage src={NOW_PLAYING.artUrl} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Track + transport */}
          <div className="text-center md:text-start">
            <div className="text-[10px] tracking-luxe uppercase text-bone-500">{t('litHome.albumName')}</div>
            <div className="mt-2 font-serif text-3xl text-bone-100">{NOW_PLAYING.artist}</div>
            <div className="text-[13px] text-bone-300 mt-1">{NOW_PLAYING.song}</div>

            {/* Progress */}
            <div className="mt-6">
              <input
                type="range"
                min={0}
                max={duration}
                value={progress}
                onChange={(e) => dispatch({ type: 'audio_seek', value: Number(e.target.value) })}
                className="lit-slider"
                aria-label="Track position"
              />
              <div className="mt-1.5 flex items-center justify-between text-[10px] tracking-luxe uppercase text-bone-500 font-mono">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport */}
            <div className="mt-6 flex items-center justify-center md:justify-start gap-6">
              <button className="text-bone-300 hover:text-gold transition-colors" aria-label="Previous">
                <SkipBack size={22} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                onClick={() => dispatch({ type: 'audio_toggle' })}
                className="w-14 h-14 rounded-full bg-gold text-ink-950 hover:bg-gold-400 transition-colors flex items-center justify-center"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={20} strokeWidth={1.75} aria-hidden="true" /> : <Play size={20} strokeWidth={1.75} aria-hidden="true" className="translate-x-0.5" />}
              </button>
              <button className="text-bone-300 hover:text-gold transition-colors" aria-label="Next">
                <SkipForward size={22} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="mt-7 pt-5 border-t border-white/[0.05] flex items-center gap-4">
          <button
            onClick={() => dispatch({ type: 'audio_volume', value: 0 })}
            className="text-bone-500 hover:text-gold transition-colors"
            aria-label="Mute"
          >
            <VolumeX size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={() => dispatch({ type: 'audio_step_volume', delta: -1 })}
            aria-label="Decrease volume"
            className="text-bone-500 hover:text-gold transition-colors"
          >
            <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => dispatch({ type: 'audio_volume', value: Number(e.target.value) })}
            className="lit-slider flex-1"
            aria-label="Volume"
          />
          <button
            onClick={() => dispatch({ type: 'audio_step_volume', delta: 1 })}
            aria-label="Increase volume"
            className="text-bone-500 hover:text-gold transition-colors"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>
    </DetailShell>
  );
}
