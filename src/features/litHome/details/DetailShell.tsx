import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDialogA11y } from '@/lib/useDialogA11y';

type Props = {
  eyebrow: string;
  /** The "Room Name" subtitle */
  roomName: string;
  onClose: () => void;
  /** Slot at top right used by Cinema for hardware shortcut icons. */
  topRight?: ReactNode;
  children: ReactNode;
};

/**
 * Shared chrome for the four detail overlays — header bar + close, body slot.
 *
 * Carries real dialog semantics (WCAG 2.2 AA): `role="dialog"`/`aria-modal`,
 * focus moved in on open and returned to the triggering tile on close,
 * `Escape` to close, and a Tab trap — previously this was a plain `<div>`
 * with none of that, so a keyboard user could tab straight through it into
 * the page behind and closing it left focus wherever it happened to be.
 * See `src/lib/useDialogA11y.ts`.
 */
export function DetailShell({ eyebrow, roomName, onClose, topRight, children }: Props) {
  const { ref, onKeyDown } = useDialogA11y<HTMLDivElement>(onClose);

  return (
    <motion.div
      key={eyebrow}
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${eyebrow} — ${roomName}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 bg-ink-900/98 backdrop-blur-sm flex flex-col"
    >
      <div className="flex items-start justify-between px-7 pt-5 pb-3 border-b border-white/[0.05]">
        <div>
          <div className="text-[10px] tracking-luxe uppercase text-bone-500 font-medium">{eyebrow}</div>
          <div className="text-[13px] text-bone-100 mt-0.5">{roomName}</div>
        </div>
        <div className="flex items-center gap-5">
          {topRight}
          <button
            onClick={onClose}
            className="text-bone-500 hover:text-gold transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </motion.div>
  );
}
