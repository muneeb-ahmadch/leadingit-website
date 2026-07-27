# Leading IT — Website

Marketing site for [Leading IT](https://leadingit.me) — premium home, cinema and industrial
automation across the UAE and Pakistan. Distributor of Crestron, Blustream, Basalte, Black Nova,
Marantz, Denon, U&K Sound, Polk Audio and JVC, and maker of the LIT Home control software.

Cinematic dark-luxury aesthetic, with two interactive showcases: the LIT Home control-surface demo
and the Black Nova keypad designer.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, brand wall, LIT Home teaser, featured products |
| `/brands` | Brands index, grouped by category (Architectural Interfaces, Cinema & AV) |
| `/brands/:slug` | Brand page (templated — e.g. `/brands/crestron`) |
| `/brands/:slug/:productSlug` | Product detail (e.g. `/brands/basalte/deseo`) |
| `/brands/black-nova/keypad-designer` | Black Nova keypad designer (interactive configurator) |
| `/lit-home` | LIT Home showcase with fully clickable interactive demo |
| `/about` | About |
| `/contact` | Contact |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check + production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check only (`tsc -b --noEmit`) |

## Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS (RTL-ready) · Framer Motion · Lenis ·
react-i18next · react-router-dom

Fonts are self-hosted via `@fontsource`. Product renders are downloaded from official manufacturer
sources and kept outside version control (some lifestyle imagery is temporary stock placeholder,
being replaced with cleared official photography); a build-time image-optimisation pipeline is
planned to emit the committed web assets.
