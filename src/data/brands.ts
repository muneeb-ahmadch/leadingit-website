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
    slug: 'blacknova',
    name: 'Black Nova',
    wordmark: 'BLACK NOVA',
    tagline: 'Smart design keypads, made in Italy.',
    category: 'interfaces',
    story:
      'Black Nova is an Italian house in Milan crafting smart design keypads in metal and glass — a single tactile object that commands the entire room. Each collection is hand-finished through anodisation, galvanic bath plating and hand brushing, and engineered brand- and technology-agnostic for the projects where every detail is considered.',
    heroImage: '/products/blacknova/alba-on.png',
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
    name: 'U&K Sound',
    wordmark: 'U&K SOUND',
    tagline: 'Awaken your senses.',
    category: 'cinema',
    story:
      'Born in Europe and voiced alongside the film industry\'s own sound engineers, U&K Sound builds high-end cinema and custom loudspeakers that dissolve into the architecture of a room. Horn-loaded Reference systems, Air Motion tweeters and hand-finished cabinets — supplied, installed and calibrated only through trained specialists, to awaken every sense.',
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
