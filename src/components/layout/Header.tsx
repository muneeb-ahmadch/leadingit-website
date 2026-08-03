import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { href } from '@/seo/paths';

const linkCls = (isActive: boolean) =>
  `text-sm uppercase tracking-luxe transition-colors duration-300 ${
    isActive ? 'text-gold' : 'text-bone-100 hover:text-gold'
  }`;

/**
 * Nav link with trailing-slash-insensitive active matching.
 *
 * `NavLink` cannot be used here, and the reason is subtle enough to be worth
 * writing down. Its `to` must be the rendered canonical form (`/about/`), but
 * the prerender runs at the manifest's internal form (`/about`) — React Router's
 * matching key. `NavLink` compares those two strings and finds no match, so the
 * emitted HTML for `/about/` carried no `aria-current` and no active styling at
 * all, while `/brands/marantz/` marked *Brands* as `aria-current="page"` — a
 * page the visitor is not on. It also diverged at hydration, because in the
 * browser the location *is* `/about/`, so the client marked the link active and
 * disagreed with the server HTML.
 *
 * Normalising both sides is insensitive to which form the router hands us, so
 * server and client always agree. The `startsWith` arm keeps a section link lit
 * on its children (`/brands/marantz/` lights *Brands*), matching the previous
 * `NavLink` behaviour that was relied on.
 */
function NavItem({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const here = pathname.replace(/\/+$/, '') || '/';
  const target = to.replace(/\/+$/, '') || '/';
  const isActive = here === target || (target !== '/' && here.startsWith(`${target}/`));

  return (
    <Link
      to={href(to)}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={linkCls(isActive)}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-out-luxe
        ${scrolled ? 'bg-ink-950/85 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}
    >
      <div className="container-luxe flex items-center justify-between py-5">
        <Link to={href('/')} className="flex items-baseline gap-2 group">
          <span className="font-serif text-2xl tracking-wider2 text-bone-100 group-hover:text-gold transition-colors">
            Leading <span className="text-gold">IT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <NavItem to="/brands">{t('nav.brands')}</NavItem>
          {/*
           * `/solutions` is in global nav from the moment the route emits HTML
           * (Phase 4) and not a day before — an anchor to a route that 404s is
           * worse than no anchor (docs/10-CONTENT-BRIEFS/_CONVENTIONS.md §8).
           * The section link also lights on its children via NavItem's
           * `startsWith` arm, so /solutions/home-cinema/ marks Solutions active.
           */}
          <NavItem to="/solutions">{t('nav.solutions')}</NavItem>
          <NavItem to="/lit-home">{t('nav.litHome')}</NavItem>
          <NavItem to="/about">{t('nav.about')}</NavItem>
          <NavItem to="/contact">{t('nav.contact')}</NavItem>
        </nav>

        <button
          aria-label="Menu"
          className="md:hidden text-bone-100"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink-950/95 backdrop-blur-md">
          <div className="container-luxe flex flex-col gap-5 py-6">
            <NavItem to="/brands" onClick={() => setOpen(false)}>{t('nav.brands')}</NavItem>
            <NavItem to="/solutions" onClick={() => setOpen(false)}>{t('nav.solutions')}</NavItem>
            <NavItem to="/lit-home" onClick={() => setOpen(false)}>{t('nav.litHome')}</NavItem>
            <NavItem to="/about" onClick={() => setOpen(false)}>{t('nav.about')}</NavItem>
            <NavItem to="/contact" onClick={() => setOpen(false)}>{t('nav.contact')}</NavItem>
          </div>
        </div>
      )}
    </header>
  );
}
