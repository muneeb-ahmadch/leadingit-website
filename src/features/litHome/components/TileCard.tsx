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
  const Wrapper = onOpen && !isStatic ? motion.button : motion.div;
  return (
    <Wrapper
      {...(onOpen && !isStatic
        ? {
            onClick: onOpen,
            whileTap: { scale: 0.985 },
            whileHover: { y: -1 },
          }
        : {})}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative w-full text-start rounded-lg bg-ink-800/80 border border-white/[0.06]
        hover:border-gold/30 transition-colors overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between px-4 pt-3.5 pb-2.5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={14} className="text-gold shrink-0" strokeWidth={1.5} />}
          <span className="text-[13px] font-medium text-bone-100 truncate">{title}</span>
        </div>
        {rightSlot && <div className="shrink-0 text-end">{rightSlot}</div>}
      </div>
      {children && (
        <div className={`border-t border-white/[0.04] ${bodyClass}`}>{children}</div>
      )}
    </Wrapper>
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
