// Flat ESLint config (ESLint 9). Kept deliberately close to the standard Vite +
// React + TS template: typescript-eslint's non-type-checked `recommended` (type-
// checked linting needs a tsconfig `project` pass and roughly doubles lint time —
// `tsc -b --noEmit` already runs first in `npm run lint` and is the strict-TS
// gate), react-hooks, and react-refresh for Vite's HMR contract.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'raw', 'public'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // Plain Node JS run outside the browser bundle: the build-time sitemap
  // generator and the root tooling configs. No TS project membership, so kept
  // on the base JS ruleset plus Node globals rather than ignored.
  {
    files: ['scripts/**/*.mjs', 'postcss.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
);
