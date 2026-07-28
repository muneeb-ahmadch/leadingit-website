import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { ViteReactSSGOptions } from 'vite-react-ssg';
import { ENABLED_LOCALES, RTL_LOCALES } from './src/lib/locales';

const ssgOptions: ViteReactSSGOptions = {
  // `/lit-home` -> `dist/lit-home/index.html`, so Apache serves extension-less
  // URLs straight from the static tree without rewrite rules.
  dirStyle: 'nested',
  // Pretty-printing the emitted HTML breaks hydration; keep the renderer output.
  formatting: 'none',
  async onFinished(dir) {
    // cPanel/Apache `ErrorDocument 404` needs a real file at the document root.
    const out = isAbsolute(dir) ? dir : resolve(process.cwd(), dir);
    await copyFile(join(out, '404', 'index.html'), join(out, '404.html'));
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Compile-time constant: while no RTL locale is enabled, the fonts-rtl.css
  // dynamic import in main.tsx is dead code and Rollup drops the ~30-file
  // Arabic/Urdu font payload from dist entirely.
  define: {
    __RTL_FONTS_ENABLED__: JSON.stringify(
      ENABLED_LOCALES.some((locale) => (RTL_LOCALES as readonly string[]).includes(locale)),
    ),
  },
  server: { port: 5173, host: true },
  ssgOptions,
});
