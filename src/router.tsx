import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';
import { KEYPAD_DESIGNER_PATH } from '@/seo/paths';

/**
 * `getStaticPaths` decides which files the prerender writes. It is called in
 * exactly one place — `vite-react-ssg`'s Node build — and never in a browser.
 *
 * That matters because the only way to enumerate URLs is the manifest, and the
 * manifest reaches `src/data/products.ts` (~3,500 lines). `vite-react-ssg` runs
 * two separate Rollup builds off this one file, so `import.meta.env.SSR` is a
 * compile-time constant in both: `true` for the SSR build that prerenders,
 * `false` for the client build. In the client build these ternaries fold to
 * `undefined` and Rollup drops the `import()` with them, so neither the manifest
 * nor the catalog it pulls in can reach the entry chunk. A plain top-level
 * `import` of `@/seo/routes` here — which is what this file used to do — put
 * `STATIC_ROUTES`, `RESERVED_BRAND_CHILD_SLUGS` and the manifest's assertion
 * prose in front of every visitor.
 *
 * The dynamic import keeps one source of truth: the paths still come from the
 * same manifest the sitemap and the validation harness read. Do not replace it
 * with a second, hand-kept path list.
 */
type StaticPaths = RouteRecord['getStaticPaths'];

const brandStaticPaths: StaticPaths = import.meta.env.SSR
  ? async () => (await import('@/seo/routes')).brandPaths()
  : undefined;

const productStaticPaths: StaticPaths = import.meta.env.SSR
  ? async () => (await import('@/seo/routes')).productPaths()
  : undefined;

const solutionStaticPaths: StaticPaths = import.meta.env.SSR
  ? async () => (await import('@/seo/routes')).solutionPaths()
  : undefined;

/**
 * Route records consumed by `ViteReactSSG`: the same tree drives the build-time
 * prerender and the browser router after hydration.
 *
 * The URL set itself is not defined here — it comes from the typed manifest in
 * `src/seo/routes.ts`, which also feeds `scripts/gen-sitemap.mjs` and the
 * metadata layer. This file only maps patterns to components.
 *
 * Route patterns are declared in the manifest's **internal form** — no trailing
 * slash (`/brands/:slug`). Anchors render the slashed form via `href()`; React
 * Router's `compilePath()` appends `\/*$` when matching to the end, so
 * `/brands/marantz/` matches `/brands/:slug` with identical params. See
 * `src/seo/paths.ts` for the whole convention.
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
        getStaticPaths: brandStaticPaths,
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
        getStaticPaths: productStaticPaths,
      },
      {
        path: '/solutions',
        lazy: async () => ({ Component: (await import('@/pages/SolutionsIndex')).SolutionsIndex }),
      },
      {
        path: '/solutions/:slug',
        lazy: async () => ({ Component: (await import('@/pages/SolutionPage')).SolutionPage }),
        getStaticPaths: solutionStaticPaths,
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
