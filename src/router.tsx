import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';
import { KEYPAD_DESIGNER_PATH, brandPaths, productPaths } from '@/seo/routes';

/**
 * Route records consumed by `ViteReactSSG`: the same tree drives the build-time
 * prerender and the browser router after hydration.
 *
 * The URL set itself is not defined here — it comes from the typed manifest in
 * `src/seo/routes.ts`, which also feeds `scripts/gen-sitemap.mjs` and the
 * metadata layer. This file only maps patterns to components. `getStaticPaths`
 * runs exclusively in Node during the prerender, and the manifest reaches the
 * catalog through `await import()`, so `src/data/*` stays out of the browser
 * entry chunk (Phase 1 decision — do not inline the path logic back in here).
 *
 * `KEYPAD_DESIGNER_PATH` is a static segment inside the Black Nova namespace.
 * React Router ranks static segments above dynamic ones, so it always wins over
 * `/brands/:slug/:productSlug` — and the manifest both filters it out of the
 * generated product paths and hard-fails if a product ever claims that slug, so
 * the two can never emit the same file.
 *
 * Every page is loaded through react-router's `lazy` field so each one compiles
 * to its own chunk. Nothing is deferred in the output: the prerender resolves
 * `lazy` inside `createStaticHandler().query()`, and in the browser
 * `vite-react-ssg` awaits the matched route's module *before* it hydrates — the
 * static HTML is never replaced by a fallback. The shell (`Layout`) stays eager
 * because it renders on every route.
 */
export const routes: RouteRecord[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', lazy: async () => ({ Component: (await import('@/pages/Home')).Home }) },
      {
        path: '/brands',
        lazy: async () => ({ Component: (await import('@/pages/BrandsIndex')).BrandsIndex }),
      },
      {
        path: '/brands/:slug',
        lazy: async () => ({ Component: (await import('@/pages/BrandPage')).BrandPage }),
        getStaticPaths: brandPaths,
      },
      {
        path: KEYPAD_DESIGNER_PATH,
        lazy: async () => ({
          Component: (await import('@/pages/KeypadDesignerPage')).KeypadDesignerPage,
        }),
      },
      {
        path: '/brands/:slug/:productSlug',
        lazy: async () => ({ Component: (await import('@/pages/ProductPage')).ProductPage }),
        getStaticPaths: productPaths,
      },
      {
        path: '/lit-home',
        lazy: async () => ({ Component: (await import('@/pages/LitHome')).LitHomePage }),
      },
      { path: '/about', lazy: async () => ({ Component: (await import('@/pages/About')).About }) },
      {
        path: '/contact',
        lazy: async () => ({ Component: (await import('@/pages/Contact')).Contact }),
      },
      // Prerendered as its own file; the splat renders the same page for any
      // unmatched URL reached through client-side navigation. `/404` is in the
      // manifest as `indexable: false`, so it never enters the sitemap.
      {
        path: '/404',
        lazy: async () => ({ Component: (await import('@/pages/NotFound')).NotFound }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFound')).NotFound }),
      },
    ],
  },
];
