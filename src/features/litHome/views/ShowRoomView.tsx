import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Rocket,
  PhoneCall,
  LogIn,
  CalendarPlus,
  Thermometer,
  SlidersHorizontal,
  Network,
  Plus,
  Minus,
} from 'lucide-react';
import { TileCard, TilePill } from '../components/TileCard';
import type { GlobalState, LitAction } from '../state';

type Props = {
  global: GlobalState;
  dispatch: (a: LitAction) => void;
  compact: boolean;
};

/** Renders the global "Show Room" root view — quick actions + global controls grid. */
export function ShowRoomView({ global, dispatch, compact }: Props) {
  const { t } = useTranslation();
  return (
    <div className={compact ? 'px-4 py-4' : 'px-7 py-6'}>
      <SectionLabel>{t('litHome.globalQuickActions')}</SectionLabel>
      <div className={`mt-2.5 grid gap-2.5 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {[0, 1, 2, 3].map((i) => (
          <motion.button
            key={i}
            onClick={() => dispatch({ type: 'global_qa', index: i })}
            whileTap={{ scale: 0.97 }}
            animate={{
              borderColor: global.quickActions === i ? 'rgba(201,169,97,0.55)' : 'rgba(255,255,255,0.06)',
            }}
            transition={{ duration: 0.25 }}
            className="rounded-lg bg-ink-800/80 border py-5 px-4 flex items-center gap-2.5 text-bone-100 hover:bg-ink-700/60 transition-colors"
          >
            <Rocket size={14} className="text-gold" strokeWidth={1.5} />
            <span className="text-[13px]">{t('litHome.globalQuickAction')}</span>
          </motion.button>
        ))}
      </div>

      <SectionLabel className="mt-7">{t('litHome.globalControls')}</SectionLabel>
      <div className={`mt-2.5 grid gap-2.5 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {/* Intercom */}
        <TileCard
          icon={PhoneCall}
          title={t('litHome.tileIntercom')}
          static
        >
          <div className="grid grid-cols-1">
            <TilePill
              active={global.intercomDnd}
              onClick={() => dispatch({ type: 'global_toggle_dnd' })}
            >
              {t('litHome.intercomDnd')}
            </TilePill>
          </div>
        </TileCard>

        {/* Access */}
        <TileCard icon={LogIn} title={t('litHome.tileAccess')} static>
          <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
            <TilePill active={global.doorsLocked} onClick={() => dispatch({ type: 'global_lock_doors' })}>
              {t('litHome.accessLockDoors')}
            </TilePill>
            <TilePill active={global.gatesClosed} onClick={() => dispatch({ type: 'global_close_gates' })}>
              {t('litHome.accessCloseGates')}
            </TilePill>
          </div>
        </TileCard>

        {/* Global Scheduler */}
        <TileCard icon={CalendarPlus} title={t('litHome.tileGlobalScheduler')} static>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 text-[10px] tracking-luxe uppercase text-gold hover:bg-gold/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={12} strokeWidth={2} />
            {t('litHome.newEvent')}
          </button>
        </TileCard>

        {/* Global Climate */}
        <TileCard
          icon={Thermometer}
          title={t('litHome.tileGlobalClimate')}
          static
          rightSlot={
            !global.globalClimate.enabled && (
              <div className="text-[10px] tracking-luxe uppercase text-bone-500">{t('litHome.setpointDisabled')}</div>
            )
          }
        >
          <div className="grid grid-cols-[1fr_2fr_1fr] items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'global_climate_step', delta: -1 });
              }}
              className="py-2.5 text-bone-500 hover:text-gold transition-colors flex items-center justify-center border-e border-white/[0.04]"
            >
              <Minus size={14} strokeWidth={1.75} />
            </button>
            <div className="text-center leading-tight">
              <div className="font-mono text-[13px] text-bone-100">{global.globalClimate.target}°</div>
              <div className="text-[9px] tracking-luxe uppercase text-bone-500">{t('litHome.setpoint')}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'global_climate_step', delta: 1 });
              }}
              className="py-2.5 text-bone-500 hover:text-gold transition-colors flex items-center justify-center border-s border-white/[0.04]"
            >
              <Plus size={14} strokeWidth={1.75} />
            </button>
          </div>
        </TileCard>

        {/* Audio Mixer */}
        <TileCard icon={SlidersHorizontal} title={t('litHome.tileAudioMixer')} static>
          <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
            {[1, 2, 3].map((p) => (
              <TilePill
                key={p}
                active={global.audioMixerPreset === p}
                onClick={() => dispatch({ type: 'set_audio_mixer', preset: p })}
              >
                {t('litHome.preset')} {p}
              </TilePill>
            ))}
          </div>
        </TileCard>

        {/* Routing */}
        <TileCard icon={Network} title={t('litHome.tileRouting')} static>
          <div className="grid grid-cols-3 divide-x divide-white/[0.04]">
            {[1, 2, 3].map((p) => (
              <TilePill
                key={p}
                active={global.routingPreset === p}
                onClick={() => dispatch({ type: 'set_routing', preset: p })}
              >
                {t('litHome.preset')} {p}
              </TilePill>
            ))}
          </div>
        </TileCard>
      </div>
    </div>
  );
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-[10px] tracking-luxe uppercase text-bone-500 font-medium ${className}`}>{children}</div>
  );
}
