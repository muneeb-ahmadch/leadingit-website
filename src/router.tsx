import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';

/**
 * Static tool route inside the Black Nova brand namespace. React Router ranks
 * static segments above dynamic ones, so it always wins over
 * `/brands/:slug/:productSlug` — and it is filtered out of the generated product
 * paths below so the two can never emit the same file.
 */
const KEYPAD_DESIGNER_PATH = '/brands/black-nova/keypad-designer';

/**
 * `getStaticPaths` only ever runs in Node during the prerender, so the catalogs
 * it needs are pulled in with `await import()`: that keeps `src/data/*` out of
 * the browser entry chunk, where it would otherwise be shipped to every page
 * just to build a list of build-time URLs.
 */

/** Every brand page that gets prerendered. */
export const brandPaths = async (): Promise<string[]> => {
  const { BRANDS } = await import('@/data/brands');
  return BRANDS.map((b) => `/brands/${b.slug}`);
};

/** Every product page that gets prerendered (brandSlug + slug pairs). */
export const productPaths = async (): Promise<string[]> => {
  const { PRODUCTS } = await import('@/data/products');
  return PRODUCTS.map((p) => `/brands/${p.brandSlug}/${p.slug}`).filter(
    (path) => path !== KEYPAD_DESIGNER_PATH,
  );
};

/**
 * Route records consumed by `ViteReactSSG`: the same tree drives the build-time
 * prerender and the browser router after hydration.
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
      // unmatched URL reached through client-side navigation.
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
