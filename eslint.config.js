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
      // Trailing-slash convention (docs/05-URL-TAXONOMY.md §1/§4, src/seo/paths.ts).
      // A slashless internal href is a 301 hop under Apache's DirectorySlash and
      // desynchronises the visible breadcrumb from its BreadcrumbList JSON-LD, so
      // catch the literal form (`<Link to="/brands">`) at lint time.
      //
      // Scoped to the three elements that emit an anchor themselves — `a`, `Link`,
      // `NavLink` — because that is where `to`/`href` is the rendered value. Wrapper
      // components (`ButtonLink`, `Card`, `InternalLinks`) deliberately take the
      // internal slashless form and call href() inside, so they are not flagged.
      // The value pattern is "starts with /, does not end with /, has no file
      // extension": a route path, not an asset, a `#fragment` or a `mailto:`.
      // Computed paths (template literals) are beyond a syntactic rule; those all
      // flow through the wrapper components above.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXOpeningElement[name.name=/^(a|Link|NavLink)$/] > ' +
            'JSXAttribute[name.name=/^(to|href)$/] > Literal[value=/^\\/[^.]*[^/]$/]',
          message:
            'Internal link paths must render in the canonical trailing-slash form: ' +
            "wrap it as href('/path') from '@/seo/paths'. A slashless href is a 301 hop.",
        },
      ],
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
