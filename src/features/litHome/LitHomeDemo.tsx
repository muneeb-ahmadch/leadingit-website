import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { INITIAL_STATE, ROOMS, litReducer } from './state';
import { ShowRoomView } from './views/ShowRoomView';
import { SuiteView } from './views/SuiteView';
import { BottomNav } from './components/BottomNav';
import { LightsDetail } from './details/LightsDetail';
import { ClimateDetail } from './details/ClimateDetail';
import { AudioSourceDetail } from './details/AudioSourceDetail';
import { CinemaSourceDetail } from './details/CinemaSourceDetail';

type Props = {
  /** "ipad" shows the full residence UI, "panel" tightens spacing for the 5" wall-panel preview. */
  surface?: 'ipad' | 'panel';
  className?: string;
};

export function LitHomeDemo({ surface = 'ipad', className = '' }: Props) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(litReducer, INITIAL_STATE);
  const compact = surface === 'panel';

  const room = state.rooms[state.activeRoom];
  const roomName = t(ROOMS.find((r) => r.id === state.activeRoom)!.i18nKey);

  return (
    <div className={`relative h-full w-full flex flex-col bg-ink-950 text-bone-100 overflow-hidden ${className}`}>
      <motion.div
        key={state.view}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        {state.view === 'showroom' ? (
          <>
            <div className={compact ? 'px-4 pt-4' : 'px-7 pt-5'}>
              <h2 className={`font-serif ${compact ? 'text-xl' : 'text-2xl'} text-bone-100`}>
                {t('litHome.showRoomTitle')}
              </h2>
            </div>
            <ShowRoomView global={state.global} dispatch={dispatch} compact={compact} />
          </>
        ) : (
          <SuiteView state={state} dispatch={dispatch} compact={compact} />
        )}
      </motion.div>

      {/* Detail overlays */}
      <AnimatePresence>
        {state.detail?.tile === 'lights' && (
          <LightsDetail
            room={room}
            roomName={roomName}
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'close_detail' })}
          />
        )}
        {state.detail?.tile === 'climate' && (
          <ClimateDetail
            room={room}
            roomName={roomName}
            modal={state.modal}
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'close_detail' })}
          />
        )}
        {state.detail?.tile === 'audio' && (
          <AudioSourceDetail
            room={room}
            roomName={roomName}
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'close_detail' })}
          />
        )}
        {state.detail?.tile === 'cinema' && (
          <CinemaSourceDetail
            room={room}
            roomName={roomName}
            kind="cinema"
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'close_detail' })}
          />
        )}
        {state.detail?.tile === 'video' && (
          <CinemaSourceDetail
            room={room}
            roomName={roomName}
            kind="video"
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'close_detail' })}
          />
        )}
      </AnimatePresence>

      <BottomNav view={state.view} dispatch={dispatch} compact={compact} />
    </div>
  );
}
