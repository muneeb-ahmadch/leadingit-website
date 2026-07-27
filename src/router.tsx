import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { BrandsIndex } from '@/pages/BrandsIndex';
import { BrandPage } from '@/pages/BrandPage';
import { ProductPage } from '@/pages/ProductPage';
import { KeypadDesignerPage } from '@/pages/KeypadDesignerPage';
import { LitHomePage } from '@/pages/LitHome';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/brands', element: <BrandsIndex /> },
      { path: '/brands/:slug', element: <BrandPage /> },
      { path: '/brands/blacknova/designer', element: <KeypadDesignerPage /> },
      { path: '/brands/:slug/:productSlug', element: <ProductPage /> },
      { path: '/lit-home', element: <LitHomePage /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <Home /> },
    ],
  },
]);
