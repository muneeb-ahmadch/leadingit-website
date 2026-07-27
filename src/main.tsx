import { ViteReactSSG } from 'vite-react-ssg';
import './i18n';
import './styles/globals.css';
import { routes } from './router';

/**
 * SSG entry. `vite-react-ssg` owns the root: at build time it walks `routes`,
 * renders every path to static HTML, and in the browser it hydrates that same
 * markup with a react-router browser router.
 */
export const createRoot = ViteReactSSG({ routes });
