import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

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

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm uppercase tracking-luxe transition-colors duration-300 ${
      isActive ? 'text-gold' : 'text-bone-100 hover:text-gold'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-out-luxe
        ${scrolled ? 'bg-ink-950/85 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}
    >
      <div className="container-luxe flex items-center justify-between py-5">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-serif text-2xl tracking-wider2 text-bone-100 group-hover:text-gold transition-colors">
            Leading <span className="text-gold">IT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/brands" className={linkCls}>{t('nav.brands')}</NavLink>
          <NavLink to="/lit-home" className={linkCls}>{t('nav.litHome')}</NavLink>
          <NavLink to="/about" className={linkCls}>{t('nav.about')}</NavLink>
          <NavLink to="/contact" className={linkCls}>{t('nav.contact')}</NavLink>
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
            <NavLink to="/brands" onClick={() => setOpen(false)} className={linkCls}>{t('nav.brands')}</NavLink>
            <NavLink to="/lit-home" onClick={() => setOpen(false)} className={linkCls}>{t('nav.litHome')}</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)} className={linkCls}>{t('nav.about')}</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className={linkCls}>{t('nav.contact')}</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
