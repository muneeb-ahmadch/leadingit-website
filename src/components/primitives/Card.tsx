import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { href } from '@/seo/paths';

type Props = {
  /** Site-relative path, internal slashless form — `href()` adds the slash. */
  to?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ to, children, className = '' }: Props) {
  const cls = `group relative block bg-ink-800/60 border border-white/5 overflow-hidden
    transition-all duration-700 ease-out-luxe
    hover:bg-ink-800 hover:border-gold/30 hover:shadow-card ${className}`;
  if (to) return <Link to={href(to)} className={cls}>{children}</Link>;
  return <div className={cls}>{children}</div>;
}
