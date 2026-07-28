import { ViteReactSSG } from 'vite-react-ssg';
import './i18n';
import './styles/globals.css';
import { routes } from './router';
// Arabic/Urdu font payload (~30 files) only ships once one of those locales is
// enabled — __RTL_FONTS_ENABLED__ is a compile-time constant (vite.config.ts),
// so while it is false this import is dead code and the fonts never reach dist.
// See src/styles/fonts-rtl.css for the reversal note.
if (__RTL_FONTS_ENABLED__) {
  void import('./styles/fonts-rtl.css');
}

/**
 * SSG entry. `vite-react-ssg` owns the root: at build time it walks `routes`,
 * renders every path to static HTML, and in the browser it hydrates that same
 * markup with a react-router browser router.
 */
export const createRoot = ViteReactSSG({ routes });
