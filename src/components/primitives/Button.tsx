import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { href } from '@/seo/paths';

type Variant = 'gold' | 'ghost';

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  withArrow?: boolean;
};

/**
 * `to` is a site-relative path in the internal, slashless form; the trailing
 * slash is added here by `href()` (`src/seo/paths.ts`), so no caller has to
 * remember it and no CTA on the site points at a 301.
 */
export function ButtonLink({
  to,
  variant = 'gold',
  children,
  className = '',
  withArrow = true,
}: CommonProps & { to: string }) {
  const cls = variant === 'gold' ? 'btn-gold' : 'btn-ghost';
  return (
    <Link to={href(to)} className={`${cls} group ${className}`}>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight
          size={16}
          className="transition-transform duration-500 ease-out-luxe group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
        />
      )}
    </Link>
  );
}

export function Button({
  variant = 'gold',
  children,
  className = '',
  withArrow = true,
  onClick,
  type = 'button',
}: CommonProps & { onClick?: () => void; type?: 'button' | 'submit' }) {
  const cls = variant === 'gold' ? 'btn-gold' : 'btn-ghost';
  return (
    <button type={type} onClick={onClick} className={`${cls} group ${className}`}>
      <span>{children}</span>
      {withArrow && (
        <ArrowRight
          size={16}
          className="transition-transform duration-500 ease-out-luxe group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
        />
      )}
    </button>
  );
}
