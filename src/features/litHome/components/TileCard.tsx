import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

type Props = {
  icon?: LucideIcon;
  title: string;
  rightSlot?: ReactNode;
  onOpen?: () => void;
  /** Footer area — pill buttons, +/- rows, status text. */
  children?: ReactNode;
  /** Optional override for content alignment. */
  bodyClass?: string;
  className?: string;
  /** Disable hover/press affordance — for tiles whose buttons are purely inline. */
  static?: boolean;
};

/**
 * The base card used everywhere on the home + showroom grids.
 * Re-skins the LIT Home app's white cards as warm-ink panels with hairline gold-on-hover.
 */
export function TileCard({
  icon: Icon,
  title,
  rightSlot,
  onOpen,
  children,
  bodyClass = '',
  className = '',
  static: isStatic = false,
}: Props) {
  const clickable = Boolean(onOpen) && !isStatic;
  const header = (
    <div className="flex items-start justify-between px-4 pt-3.5 pb-2.5 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={14} aria-hidden="true" className="text-gold shrink-0" strokeWidth={1.5} />}
        <span className="text-[13px] font-medium text-bone-100 truncate">{title}</span>
      </div>
      {rightSlot && <div className="shrink-0 text-end">{rightSlot}</div>}
    </div>
  );

  return (
    <motion.div
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative w-full text-start rounded-lg bg-ink-800/80 border border-white/[0.06]
        hover:border-gold/30 transition-colors overflow-hidden ${className}`}
    >
      {/*
       * The header is the only clickable region when a tile opens a detail —
       * it does NOT wrap `children`. Several tiles (Lights, Climate, Audio,
       * Cinema, Video) pass both `onOpen` *and* footer pill/stepper buttons as
       * `children`; making the whole card a <button> would nest interactive
       * controls inside a <button>; that is invalid HTML and browsers/AT
       * disagree on how to parse it, so it is a real defect and not merely a
       * style choice. Scoping the button to the header keeps every control
       * a real, singly-nested, keyboard-operable element.
       */}
      {clickable ? (
        <motion.button
          type="button"
          onClick={onOpen}
          whileTap={{ scale: 0.985 }}
          whileHover={{ y: -1 }}
          className="w-full text-start"
        >
          {header}
        </motion.button>
      ) : (
        header
      )}
      {children && (
        <div className={`border-t border-white/[0.04] ${bodyClass}`}>{children}</div>
      )}
    </motion.div>
  );
}

/** Pill-shaped inline button used in tile footers (QA1, SCENE 1, ALL OFF, etc.). */
export function TilePill({
  active,
  onClick,
  children,
  className = '',
}: {
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      // `active` is exclusively used by scene/preset/mode pill groups where exactly
      // one pill is "on" — exposing it as aria-pressed fixes the SC 1.4.1 gap where
      // selection was gold-vs-bone colour only. Pills with no selection concept
      // (e.g. "+ New Event") never pass `active`, so they get no aria-pressed.
      aria-pressed={active}
      className={`flex-1 py-2.5 text-[10px] tracking-luxe uppercase font-medium transition-colors
        ${active ? 'bg-gold/15 text-gold' : 'text-bone-500 hover:text-gold hover:bg-white/[0.03]'}
        ${className}`}
    >
      {children}
    </button>
  );
}

/** Eyebrow shown on the right side of a tile header (e.g. "NOW PLAYING"). */
export function TileEyebrow({ children }: { children: ReactNode }) {
  return <div className="text-[8px] tracking-luxe uppercase text-bone-500 font-medium">{children}</div>;
}
