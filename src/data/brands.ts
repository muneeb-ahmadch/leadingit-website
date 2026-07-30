export type BrandCategory = 'interfaces' | 'cinema';

export type Brand = {
  slug: string;
  name: string;
  wordmark: string; // simple text wordmark used in prototype (replace with SVG in build phase)
  tagline: string;
  category: BrandCategory;
  story: string;
  heroImage: string; // unsplash url for prototype
  accent: string; // brand-specific accent for hover micro-color
};

export const BRANDS: Brand[] = [
  {
    slug: 'crestron',
    name: 'Crestron',
    wordmark: 'CRESTRON',
    tagline: 'The standard of integrated control.',
    category: 'interfaces',
    story:
      'For four decades Crestron has defined the architecture of integrated control — from the residences of New York to the towers of the Gulf. We deliver Crestron across Pakistan and the UAE with full programming, design and lifecycle support.',
    heroImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80',
    accent: '#E03A3E',
  },
  {
    slug: 'blustream',
    name: 'Blustream',
    wordmark: 'BLUSTREAM',
    tagline: 'Pristine signal, anywhere in the home.',
    category: 'interfaces',
    story:
      'Blustream engineers HDMI distribution and matrix systems with broadcast-grade integrity. The invisible backbone of multi-room cinema and corporate AV.',
    heroImage:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=2000&q=80',
    accent: '#1FA3D6',
  },
  {
    slug: 'basalte',
    name: 'Basalte',
    wordmark: 'BASALTE',
    tagline: 'Design-led architectural interfaces, made in Belgium.',
    category: 'interfaces',
    story:
      'Basalte makes the switches, panels and audio speakers that disappear into architecture — and the moments where the building meets the hand. Anodized aluminium, sculpted glass, and an obsession with finish.',
    heroImage:
      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=2000&q=80',
    accent: '#C9A961',
  },
  {
    slug: 'black-nova',
    name: 'Black Nova',
    wordmark: 'BLACK NOVA',
    tagline: 'Smart Design keypads, made in Italy.',
    category: 'interfaces',
    story:
      'Black Nova is an Italian company based in Milan, and its Smart Design collections are made in Italy. The metal finishes — anodisation, galvanic bath plating, hand brushing — come from artisanal processes that are not fully industrialised, so no two pieces are identical. The keypads connect to a wide range of third-party systems over KNX, RS-485 and Cresnet.',
    heroImage: '/products/black-nova/alba-on.png',
    accent: '#E5DCC8',
  },
  {
    slug: 'marantz',
    name: 'Marantz',
    wordmark: 'MARANTZ',
    tagline: 'The sound of the music.',
    category: 'cinema',
    story:
      'Marantz has shaped the language of high-end audio for seven decades. Hand-tuned amplifiers and processors built by engineers who measure performance in feeling as much as in figures.',
    heroImage: '/brands/marantz.jpg',
    accent: '#D4AF37',
  },
  {
    slug: 'denon',
    name: 'Denon',
    wordmark: 'DENON',
    tagline: 'A century of precision audio.',
    category: 'cinema',
    story:
      'From the founding patents in 1910 to today\'s reference home cinema receivers, Denon delivers immersive performance trusted by studios, halls and the most demanding private rooms.',
    heroImage: '/brands/denon.jpg',
    accent: '#C9A961',
  },
  {
    slug: 'uandksound',
    // Official styling, evidenced across 54 pages of uandksound.com (2026-07-28):
    // the manufacturer writes `uandksound` lowercase in the logotype artwork,
    // every page title, the footer copyright and its oEmbed `provider_name`, and
    // `UandKSound` mixed-case in all About/product prose, on its own YouTube
    // channel and on its LinkedIn company page. "U&K Sound" — the value this
    // field held until now — appears NOWHERE in any first-party context.
    // Mixed-case is used for `name` because it is the form that anchors the two
    // strongest external entity nodes (YouTube, LinkedIn) that a knowledge graph
    // reconciles against, and because an all-lowercase <h1>/<title> reads as a
    // typo and gets re-cased by aggregators. It also spells "and" out, so it
    // cannot be misread as "UK Sound" — a United Kingdom implication would be
    // actively harmful for a Dubai/Pakistan distributor (docs/05 §3b).
    name: 'UandKSound',
    // The logo artwork is literally lowercase, so the wordmark breaks this
    // file's all-caps convention on purpose: official styling outranks it.
    wordmark: 'uandksound',
    // Their styling is title case with no full stop ("Awaken Your Senses").
    // The stop is retained because `brandMeta()` composes this field into prose
    // as a complete sentence; without it the meta description runs on.
    tagline: 'Awaken Your Senses.',
    category: 'cinema',
    // The opening clause used to read "Born in Europe and voiced alongside the
    // film industry's own sound engineers". Both halves were unsourced and the
    // first was false: the design studio was founded in Shenzhen in 2009 and
    // production remains China-based, expanding into Spain later
    // (https://www.uandksound.com/company/). Removed rather than rewritten —
    // replacing one unsourced origin story with another is the same mistake.
    // A sourced origin paragraph is Phase 3 content work (OQ #17). What remains
    // is product-level and verifiable from the manufacturer's own pages.
    story:
      'UandKSound builds high-end cinema and custom loudspeakers that dissolve into the architecture of a room. Horn-loaded Reference systems, Air Motion tweeters and hand-finished cabinets — supplied, installed and calibrated only through trained specialists, to awaken every sense.',
    heroImage: '/brands/uandksound-hero.jpg',
    accent: '#9C8B6E',
  },
  {
    slug: 'polk-audio',
    name: 'Polk Audio',
    wordmark: 'POLK AUDIO',
    tagline: 'American engineered. Cinema everywhere.',
    category: 'cinema',
    story:
      'Polk Audio has been engineering loudspeakers in Baltimore since 1972, with patented technologies that bring cinema scale into intimate rooms without compromise.',
    heroImage: '/brands/polk-audio-hero.jpg',
    accent: '#1B6FB8',
  },
  {
    slug: 'jvc',
    name: 'JVC',
    wordmark: 'JVC',
    tagline: 'Reference projection for private cinema.',
    category: 'cinema',
    story:
      'JVC projectors define the reference for home cinema — D-ILA imaging, native contrast that approaches the absolute, and a color palette engineered for film. The screen at the end of every well-designed cinema room.',
    heroImage:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80',
    accent: '#B11F23',
  },
];

export const BRAND_BY_SLUG = Object.fromEntries(BRANDS.map((b) => [b.slug, b]));
