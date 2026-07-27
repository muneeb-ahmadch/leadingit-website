import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { hasHydrated, mountedDuringHydration } from '@/lib/hydration';

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-triggered entrance animation that never hides prerendered content.
 *
 * The static HTML carries no hidden initial state, so every page is complete and
 * readable with JavaScript disabled. Once React takes over:
 *   - blocks the visitor can already see stay exactly as painted (no flash, and
 *     LCP is not deferred behind hydration);
 *   - blocks below the fold are armed, hidden instantly, then revealed as they
 *     scroll into view;
 *   - after hydration (client-side navigation) every block animates in as designed.
 */
export function Reveal({ children, delay = 0, y = 24, className, once = true }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-80px' });
  const [armed, setArmed] = useState(false);
  // False while prerendering and during hydration; true for later client mounts.
  const animateOnMount = hasHydrated();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offscreen = rect.top >= window.innerHeight || rect.bottom <= 0;
    if (!mountedDuringHydration() || offscreen) setArmed(true);
  }, []);

  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : y, transition: { duration: 0 } },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay } },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial={animateOnMount ? 'hidden' : false}
      animate={armed ? (inView ? 'show' : 'hidden') : undefined}
    >
      {children}
    </motion.div>
  );
}
