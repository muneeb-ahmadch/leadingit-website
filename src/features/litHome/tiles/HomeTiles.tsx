import { useTranslation } from 'react-i18next';
import {
  Rocket,
  Lightbulb,
  Thermometer,
  Blinds,
  Music2,
  Clapperboard,
  PlaySquare,
  CalendarPlus,
  Fan,
  Flame,
  Video as VideoIcon,
  Minus,
  Plus,
  MicOff,
  Ban,
} from 'lucide-react';
import { TileCard, TilePill, TileEyebrow } from '../components/TileCard';
import type { LitAction, RoomState } from '../state';

type Dispatch = (a: LitAction) => void;
type TileProps = { room: RoomState; dispatch: Dispatch; onOpen?: () => void };

/** Small +/- row used inside several tiles. */
function StepRow({
  onMinus,
  onPlus,
  middle,
}: {
  onMinus: (e: React.MouseEvent) => void;
  onPlus: (e: React.MouseEvent) => void;
  middle: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] items-center text-bone-100">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMinus(e);
        }}
        className="py-2.5 text-bone-500 hover:text-gold transition-colors flex items-center justify-center border-e border-white/[0.04]"
      >
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <div className="text-center text-[13px]">{middle}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlus(e);
        }}
        className="py-2.5 text-bone-500 hover:text-gold transition-colors flex items-center justify-center border-s border-white/[0.04]"
      >
        <Plus size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}

// --------------------------------------------------------------------------------------

export function QuickActionsTile({ dispatch }: TileProps) {
  const { t } = useTranslation();
  return (
    <TileCard
      icon={Rocket}
      title={t('litHome.tileQuickActions')}
      static
    >
      <div className="grid grid-cols-3 divide-x divide-white/[0.04] [&>*:first-child]:border-l-0">
        {[1, 2, 3].map((i) => (
          <TilePill key={i} onClick={() => dispatch({ type: 'global_qa', index: i })}>
            {t('litHome.qaShort')} {i}
          </TilePill>
        ))}
      </div>
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function LightsTile({ room, dispatch, onOpen }: TileProps) {
  const { t } = useTranslation();
  const anyOn = room.lights.items.some((l) => l.on);
  return (
    <TileCard
      icon={Lightbulb}
      title={t('litHome.tileLights')}
      onOpen={onOpen}
      rightSlot={
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${anyOn ? 'bg-gold' : 'bg-bone-500/30'}`} />
      }
    >
      <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
        <TilePill onClick={() => dispatch({ type: 'lights_all_off' })}>{t('litHome.allOff')}</TilePill>
        <TilePill
          active={room.lights.activeScene === 1}
          onClick={() => dispatch({ type: 'lights_apply_scene', sceneIndex: 1 })}
        >
          {t('litHome.scene')} 1
        </TilePill>
      </div>
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function ClimateTile({ room, dispatch, onOpen }: TileProps) {
  const { t } = useTranslation();
  const { current, target, on } = room.climate;
  return (
    <TileCard
      icon={Thermometer}
      title={t('litHome.tileClimate')}
      onOpen={onOpen}
      rightSlot={
        <div>
          <TileEyebrow>{t('litHome.currentTemp')}: <span className="font-mono normal-case tracking-normal text-bone-300">{current}°</span></TileEyebrow>
          <div className={`mt-1 text-[10px] tracking-luxe uppercase ${on ? 'text-gold' : 'text-bone-500'}`}>
            {on ? t('litHome.acOn') : t('litHome.acOff')}
          </div>
        </div>
      }
    >
      <StepRow
        onMinus={() => dispatch({ type: 'climate_step', delta: -1 })}
        onPlus={() => dispatch({ type: 'climate_step', delta: 1 })}
        middle={
          <div className="leading-tight">
            <div className="font-mono text-bone-100">{target}°</div>
            <div className="text-[9px] tracking-luxe uppercase text-bone-500">{t('litHome.setpoint')}</div>
          </div>
        }
      />
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function CurtainsTile({ room, dispatch }: TileProps) {
  const { t } = useTranslation();
  return (
    <TileCard icon={Blinds} title={t('litHome.tileCurtains')} static>
      <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
        {[1, 2, 3].map((i) => (
          <TilePill
            key={i}
            active={room.curtains.activeScene === i}
            onClick={() => dispatch({ type: 'curtains_scene', scene: i })}
          >
            {t('litHome.scene')} {i}
          </TilePill>
        ))}
      </div>
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function AudioTile({ room, dispatch, onOpen }: TileProps) {
  const { t } = useTranslation();
  return (
    <TileCard
      icon={Music2}
      title={t('litHome.tileAudio')}
      onOpen={onOpen}
      rightSlot={
        <div>
          <TileEyebrow>{t('litHome.nowPlaying')}</TileEyebrow>
          <div className="text-[11px] text-bone-300 mt-0.5">{t('litHome.artistName')}</div>
          <div className="text-[10px] text-bone-500">{t('litHome.songName')}</div>
        </div>
      }
    >
      <StepRow
        onMinus={() => dispatch({ type: 'audio_step_volume', delta: -1 })}
        onPlus={() => dispatch({ type: 'audio_step_volume', delta: 1 })}
        middle={
          <div className="leading-tight">
            <div className="font-mono text-bone-100">{room.audio.volume}</div>
            <div className="text-[9px] tracking-luxe uppercase text-bone-500">{t('litHome.volume')}</div>
          </div>
        }
      />
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function CinemaTile({ room, dispatch, onOpen }: TileProps) {
  const { t } = useTranslation();
  return (
    <TileCard
      icon={Clapperboard}
      title={t('litHome.tileCinema')}
      onOpen={onOpen}
      rightSlot={
        <div>
          <TileEyebrow>{t('litHome.nowPlaying')}</TileEyebrow>
          <div className="text-[11px] text-bone-300 mt-0.5">{room.cinema.source ?? t('litHome.sourceName')}</div>
        </div>
      }
    >
      <StepRow
        onMinus={() => dispatch({ type: 'cinema_step_volume', delta: -1 })}
        onPlus={() => dispatch({ type: 'cinema_step_volume', delta: 1 })}
        middle={
          <div className="leading-tight">
            <div className="font-mono text-bone-100">{room.cinema.volume}</div>
            <div className="text-[9px] tracking-luxe uppercase text-bone-500">{t('litHome.volume')}</div>
          </div>
        }
      />
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function VideoTile({ room, dispatch, onOpen }: TileProps) {
  const { t } = useTranslation();
  return (
    <TileCard
      icon={PlaySquare}
      title={t('litHome.tileVideo')}
      onOpen={onOpen}
      rightSlot={
        <div>
          <TileEyebrow>{t('litHome.nowPlaying')}</TileEyebrow>
          <div className="text-[11px] text-bone-300 mt-0.5">{room.video.source ?? t('litHome.sourceName')}</div>
        </div>
      }
    >
      <StepRow
        onMinus={() => dispatch({ type: 'video_step_volume', delta: -1 })}
        onPlus={() => dispatch({ type: 'video_step_volume', delta: 1 })}
        middle={
          <div className="leading-tight">
            <div className="font-mono text-bone-100">{room.video.volume}</div>
            <div className="text-[9px] tracking-luxe uppercase text-bone-500">{t('litHome.volume')}</div>
          </div>
        }
      />
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function SchedulerTile() {
  const { t } = useTranslation();
  return (
    <TileCard icon={CalendarPlus} title={t('litHome.tileScheduler')} static>
      <button
        onClick={(e) => e.stopPropagation()}
        className="w-full py-2.5 text-[10px] tracking-luxe uppercase text-gold hover:bg-gold/10 transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus size={12} strokeWidth={2} />
        {t('litHome.newEvent')}
      </button>
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function ExhaustFanTile({ room, dispatch }: TileProps) {
  const { t } = useTranslation();
  const state = room.exhaustFan;
  return (
    <TileCard
      icon={Fan}
      title={t('litHome.tileExhaustFan')}
      static
      rightSlot={
        <div className={`text-[10px] tracking-luxe uppercase ${state === 'off' ? 'text-bone-500' : 'text-gold'}`}>
          {state === 'off' ? t('litHome.fanIsOff') : t('litHome.fanIsOn')}
        </div>
      }
    >
      <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
        <TilePill active={state === 'on'} onClick={() => dispatch({ type: 'exhaust_fan_set', state: 'on' })}>
          {t('litHome.on')}
        </TilePill>
        <TilePill active={state === 'off'} onClick={() => dispatch({ type: 'exhaust_fan_set', state: 'off' })}>
          {t('litHome.off')}
        </TilePill>
        <TilePill active={state === '5min'} onClick={() => dispatch({ type: 'exhaust_fan_set', state: '5min' })}>
          {t('litHome.min5')}
        </TilePill>
      </div>
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function WaterHeaterTile({ room, dispatch }: TileProps) {
  const { t } = useTranslation();
  const on = room.waterHeater;
  return (
    <TileCard
      icon={Flame}
      title={t('litHome.tileWaterHeater')}
      static
      rightSlot={
        <div className={`text-[10px] tracking-luxe uppercase ${on ? 'text-gold' : 'text-bone-500'}`}>
          {on ? t('litHome.heaterOn') : t('litHome.heaterOff')}
        </div>
      }
    >
      <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
        <TilePill active={on} onClick={() => dispatch({ type: 'water_heater_set', on: true })}>
          {t('litHome.on')}
        </TilePill>
        <TilePill active={!on} onClick={() => dispatch({ type: 'water_heater_set', on: false })}>
          {t('litHome.off')}
        </TilePill>
      </div>
    </TileCard>
  );
}

// --------------------------------------------------------------------------------------

export function CiscoTile({ room, dispatch }: TileProps) {
  const { t } = useTranslation();
  const { dnd, mute, video } = room.cisco;
  return (
    <TileCard icon={VideoIcon} title={t('litHome.tileCisco')} static>
      <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
        <TilePill active={dnd} onClick={() => dispatch({ type: 'cisco_toggle', key: 'dnd' })}>
          <span className="inline-flex items-center gap-1.5">
            <Ban size={11} strokeWidth={1.75} />
            {t('litHome.dnd')}
          </span>
        </TilePill>
        <TilePill active={mute} onClick={() => dispatch({ type: 'cisco_toggle', key: 'mute' })}>
          <span className="inline-flex items-center gap-1.5">
            <MicOff size={11} strokeWidth={1.75} />
            {t('litHome.mute')}
          </span>
        </TilePill>
        <TilePill active={video} onClick={() => dispatch({ type: 'cisco_toggle', key: 'video' })}>
          <span className="inline-flex items-center gap-1.5">
            <VideoIcon size={11} strokeWidth={1.75} />
            {t('litHome.video')}
          </span>
        </TilePill>
      </div>
    </TileCard>
  );
}
