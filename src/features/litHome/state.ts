/**
 * LIT Home demo state. Mirrors the structure of the real LIT Home app:
 *   - two root views: "showroom" (global) and "suite" (a residence with rooms)
 *   - inside the suite, each room owns its own tile state
 *   - any tile can open a detail overlay (lights / climate / audio source / cinema source / video source)
 */

export type View = 'showroom' | 'suite';

export type RoomId = 'bedroom' | 'living' | 'washroom' | 'dressing' | 'balcony';

export type DetailId =
  | { tile: 'lights' }
  | { tile: 'climate' }
  | { tile: 'audio' }
  | { tile: 'cinema' }
  | { tile: 'video' };

export type FanMode = 'Auto' | 'High' | 'Medium' | 'Low' | 'Off';

export type LightInstance = {
  id: string;
  name: string;
  on: boolean;
  brightness: number; // 0-100
  /** Optional swatch color for color-capable fixtures. */
  color?: string;
};

export type SensorInstance = { id: string; name: string; on: boolean };

export type RoomState = {
  lights: {
    items: LightInstance[];
    sensors: SensorInstance[];
    /** Active scene id (1-4) or null. Tapping a scene applies brightness to all lights. */
    activeScene: number | null;
  };
  climate: {
    /** Always shown as "current temp". Stable per-room ambient. */
    current: number;
    /** Target setpoint, 16–32. */
    target: number;
    on: boolean;
    fan: FanMode;
  };
  curtains: {
    activeScene: number | null;
  };
  audio: {
    playing: boolean;
    volume: number; // 0-100
    /** seconds elapsed; 0..210 (3:30 of a 3:50 track) */
    progress: number;
    duration: number;
  };
  cinema: {
    playing: boolean;
    /** Currently selected source name; undefined = none picked yet */
    source?: string;
    volume: number;
  };
  video: {
    playing: boolean;
    source?: string;
    volume: number;
  };
  exhaustFan: 'on' | 'off' | '5min';
  waterHeater: boolean;
  cisco: { dnd: boolean; mute: boolean; video: boolean };
};

export type GlobalState = {
  quickActions: number | null;        // pulsing index 0..3 of last tapped global QA
  intercomDnd: boolean;
  doorsLocked: boolean;
  gatesClosed: boolean;
  globalClimate: { target: number; enabled: boolean };
  audioMixerPreset: number | null;    // 1..3
  routingPreset: number | null;       // 1..3
};

export type LitState = {
  view: View;
  activeRoom: RoomId;
  detail: DetailId | null;
  /** Modal stacked on top of detail (currently only the Fan picker inside Climate). */
  modal: 'fan' | null;
  global: GlobalState;
  rooms: Record<RoomId, RoomState>;
};

// ---------- factories ----------

const makeLights = (): LightInstance[] => [
  { id: 'l0', name: 'Ceiling', on: true, brightness: 100, color: '#7C8470' },
  { id: 'l1', name: 'Cove', on: false, brightness: 60 },
  { id: 'l2', name: 'Bedside', on: false, brightness: 40, color: '#0A0A0A' },
  { id: 'l3', name: 'Reading', on: false, brightness: 0 },
  { id: 'l4', name: 'Wardrobe', on: false, brightness: 0 },
  { id: 'l5', name: 'Accent', on: false, brightness: 0 },
];

const makeSensors = (): SensorInstance[] => [
  { id: 's0', name: 'Motion', on: false },
  { id: 's1', name: 'Daylight', on: false },
];

const defaultRoom = (): RoomState => ({
  lights: { items: makeLights(), sensors: makeSensors(), activeScene: null },
  climate: { current: 28, target: 21, on: false, fan: 'Auto' },
  curtains: { activeScene: null },
  audio: { playing: false, volume: 21, progress: 110, duration: 230 },
  cinema: { playing: false, volume: 21 },
  video: { playing: false, volume: 21 },
  exhaustFan: 'off',
  waterHeater: true,
  cisco: { dnd: false, mute: false, video: false },
});

export const INITIAL_STATE: LitState = {
  view: 'suite',
  activeRoom: 'bedroom',
  detail: null,
  modal: null,
  global: {
    quickActions: null,
    intercomDnd: false,
    doorsLocked: false,
    gatesClosed: false,
    globalClimate: { target: 21, enabled: false },
    audioMixerPreset: null,
    routingPreset: null,
  },
  rooms: {
    bedroom: defaultRoom(),
    living: { ...defaultRoom(), climate: { current: 27, target: 22, on: false, fan: 'Auto' } },
    washroom: defaultRoom(),
    dressing: defaultRoom(),
    balcony: { ...defaultRoom(), climate: { current: 31, target: 24, on: false, fan: 'Auto' } },
  },
};

export const ROOMS: { id: RoomId; i18nKey: string }[] = [
  { id: 'bedroom', i18nKey: 'litHome.roomBedroom' },
  { id: 'living', i18nKey: 'litHome.roomLiving' },
  { id: 'washroom', i18nKey: 'litHome.roomWashroom' },
  { id: 'dressing', i18nKey: 'litHome.roomDressing' },
  { id: 'balcony', i18nKey: 'litHome.roomBalcony' },
];

// ---------- actions ----------

export type LitAction =
  | { type: 'set_view'; view: View }
  | { type: 'select_room'; room: RoomId }
  | { type: 'open_detail'; detail: DetailId }
  | { type: 'close_detail' }
  | { type: 'open_modal'; modal: 'fan' }
  | { type: 'close_modal' }
  // global
  | { type: 'global_qa'; index: number }
  | { type: 'global_toggle_dnd' }
  | { type: 'global_lock_doors' }
  | { type: 'global_close_gates' }
  | { type: 'global_climate_step'; delta: number }
  | { type: 'set_audio_mixer'; preset: number }
  | { type: 'set_routing'; preset: number }
  // lights
  | { type: 'lights_toggle'; lightId: string }
  | { type: 'lights_brightness'; lightId: string; value: number }
  | { type: 'lights_all_off' }
  | { type: 'lights_all_on' }
  | { type: 'lights_step_all'; delta: number }
  | { type: 'lights_apply_scene'; sceneIndex: number }
  | { type: 'lights_sensor_toggle'; sensorId: string }
  // climate
  | { type: 'climate_set'; value: number }
  | { type: 'climate_step'; delta: number }
  | { type: 'climate_toggle' }
  | { type: 'climate_fan'; fan: FanMode }
  // curtains
  | { type: 'curtains_scene'; scene: number }
  // audio / cinema / video
  | { type: 'audio_toggle' }
  | { type: 'audio_volume'; value: number }
  | { type: 'audio_step_volume'; delta: number }
  | { type: 'audio_seek'; value: number }
  | { type: 'cinema_pick_source'; source: string }
  | { type: 'cinema_volume'; value: number }
  | { type: 'cinema_step_volume'; delta: number }
  | { type: 'video_pick_source'; source: string }
  | { type: 'video_volume'; value: number }
  | { type: 'video_step_volume'; delta: number }
  // ambient room tiles
  | { type: 'exhaust_fan_set'; state: 'on' | 'off' | '5min' }
  | { type: 'water_heater_set'; on: boolean }
  | { type: 'cisco_toggle'; key: 'dnd' | 'mute' | 'video' };

function withRoom(state: LitState, mutate: (r: RoomState) => RoomState): LitState {
  return {
    ...state,
    rooms: { ...state.rooms, [state.activeRoom]: mutate(state.rooms[state.activeRoom]) },
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function litReducer(state: LitState, action: LitAction): LitState {
  switch (action.type) {
    case 'set_view':
      return { ...state, view: action.view, detail: null, modal: null };
    case 'select_room':
      return { ...state, activeRoom: action.room, detail: null, modal: null };
    case 'open_detail':
      return { ...state, detail: action.detail };
    case 'close_detail':
      return { ...state, detail: null, modal: null };
    case 'open_modal':
      return { ...state, modal: action.modal };
    case 'close_modal':
      return { ...state, modal: null };

    case 'global_qa':
      return { ...state, global: { ...state.global, quickActions: action.index } };
    case 'global_toggle_dnd':
      return { ...state, global: { ...state.global, intercomDnd: !state.global.intercomDnd } };
    case 'global_lock_doors':
      return { ...state, global: { ...state.global, doorsLocked: !state.global.doorsLocked } };
    case 'global_close_gates':
      return { ...state, global: { ...state.global, gatesClosed: !state.global.gatesClosed } };
    case 'global_climate_step':
      return {
        ...state,
        global: {
          ...state.global,
          globalClimate: {
            enabled: true,
            target: clamp(state.global.globalClimate.target + action.delta, 16, 32),
          },
        },
      };
    case 'set_audio_mixer':
      return { ...state, global: { ...state.global, audioMixerPreset: action.preset } };
    case 'set_routing':
      return { ...state, global: { ...state.global, routingPreset: action.preset } };

    case 'lights_toggle':
      return withRoom(state, (r) => ({
        ...r,
        lights: {
          ...r.lights,
          items: r.lights.items.map((l) =>
            l.id === action.lightId ? { ...l, on: !l.on, brightness: !l.on && l.brightness === 0 ? 100 : l.brightness } : l,
          ),
        },
      }));
    case 'lights_brightness':
      return withRoom(state, (r) => ({
        ...r,
        lights: {
          ...r.lights,
          items: r.lights.items.map((l) =>
            l.id === action.lightId ? { ...l, brightness: action.value, on: action.value > 0 } : l,
          ),
        },
      }));
    case 'lights_all_off':
      return withRoom(state, (r) => ({
        ...r,
        lights: { ...r.lights, activeScene: null, items: r.lights.items.map((l) => ({ ...l, on: false })) },
      }));
    case 'lights_all_on':
      return withRoom(state, (r) => ({
        ...r,
        lights: {
          ...r.lights,
          activeScene: null,
          items: r.lights.items.map((l) => ({ ...l, on: true, brightness: l.brightness || 100 })),
        },
      }));
    case 'lights_step_all':
      return withRoom(state, (r) => ({
        ...r,
        lights: {
          ...r.lights,
          items: r.lights.items.map((l) =>
            l.on ? { ...l, brightness: clamp(l.brightness + action.delta * 10, 0, 100) } : l,
          ),
        },
      }));
    case 'lights_apply_scene': {
      // each scene preset shifts the room palette + brightness
      const presets: { brightness: number; ids: number[] }[] = [
        { brightness: 80, ids: [0, 1] },
        { brightness: 40, ids: [1, 2] },
        { brightness: 15, ids: [2, 5] },
        { brightness: 100, ids: [0, 1, 4, 5] },
      ];
      const p = presets[action.sceneIndex - 1] ?? presets[0];
      return withRoom(state, (r) => ({
        ...r,
        lights: {
          ...r.lights,
          activeScene: action.sceneIndex,
          items: r.lights.items.map((l, i) => ({
            ...l,
            on: p.ids.includes(i),
            brightness: p.ids.includes(i) ? p.brightness : 0,
          })),
        },
      }));
    }
    case 'lights_sensor_toggle':
      return withRoom(state, (r) => ({
        ...r,
        lights: {
          ...r.lights,
          sensors: r.lights.sensors.map((s) => (s.id === action.sensorId ? { ...s, on: !s.on } : s)),
        },
      }));

    case 'climate_set':
      return withRoom(state, (r) => ({ ...r, climate: { ...r.climate, target: clamp(action.value, 16, 32) } }));
    case 'climate_step':
      return withRoom(state, (r) => ({
        ...r,
        climate: { ...r.climate, target: clamp(r.climate.target + action.delta, 16, 32) },
      }));
    case 'climate_toggle':
      return withRoom(state, (r) => ({ ...r, climate: { ...r.climate, on: !r.climate.on } }));
    case 'climate_fan':
      return withRoom(state, (r) => ({ ...r, climate: { ...r.climate, fan: action.fan } }));

    case 'curtains_scene':
      return withRoom(state, (r) => ({ ...r, curtains: { activeScene: action.scene } }));

    case 'audio_toggle':
      return withRoom(state, (r) => ({ ...r, audio: { ...r.audio, playing: !r.audio.playing } }));
    case 'audio_volume':
      return withRoom(state, (r) => ({ ...r, audio: { ...r.audio, volume: clamp(action.value, 0, 100) } }));
    case 'audio_step_volume':
      return withRoom(state, (r) => ({
        ...r,
        audio: { ...r.audio, volume: clamp(r.audio.volume + action.delta, 0, 100) },
      }));
    case 'audio_seek':
      return withRoom(state, (r) => ({
        ...r,
        audio: { ...r.audio, progress: clamp(action.value, 0, r.audio.duration) },
      }));

    case 'cinema_pick_source':
      return withRoom(state, (r) => ({ ...r, cinema: { ...r.cinema, source: action.source, playing: true } }));
    case 'cinema_volume':
      return withRoom(state, (r) => ({ ...r, cinema: { ...r.cinema, volume: clamp(action.value, 0, 100) } }));
    case 'cinema_step_volume':
      return withRoom(state, (r) => ({
        ...r,
        cinema: { ...r.cinema, volume: clamp(r.cinema.volume + action.delta, 0, 100) },
      }));

    case 'video_pick_source':
      return withRoom(state, (r) => ({ ...r, video: { ...r.video, source: action.source, playing: true } }));
    case 'video_volume':
      return withRoom(state, (r) => ({ ...r, video: { ...r.video, volume: clamp(action.value, 0, 100) } }));
    case 'video_step_volume':
      return withRoom(state, (r) => ({
        ...r,
        video: { ...r.video, volume: clamp(r.video.volume + action.delta, 0, 100) },
      }));

    case 'exhaust_fan_set':
      return withRoom(state, (r) => ({ ...r, exhaustFan: action.state }));
    case 'water_heater_set':
      return withRoom(state, (r) => ({ ...r, waterHeater: action.on }));
    case 'cisco_toggle':
      return withRoom(state, (r) => ({ ...r, cisco: { ...r.cisco, [action.key]: !r.cisco[action.key] } }));

    default:
      return state;
  }
}
