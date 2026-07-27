import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useHydrated } from '@/lib/hydration';

type Props = {
  children: ReactNode;
  className?: string;
  /** distance in px to translate over the scroll window */
  distance?: number;
};

export function Parallax({ children, className, distance = 80 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      {/* The scroll transform is attached only after hydration: the prerendered
          HTML must render at its natural position for no-JS visitors. */}
      <motion.div style={hydrated ? { y } : undefined} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
