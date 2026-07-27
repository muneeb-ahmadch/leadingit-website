import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import type { ViteReactSSGOptions } from 'vite-react-ssg';

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
  server: { port: 5173, host: true },
  ssgOptions,
});
