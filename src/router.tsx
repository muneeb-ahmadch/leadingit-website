import type { RouteRecord } from 'vite-react-ssg';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { BrandsIndex } from '@/pages/BrandsIndex';
import { BrandPage } from '@/pages/BrandPage';
import { ProductPage } from '@/pages/ProductPage';
import { KeypadDesignerPage } from '@/pages/KeypadDesignerPage';
import { LitHomePage } from '@/pages/LitHome';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { NotFound } from '@/pages/NotFound';
import { BRANDS } from '@/data/brands';
import { PRODUCTS } from '@/data/products';

/**
 * Static tool route inside the Black Nova brand namespace. React Router ranks
 * static segments above dynamic ones, so it always wins over
 * `/brands/:slug/:productSlug` — and it is filtered out of the generated product
 * paths below so the two can never emit the same file.
 */
const KEYPAD_DESIGNER_PATH = '/brands/black-nova/keypad-designer';

/** Every brand page that gets prerendered. */
export const brandPaths = (): string[] => BRANDS.map((b) => `/brands/${b.slug}`);

/** Every product page that gets prerendered (brandSlug + slug pairs). */
export const productPaths = (): string[] =>
  PRODUCTS.map((p) => `/brands/${p.brandSlug}/${p.slug}`).filter(
    (path) => path !== KEYPAD_DESIGNER_PATH,
  );

/**
 * Route records consumed by `ViteReactSSG`: the same tree drives the build-time
 * prerender and the browser router after hydration.
 */
export const routes: RouteRecord[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/brands', element: <BrandsIndex /> },
      { path: '/brands/:slug', element: <BrandPage />, getStaticPaths: brandPaths },
      { path: KEYPAD_DESIGNER_PATH, element: <KeypadDesignerPage /> },
      { path: '/brands/:slug/:productSlug', element: <ProductPage />, getStaticPaths: productPaths },
      { path: '/lit-home', element: <LitHomePage /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      // Prerendered as its own file; the splat renders the same page for any
      // unmatched URL reached through client-side navigation.
      { path: '/404', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
