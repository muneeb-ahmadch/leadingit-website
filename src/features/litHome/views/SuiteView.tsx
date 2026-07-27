import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ROOMS, type LitAction, type LitState, type RoomId } from '../state';
import {
  QuickActionsTile,
  LightsTile,
  ClimateTile,
  CurtainsTile,
  AudioTile,
  CinemaTile,
  VideoTile,
  SchedulerTile,
  ExhaustFanTile,
  WaterHeaterTile,
  CiscoTile,
} from '../tiles/HomeTiles';

type Props = { state: LitState; dispatch: (a: LitAction) => void; compact: boolean };

export function SuiteView({ state, dispatch, compact }: Props) {
  const { t } = useTranslation();
  const room = state.rooms[state.activeRoom];

  return (
    <div className={compact ? 'px-4 py-4' : 'px-7 py-6'}>
      {/* Suite title + room tabs */}
      <h2 className={`font-serif ${compact ? 'text-xl' : 'text-2xl'} text-bone-100`}>{t('litHome.suite1')}</h2>
      <div className={`mt-2.5 flex items-end gap-${compact ? '3' : '5'} text-[13px]`}>
        {ROOMS.map((r) => {
          const active = state.activeRoom === r.id;
          return (
            <button
              key={r.id}
              onClick={() => dispatch({ type: 'select_room', room: r.id as RoomId })}
              className={`relative pb-2.5 transition-colors
                ${active ? 'text-bone-100' : 'text-bone-500 hover:text-bone-300'}`}
            >
              {t(r.i18nKey)}
              {active && (
                <motion.span
                  layoutId="suite-room-dot"
                  className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-1.5 h-1.5 rounded-full bg-gold"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tile grid */}
      <motion.div
        key={state.activeRoom}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-4 grid gap-2.5 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}
      >
        <QuickActionsTile room={room} dispatch={dispatch} />
        <LightsTile room={room} dispatch={dispatch} onOpen={() => dispatch({ type: 'open_detail', detail: { tile: 'lights' } })} />
        <ClimateTile room={room} dispatch={dispatch} onOpen={() => dispatch({ type: 'open_detail', detail: { tile: 'climate' } })} />
        <CurtainsTile room={room} dispatch={dispatch} />
        <AudioTile room={room} dispatch={dispatch} onOpen={() => dispatch({ type: 'open_detail', detail: { tile: 'audio' } })} />
        <CinemaTile room={room} dispatch={dispatch} onOpen={() => dispatch({ type: 'open_detail', detail: { tile: 'cinema' } })} />
        <VideoTile room={room} dispatch={dispatch} onOpen={() => dispatch({ type: 'open_detail', detail: { tile: 'video' } })} />
        <SchedulerTile />
        <ExhaustFanTile room={room} dispatch={dispatch} />
        <WaterHeaterTile room={room} dispatch={dispatch} />
        <CiscoTile room={room} dispatch={dispatch} />
      </motion.div>
    </div>
  );
}
