/**
 * Keypad designer state. Mirrors the litHome reducer pattern
 * (src/features/litHome/state.ts): a single typed config driven by a reducer.
 *
 * The full config serialises to / hydrates from the URL query string, so any
 * shared or bookmarked designer link restores the exact design.
 */
import {
  COLLECTIONS,
  COLLECTION_BY_ID,
  BACKLIGHT_BY_ID,
  ICON_BY_ID,
  DEFAULT_SEQUENCE,
  buttonCount,
  finishesFor,
  layoutById,
  type Layout,
} from './catalog';

export type ButtonConfig = { icon: string; label: string };

export type DesignConfig = {
  collection: string;
  layout: string;
  finish: string;
  buttons: ButtonConfig[];
  backlight: { color: string; intensity: number }; // intensity 0-100
  ambient: boolean; // preview lit / at-rest
};

export const STEPS = ['collection', 'layout', 'finish', 'engraving', 'backlight', 'summary'] as const;
export type Step = (typeof STEPS)[number];

// ---------- factories ----------

/** A fresh button grid seeded from the default icon rotation. */
export function seedButtons(layout: Layout | undefined): ButtonConfig[] {
  const n = buttonCount(layout);
  return Array.from({ length: n }, (_, i) => {
    const iconId = DEFAULT_SEQUENCE[i % DEFAULT_SEQUENCE.length];
    return { icon: iconId, label: ICON_BY_ID[iconId]?.label ?? '' };
  });
}

export function initialConfig(collectionId = COLLECTIONS[0].id): DesignConfig {
  const collection = COLLECTION_BY_ID[collectionId] ?? COLLECTIONS[0];
  const layout = collection.layouts[0];
  const finishes = finishesFor(collection.id);
  return {
    collection: collection.id,
    layout: layout.id,
    finish: finishes[0]?.id ?? '',
    buttons: seedButtons(layout),
    backlight: { color: 'amber', intensity: 70 },
    ambient: true,
  };
}

// ---------- actions ----------

export type DesignerAction =
  | { type: 'set_collection'; collection: string }
  | { type: 'set_layout'; layout: string }
  | { type: 'set_finish'; finish: string }
  | { type: 'set_button'; index: number; icon?: string; label?: string }
  | { type: 'set_backlight_color'; color: string }
  | { type: 'set_backlight_intensity'; intensity: number }
  | { type: 'toggle_ambient' }
  | { type: 'hydrate'; config: DesignConfig };

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function designerReducer(state: DesignConfig, action: DesignerAction): DesignConfig {
  switch (action.type) {
    case 'hydrate':
      return action.config;

    case 'set_collection': {
      const collection = COLLECTION_BY_ID[action.collection];
      if (!collection) return state;
      const layout = collection.layouts[0];
      const finishes = finishesFor(collection.id);
      return {
        ...state,
        collection: collection.id,
        layout: layout.id,
        finish: finishes[0]?.id ?? '',
        buttons: seedButtons(layout),
      };
    }

    case 'set_layout': {
      const layout = layoutById(state.collection, action.layout);
      if (!layout) return state;
      // Preserve existing button choices where the grids overlap.
      const seeded = seedButtons(layout);
      const buttons = seeded.map((b, i) => state.buttons[i] ?? b);
      return { ...state, layout: layout.id, buttons };
    }

    case 'set_finish':
      return { ...state, finish: action.finish };

    case 'set_button':
      return {
        ...state,
        buttons: state.buttons.map((b, i) =>
          i === action.index
            ? { icon: action.icon ?? b.icon, label: action.label ?? b.label }
            : b,
        ),
      };

    case 'set_backlight_color':
      return { ...state, backlight: { ...state.backlight, color: action.color } };
    case 'set_backlight_intensity':
      return { ...state, backlight: { ...state.backlight, intensity: clamp(action.intensity, 0, 100) } };

    case 'toggle_ambient':
      return { ...state, ambient: !state.ambient };

    default:
      return state;
  }
}

// ---------- URL (de)serialisation ----------

/** Serialise config to a URLSearchParams-ready record. */
export function toParams(config: DesignConfig): Record<string, string> {
  const bt = config.buttons.map((b) => `${b.icon}~${encodeURIComponent(b.label)}`).join('!');
  return {
    c: config.collection,
    l: config.layout,
    f: config.finish,
    b: config.backlight.color,
    i: String(config.backlight.intensity),
    bt,
  };
}

/** Build the designer path (with query) that restores this design. */
export function toQueryString(config: DesignConfig): string {
  return new URLSearchParams(toParams(config)).toString();
}

/**
 * Hydrate a config from URL params. Validates every value against the catalog;
 * unknown values fall back to defaults so a malformed link never crashes.
 */
export function fromParams(params: URLSearchParams): DesignConfig {
  const collectionId = params.get('c') ?? '';
  const base = initialConfig(COLLECTION_BY_ID[collectionId] ? collectionId : undefined);

  const layoutId = params.get('l') ?? '';
  if (layoutById(base.collection, layoutId)) {
    base.layout = layoutId;
    base.buttons = seedButtons(layoutById(base.collection, layoutId));
  }

  const finishId = params.get('f') ?? '';
  if (finishesFor(base.collection).some((fn) => fn.id === finishId)) base.finish = finishId;

  const color = params.get('b') ?? '';
  if (BACKLIGHT_BY_ID[color]) base.backlight.color = color;

  const intensity = Number(params.get('i'));
  if (Number.isFinite(intensity)) base.backlight.intensity = clamp(intensity, 0, 100);

  const bt = params.get('bt');
  if (bt) {
    const parsed = bt.split('!').map((seg) => {
      const [icon, rawLabel = ''] = seg.split('~');
      return { icon, label: decodeURIComponent(rawLabel) };
    });
    // Only accept parsed buttons that fit the layout's grid and use known icons.
    base.buttons = base.buttons.map((b, i) => {
      const p = parsed[i];
      return p && ICON_BY_ID[p.icon] ? { icon: p.icon, label: p.label } : b;
    });
  }

  return base;
}

/** Whether the params carry a serialised design (vs. just a collection preselect). */
export function hasFullDesign(params: URLSearchParams): boolean {
  return params.has('l') || params.has('bt') || params.has('f');
}
