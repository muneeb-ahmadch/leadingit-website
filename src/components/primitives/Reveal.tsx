import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

export function Reveal({ children, delay = 0, y = 24, className, once = true }: Props) {
  const reduced = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-80px' }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
