/**
 * Honest, verified alt text for content imagery, replacing the blanket
 * `alt=""` that used to ship on every product render and gallery photo
 * (MAJOR-2, Phase 3 remediation). Two disciplines apply everywhere in this
 * file:
 *
 * 1. Product renders (`.png`/`.webp` cutouts, and Blustream's white-background
 *    `-tile.jpg` renders) are captioned `<Brand> <Model>` — that is honest
 *    because the render literally is that product.
 * 2. Sourced lifestyle photography is captioned with the caption drafted in
 *    `docs/12-PROVENANCE/image-url-map.md` from the manufacturer's own
 *    published context, copied verbatim — never re-described here. A frame we
 *    have not individually verified gets brand+model only, never an invented
 *    room/scene detail.
 */

/** Verbatim from docs/12-PROVENANCE/image-url-map.md ("Drafted alt text" column/rows). */
const DRAFTED_ALT: Record<string, string> = {
  '/products/marantz/lifestyle/cinema-50-credenza.jpg':
    'Marantz AV receiver in Silver-Gold on a dark ribbed-timber credenza in a minimal interior.',
  '/products/marantz/lifestyle/cinema-50-black-credenza.jpg':
    'Black Marantz Cinema 50 AV receiver on a ribbed-timber credenza, its display reading Blu-ray.',
  '/products/marantz/lifestyle/cinema-50-oak-sideboard.jpg':
    'Marantz AV receiver in Silver-Gold on an oak sideboard below a wall-mounted screen.',
  '/products/denon/lifestyle/avr-x3800h-scene.jpg':
    'Black Denon AVR-X3800H receiver in a walnut media console below a wall-mounted TV, with on-wall speakers and subwoofers in a living room.',
  '/products/denon/lifestyle/avr-x3800h-scene-angle.jpg':
    'Denon AVR-X3800H on an oak sideboard in a bright open-plan living room with in-ceiling speakers and folding glass doors.',
  '/products/denon/lifestyle/avr-x3800h-console-detail.jpg':
    'Close view of a Denon AVR-X3800H on an oak sideboard, its display reading IMAX DTS:X, below a wall-mounted TV.',
  '/products/polk-audio/lifestyle/reserve-home-theatre-insitu.jpg':
    'Two black Polk Reserve tower speakers and a Polk centre channel around a wall-mounted TV in a white family room.',
  '/products/polk-audio/lifestyle/reserve-r700-black-interior.jpg':
    'Black Polk Reserve tower speaker with its grille off, beside a raffia-fronted cabinet on a terrazzo floor.',
  '/products/polk-audio/lifestyle/reserve-r700-walnut-interior.jpg':
    'Polk Reserve tower speaker in walnut with grille fitted, against a taupe plaster wall beside a linen-fronted cabinet.',
  '/products/crestron/lifestyle/horizon-keypad-bedroom-brass.jpg':
    'Brushed-brass Crestron Horizon keypad with scene buttons, beside a softly lit bedroom at dusk.',
  '/products/crestron/lifestyle/horizon-keypad-kitchen-glass-black.jpg':
    'Black glass Crestron Horizon keypad on a mosaic-tiled wall in a bright kitchen, with lighting, climate and shade buttons.',
  '/products/crestron/lifestyle/horizon-keypad-white-backlit.jpg':
    'White Crestron Horizon keypad on a plaster wall, its scene and volume buttons backlit in magenta.',
  '/products/crestron/lifestyle/horizon-keypad-bathroom.jpg':
    'Crestron Horizon keypad in brushed black on a concrete wall, controlling temperature in a contemporary bathroom.',
  '/products/basalte/deseo-hero.jpg':
    'Basalte Deseo thermostat in bronze, flush-mounted on a walnut wall and showing 19.5 °C, lit by a shaft of daylight.',
};

/**
 * Confirmed decorative — inspected and no product is identifiable in frame
 * (docs/12-PROVENANCE/image-url-map.md Part 4, `auro-sfeer.jpg`). Never
 * caption these as if a product were shown.
 */
const DECORATIVE_ONLY = new Set<string>(['/products/basalte/auro-sfeer.jpg']);

/** Brand-hub hero images — the 4 drafted-alt lifestyle shots plus the other 5,
 * each personally viewed and captioned to what is actually in frame (no
 * invented specifics beyond what is visible). */
export const BRAND_HERO_ALT: Record<string, string> = {
  ...DRAFTED_ALT,
  '/products/blustream/dante-matrix.png': 'Blustream Dante audio matrix, product render.',
  '/products/black-nova/alba-on.png': 'Black Nova Alba keypad, illuminated.',
  '/products/jvc/dla-nz900.png': 'JVC DLA-NZ900 D-ILA projector, product render.',
  '/brands/marantz.jpg': 'Marantz stereo amplifier on a wooden sideboard in a warmly lit living room.',
  '/brands/denon.jpg': 'Stacked black Denon components beside a turntable and floor-standing speakers on a wooden cabinet.',
  '/brands/uandksound-hero.jpg': 'Private home cinema with tiered seating, a starlit ceiling and a large screen.',
  '/brands/polk-audio-hero.jpg': 'Polk Audio speaker and turntable on a wooden cabinet in a bright living room.',
};

const isRenderPath = (src: string) => /\.(png|webp)$/i.test(src) || /-tile\.jpg$/i.test(src);

/** Alt for a product hero/finish shot — always a render of the named product. */
export function productAlt(brandName: string, productName: string, finishName?: string): string {
  return finishName ? `${brandName} ${productName} in ${finishName}` : `${brandName} ${productName}`;
}

/**
 * Alt for a gallery/"in use" image: the manufacturer's own drafted caption
 * where we have individually verified one, `""` for confirmed-decorative
 * assets, otherwise brand+model — a render, or a lifestyle photo whose exact
 * scene we have not individually captioned, so we assert only what we know.
 */
export function inUseAlt(src: string, brandName: string, productName: string): string {
  if (DECORATIVE_ONLY.has(src)) return '';
  if (DRAFTED_ALT[src]) return DRAFTED_ALT[src];
  if (isRenderPath(src)) return `${brandName} ${productName}`;
  return `${brandName} ${productName} in use.`;
}
