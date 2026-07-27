export type Finish = {
  id: string;
  name: string;
  swatch: string; // css color or gradient
  productImage: string; // unsplash url for prototype
};

export type SpecGroup = {
  label: string;
  rows: { name: string; value: string }[];
};

export type Product = {
  slug: string;
  brandSlug: string;
  name: string;
  collection: string;
  tagline: string;
  description: string;
  hero: string;
  finishes: Finish[];
  specs: SpecGroup[];
  inUse: string[]; // image URLs
  /** Optional category slug used to group large catalogs on the brand page. */
  category?: string;
  /** Concise <=155-char meta description for SEO; falls back to `description`. */
  metaDescription?: string;
  /** Target keywords for this product page. */
  keywords?: string[];
};

/** An ordered product category used to group a brand's catalog into sections. */
export type ProductCategory = { slug: string; label: string; blurb: string };

/**
 * Ordered category taxonomy per brand. When a brand appears here, its catalog is
 * rendered as labelled sections (in this order) on the brand page instead of one
 * flat grid — used for large catalogs like Crestron. Category slugs match the
 * `category` field on each Product.
 */
export const CATEGORIES_BY_BRAND: Record<string, ProductCategory[]> = {
  crestron: [
    { slug: 'keypads', label: 'Keypads & Interfaces', blurb: 'Horizon® and Cameo® keypads and faceplates — where the home meets the hand.' },
    { slug: 'touchscreens', label: 'Touch Screens & Scheduling', blurb: 'From five-inch wall screens to room-scheduling panels, finished edge to edge in glass.' },
    { slug: 'sensors', label: 'Sensors & Climate', blurb: 'Occupancy, daylight and thermostat control that lets the building respond on its own.' },
    { slug: 'control', label: 'Control Processors', blurb: 'The 4-Series™ engine at the core of every system — rack-mount, DIN-rail and Crestron Home® OS.' },
    { slug: 'audio', label: 'Audio Processing', blurb: 'Crestron Avia™ digital signal processors for whole-home and commercial sound.' },
    { slug: 'lighting', label: 'Lighting & Load Control', blurb: 'DIN-rail dimming, switching, motor and DALI / KNX modules that command architectural lighting.' },
    { slug: 'network', label: 'Network & Power', blurb: 'Cresnet® distribution, PoE bridges and DIN-rail power for a resilient control backbone.' },
  ],
};

// Shared lifestyle galleries + finish helpers reused across the electronics
// brands (prototype placeholders — swap for real lifestyle assets in build phase).
const mzInUse = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=80',
];
const mzBlack = (img: string): Finish => ({
  id: 'black',
  name: 'Black',
  swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
  productImage: img,
});
const mzSilverGold = (img: string): Finish => ({
  id: 'silver-gold',
  name: 'Silver-Gold',
  swatch: 'linear-gradient(135deg,#ece6d6,#c9a961)',
  productImage: img,
});
// Polk speaker cabinet finishes (official Black/White/Brown vinyl wraps).
const pkWhite = (img: string): Finish => ({
  id: 'white',
  name: 'White',
  swatch: 'linear-gradient(135deg,#f0ece3,#cfc9bc)',
  productImage: img,
});
const pkBrown = (img: string): Finish => ({
  id: 'brown',
  name: 'Brown',
  swatch: 'linear-gradient(135deg,#6b4f38,#3a2a1c)',
  productImage: img,
});

const dnInUse = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=80',
];
const jvInUse = [
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80',
];
const pkInUse = [
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=80',
];

// ─── U&K Sound helpers ──────────────────────────────────────────────────────
// Real cinema-room lifestyle photography + official product cutouts, downloaded
// from uandksound.com (never hotlinked). Series flagships anchor each card.
const uk = (name: string) => `/products/uandksound/${name}`;
const ukBlack = (img: string, name = 'Matte Black'): Finish => ({
  id: 'black',
  name,
  swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
  productImage: img,
});
// AMT (Air Motion Transformer) tweeter — figures from U&K Sound's own tweeter
// technology note; used across the Air-Motion series (M8, M6).
const AMT_TWEETER_SPEC: SpecGroup = {
  label: 'AMT Air Motion Tweeter',
  rows: [
    { name: 'Principle', value: 'Folded diaphragm, Air Motion Transformer' },
    { name: 'Radiation area', value: '8–13× a dome tweeter' },
    { name: 'Air velocity', value: '≈5× a dome tweeter' },
    { name: 'HF extension', value: 'Beyond 20 kHz (to 30–40 kHz)' },
    { name: 'Character', value: 'Low distortion, fast transients' },
  ],
};

// ─── Black Nova helpers ─────────────────────────────────────────────────────
// Official renders, layout SVGs and material swatches downloaded from
// blacknova.co (never hotlinked) into public/products/blacknova/. Finish and
// layout names were taken verbatim from each collection page's markup — no
// invented data. Black Nova is an Italian company based in Milan; its Smart
// Design keypads are hand-finished (anodisation, galvanic bath plating, hand
// brushing) with the natural variation of a handcrafted product.
const bn = (name: string) => `/products/blacknova/${name}`;

// ─── Crestron helpers ───────────────────────────────────────────────────────
// Product renders are official 2500px assets downloaded from crestron.com (never
// hotlinked) into public/products/crestron/. The inUse galleries below are warm
// luxury-interior / equipment-room placeholders (prototype only) — swap for real
// Crestron install photography in the build phase.
const cr = (name: string) => `/products/crestron/${name}`;
const crRack = [
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=80',
];
const crInterior = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=2000&q=80',
];
// Housing swatches shared across the Crestron catalog.
const crBlack = 'linear-gradient(135deg,#2a2a2a,#0a0a0a)';
const crGray = 'linear-gradient(135deg,#d8d8d4,#a9a9a3)';
const crWhite = 'linear-gradient(135deg,#f5f1e8,#d6d0c2)';

export const PRODUCTS: Product[] = [
  // ─── Crestron · Control Processors ─────────────────────────────────────────
  {
    slug: 'cp4',
    brandSlug: 'crestron',
    name: 'CP4',
    collection: '4-Series™ Rack-Mount Control System',
    tagline: 'A powerful 4-Series™ control engine for the connected home.',
    description:
      'The CP4 is a secure, high-performance control processor with a powerful 4-Series™ control engine. Designed to integrate and automate technology within any modern networked home, commercial building or government facility, it runs up to ten programs at once with numerous integrated control ports on board.',
    category: 'control',
    hero: cr('cp4.png'),
    finishes: [{ id: 'black', name: 'Black', swatch: crBlack, productImage: cr('cp4.png') }],
    specs: [
      { label: 'Control Engine', rows: [
        { name: 'Engine', value: 'Crestron® 4-Series™' },
        { name: 'Memory', value: '2 GB SDRAM · 8 GB flash' },
        { name: 'Programs', value: 'Up to 10 simultaneous' },
      ] },
      { label: 'Connections', rows: [
        { name: 'Relays', value: '8 (1 A, 30 VAC/VDC)' },
        { name: 'I/O ports', value: '8 Versiport digital/analog' },
        { name: 'IR / serial', value: '8 outputs · 3 COM ports' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: 'Gigabit, IPv4/IPv6, BACnet, SNMP v3' },
        { name: 'Cresnet®', value: 'Master mode, 1 A @ 24 VDC' },
        { name: 'Mounting', value: '1 RU rack or freestanding' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron CP4 4-Series™ rack-mount control processor. Distributed, programmed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron CP4', 'CP4 control processor', '4-Series control system', 'Crestron CP4 UAE', 'Crestron CP4 Pakistan'],
  },
  {
    slug: 'cp4-r',
    brandSlug: 'crestron',
    name: 'CP4-R',
    collection: '4-Series™ Processor for Crestron Home®',
    tagline: 'The rack-mount core of a Crestron Home® system.',
    description:
      'The CP4-R is a secure, high-performance, rack-mountable control processor with the embedded Crestron Home® operating system. Designed exclusively as the core of a Crestron Home system, its enhanced 4-Series™ multicore processing handles larger home automation, home theater, multiroom video and MDU applications.',
    category: 'control',
    hero: cr('cp4-r.png'),
    finishes: [{ id: 'black', name: 'Black', swatch: crBlack, productImage: cr('cp4-r.png') }],
    specs: [
      { label: 'Processing', rows: [
        { name: 'CPU', value: '4-Series™ multicore' },
        { name: 'Memory', value: '4 GB SDRAM · 8 GB flash' },
        { name: 'Platform', value: 'Crestron Home® OS' },
      ] },
      { label: 'Connections', rows: [
        { name: 'Relays', value: '8 (1 A, 30 VAC/VDC)' },
        { name: 'I/O ports', value: '8 Versiport digital/analog' },
        { name: 'IR / serial', value: '8 outputs · 3 COM ports' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: 'Gigabit' },
        { name: 'Cresnet®', value: 'Server mode' },
        { name: 'Mounting', value: '1 RU 19" rack' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron CP4-R rack-mount 4-Series™ processor with embedded Crestron Home® OS. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron CP4-R', 'Crestron Home processor', 'CP4-R UAE', 'CP4-R Pakistan', 'Crestron Home OS'],
  },
  {
    slug: 'din-ap4',
    brandSlug: 'crestron',
    name: 'DIN-AP4',
    collection: '4-Series™ DIN Rail Control System',
    tagline: 'The 4-Series™ engine, sized for the DIN rail.',
    description:
      'The DIN-AP4 provides a secure, high-performance control processor with a powerful 4-Series™ control engine and numerous integrated control ports, designed specifically for DIN rail mounting. It serves as the core processor for a complete DIN rail automation system, with Apple HomeKit, BACnet and XiO Cloud provisioning.',
    category: 'control',
    hero: cr('din-ap4.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-ap4.png') }],
    specs: [
      { label: 'Control Engine', rows: [
        { name: 'Engine', value: 'Crestron® 4-Series™' },
        { name: 'Memory', value: '1 GB DDR3 · 8 GB flash' },
        { name: 'Programs', value: 'Up to 10 simultaneous' },
      ] },
      { label: 'Connections', rows: [
        { name: 'I/O ports', value: '8 Versiport digital/analog' },
        { name: 'Relays', value: '4 isolated (1 A)' },
        { name: 'IR / COM', value: '4 IR · 2 COM ports' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: '100 Mbps, IPv4/IPv6, SSL/TLS' },
        { name: 'Power', value: '24 VDC or PoE (802.3at)' },
        { name: 'Mounting', value: '9-module DIN rail (EN 60715)' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron DIN-AP4 4-Series™ DIN-rail control system. Distributed, programmed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-AP4', 'DIN rail control system', '4-Series DIN', 'DIN-AP4 UAE', 'DIN-AP4 Pakistan'],
  },
  {
    slug: 'din-ap4-r',
    brandSlug: 'crestron',
    name: 'DIN-AP4-R',
    collection: 'DIN Rail System for Crestron Home®',
    tagline: 'A Crestron Home® core that lives on the DIN rail.',
    description:
      'The DIN-AP4-R is a secure, high-performance control system with a powerful 4-Series™ control engine, designed for DIN rail mounting and built to function as the core of a Crestron Home® system. Enhanced processing handles small to medium home automation, home theater, multiroom video and MDU applications.',
    category: 'control',
    hero: cr('din-ap4-r.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-ap4-r.png') }],
    specs: [
      { label: 'Platform', rows: [
        { name: 'OS', value: 'Crestron Home®' },
        { name: 'Engine', value: '4-Series™' },
        { name: 'Memory', value: '2 GB SDRAM · 8 GB flash' },
      ] },
      { label: 'Connections', rows: [
        { name: 'I/O ports', value: '8 Versiport digital/analog' },
        { name: 'Relays', value: '4 (1 A, 30 VAC/VDC)' },
        { name: 'IR / COM', value: '4 IR · 2 COM ports' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: 'Gigabit with PoE' },
        { name: 'Cresnet®', value: 'Server mode' },
        { name: 'Mounting', value: '9-module DIN rail' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron DIN-AP4-R DIN-rail 4-Series™ system with Crestron Home® OS. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-AP4-R', 'Crestron Home DIN rail', 'DIN-AP4-R UAE', 'DIN-AP4-R Pakistan'],
  },

  // ─── Crestron · Lighting & Load Control ────────────────────────────────────
  {
    slug: 'din-1dim4',
    brandSlug: 'crestron',
    name: 'DIN-1DIM4',
    collection: '4-Channel Dimmer · DIN Rail',
    tagline: 'Four channels of dimming from a single feed.',
    description:
      'The DIN-1DIM4 is a DIN rail mounted lighting control module with four channels of dimming. A single model supports both 120 V and 220–277 V electronic and magnetic low-voltage, incandescent, neon/cold-cathode, 2-wire dimmable fluorescent and non-dimmable loads up to 5 A per channel, 10 A total.',
    category: 'lighting',
    hero: cr('din-1dim4.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-1dim4.png') }],
    specs: [
      { label: 'Dimming', rows: [
        { name: 'Channels', value: '4 · 1 feed' },
        { name: 'Per channel', value: '5 A (600 W @ 120 V)' },
        { name: 'Module total', value: '10 A' },
      ] },
      { label: 'Load Types', rows: [
        { name: 'Supported', value: 'ELV, MLV, incandescent, 2-wire fluorescent' },
        { name: 'Line power', value: '120–277 VAC, 50/60 Hz' },
        { name: 'Control', value: 'Cresnet® + override input' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '12 modules (35 mm EN 60715)' },
        { name: 'Setup', value: 'Front-panel controls' },
        { name: 'Weight', value: '2.43 lb' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron DIN-1DIM4 4-channel DIN-rail dimmer for architectural lighting. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-1DIM4', 'DIN rail dimmer', '4-channel dimmer', 'DIN-1DIM4 UAE', 'DIN-1DIM4 Pakistan'],
  },
  {
    slug: 'din-1dimu4',
    brandSlug: 'crestron',
    name: 'DIN-1DIMU4',
    collection: '4-Channel Universal Dimmer · DIN Rail',
    tagline: 'Forward and reverse phase, all in one module.',
    description:
      'The DIN-1DIMU4 is a 4-channel universal lighting control module engineered to dim both forward and reverse phase loads. A single model accommodates 120 V and 220–240 V electronic and magnetic low-voltage, incandescent, neon/cold-cathode, 2-wire dimmable fluorescent and non-dimmable loads up to 5 A per channel, 10 A total.',
    category: 'lighting',
    hero: cr('din-1dimu4.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-1dimu4.png') }],
    specs: [
      { label: 'Dimming', rows: [
        { name: 'Channels', value: '4 universal · 1 feed' },
        { name: 'Phase', value: 'Forward & reverse' },
        { name: 'Per channel', value: '5 A (600 W @ 120 V)' },
      ] },
      { label: 'Load Types', rows: [
        { name: 'Supported', value: 'ELV, MLV, incandescent, fluorescent, non-dim' },
        { name: 'Line power', value: '120–240 VAC, 50/60 Hz' },
        { name: 'Module total', value: '10 A' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '12 modules (216 mm)' },
        { name: 'Comms', value: 'Cresnet® secondary mode' },
        { name: 'Weight', value: '2.23 lb' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron DIN-1DIMU4 4-channel universal DIN-rail dimmer, forward & reverse phase. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-1DIMU4', 'universal dimmer', 'forward reverse phase dimmer', 'DIN-1DIMU4 UAE', 'DIN-1DIMU4 Pakistan'],
  },
  {
    slug: 'din-2mc2',
    brandSlug: 'crestron',
    name: 'DIN-2MC2',
    collection: '2-Channel Motor Control · DIN Rail',
    tagline: 'Drapes, shades and screens under precise command.',
    description:
      'The DIN-2MC2 is a 2-channel motor control module for bidirectional motors driving drapes, shades, projection screens, lifts, skylights and gates. Each channel supports up/down or open/close control of a conventional three-wire bidirectional motor up to 1/2 HP at voltages up to 240 volts.',
    category: 'lighting',
    hero: cr('din-2mc2.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-2mc2.png') }],
    specs: [
      { label: 'Motor Control', rows: [
        { name: 'Channels', value: '2 bidirectional' },
        { name: 'Per channel', value: '0.5 HP @ 240 VAC' },
        { name: 'Loads', value: 'Drapes, shades, screens, gates' },
      ] },
      { label: 'Connections', rows: [
        { name: 'Motor', value: '3-wire, 12 AWG max' },
        { name: 'Cresnet®', value: '2× 4-pin terminal blocks' },
        { name: 'Override', value: '2× 2-pin inputs' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '6 modules (108 mm)' },
        { name: 'Power', value: '3 W Cresnet® (24 VDC)' },
        { name: 'Weight', value: '210 g' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron DIN-2MC2 2-channel DIN-rail motor control for shades, drapes and screens. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-2MC2', 'motor control module', 'shade control', 'DIN-2MC2 UAE', 'DIN-2MC2 Pakistan'],
  },
  {
    slug: 'din-8sw8-i',
    brandSlug: 'crestron',
    name: 'DIN-8SW8-I',
    collection: '8-Channel High-Voltage Switch · DIN Rail',
    tagline: 'Eight switched channels with isolated inputs.',
    description:
      'The DIN-8SW8-I is an 8-channel lighting control module for non-dimmable lighting and fan switching. Eight isolated digital inputs let standard momentary switches trigger events with or without a control system. A single model supports 120 V and 220–240 V, handling incandescent loads up to 10 A, fluorescent up to 5 A and 1/2 HP motor loads per channel.',
    category: 'lighting',
    hero: cr('din-8sw8-i.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-8sw8-i.png') }],
    specs: [
      { label: 'Switching', rows: [
        { name: 'Channels', value: '8' },
        { name: 'Per channel', value: '10 A incandescent · 5 A fluorescent' },
        { name: 'Motor', value: '0.5 HP @ 120–240 VAC' },
      ] },
      { label: 'Inputs', rows: [
        { name: 'Digital inputs', value: '8 isolated' },
        { name: 'Trigger', value: 'Momentary switches, with or without processor' },
        { name: 'Comms', value: 'Cresnet® secondary mode' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '9 modules (162 mm)' },
        { name: 'Power', value: '5.4 W Cresnet®' },
        { name: 'Temperature', value: '0–40 °C' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron DIN-8SW8-I 8-channel DIN-rail high-voltage switch with isolated inputs. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-8SW8-I', 'DIN rail switch', 'high voltage switch module', 'DIN-8SW8-I UAE', 'DIN-8SW8-I Pakistan'],
  },
  {
    slug: 'din-dli',
    brandSlug: 'crestron',
    name: 'DIN-DLI',
    collection: 'DALI® Interface · DIN Rail',
    tagline: 'A DALI-2™ certified bridge to a full DALI loop.',
    description:
      'The DIN-DLI is a DALI-2™ certified DALI® interface for Crestron control systems, controlling one DALI loop of up to 64 devices. Housed in a compact 3M DIN-rail enclosure, it drives DT0–DT8 Tc DALI devices over Cresnet® or Ethernet with PoE, and commissions devices through an intuitive web user interface.',
    category: 'lighting',
    hero: cr('din-dli.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-dli.png') }],
    specs: [
      { label: 'DALI®', rows: [
        { name: 'Loops', value: '1 · up to 64 devices' },
        { name: 'Certification', value: 'DALI-2™ certified' },
        { name: 'Device types', value: 'DT0–DT8 Tc' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Control', value: 'Cresnet® or Ethernet PoE' },
        { name: 'Commissioning', value: 'Web user interface' },
        { name: 'PoE', value: '802.3af Class 2' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '3-module enclosure' },
        { name: 'Temperature', value: '0–50 °C' },
        { name: 'Weight', value: '113 g' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron DIN-DLI DALI-2™ certified DIN-rail DALI interface. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-DLI', 'DALI interface', 'DALI-2 gateway', 'DIN-DLI UAE', 'DIN-DLI Pakistan'],
  },
  {
    slug: 'din-kxi',
    brandSlug: 'crestron',
    name: 'DIN-KXI',
    collection: 'KNX Secure IP Gateway · DIN Rail',
    tagline: 'The 4-Series™ system, fluent in KNX.',
    description:
      'The DIN-KXI is an IP-based KNX interface that lets a 4-Series™ control system communicate with a KNX system. It addresses and controls up to 1,000 datapoints, receives power over the KNX bus, and doubles as a programming interface for KNX devices using ETS5 or ETS6 software.',
    category: 'lighting',
    hero: cr('din-kxi.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-kxi.png') }],
    specs: [
      { label: 'KNX', rows: [
        { name: 'Datapoints', value: 'Up to 1,000' },
        { name: 'Protocol', value: 'KNX over TP, cEMI, System B' },
        { name: 'Security', value: 'KNXnet/IP Secure (AES-128)' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Host', value: '4-Series™ control system' },
        { name: 'Tools', value: 'ETS5 / ETS6 programming interface' },
        { name: 'Power', value: 'KNX bus (20 mA)' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '1 module (18 mm)' },
        { name: 'LAN', value: 'RJ-45 100BASE-TX' },
        { name: 'Weight', value: '40 g' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron DIN-KXI KNX Secure IP gateway for 4-Series™ systems, DIN-rail mount. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-KXI', 'KNX IP gateway', 'KNX Secure', 'DIN-KXI UAE', 'DIN-KXI Pakistan'],
  },

  // ─── Crestron · Network & Power ────────────────────────────────────────────
  {
    slug: 'din-cencn-2-poe',
    brandSlug: 'crestron',
    name: 'DIN-CENCN-2-POE',
    collection: 'Ethernet-to-Cresnet® Bridge with PoE',
    tagline: 'Cresnet® reliability, carried over high-speed Ethernet.',
    description:
      'The DIN-CENCN-2-POE works with a Crestron® control system to maximise Cresnet® network reliability and performance. It carries Cresnet data over high-speed Ethernet and provides two isolated Cresnet subnets, built-in network diagnostics and versatile power management with PoE.',
    category: 'network',
    hero: cr('din-cencn-2-poe.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-cencn-2-poe.png') }],
    specs: [
      { label: 'Bridge', rows: [
        { name: 'Function', value: 'Ethernet ↔ Cresnet®' },
        { name: 'Subnets', value: '2 isolated Cresnet® subnets' },
        { name: 'Devices', value: 'Up to 20 per subnet' },
      ] },
      { label: 'Power', rows: [
        { name: 'Input', value: 'PoE / PoE+ or 24 VDC' },
        { name: 'Cresnet® power', value: '10 W PoE · 20 W PoE+ · 75 W external' },
        { name: 'Diagnostics', value: 'Built-in network diagnostics' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '9 modules (162 mm)' },
        { name: 'Ethernet', value: '100 Mbps' },
        { name: 'Temperature', value: '0–40 °C' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron DIN-CENCN-2-POE Ethernet-to-Cresnet® bridge with PoE and dual subnets. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-CENCN-2-POE', 'Cresnet bridge', 'Ethernet Cresnet', 'DIN-CENCN UAE', 'DIN-CENCN Pakistan'],
  },
  {
    slug: 'din-hub',
    brandSlug: 'crestron',
    name: 'DIN-HUB',
    collection: 'Cresnet® Distribution Hub · DIN Rail',
    tagline: 'The backbone of a large Cresnet® network.',
    description:
      'The DIN-HUB is a DIN rail-mounted Cresnet® hub designed to simplify the configuration of large Cresnet networks. DIN rail mounting enables modular installation alongside Crestron DIN Rail lighting and automation control modules and other third-party DIN rail devices.',
    category: 'network',
    hero: cr('din-hub.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-hub.png') }],
    specs: [
      { label: 'Cresnet®', rows: [
        { name: 'Segments', value: '3-segment hub' },
        { name: 'Devices', value: '~80 (up to 252 with multiple hubs)' },
        { name: 'Purpose', value: 'Large Cresnet® network configuration' },
      ] },
      { label: 'Power', rows: [
        { name: 'Distribution', value: '24 VDC · 75 W max per segment' },
        { name: 'Consumption', value: '0.6 W' },
        { name: 'Temperature', value: '0–40 °C' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '6 modules (35 mm EN 60715)' },
        { name: 'Weight', value: '169 g' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron DIN-HUB DIN-rail Cresnet® distribution hub for large networks. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-HUB', 'Cresnet hub', 'Cresnet distribution', 'DIN-HUB UAE', 'DIN-HUB Pakistan'],
  },
  {
    slug: 'din-pws60',
    brandSlug: 'crestron',
    name: 'DIN-PWS60',
    collection: '60 W Cresnet® Power Supply · DIN Rail',
    tagline: 'Clean, front-wired power for the Cresnet® bus.',
    description:
      'The DIN-PWS60 is a 60 watt Cresnet® power supply that snaps onto a standard DIN rail for wall-mount enclosures. All wiring connects through screw terminals along the top and bottom, clearly accessible from the front, with six Cresnet power ports provided.',
    category: 'network',
    hero: cr('din-pws60.png'),
    finishes: [{ id: 'light-gray', name: 'Light Gray', swatch: crGray, productImage: cr('din-pws60.png') }],
    specs: [
      { label: 'Output', rows: [
        { name: 'Power', value: '60 W (2.5 A @ 24 VDC)' },
        { name: 'Ports', value: '6 Cresnet® NET ports' },
        { name: 'Efficiency', value: '85%' },
      ] },
      { label: 'Input', rows: [
        { name: 'Line power', value: '100–277 VAC, 50/60 Hz' },
        { name: 'Consumption', value: '70 W at full output' },
        { name: 'Ripple / noise', value: '< 1%' },
      ] },
      { label: 'Mounting', rows: [
        { name: 'DIN rail', value: '6 modules (35 mm EN 60715)' },
        { name: 'Wiring', value: 'Front-accessible screw terminals' },
        { name: 'Weight', value: '170 g' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron DIN-PWS60 60 W DIN-rail Cresnet® power supply. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DIN-PWS60', 'Cresnet power supply', 'DIN rail power', 'DIN-PWS60 UAE', 'DIN-PWS60 Pakistan'],
  },

  // ─── Crestron · Audio Processing ───────────────────────────────────────────
  {
    slug: 'dsp-1280',
    brandSlug: 'crestron',
    name: 'DSP-1280',
    collection: 'Crestron Avia™ 12×8 DSP',
    tagline: 'A revolutionary platform for exceptional sound.',
    description:
      'The Crestron® Avia™ family of digital signal processors leverages the highest-quality components and the expertise of veteran audio engineers to deliver a platform that is easy to integrate and configure. The DSP-1280 offers twelve mic/line inputs and eight balanced outputs, with an intuitive graphical workspace conceived to inspire exceptional results quickly.',
    category: 'audio',
    hero: cr('dsp-1280.png'),
    finishes: [{ id: 'black', name: 'Black', swatch: crBlack, productImage: cr('dsp-1280.png') }],
    specs: [
      { label: 'Audio', rows: [
        { name: 'Inputs', value: '12 mic/line (66 dB gain)' },
        { name: 'Outputs', value: '8 balanced (+24 dBu)' },
        { name: 'Conversion', value: '24-bit / 48 kHz' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '20 Hz–20 kHz ±0.5 dB' },
        { name: 'Latency', value: '3.0 ms' },
        { name: 'Ethernet', value: 'Gigabit' },
      ] },
      { label: 'Platform', rows: [
        { name: 'Software', value: 'Avia Audio Tool' },
        { name: 'Integration', value: 'Native Crestron control' },
        { name: 'Mounting', value: '1 RU 19" rack' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron Avia™ DSP-1280 12×8 digital signal processor. Distributed, configured and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DSP-1280', 'Crestron Avia DSP', 'digital signal processor', 'DSP-1280 UAE', 'DSP-1280 Pakistan'],
  },
  {
    slug: 'dsp-1281',
    brandSlug: 'crestron',
    name: 'DSP-1281',
    collection: 'Crestron Avia™ 12×8 DSP with Dante®',
    tagline: 'Avia™ processing, networked over Dante®.',
    description:
      'The DSP-1281 brings the Crestron® Avia™ processing platform to networked audio, pairing twelve mic/line inputs and eight balanced outputs with a 32×32 Dante® audio network interface. Veteran audio engineering and an intuitive graphical workspace make sophisticated sound systems fast to design and deploy.',
    category: 'audio',
    hero: cr('dsp-1281.png'),
    finishes: [{ id: 'black', name: 'Black', swatch: crBlack, productImage: cr('dsp-1281.png') }],
    specs: [
      { label: 'Audio', rows: [
        { name: 'Inputs', value: '12 mic/line' },
        { name: 'Outputs', value: '8 balanced' },
        { name: 'Network', value: '32×32 Dante®' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '20 Hz–20 kHz ±0.5 dB' },
        { name: 'THD', value: '0.001%' },
        { name: 'Dynamic range', value: '110 dB' },
      ] },
      { label: 'Platform', rows: [
        { name: 'Dante®', value: 'Primary/secondary Gigabit' },
        { name: 'Software', value: 'Avia Audio Tool' },
        { name: 'Mounting', value: '1 RU 19" rack' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron Avia™ DSP-1281 12×8 DSP with 32×32 Dante® networking. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DSP-1281', 'Avia DSP Dante', 'Dante audio processor', 'DSP-1281 UAE', 'DSP-1281 Pakistan'],
  },
  {
    slug: 'dsp-860',
    brandSlug: 'crestron',
    name: 'DSP-860',
    collection: 'Crestron Avia™ 8×6 DSP',
    tagline: 'Reference processing for intimate rooms.',
    description:
      'The DSP-860 delivers Crestron® Avia™ processing, mixing and routing for all audio signal types with comprehensive controls over each signal. Native Crestron integration substantially reduces programming, exporting components as Smart Graphics files with ready-to-use touch screen controls and meters.',
    category: 'audio',
    hero: cr('dsp-860.png'),
    finishes: [{ id: 'black', name: 'Black', swatch: crBlack, productImage: cr('dsp-860.png') }],
    specs: [
      { label: 'Audio', rows: [
        { name: 'Inputs', value: '8 mic/line (+48 V phantom)' },
        { name: 'Outputs', value: '6 balanced (+24 dBu)' },
        { name: 'Conversion', value: '24-bit / 48 kHz' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '20 Hz–20 kHz ±0.5 dB' },
        { name: 'THD', value: '0.001%' },
        { name: 'Dynamic range', value: '110 dB' },
      ] },
      { label: 'Platform', rows: [
        { name: 'Software', value: 'Avia Audio Tool' },
        { name: 'Integration', value: 'Native Crestron control' },
        { name: 'Mounting', value: '1 RU 19" rack' },
      ] },
    ],
    inUse: crRack,
    metaDescription:
      'Crestron Avia™ DSP-860 8×6 digital signal processor. Distributed, configured and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron DSP-860', 'Avia 8x6 DSP', 'digital signal processor', 'DSP-860 UAE', 'DSP-860 Pakistan'],
  },

  // ─── Crestron · Sensors & Climate ──────────────────────────────────────────
  {
    slug: 'gls-oirlcl-c-cn',
    brandSlug: 'crestron',
    name: 'GLS-OIRLCL-C-CN',
    collection: 'Occupancy & Daylight Sensor · Cresnet®',
    tagline: 'A nearly invisible eye for light and presence.',
    description:
      'This ceiling-mount sensor delivers occupancy or vacancy detection paired with an integrated closed-loop photosensor for Crestron systems, enabling automation of lighting, HVAC and more by room occupancy and ambient light. Its miniaturised flush design nearly disappears into the ceiling, with daylight harvesting and XiO Cloud room-usage monitoring.',
    category: 'sensors',
    hero: cr('gls-oirlcl.png'),
    finishes: [{ id: 'white', name: 'White', swatch: crWhite, productImage: cr('gls-oirlcl.png') }],
    specs: [
      { label: 'Detection', rows: [
        { name: 'Technology', value: 'Passive infrared, 64 zones' },
        { name: 'Coverage', value: '450 sq ft · 360° hemispherical' },
        { name: 'Ceiling height', value: 'Up to 16.4 ft' },
      ] },
      { label: 'Daylight', rows: [
        { name: 'Photosensor', value: 'Integrated closed-loop' },
        { name: 'Range', value: '0–1000 lux' },
        { name: 'Modes', value: 'Occupancy / vacancy, walk-through' },
      ] },
      { label: 'Install', rows: [
        { name: 'Mount', value: '1 in. flush ceiling cut-out' },
        { name: 'Power', value: 'Cresnet® (1 W)' },
        { name: 'Rating', value: 'IP64' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron GLS-OIRLCL-C-CN ceiling occupancy & daylight sensor on Cresnet®. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron GLS-OIRLCL-C-CN', 'occupancy sensor', 'daylight sensor', 'GLS-OIRLCL UAE', 'GLS-OIRLCL Pakistan'],
  },
  {
    slug: 'hz-thstat',
    brandSlug: 'crestron',
    name: 'HZ-THSTAT',
    collection: 'Horizon® Wireless Thermostat',
    tagline: 'Climate control, finished to match the room.',
    description:
      'The HZ-THSTAT is a wall-mounted heating and cooling thermostat with integrated humidistat, capable of controlling two-stage heat/cool and heat-pump systems, 2- and 4-pipe FCU systems, floor warming and humidity systems. A 3.5 in. LCD touch screen and integrated sensors keep the display crisp across lighting conditions, with Wi-Fi integration into Crestron automation.',
    category: 'sensors',
    hero: cr('hz-thstat.png'),
    finishes: [
      { id: 'black', name: 'Black', swatch: crBlack, productImage: cr('hz-thstat.png') },
      { id: 'white', name: 'White', swatch: crWhite, productImage: cr('hz-thstat-white.png') },
      { id: 'almond', name: 'Almond', swatch: 'linear-gradient(135deg,#e8dcc4,#c4b393)', productImage: cr('hz-thstat-almond.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Screen', value: '3.5" transflective LCD touch' },
        { name: 'Resolution', value: '320 × 480' },
        { name: 'Buttons', value: 'RGB backlit' },
      ] },
      { label: 'Climate', rows: [
        { name: 'Systems', value: '2-stage heat/cool, heat pump, FCU, floor' },
        { name: 'Humidity', value: 'Integrated humidistat' },
        { name: 'Sensors', value: 'Up to 4 remote temp / 2 temp-humidity' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Connectivity', value: 'Wi-Fi 2.4 GHz' },
        { name: 'Config', value: 'Crestron Toolbox™' },
        { name: 'Mounting', value: '1-gang or surface' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron HZ-THSTAT Horizon® wireless thermostat with humidistat and 3.5" touch screen. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron HZ-THSTAT', 'Horizon thermostat', 'Crestron thermostat', 'HZ-THSTAT UAE', 'HZ-THSTAT Pakistan'],
  },

  // ─── Crestron · Keypads & Interfaces ───────────────────────────────────────
  {
    slug: 'hz2-kpcn',
    brandSlug: 'crestron',
    name: 'HZ2-KPCN',
    collection: 'Horizon® 2 Keypad · Cresnet®',
    tagline: 'Where the home meets the hand.',
    description:
      'The HZ2-KPCN Horizon® 2 keypad provides Cresnet® network control of lighting, shading, audio and other amenities. Its design matches the entire line of Horizon dimmers, switches and keypads, and it is available with default or custom engraving, RGB LED feedback, and a range of textured, glass and metal finishes.',
    category: 'keypads',
    hero: cr('hz2-kpcn-glass-black.png'),
    finishes: [
      { id: 'glass-black', name: 'Black Glass', swatch: 'linear-gradient(135deg,#1c1c1e,#050505)', productImage: cr('hz2-kpcn-glass-black.png') },
      { id: 'glass-white', name: 'White Glass', swatch: 'linear-gradient(135deg,#f2efe9,#cdc8bd)', productImage: cr('hz2-kpcn-glass-white.png') },
      { id: 'brushed-black', name: 'Brushed Black', swatch: 'linear-gradient(135deg,#3a3a3c,#131313)', productImage: cr('hz2-kpcn-brushed-black.png') },
      { id: 'brushed-brass', name: 'Brushed Brass', swatch: 'linear-gradient(135deg,#d8c088,#9a7d47)', productImage: cr('hz2-kpcn-brushed-brass.png') },
      { id: 'dark-bronze', name: 'Dark Bronze', swatch: 'linear-gradient(135deg,#7d6b4f,#3a3226)', productImage: cr('hz2-kpcn-dark-bronze.png') },
      { id: 'dark-nickel', name: 'Dark Nickel', swatch: 'linear-gradient(135deg,#6b6a66,#2e2d2b)', productImage: cr('hz2-kpcn-dark-nickel.png') },
      { id: 'black', name: 'Textured Black', swatch: crBlack, productImage: cr('hz2-kpcn-black.png') },
      { id: 'white', name: 'Textured White', swatch: crWhite, productImage: cr('hz2-kpcn-white.png') },
      { id: 'almond', name: 'Textured Almond', swatch: 'linear-gradient(135deg,#e8dcc4,#c4b393)', productImage: cr('hz2-kpcn-almond.png') },
    ],
    specs: [
      { label: 'Control', rows: [
        { name: 'Buttons', value: 'Up to 5 (Style 1) · custom engraving' },
        { name: 'Feedback', value: 'RGB LED backlight, alternate themes' },
        { name: 'Comms', value: 'Cresnet® client mode' },
      ] },
      { label: 'Design', rows: [
        { name: 'Family', value: 'Matches Horizon® dimmers & switches' },
        { name: 'Finishes', value: 'Textured, glass & metal options' },
        { name: 'Mounting', value: '1-gang' },
      ] },
      { label: 'Power', rows: [
        { name: 'Usage', value: '2 W (83 mA @ 24 VDC)' },
        { name: 'Temperature', value: '0–30 °C' },
        { name: 'Weight', value: '135 g' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron HZ2-KPCN Horizon® 2 keypad on Cresnet®, in textured, glass and metal finishes. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron HZ2-KPCN', 'Horizon 2 keypad', 'Crestron keypad', 'HZ2-KPCN UAE', 'HZ2-KPCN Pakistan', 'luxury keypad Dubai'],
  },
  {
    slug: 'hz2-faceplate',
    brandSlug: 'crestron',
    name: 'HZ2-FP-G1',
    collection: 'Horizon® 2 Faceplate · 1-Gang',
    tagline: 'The finishing frame for every Horizon® device.',
    description:
      'Horizon® 2 faceplates are an essential component of every Horizon 2 installation, giving each device a finished appearance with customisable design elements. Available in textured (white, black, almond), glass (white, black) and metal finishes (brushed black, brushed brass, dark bronze, dark nickel), the trim is matched to the faceplate throughout.',
    category: 'keypads',
    hero: cr('hz2-fp-glass-black.png'),
    finishes: [
      { id: 'glass-black', name: 'Black Glass', swatch: 'linear-gradient(135deg,#1c1c1e,#050505)', productImage: cr('hz2-fp-glass-black.png') },
      { id: 'glass-white', name: 'White Glass', swatch: 'linear-gradient(135deg,#f2efe9,#cdc8bd)', productImage: cr('hz2-fp-glass-white.png') },
      { id: 'brushed-black', name: 'Brushed Black', swatch: 'linear-gradient(135deg,#3a3a3c,#131313)', productImage: cr('hz2-fp-brushed-black.png') },
      { id: 'brushed-brass', name: 'Brushed Brass', swatch: 'linear-gradient(135deg,#d8c088,#9a7d47)', productImage: cr('hz2-fp-brushed-brass.png') },
      { id: 'dark-bronze', name: 'Dark Bronze', swatch: 'linear-gradient(135deg,#7d6b4f,#3a3226)', productImage: cr('hz2-fp-dark-bronze.png') },
      { id: 'dark-nickel', name: 'Dark Nickel', swatch: 'linear-gradient(135deg,#6b6a66,#2e2d2b)', productImage: cr('hz2-fp-dark-nickel.png') },
      { id: 'black', name: 'Textured Black', swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)', productImage: cr('hz2-fp-black.png') },
      { id: 'white', name: 'Textured White', swatch: 'linear-gradient(135deg,#f5f1e8,#d6d0c2)', productImage: cr('hz2-fp-white.png') },
      { id: 'almond', name: 'Textured Almond', swatch: 'linear-gradient(135deg,#e8dcc4,#c4b393)', productImage: cr('hz2-fp-almond.png') },
    ],
    specs: [
      { label: 'Design', rows: [
        { name: 'Gang', value: '1-gang' },
        { name: 'Materials', value: 'Textured, glass & metal' },
        { name: 'Trim', value: 'Faceplate trim matches finish' },
      ] },
      { label: 'Fit', rows: [
        { name: 'Compatibility', value: 'All Horizon® 2 devices' },
        { name: 'Backplate', value: 'Metal backplate included' },
        { name: 'Mounting', value: 'US box or low-voltage bracket' },
      ] },
      { label: 'Dimensions', rows: [
        { name: 'Height', value: '4.73 in. (120 mm)' },
        { name: 'Width', value: '3.07 in. (78 mm)' },
        { name: 'Depth', value: '0.46 in. (12 mm)' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron HZ2-FP-G1 Horizon® 2 1-gang faceplate in glass and metal finishes. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron HZ2-FP-G1', 'Horizon 2 faceplate', 'Crestron faceplate', 'HZ2-FP UAE', 'HZ2-FP Pakistan'],
  },
  {
    slug: 'c2ni-cameo',
    brandSlug: 'crestron',
    name: 'C2NI-CB',
    collection: 'Cameo® Keypad · International',
    tagline: 'A customisable keypad for the European wall box.',
    description:
      'The Crestron® Cameo® International keypad offers an attractive, customisable wall-mount keypad for controlling lighting, shades, AV and other functions in residential or commercial spaces. It installs in a single-gang European or UK electrical box, in a choice of almond, black or white textured finishes, integrating through a wired Cresnet® connection.',
    category: 'keypads',
    hero: cr('c2ni-cb-black.png'),
    finishes: [{ id: 'black', name: 'Textured Black', swatch: crBlack, productImage: cr('c2ni-cb-black.png') }],
    specs: [
      { label: 'Control', rows: [
        { name: 'Layout', value: '2 columns, configurable strips' },
        { name: 'Feedback', value: '12 white LEDs, auto-brightness' },
        { name: 'Inputs', value: '2 dry-contact' },
      ] },
      { label: 'Design', rows: [
        { name: 'Finishes', value: 'Textured almond, black, white' },
        { name: 'Comms', value: 'Cresnet® secondary mode' },
        { name: 'Mounting', value: '1-gang EU / UK box' },
      ] },
      { label: 'Power', rows: [
        { name: 'Usage', value: '0.5 W (24 VDC)' },
        { name: 'Temperature', value: '0–45 °C' },
        { name: 'Weight', value: '149 g' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron C2NI-CB Cameo® international keypad for EU/UK boxes, textured finishes. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron C2NI-CB', 'Cameo keypad', 'Crestron international keypad', 'C2NI-CB UAE', 'C2NI-CB Pakistan'],
  },

  // ─── Crestron · Touch Screens & Scheduling ─────────────────────────────────
  {
    slug: 'tsw-1080',
    brandSlug: 'crestron',
    name: 'TSW-1080',
    collection: '10.1" Wall Mount Touch Screen',
    tagline: 'A ten-inch canvas for the whole home.',
    description:
      'The TSW-1080 wall mount touch screen serves residential and enterprise applications with a 10.1-inch capacitive display, programmable virtual controls and HTML5 support. PoE and Wi-Fi connectivity, proximity sensing, auto-brightness and real-time status make it the interface for boardrooms, homes and command centres.',
    category: 'touchscreens',
    hero: cr('tsw-1080.png'),
    finishes: [
      { id: 'black', name: 'Black', swatch: crBlack, productImage: cr('tsw-1080.png') },
      { id: 'white', name: 'White', swatch: crWhite, productImage: cr('tsw-1080-white.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Size', value: '10.1" diagonal' },
        { name: 'Resolution', value: '1920 × 1200 WUXGA' },
        { name: 'Touch', value: 'Projected capacitive, 5-point' },
      ] },
      { label: 'Audio & Voice', rows: [
        { name: 'Audio', value: 'Built-in mic & speakers' },
        { name: 'Intercom', value: 'Rava® SIP' },
        { name: 'Video', value: 'H.265 / H.264 / MJPEG' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: 'Gigabit with PoE+' },
        { name: 'Wi-Fi', value: '802.11ax (Wi-Fi 6E)' },
        { name: 'Memory', value: '8 GB RAM · 40 GB storage' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron TSW-1080 10.1" wall mount touch screen with PoE+, Wi-Fi 6E and Rava® SIP. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron TSW-1080', '10 inch touch screen', 'Crestron touch panel', 'TSW-1080 UAE', 'TSW-1080 Pakistan'],
  },
  {
    slug: 'tsw-880',
    brandSlug: 'crestron',
    name: 'TSW-880',
    collection: '8.1" Wall Mount Touch Screen',
    tagline: 'Eight inches of glass, edge to edge.',
    description:
      'The TSW-880 wall mount touch screen serves residential and enterprise applications with an 8.1-inch capacitive display, custom programmable buttons and HTML5 UI support. PoE and Wi-Fi connectivity, proximity-sensing wake and automatic brightness deliver an intuitive interface in any light.',
    category: 'touchscreens',
    hero: cr('tsw-880.png'),
    finishes: [
      { id: 'black', name: 'Black', swatch: crBlack, productImage: cr('tsw-880.png') },
      { id: 'white', name: 'White', swatch: crWhite, productImage: cr('tsw-880-white.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Size', value: '8.1" diagonal' },
        { name: 'Resolution', value: '1280 × 800 WXGA' },
        { name: 'Touch', value: 'Projected capacitive, 5-point' },
      ] },
      { label: 'Audio & Voice', rows: [
        { name: 'Audio', value: 'Built-in mic & speakers' },
        { name: 'Intercom', value: 'Rava® SIP' },
        { name: 'Video', value: 'H.265 / H.264 / MJPEG' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: 'Gigabit with PoE+' },
        { name: 'Wi-Fi', value: 'Wi-Fi 6E' },
        { name: 'Memory', value: '8 GB RAM · 40 GB storage' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron TSW-880 8.1" wall mount touch screen with PoE+, Wi-Fi 6E and Rava® SIP. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron TSW-880', '8 inch touch screen', 'Crestron touch panel', 'TSW-880 UAE', 'TSW-880 Pakistan'],
  },
  {
    slug: 'tsw-770',
    brandSlug: 'crestron',
    name: 'TSW-770',
    collection: '7" Wall Mount Touch Screen',
    tagline: 'Stylish, versatile, seven inches wide.',
    description:
      'The TSW-770 is a stylish, versatile wall mount touch screen featuring web browsing, Crestron HTML5 and Smart Graphics® technology, custom-programmable icons, H.265/H.264 streaming video, a Rava® SIP intercom, Wi-Fi and PoE+ power. Built-in applications cover room scheduling, conferencing and home control, and it is Wall-Smart® compatible.',
    category: 'touchscreens',
    hero: cr('tsw-770.png'),
    finishes: [
      { id: 'black-smooth', name: 'Black Smooth', swatch: crBlack, productImage: cr('tsw-770.png') },
      { id: 'white-smooth', name: 'White Smooth', swatch: crWhite, productImage: cr('tsw-770-white.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Size', value: '7" diagonal' },
        { name: 'Resolution', value: '1280 × 800 WXGA' },
        { name: 'Touch', value: 'Projected capacitive, 5-point' },
      ] },
      { label: 'Audio & Voice', rows: [
        { name: 'Audio', value: 'Built-in mic & speakers' },
        { name: 'Intercom', value: 'Rava® SIP' },
        { name: 'Video', value: 'H.265 / H.264 / MJPEG' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: '100 Mbps PoE+' },
        { name: 'Wi-Fi', value: '802.11ac' },
        { name: 'Memory', value: '2 GB RAM · 16 GB storage' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron TSW-770 7" wall mount touch screen with Smart Graphics®, Rava® SIP and PoE+. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron TSW-770', '7 inch touch screen', 'Crestron touch panel', 'TSW-770 UAE', 'TSW-770 Pakistan'],
  },
  {
    slug: 'tsw-570',
    brandSlug: 'crestron',
    name: 'TSW-570',
    collection: '5" Wall Mount Touch Screen',
    tagline: 'The compact interface for retrofit and new build.',
    description:
      'The TSW-570 is a stylish, versatile wall mount touch screen ideal for residential and enterprise applications. Its 5 in. capacitive display supports custom-programmable control buttons, Smart Graphics® software and HTML5-based custom UI projects, with PoE connectivity and mounting accessories that simplify new and retrofit installations.',
    category: 'touchscreens',
    hero: cr('tsw-570.png'),
    finishes: [
      { id: 'black-smooth', name: 'Black Smooth', swatch: crBlack, productImage: cr('tsw-570.png') },
      { id: 'white-smooth', name: 'White Smooth', swatch: crWhite, productImage: cr('tsw-570-white.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Size', value: '5" diagonal' },
        { name: 'Resolution', value: '1280 × 720 HD' },
        { name: 'Touch', value: 'Projected capacitive, 5-point' },
      ] },
      { label: 'Interface', rows: [
        { name: 'Software', value: 'Smart Graphics® & HTML5' },
        { name: 'Buttons', value: 'Custom-programmable' },
        { name: 'Video', value: 'H.265 / H.264 / MJPEG' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: '100 Mbps PoE+' },
        { name: 'Memory', value: '2 GB RAM · 16 GB storage' },
        { name: 'Weight', value: '250 g' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron TSW-570 5" wall mount touch screen with Smart Graphics® and PoE. Supplied and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron TSW-570', '5 inch touch screen', 'Crestron touch panel', 'TSW-570 UAE', 'TSW-570 Pakistan'],
  },
  {
    slug: 'tss-880',
    brandSlug: 'crestron',
    name: 'TSS-880',
    collection: '8.1" Room Scheduling Touch Screen',
    tagline: 'Room status, read across the hallway.',
    description:
      'The TSS-880 touch screen enhances and simplifies room scheduling across the enterprise. Installed outside meeting or huddle rooms, it shows clear availability with integrated light bars and connects to Microsoft Exchange, Google Calendar, 25Live and Ad Astra. Enterprise-grade security, XiO Cloud management and PoE+ round out a single-cable install.',
    category: 'touchscreens',
    hero: cr('tss-880.png'),
    finishes: [
      { id: 'black', name: 'Black', swatch: crBlack, productImage: cr('tss-880.png') },
      { id: 'white', name: 'White', swatch: crWhite, productImage: cr('tss-880-white.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Size', value: '8.1" diagonal' },
        { name: 'Resolution', value: '1280 × 800 WXGA' },
        { name: 'Light bar', value: 'Integrated room-status LEDs' },
      ] },
      { label: 'Scheduling', rows: [
        { name: 'Services', value: 'Exchange, Google, 25Live, Ad Astra' },
        { name: 'Branding', value: 'Customisable' },
        { name: 'Management', value: 'XiO Cloud' },
      ] },
      { label: 'Network & Power', rows: [
        { name: 'Ethernet', value: 'Gigabit with PoE+' },
        { name: 'Wi-Fi', value: 'Wi-Fi 6E' },
        { name: 'Security', value: '802.1X, TLS' },
      ] },
    ],
    inUse: crInterior,
    metaDescription:
      'Crestron TSS-880 8.1" room scheduling touch screen with light bars and XiO Cloud. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Crestron TSS-880', 'room scheduling panel', 'Crestron scheduling', 'TSS-880 UAE', 'TSS-880 Pakistan'],
  },
  // ─── Basalte ──────────────────────────────────────────────────────────────
  {
    slug: 'sentido',
    brandSlug: 'basalte',
    name: 'Sentido',
    collection: 'Design Switch',
    tagline: 'The light switch reinvented.',
    description:
      'Sentido is Basalte’s touch-sensitive design switch to intuitively control lights and music at the slightest touch. Handmade in Belgium in two- or four-button designs, its high-end finishes blend beautifully with any exclusive interior.',
    metaDescription:
      'Basalte Sentido touch-sensitive design switch — KNX, Crestron and Lutron compatible, handmade in Belgium. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Sentido', 'Sentido design switch', 'Basalte Sentido UAE', 'Basalte Sentido Pakistan', 'luxury light switch'],
    hero: '/products/basalte/sentido-brushed-brass.png',
    finishes: [
      { id: 'brushed-brass', name: 'Brushed Brass', swatch: 'linear-gradient(135deg,#e4d196,#b49a5c)', productImage: '/products/basalte/sentido-brushed-brass.png' },
      { id: 'brushed-black', name: 'Brushed Black', swatch: 'linear-gradient(135deg,#33343a,#141519)', productImage: '/products/basalte/sentido-brushed-black.png' },
      { id: 'brushed-volcanic-grey', name: 'Brushed Volcanic Grey', swatch: 'linear-gradient(135deg,#4a5052,#282c2e)', productImage: '/products/basalte/sentido-brushed-volcanic-grey.png' },
      { id: 'brushed-nickel', name: 'Brushed Nickel', swatch: 'linear-gradient(135deg,#eee9e0,#b9b4a9)', productImage: '/products/basalte/sentido-brushed-nickel.png' },
      { id: 'brushed-aluminium', name: 'Brushed Aluminium', swatch: 'linear-gradient(135deg,#d2d6d4,#9ea3a0)', productImage: '/products/basalte/sentido-brushed-aluminium.png' },
      { id: 'bronze', name: 'Bronze', swatch: 'linear-gradient(135deg,#8a6d59,#4a382d)', productImage: '/products/basalte/sentido-bronze.png' },
      { id: 'rose', name: 'Rosé', swatch: 'linear-gradient(135deg,#b08a7c,#7a5c50)', productImage: '/products/basalte/sentido-rose.png' },
      { id: 'satin-white', name: 'Satin White', swatch: 'linear-gradient(135deg,#f5f5f2,#d3d5d2)', productImage: '/products/basalte/sentido-satin-white.png' },
      { id: 'fer-forge-gunmetal', name: 'Fer Forgé Gunmetal', swatch: 'linear-gradient(135deg,#45464a,#232426)', productImage: '/products/basalte/sentido-fer-forge-gunmetal.png' },
      { id: 'fer-forge-grey', name: 'Fer Forgé Grey', swatch: 'linear-gradient(135deg,#8a7f6d,#4a4034)', productImage: '/products/basalte/sentido-fer-forge-grey.png' },
      { id: 'fer-forge-bronze', name: 'Fer Forgé Bronze', swatch: 'linear-gradient(135deg,#6f5a4f,#3c302a)', productImage: '/products/basalte/sentido-fer-forge-bronze.png' },
      { id: 'fer-forge-rose', name: 'Fer Forgé Rosé', swatch: 'linear-gradient(135deg,#c9a07c,#9a7264)', productImage: '/products/basalte/sentido-fer-forge-rose.png' },
    ],
    specs: [
      { label: 'Control', rows: [
        { name: 'Surface', value: 'Touch-sensitive, full surface' },
        { name: 'Multi-touch', value: 'All lights on or off' },
        { name: 'Layout', value: 'Two- or four-button design' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'KNX, Crestron, Lutron' },
        { name: 'Climate', value: 'Temperature sensor & thermostat logic' },
        { name: 'Feedback', value: 'Integrated multicolour LED' },
      ] },
      { label: 'Design', rows: [
        { name: 'Finishes', value: '12 high-end finishes' },
        { name: 'Mounting', value: '1-gang EU wall box' },
        { name: 'Origin', value: 'Handmade in Belgium' },
      ] },
    ],
    inUse: [
      '/products/basalte/sentido-scene.jpg',
      '/products/basalte/fibonacci-scene.jpg',
      '/products/basalte/deseo-sfeer.jpg',
    ],
  },
  {
    slug: 'fibonacci',
    brandSlug: 'basalte',
    name: 'Fibonacci',
    collection: 'Design Switch',
    tagline: 'The new reference.',
    description:
      'Fibonacci is Basalte’s avant-garde touch-sensitive switch, inspired by the golden ratio. As you approach, its backlit laser-engraved labels gently illuminate to welcome you home — customisable icons and text in a range of high-end finishes.',
    metaDescription:
      'Basalte Fibonacci touch-sensitive design switch with backlit laser-engraved labels — KNX, Crestron and Lutron compatible. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Fibonacci', 'Fibonacci design switch', 'Basalte Fibonacci UAE', 'Basalte Fibonacci Pakistan', 'luxury keypad'],
    hero: '/products/basalte/fibonacci-brushed-brass.png',
    finishes: [
      { id: 'brushed-brass', name: 'Brushed Brass', swatch: 'linear-gradient(135deg,#e4d196,#b49a5c)', productImage: '/products/basalte/fibonacci-brushed-brass.png' },
      { id: 'brushed-black', name: 'Brushed Black', swatch: 'linear-gradient(135deg,#33343a,#141519)', productImage: '/products/basalte/fibonacci-brushed-black.png' },
      { id: 'brushed-volcanic-grey', name: 'Brushed Volcanic Grey', swatch: 'linear-gradient(135deg,#4a5052,#282c2e)', productImage: '/products/basalte/fibonacci-brushed-volcanic-grey.png' },
      { id: 'brushed-aluminium', name: 'Brushed Aluminium', swatch: 'linear-gradient(135deg,#d2d6d4,#9ea3a0)', productImage: '/products/basalte/fibonacci-brushed-aluminium.png' },
      { id: 'bronze', name: 'Bronze', swatch: 'linear-gradient(135deg,#8a6d59,#4a382d)', productImage: '/products/basalte/fibonacci-bronze.png' },
      { id: 'rose', name: 'Rosé', swatch: 'linear-gradient(135deg,#b08a7c,#7a5c50)', productImage: '/products/basalte/fibonacci-rose.png' },
      { id: 'satin-white', name: 'Satin White', swatch: 'linear-gradient(135deg,#f5f5f2,#d3d5d2)', productImage: '/products/basalte/fibonacci-satin-white.png' },
      { id: 'fer-forge-gunmetal', name: 'Fer Forgé Gunmetal', swatch: 'linear-gradient(135deg,#45464a,#232426)', productImage: '/products/basalte/fibonacci-fer-forge-gunmetal.png' },
      { id: 'fer-forge-grey', name: 'Fer Forgé Grey', swatch: 'linear-gradient(135deg,#8a7f6d,#4a4034)', productImage: '/products/basalte/fibonacci-fer-forge-grey.png' },
      { id: 'fer-forge-bronze', name: 'Fer Forgé Bronze', swatch: 'linear-gradient(135deg,#6f5a4f,#3c302a)', productImage: '/products/basalte/fibonacci-fer-forge-bronze.png' },
      { id: 'fer-forge-rose', name: 'Fer Forgé Rosé', swatch: 'linear-gradient(135deg,#c9a07c,#9a7264)', productImage: '/products/basalte/fibonacci-fer-forge-rose.png' },
    ],
    specs: [
      { label: 'Control', rows: [
        { name: 'Surface', value: 'Touch-sensitive, multi-touch' },
        { name: 'Labels', value: 'Backlit, laser-engraved, customisable' },
        { name: 'Layout', value: 'Two- or four-button design' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'KNX, Crestron, Lutron' },
        { name: 'Sensors', value: 'Temperature, thermostat logic, proximity' },
        { name: 'Feedback', value: 'Integrated multicolour LED' },
      ] },
      { label: 'Design', rows: [
        { name: 'Finishes', value: '11 high-end finishes' },
        { name: 'Mounting', value: '1-gang EU or US wall box' },
        { name: 'Origin', value: 'Handmade in Belgium' },
      ] },
    ],
    inUse: [
      '/products/basalte/fibonacci-scene.jpg',
      '/products/basalte/fibonacci-personal.jpg',
      '/products/basalte/sentido-scene.jpg',
    ],
  },
  {
    slug: 'deseo',
    brandSlug: 'basalte',
    name: 'Deseo',
    collection: 'Design Thermostat',
    tagline: 'An intelligent design thermostat.',
    description:
      'Deseo is a design thermostat and room controller to intuitively command your home climate, lighting and even music at the lightest touch. A multicolour OLED display and a variety of high-quality finishes let it blend beautifully into any interior.',
    metaDescription:
      'Basalte Deseo touch-sensitive design thermostat and room controller with multicolour OLED display — KNX and Crestron compatible. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Deseo', 'Deseo thermostat', 'Basalte Deseo UAE', 'Basalte Deseo Pakistan', 'design thermostat'],
    hero: '/products/basalte/deseo.jpg',
    finishes: [
      {
        id: 'satin-white',
        name: 'Satin White',
        swatch: 'linear-gradient(135deg,#f5f1e8,#d6d0c2)',
        productImage: '/products/basalte/deseo.jpg',
      },
    ],
    specs: [
      { label: 'Control', rows: [
        { name: 'Keypad', value: 'Multifunctional, touch-sensitive' },
        { name: 'Multi-touch', value: 'Additional multitouch functions' },
      ] },
      { label: 'Climate', rows: [
        { name: 'Sensing', value: 'Integrated temperature sensor & thermostat logic' },
        { name: 'Display', value: 'Multicolour OLED' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'KNX, Crestron' },
        { name: 'Mounting', value: 'Flush mountable, 1-gang EU wall box' },
      ] },
    ],
    inUse: [
      '/products/basalte/deseo-hero.jpg',
      '/products/basalte/deseo-sfeer.jpg',
      '/products/basalte/sentido-scene.jpg',
    ],
  },
  {
    slug: 'auro',
    brandSlug: 'basalte',
    name: 'Auro',
    collection: 'Motion Sensor',
    tagline: 'The almost invisible motion sensor.',
    description:
      'Auro is a small, fast and almost invisible flush-fitting motion sensor that automatically switches on lights in hallways, dressings and restrooms. Integrated LEDs let it double as a night light, and a wide variety of finishes lets it disappear into any interior.',
    metaDescription:
      'Basalte Auro flush-fitting motion sensor with integrated night light — Crestron, Lutron HomeWorks and KNX compatible. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Auro', 'Auro motion sensor', 'Basalte Auro UAE', 'Basalte Auro Pakistan', 'design motion sensor'],
    hero: '/products/basalte/auro.jpg',
    finishes: [
      {
        id: 'bronze',
        name: 'Bronze',
        swatch: 'linear-gradient(135deg,#c9a961,#8b7355)',
        productImage: '/products/basalte/auro.jpg',
      },
    ],
    specs: [
      { label: 'Detection', rows: [
        { name: 'Design', value: 'Miniature, flush-fitting' },
        { name: 'Logic', value: 'Set times or room light levels' },
      ] },
      { label: 'Comfort', rows: [
        { name: 'Night light', value: 'Integrated LEDs' },
        { name: 'Dimming', value: 'Full power by day, dimmed at night' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'Crestron, Lutron HomeWorks, KNX' },
        { name: 'Variants', value: 'White or black; wall-mounted version' },
      ] },
    ],
    inUse: [
      '/products/basalte/auro-hero.jpg',
      '/products/basalte/auro-sfeer.jpg',
      '/products/basalte/deseo-sfeer.jpg',
    ],
  },
  {
    slug: 'eve',
    brandSlug: 'basalte',
    name: 'Eve',
    collection: 'iPad Mount',
    tagline: 'The elegant iPad mount.',
    description:
      'Eve is an elegant iPad mount for the intelligent home, precision-machined from solid aluminium. It keeps the iPad securely mounted yet permanently charged — always there to control lighting, music and more in luxury homes, hotels and offices.',
    metaDescription:
      'Basalte Eve elegant iPad wall mount, precision-machined from solid aluminium with permanent charging. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Eve', 'Eve iPad mount', 'Basalte Eve UAE', 'Basalte Eve Pakistan', 'luxury iPad wall mount'],
    hero: '/products/basalte/eve.png',
    finishes: [
      {
        id: 'black',
        name: 'Black',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/basalte/eve.png',
      },
    ],
    specs: [
      { label: 'Construction', rows: [
        { name: 'Material', value: 'Precision-machined solid aluminium' },
        { name: 'Finishes', value: 'Luxury finishes' },
      ] },
      { label: 'Function', rows: [
        { name: 'Mounting', value: 'Securely mounted, on-wall' },
        { name: 'Power', value: 'Permanently charged' },
      ] },
      { label: 'Variants', rows: [
        { name: 'Eve', value: 'On-wall mount' },
        { name: 'Eve Curve', value: 'Freestanding, with rotation system' },
      ] },
    ],
    inUse: [
      '/products/basalte/eve-interior.jpg',
      '/products/basalte/eve-details.jpg',
      '/products/basalte/eve-moves.jpg',
    ],
  },
  {
    slug: 'miro',
    brandSlug: 'basalte',
    name: 'Miro',
    collection: 'Design Remote',
    tagline: 'The only remote you’ll ever need.',
    description:
      'Miro is Basalte’s design remote — turn on the TV, fill the room with music or dim the lights from the palm of your hand. An interactive 2" super-black touch display, buttons and joystick balance in a slim aluminium body, connected over Basalte Beam.',
    metaDescription:
      'Basalte Miro design remote with 2" touch display and aluminium body, connected via Basalte Beam wireless. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Miro', 'Miro remote', 'Basalte Miro UAE', 'Basalte Miro Pakistan', 'design remote control'],
    hero: '/products/basalte/miro.png',
    finishes: [
      {
        id: 'black',
        name: 'Black',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/basalte/miro.png',
      },
    ],
    specs: [
      { label: 'Interface', rows: [
        { name: 'Display', value: '2" super-black touch display' },
        { name: 'Controls', value: 'Touch, buttons and joystick' },
      ] },
      { label: 'Body', rows: [
        { name: 'Material', value: 'Slim aluminium' },
        { name: 'Ergonomics', value: 'Balanced in the palm of the hand' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Wireless', value: 'Basalte Beam low-power network' },
        { name: 'Charging', value: 'Wireless base, 6 premium finishes' },
      ] },
    ],
    inUse: [
      '/products/basalte/miro-intro.jpg',
      '/products/basalte/eve-interior.jpg',
      '/products/basalte/sentido-scene.jpg',
    ],
  },
  {
    slug: 'aalto',
    brandSlug: 'basalte',
    name: 'Aalto',
    collection: 'Speaker Collection',
    tagline: 'Powerful design speakers.',
    description:
      'Aalto is an elegant collection of powerful speakers for high-end interiors — in-wall, on-wall and freestanding models, soundbars and stands, crowned by the Aalto F5 flagship. Crafted in Belgium in exclusive finishes and fabrics, with integrated Bluetooth.',
    metaDescription:
      'Basalte Aalto design speaker collection — in-wall, on-wall and freestanding, crafted in Belgium with integrated Bluetooth. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Aalto', 'Aalto speakers', 'Basalte Aalto UAE', 'Basalte Aalto Pakistan', 'design speakers'],
    hero: '/products/basalte/aalto-brushed-black.png',
    finishes: [
      { id: 'brushed-black', name: 'Brushed Black', swatch: 'linear-gradient(135deg,#33343a,#141519)', productImage: '/products/basalte/aalto-brushed-black.png' },
      { id: 'brushed-brass', name: 'Brushed Brass', swatch: 'linear-gradient(135deg,#e4d196,#b49a5c)', productImage: '/products/basalte/aalto-brushed-brass.png' },
      { id: 'brushed-nickel', name: 'Brushed Nickel', swatch: 'linear-gradient(135deg,#eee9e0,#b9b4a9)', productImage: '/products/basalte/aalto-brushed-nickel.png' },
      { id: 'brushed-aluminium', name: 'Brushed Aluminium', swatch: 'linear-gradient(135deg,#d2d6d4,#9ea3a0)', productImage: '/products/basalte/aalto-brushed-aluminium.png' },
      { id: 'bronze', name: 'Bronze', swatch: 'linear-gradient(135deg,#8a6d59,#4a382d)', productImage: '/products/basalte/aalto-bronze.png' },
      { id: 'satin-white', name: 'Satin White', swatch: 'linear-gradient(135deg,#f5f5f2,#d3d5d2)', productImage: '/products/basalte/aalto-satin-white.png' },
    ],
    specs: [
      { label: 'Range', rows: [
        { name: 'Models', value: 'In-wall, on-wall, freestanding, soundbars' },
        { name: 'Flagship', value: 'Aalto F5' },
        { name: 'Accessories', value: 'Aalto stands' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Bluetooth', value: 'Integrated, direct & secure access' },
      ] },
      { label: 'Design', rows: [
        { name: 'Finishes', value: 'Brushed black, aluminium, satin white, bronze, nickel, brass' },
        { name: 'Fabrics', value: 'High-quality fabric options' },
        { name: 'Origin', value: 'Crafted in Belgium' },
      ] },
    ],
    inUse: [
      '/products/basalte/aalto-sfeer.jpg',
      '/products/basalte/aalto-magical.jpg',
      '/products/basalte/aalto-allset.jpg',
    ],
  },
  {
    slug: 'plano',
    brandSlug: 'basalte',
    name: 'Plano',
    collection: 'In-wall Speakers',
    tagline: 'In-wall design speakers.',
    description:
      'Plano is a unique collection of high-performance, passive in-wall speakers. The compact Plano R3 serves smaller rooms and surround duty while the reference Plano R5 anchors the front stage — AMT ribbon tweeters, aluminium mid-woofers and kevlar bass woofers throughout.',
    metaDescription:
      'Basalte Plano high-performance passive in-wall speakers with AMT ribbon tweeter and kevlar woofers. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Basalte Plano', 'Plano in-wall speakers', 'Basalte Plano UAE', 'Basalte Plano Pakistan', 'in-wall design speakers'],
    hero: '/products/basalte/plano.jpg',
    finishes: [
      {
        id: 'fabrics',
        name: 'Fabric & Metal Finishes',
        swatch: 'linear-gradient(135deg,#5a4a3f,#2e2620)',
        productImage: '/products/basalte/plano.jpg',
      },
    ],
    specs: [
      { label: 'Models', rows: [
        { name: 'Plano R3', value: 'Compact, smaller rooms or surround' },
        { name: 'Plano R5', value: 'Reference, front stereo or centre' },
      ] },
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: 'AMT ribbon' },
        { name: 'Mid-woofers', value: 'Aluminium, with aluminium phase plug' },
        { name: 'Bass', value: 'Kevlar woofers' },
      ] },
      { label: 'Tuning & Design', rows: [
        { name: 'EQ', value: 'High & low frequency adjustment' },
        { name: 'Finishes', value: 'Metal finishes + Gabriel & Kvadrat fabrics' },
      ] },
    ],
    inUse: [
      '/products/basalte/plano-sfeer.jpg',
      '/products/basalte/plano-finish1.jpg',
      '/products/basalte/aalto-sfeer.jpg',
    ],
  },

  // ─── Blustream ────────────────────────────────────────────────────────────
  {
    slug: 'dante',
    brandSlug: 'blustream',
    name: 'Dante',
    collection: 'Audio-over-IP · Dante®',
    tagline: 'Studio-grade audio, distributed over the network.',
    description:
      'Blustream’s Dante® range brings Audinate’s Dante audio networking to residential and commercial installations. Encoders, decoders, matrix processors and networked power amplifiers move multi-channel audio over standard 1Gb network infrastructure — from a single wall plate to a fully switched building.',
    metaDescription:
      'Blustream Dante audio-over-IP range — encoders, decoders, the DA1414 matrix and NPA networked amplifiers over standard networks. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Blustream Dante', 'Dante audio over IP', 'Blustream Dante UAE', 'Blustream Dante Pakistan', 'networked audio distribution'],
    hero: '/products/blustream/dante-matrix.png',
    finishes: [
      {
        id: 'matte-black',
        name: 'Matte Black',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/blustream/dante-matrix.png',
      },
    ],
    specs: [
      { label: 'Range', rows: [
        { name: 'Encoders & decoders', value: 'Analogue, XLR, S/PDIF, USB, HDMI ARC' },
        { name: 'Matrix', value: 'DA1414 14×14 audio matrix' },
        { name: 'Amplifiers', value: 'NPA Series networked power amps' },
      ] },
      { label: 'Audio', rows: [
        { name: 'Network', value: 'Dante (Audinate)' },
        { name: 'Channels', value: 'Multi-channel' },
        { name: 'Breakout', value: 'Analogue & USB audio' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Network', value: '1Gb LAN, TCP/IP' },
        { name: 'Control', value: 'RS-232, IR' },
        { name: 'HDCP', value: '2.2 / 2.3' },
      ] },
    ],
    inUse: [
      '/products/blustream/dante-converter-tile.jpg',
      '/products/blustream/dante-switcher-tile.jpg',
      '/products/blustream/dante-amplifier-tile.jpg',
    ],
  },
  {
    slug: 'wireless-byod',
    brandSlug: 'blustream',
    name: 'Wireless / BYOD',
    collection: 'Wireless Presentation & BYOD',
    tagline: 'Share any screen, without a single cable.',
    description:
      'Blustream’s Wireless & BYOD range lets anyone present to the room’s display without cables. Wireless presentation switches and plug-and-play dongles bring AirPlay, Chromecast, Miracast, HDMI and USB-C sources together for boardrooms, meeting rooms and living spaces — with multiview and full 4K output.',
    metaDescription:
      'Blustream Wireless & BYOD range — WMF presentation switches and HDMI/USB-C dongles supporting AirPlay, Chromecast and Miracast. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Blustream BYOD', 'Blustream wireless presentation', 'Blustream WMF UAE', 'Blustream WMF Pakistan', 'wireless screen sharing'],
    hero: '/products/blustream/byod-switch.png',
    finishes: [
      {
        id: 'matte-black',
        name: 'Matte Black',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/blustream/byod-switch.png',
      },
    ],
    specs: [
      { label: 'Sources', rows: [
        { name: 'Casting', value: 'AirPlay, Chromecast, Miracast' },
        { name: 'Wired', value: 'HDMI, USB-C' },
        { name: 'Dongles', value: 'WMF-HDMI-D, WMF-USBC-D' },
      ] },
      { label: 'Presentation', rows: [
        { name: 'Multiview', value: 'WMF51 wireless presenter' },
        { name: 'Switch', value: 'WMF72-V2 multi-format' },
        { name: 'Output', value: 'HDMI, up to 4K 60Hz 4:4:4' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Control', value: 'RS-232, TCP/IP' },
        { name: 'USB', value: 'Pass-through, USB 3.0' },
        { name: 'Audio', value: 'Analogue breakout' },
      ] },
    ],
    inUse: [
      '/products/blustream/byod-presenter-tile.jpg',
      '/products/blustream/byod-hdmi-tile.jpg',
      '/products/blustream/byod-usbc-tile.jpg',
    ],
  },
  {
    slug: 'video-over-ip',
    brandSlug: 'blustream',
    name: 'Video over IP',
    collection: 'Video over IP · AV Distribution',
    tagline: 'AV distribution that scales with the building.',
    description:
      'Blustream’s Video over IP range distributes and switches AV across standard network infrastructure, scaling from a handful of screens to hundreds. Zero-latency SDVoE transceivers, 1Gb 4K systems with Dante and 100Mbps HD endpoints share a common control architecture for video walls, matrix switching, KVM and digital signage.',
    metaDescription:
      'Blustream Video over IP range — SDVoE, 1Gb 4K with Dante and HD endpoints for video wall, matrix and KVM. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Blustream Video over IP', 'Blustream SDVoE', 'Blustream AV over IP UAE', 'Blustream AV over IP Pakistan', 'video wall distribution'],
    hero: '/products/blustream/ip-sdvoe.png',
    finishes: [
      {
        id: 'matte-black',
        name: 'Matte Black',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/blustream/ip-sdvoe.png',
      },
    ],
    specs: [
      { label: 'Platforms', rows: [
        { name: 'SDVoE', value: 'IP500 / IP510, 10Gb' },
        { name: '1Gb 4K', value: 'IP200–IP350 Series' },
        { name: 'HD', value: 'IP50, 100Mbps' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Resolution', value: 'Up to 4K 60Hz 4:4:4' },
        { name: 'Latency', value: 'Zero-latency (SDVoE) to <120ms' },
        { name: 'Features', value: 'Video wall, KVM, multiview' },
      ] },
      { label: 'Network & Audio', rows: [
        { name: 'Network', value: 'RJ45 copper, fibre SFP / SFP+' },
        { name: 'Audio', value: 'Dante, ARC, audio embedding' },
        { name: 'Control', value: 'ACM control modules' },
      ] },
    ],
    inUse: [
      '/products/blustream/ip-transmitter-tile.jpg',
      '/products/blustream/ip-transceiver-tile.jpg',
      '/products/blustream/ip-wallplate-tile.jpg',
    ],
  },
  {
    slug: 'precision-48',
    brandSlug: 'blustream',
    name: 'Precision 48',
    collection: '48Gbps 8K Active HDMI Cable',
    tagline: 'Guaranteed 48Gbps, however long the run.',
    description:
      'Precision 48 is Blustream’s 48Gbps active optical HDMI cable, engineered for guaranteed Ultra High Speed performance over long runs. Integrated circuits measure, analyse and adjust the video signal to sustain the full 48Gbps bandwidth — carrying 8K/60 and 4K/120 HDMI 2.1 with full HDR, eARC and CEC through a slim, EMI/RFI-resistant active-optic-copper build.',
    metaDescription:
      'Blustream Precision 48 — 48Gbps 8K active optical HDMI 2.1 cable with eARC, HDR and integrated signal conditioning. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Blustream Precision 48', '48Gbps HDMI cable', '8K AOC HDMI cable', 'Blustream Precision 48 UAE', 'Blustream Precision 48 Pakistan'],
    hero: '/products/blustream/precision-48-detail.png',
    finishes: [
      {
        id: 'black',
        name: 'Black',
        swatch: 'linear-gradient(135deg,#1a1a1a,#0a0a0a)',
        productImage: '/products/blustream/precision-48-detail.png',
      },
    ],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Bandwidth', value: '48Gbps Ultra High Speed' },
        { name: 'Resolution', value: '8K 60Hz, 4K 120Hz' },
        { name: 'Colour', value: '8 / 10 / 12-bit HDR (16-bit at 1080p)' },
      ] },
      { label: 'Signal', rows: [
        { name: 'Construction', value: 'Active optic copper' },
        { name: 'Integrity', value: 'Integrated signal-conditioning ICs' },
        { name: 'Audio & control', value: 'eARC, CEC pass-through' },
      ] },
      { label: 'Installation', rows: [
        { name: 'Lengths', value: '10m, 15m, 30m' },
        { name: 'Power', value: 'Optional integrated USB' },
        { name: 'Jacket', value: 'LSZH, gold-plated locking tabs' },
      ] },
    ],
    inUse: [
      '/products/blustream/precision-48-full-tile.jpg',
      '/products/blustream/precision-48-hdmi-tile.jpg',
      '/products/blustream/precision-48-usb-tile.jpg',
    ],
  },

  // ─── Black Nova ───────────────────────────────────────────────────────────
  {
    slug: 'alba',
    brandSlug: 'blacknova',
    name: 'ALBA',
    collection: 'ALBA Collection · Push-Button Keypads',
    tagline: 'The epitome of elegance and functionality.',
    description:
      'ALBA is Black Nova’s push-button keypad in metal and glass — instant tactile feedback beneath engraved icons, an independently dimmable RGB backlight, and a body hand-finished in Milan. From the compact ALBA 2 to the multipurpose ALBA M1 with its temperature interface, one refined object commands the entire room.',
    metaDescription:
      'Black Nova ALBA push-button keypad in metal and glass — ALBA 2, 4, 6, 8 and M1 layouts, eight hand-finished finishes. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Black Nova ALBA', 'ALBA keypad', 'ALBA 8', 'ALBA M1', 'Black Nova keypad UAE', 'Black Nova Pakistan', 'luxury keypad Dubai'],
    hero: bn('alba-on.png'),
    finishes: [
      { id: 'york-black', name: 'York Black (Glass)', swatch: 'linear-gradient(135deg,#2b2b2d,#0a0a0a)', productImage: bn('alba-mat-yb.png') },
      { id: 'ice-white', name: 'Ice White (Glass)', swatch: 'linear-gradient(135deg,#f2efe9,#cdc8bd)', productImage: bn('alba-mat-iw.png') },
      { id: 'venetian-gold', name: 'Venetian Gold (Glass)', swatch: 'linear-gradient(135deg,#d8c48f,#a98a52)', productImage: bn('alba-mat-vg.png') },
      { id: 'mars-black', name: 'Mars Black (Metal)', swatch: 'linear-gradient(135deg,#3a3a3c,#131313)', productImage: bn('alba-mat-mmb.png') },
      { id: 'silver', name: 'Silver · York Black (Metal)', swatch: 'linear-gradient(135deg,#d8dade,#9a9ea3)', productImage: bn('alba-mat-mas-yb.png') },
      { id: 'silver-ice', name: 'Silver · Ice White (Metal)', swatch: 'linear-gradient(135deg,#e2e4e7,#a9adb2)', productImage: bn('alba-mat-mas-iw.png') },
      { id: 'bronze-gold', name: 'Bronze Gold · Venetian Gold (Metal)', swatch: 'linear-gradient(135deg,#c9a15f,#7d5b32)', productImage: bn('alba-mat-mbg-vg.png') },
      { id: 'bronze-york', name: 'Bronze Gold · York Black (Metal)', swatch: 'linear-gradient(135deg,#b98f52,#5f4526)', productImage: bn('alba-mat-mbg-yb.png') },
    ],
    specs: [
      { label: 'Layouts', rows: [
        { name: 'ALBA 2', value: 'Max 4 addressable push buttons' },
        { name: 'ALBA 4', value: 'Max 12 addressable push buttons' },
        { name: 'ALBA 6', value: 'Max 12 addressable push buttons' },
        { name: 'ALBA 8', value: 'Max 12 addressable push buttons' },
        { name: 'ALBA M1', value: 'Multipurpose · temperature interface' },
      ] },
      { label: 'Materials & Craft', rows: [
        { name: 'Construction', value: 'Metal & glass' },
        { name: 'Glass finishes', value: 'York Black, Ice White, Venetian Gold' },
        { name: 'Metal finishes', value: 'Mars Black, Silver, Bronze Gold' },
        { name: 'Finishing', value: 'Anodisation, galvanic bath plating, hand brushing' },
        { name: 'Origin', value: 'Made in Italy' },
      ] },
      { label: 'Interaction', rows: [
        { name: 'Buttons', value: 'Push-button, instant tactile feedback' },
        { name: 'Icons', value: 'Engraved icons and text' },
        { name: 'Backlight', value: 'Independently dimmable RGB, auto-dim' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'Crestron, KNX, Control4, Savant, Lutron HomeWorks QS' },
        { name: 'Socket frames', value: 'Legrand Arteor & Mosaic compatible' },
        { name: 'Modules', value: '1, 2 and 3-module frame versions' },
      ] },
    ],
    inUse: [bn('alba-design.png'), bn('alba-base.png'), bn('alba-on.png')],
  },
  {
    slug: 'aria',
    brandSlug: 'blacknova',
    name: 'ARIA',
    collection: 'ARIA Collection · Glass Touch Keypads',
    tagline: 'A tribute to minimalist aesthetics.',
    description:
      'ARIA is a glass touch keypad reduced to pure geometry — straight lines, pure shapes and a completely smooth surface. Fast-response touch points sit beneath engraved icons and text, lit by a customisable LED backlight that dims automatically when the room is at rest.',
    metaDescription:
      'Black Nova ARIA glass touch keypad — ARIA M1, ARIA 12 and ARIA Slider layouts with engraved icons and customisable LED backlight. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Black Nova ARIA', 'ARIA keypad', 'ARIA 12', 'ARIA Slider', 'glass touch keypad', 'Black Nova UAE', 'Black Nova Pakistan'],
    hero: bn('aria-off.png'),
    finishes: [
      { id: 'york-black', name: 'York Black (Glass)', swatch: 'linear-gradient(135deg,#2b2b2d,#0a0a0a)', productImage: bn('aria-mat-yb.png') },
      { id: 'ice-white', name: 'Ice White (Glass)', swatch: 'linear-gradient(135deg,#f2efe9,#cdc8bd)', productImage: bn('aria-mat-iw.png') },
      { id: 'venetian-gold', name: 'Venetian Gold (Glass)', swatch: 'linear-gradient(135deg,#d8c48f,#a98a52)', productImage: bn('aria-mat-vg.png') },
    ],
    specs: [
      { label: 'Layouts', rows: [
        { name: 'ARIA M1', value: 'Max 6 addressable touch points' },
        { name: 'ARIA 12', value: 'Max 12 addressable touch points' },
        { name: 'ARIA Slider', value: 'Max 12 addressable touch points' },
      ] },
      { label: 'Materials & Craft', rows: [
        { name: 'Construction', value: 'Glass, completely smooth surface' },
        { name: 'Finishes', value: 'York Black, Ice White, Venetian Gold' },
        { name: 'Finishing', value: 'Hand-finished, made in Italy' },
      ] },
      { label: 'Interaction', rows: [
        { name: 'Touch', value: 'Fast-response touch points' },
        { name: 'Icons', value: 'Engraved icons and text' },
        { name: 'Backlight', value: 'Customisable colour & intensity, auto-dim' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'Crestron, KNX, Control4, Savant, Lutron HomeWorks QS' },
        { name: 'Socket frames', value: 'Legrand Arteor & Mosaic compatible' },
        { name: 'Privacy', value: 'Advanced design for security and user privacy' },
      ] },
    ],
    inUse: [bn('aria-off.png'), bn('aria-on.png'), bn('aria-slider.png')],
  },
  {
    slug: 'any',
    brandSlug: 'blacknova',
    name: 'ANY',
    collection: 'ANY · Smart Touch Panel',
    tagline: 'One control, any function, anywhere.',
    description:
      'ANY is Black Nova’s smart touch panel — a design masterpiece built around an 841-LED matrix and a multitouch capacitive surface. Proximity, gesture and ambient-light sensors let it wake as you approach and dim into the night, while its display and thermostat functions bring an entire room under one considered control.',
    metaDescription:
      'Black Nova ANY smart touch panel with 841-LED matrix, multitouch, proximity, gesture and ambient-light sensors, and thermostat functions. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Black Nova ANY', 'ANY touch panel', 'ANY smart panel', 'LED matrix keypad', 'Black Nova UAE', 'Black Nova Pakistan', 'luxury touch panel Dubai'],
    hero: bn('any-on.png'),
    finishes: [
      { id: 'york-black', name: 'York Black (Glass)', swatch: 'linear-gradient(135deg,#2b2b2d,#0a0a0a)', productImage: bn('any-hb.png') },
      { id: 'ice-white', name: 'Ice White (Glass)', swatch: 'linear-gradient(135deg,#f2efe9,#cdc8bd)', productImage: bn('any-hw.png') },
      { id: 'marble', name: 'Marble', swatch: 'linear-gradient(135deg,#e7e3da,#b7ada0)', productImage: bn('any-off.png') },
    ],
    specs: [
      { label: 'Display', rows: [
        { name: 'Matrix', value: '841-LED matrix' },
        { name: 'Touch', value: 'Multitouch capacitive screen' },
        { name: 'Colour', value: 'Up to 16.7 million colours' },
        { name: 'Behaviour', value: 'Bright by day, dimmed at night' },
      ] },
      { label: 'Sensors', rows: [
        { name: 'Proximity', value: 'Wakes on approach' },
        { name: 'Gesture', value: 'Gesture recognition' },
        { name: 'Ambient light', value: 'Automatic brightness' },
        { name: 'Climate', value: 'Full thermostat functions' },
      ] },
      { label: 'Materials & Craft', rows: [
        { name: 'Finishes', value: 'York Black & Ice White glass; marble' },
        { name: 'Blend-in', value: 'Displayed controls gently diffused into the interior' },
        { name: 'Origin', value: 'Hand-finished, made in Italy' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'Crestron, KNX, Control4, Savant, Lutron HomeWorks QS' },
        { name: 'Role', value: 'One room, one control' },
      ] },
    ],
    inUse: [bn('any-on.png'), bn('any-mg.png'), bn('any-hb.png')],
  },
  {
    slug: 'axes',
    brandSlug: 'blacknova',
    name: 'AXES',
    collection: 'AXES Collection · Hospitality Touch Panels',
    tagline: 'A touch of the sublime.',
    description:
      'AXES is a family of glass touch panels built for hospitality — guest-room controls, door keypads and card holders with room-presence indicators that match a hotel’s brand identity exactly. Engraved icons, fast-response touch and night-dimming backlight bring a sophisticated allure to the world’s most high-end properties.',
    metaDescription:
      'Black Nova AXES hospitality touch panels — AXES TT, 9, CH, DR, KN and N3 for guest rooms, doors and card holders. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Black Nova AXES', 'AXES touch panel', 'AXES TT', 'AXES KN', 'hotel keypad', 'hospitality touch panel', 'Black Nova UAE Pakistan'],
    hero: bn('axes-tt.png'),
    finishes: [
      { id: 'york-black', name: 'York Black (Glass)', swatch: 'linear-gradient(135deg,#2b2b2d,#0a0a0a)', productImage: bn('axes-mat-yb.png') },
      { id: 'ice-white', name: 'Ice White (Glass)', swatch: 'linear-gradient(135deg,#f2efe9,#cdc8bd)', productImage: bn('axes-mat-iw.png') },
      { id: 'venetian-gold', name: 'Venetian Gold (Glass)', swatch: 'linear-gradient(135deg,#d8c48f,#a98a52)', productImage: bn('axes-mat-vg.png') },
    ],
    specs: [
      { label: 'Layouts', rows: [
        { name: 'AXES TT', value: 'Max 10 addressable touch points' },
        { name: 'AXES 9', value: 'Max 9 addressable touch points' },
        { name: 'AXES CH', value: 'Card holder · max 5 touch points' },
        { name: 'AXES DR', value: 'Door · RGB presence indicator' },
        { name: 'AXES KN', value: 'Numeric keypad' },
        { name: 'AXES N3', value: 'Max 3 addressable touch points' },
      ] },
      { label: 'Hospitality', rows: [
        { name: 'Solution', value: 'Door & card-holder keypads with presence indicators' },
        { name: 'Comfort', value: 'Night-dimming backlight for guests' },
        { name: 'Branding', value: 'Panels matched to hotel brand identity' },
        { name: 'Layouts', value: 'Combines with outlets and specialty sockets' },
      ] },
      { label: 'Materials & Craft', rows: [
        { name: 'Construction', value: 'Glass, engraved icons' },
        { name: 'Finishes', value: 'York Black, Ice White, Venetian Gold' },
        { name: 'Origin', value: 'Hand-finished, made in Italy' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Systems', value: 'Crestron, KNX, Control4, Savant, Lutron HomeWorks QS' },
        { name: 'Security', value: 'Advanced security with minimalist design' },
      ] },
    ],
    inUse: [bn('axes-tt.png'), bn('axes-on.png'), bn('axes-base.png')],
  },
  {
    slug: 'black-jack',
    brandSlug: 'blacknova',
    name: 'BLACK JACK',
    collection: 'BLACK JACK · Capsule Collection with Meljac',
    tagline: 'Italian innovation, French metalwork.',
    description:
      'BLACK JACK is a capsule collection created with Meljac of France — the perfect blend of Italian innovation and heritage French metalwork. Iconic push buttons carry an independently dimmable RGB backlight, temperature and humidity sensing, and the multipurpose M1 OLED display, all set into hand-finished Meljac metal.',
    metaDescription:
      'Black Nova BLACK JACK keypad — a capsule collection with Meljac of France, RGB backlight, temperature & humidity sensors and the M1 OLED display. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Black Nova Black Jack', 'Black Jack keypad', 'Black Jack M1', 'Meljac keypad', 'Black Nova Meljac', 'Black Nova UAE', 'Black Nova Pakistan'],
    hero: bn('bj-m1.png'),
    finishes: [
      { id: 'meljac-metal', name: 'Meljac Hand-Finished Metal', swatch: 'linear-gradient(135deg,#4a4a4c,#1b1b1c)', productImage: bn('bj-kp-4b.png') },
    ],
    specs: [
      { label: 'Layouts', rows: [
        { name: 'Black Jack 2', value: 'Max 2 addressable push buttons' },
        { name: 'Black Jack 4', value: 'Max 4 addressable push buttons' },
        { name: 'Black Jack 6', value: 'Max 6 addressable push buttons' },
        { name: 'Black Jack 8', value: 'Max 8 addressable push buttons' },
        { name: 'Black Jack M1', value: 'Multipurpose OLED display' },
      ] },
      { label: 'Sensors & Display', rows: [
        { name: 'Sensing', value: 'Temperature and humidity sensors' },
        { name: 'Backlight', value: 'Independently dimmable RGB' },
        { name: 'M1 display', value: 'Temperature, media, guest & room info' },
      ] },
      { label: 'Materials & Craft', rows: [
        { name: 'Collaboration', value: 'Capsule collection with Meljac, France' },
        { name: 'Finish', value: 'Hand-finished Meljac metal, natural variation' },
        { name: 'Origin', value: 'Italian design, made in Italy' },
      ] },
      { label: 'Integration', rows: [
        { name: 'Protocols', value: 'KNX, RS485, Crestron Connect' },
        { name: 'Flush mounting', value: 'Trufig and Wall-Smart platforms' },
      ] },
    ],
    inUse: [bn('bj-m1.png'), bn('bj-kp-4b.png'), bn('bj-kp-8b.png')],
  },

  // ─── Marantz ──────────────────────────────────────────────────────────────
  {
    slug: 'cinema-30',
    brandSlug: 'marantz',
    name: 'Cinema 30',
    collection: 'Reference 11.4 Channel 8K AV Receiver',
    tagline: 'The reference Marantz AV receiver, without compromise.',
    description:
      'Cinema 30 is Marantz’s most sophisticated AV receiver, engineered with proprietary HDAM circuitry refined over decades. Eleven amplified channels, full 8K connectivity and HEOS streaming bring reference home cinema to the most demanding rooms.',
    metaDescription:
      'Marantz Cinema 30 reference 11.4 channel 8K AV receiver with Dolby Atmos, DTS:X Pro and HEOS. Distributed and supported across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Cinema 30', 'Cinema 30 AV receiver', 'Marantz Cinema 30 UAE', 'Marantz Cinema 30 Pakistan', '11.4 channel AV receiver'],
    hero: '/products/marantz/cinema-30.png',
    finishes: [mzBlack('/products/marantz/cinema-30.png'), mzSilverGold('/products/marantz/cinema-30-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '11.4' },
        { name: 'Power', value: '140 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'cinema-40',
    brandSlug: 'marantz',
    name: 'Cinema 40',
    collection: 'Reference 9.4 Channel 8K AV Receiver',
    tagline: 'Reference-level immersion for the finest home theaters.',
    description:
      'Cinema 40 delivers reference-tier home cinema with nine amplified channels at 125 watts each. Extensive 8K connectivity, IMAX Enhanced and Dirac-ready calibration make it the heart of an uncompromising theatre.',
    metaDescription:
      'Marantz Cinema 40 reference 9.4 channel 8K AV receiver, 125W per channel with Dolby Atmos and Audyssey XT32. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Cinema 40', 'Cinema 40 AV receiver', 'Marantz Cinema 40 UAE', 'Marantz Cinema 40 Pakistan', '9.4 channel 8K receiver'],
    hero: '/products/marantz/cinema-40.png',
    finishes: [mzBlack('/products/marantz/cinema-40.png'), mzSilverGold('/products/marantz/cinema-40-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '9.4' },
        { name: 'Power', value: '125 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'cinema-50',
    brandSlug: 'marantz',
    name: 'Cinema 50',
    collection: 'Premium 9.4 Channel 8K AV Receiver',
    tagline: 'Premium theater performance, timeless Marantz design.',
    description:
      'Cinema 50 blends timeless Marantz design with contemporary immersive audio across nine amplified channels at 110 watts. With full 8K connectivity it suits dedicated cinema spaces and elevated living rooms alike.',
    metaDescription:
      'Marantz Cinema 50 premium 9.4 channel 8K AV receiver, 110W per channel with Dolby Atmos and Audyssey XT32. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Cinema 50', 'Cinema 50 AV receiver', 'Marantz Cinema 50 UAE', 'Marantz Cinema 50 Pakistan', '9.4 channel AV receiver'],
    hero: '/products/marantz/cinema-50.png',
    finishes: [mzBlack('/products/marantz/cinema-50.png'), mzSilverGold('/products/marantz/cinema-50-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '9.4' },
        { name: 'Power', value: '110 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'cinema-60',
    brandSlug: 'marantz',
    name: 'Cinema 60',
    collection: 'Premium 7.2 Channel 8K AV Receiver',
    tagline: 'Luxury home theater with timeless design.',
    description:
      'Cinema 60 brings foundational luxury home theatre with warm, spacious Marantz sound across seven channels at 100 watts. Comprehensive immersive audio and 8K support arrive in an elegant, intuitive package for modern living spaces.',
    metaDescription:
      'Marantz Cinema 60 premium 7.2 channel 8K AV receiver with Dolby Atmos, DTS:X and HEOS streaming. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Cinema 60', 'Cinema 60 AV receiver', 'Marantz Cinema 60 UAE', 'Marantz Cinema 60 Pakistan', '7.2 channel AV receiver'],
    hero: '/products/marantz/cinema-60.png',
    finishes: [mzBlack('/products/marantz/cinema-60.png'), mzSilverGold('/products/marantz/cinema-60-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '7.2' },
        { name: 'Power', value: '100 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / 2 out' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X, Hi-Res Audio' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'cinema-70s',
    brandSlug: 'marantz',
    name: 'Cinema 70s',
    collection: 'Slimline 7.2 Channel 8K AV Receiver',
    tagline: 'Premium theater performance in a slimline chassis.',
    description:
      'Cinema 70s delivers refined surround sound in a slim chassis that fits where conventional receivers cannot. Seven channels at 50 watts, modern immersive formats and an all-new graphical interface make it ideal for discreet installations.',
    metaDescription:
      'Marantz Cinema 70s slimline 7.2 channel 8K AV receiver with Dolby Atmos and HEOS streaming. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Cinema 70s', 'Cinema 70s AV receiver', 'Marantz Cinema 70s UAE', 'Marantz Cinema 70s Pakistan', 'slimline AV receiver'],
    hero: '/products/marantz/cinema-70s.png',
    finishes: [mzBlack('/products/marantz/cinema-70s.png'), mzSilverGold('/products/marantz/cinema-70s-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '7.2' },
        { name: 'Power', value: '50 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / eARC out' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X, Dolby TrueHD' },
      ] },
      { label: 'Streaming', rows: [
        { name: 'HEOS', value: 'Built-in' },
        { name: 'Services', value: 'Spotify, TIDAL, Amazon Music HD' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'stereo-70s',
    brandSlug: 'marantz',
    name: 'Stereo 70s',
    collection: 'Slimline Stereo Network Receiver',
    tagline: 'Two-channel simplicity, home cinema flexibility.',
    description:
      'Stereo 70s merges two-channel simplicity with home theatre flexibility in an elegant slimline chassis. HEOS streaming, 8K HDMI connectivity and 75 watts per channel let it anchor a refined music and television system.',
    metaDescription:
      'Marantz Stereo 70s slimline stereo network receiver, 75W per channel with 8K HDMI, HEOS and phono input. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Stereo 70s', 'Stereo 70s receiver', 'Marantz Stereo 70s UAE', 'Marantz Stereo 70s Pakistan', 'stereo network receiver'],
    hero: '/products/marantz/stereo-70s.png',
    finishes: [mzBlack('/products/marantz/stereo-70s.png'), mzSilverGold('/products/marantz/stereo-70s-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '2 (+ dual subwoofer)' },
        { name: 'Power', value: '75 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in, 8K & ARC' },
        { name: 'Phono', value: 'MM input' },
      ] },
      { label: 'Streaming', rows: [
        { name: 'HEOS', value: 'Built-in' },
        { name: 'Services', value: 'Spotify, TIDAL, Amazon Music HD' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'av-10',
    brandSlug: 'marantz',
    name: 'AV 10',
    collection: '15.4 Channel Reference AV Processor',
    tagline: 'The apex of home cinema processing.',
    description:
      'AV 10 is Marantz’s reference home theatre processor, built in Shirakawa with proprietary HDAM circuitry. Fifteen channels of fully balanced output, immersive 8K formats and Dirac-ready calibration meet the most demanding installations.',
    metaDescription:
      'Marantz AV 10 reference 15.4 channel AV processor with fully balanced outputs, 8K HDMI and Dolby Atmos. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz AV 10', 'AV 10 processor', 'Marantz AV 10 UAE', 'Marantz AV 10 Pakistan', 'reference AV processor'],
    hero: '/products/marantz/av-10.png',
    finishes: [mzBlack('/products/marantz/av-10.png')],
    specs: [
      { label: 'Processing', rows: [
        { name: 'Channels', value: '15.4, fully balanced' },
        { name: 'Circuitry', value: 'Proprietary HDAM' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, MPEG-H, Auro-3D' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32 + Dirac' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'av-20',
    brandSlug: 'marantz',
    name: 'AV 20',
    collection: '13.4 Channel Balanced AV Preamplifier',
    tagline: 'Reference surround for custom installation.',
    description:
      'AV 20 is a thirteen-channel balanced AV preamplifier engineered for reference installations. Seven 8K HDMI inputs, full immersive format support and HEOS streaming deliver precise, room-corrected cinema sound.',
    metaDescription:
      'Marantz AV 20 reference 13.4 channel balanced AV preamplifier with 8K HDMI, Dolby Atmos and Audyssey XT32. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz AV 20', 'AV 20 preamplifier', 'Marantz AV 20 UAE', 'Marantz AV 20 Pakistan', 'balanced AV preamplifier'],
    hero: '/products/marantz/av-20.png',
    finishes: [mzBlack('/products/marantz/av-20.png')],
    specs: [
      { label: 'Processing', rows: [
        { name: 'Channels', value: '13.4, balanced' },
        { name: 'Circuitry', value: 'Marantz HDAM' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'av-30',
    brandSlug: 'marantz',
    name: 'AV 30',
    collection: '11.4 Channel Balanced AV Preamplifier',
    tagline: 'Cinema-grade processing with immersive streaming.',
    description:
      'AV 30 is an eleven-channel balanced AV preamplifier delivering cinema-quality sound to dedicated theatres. Marantz HDAM circuitry, 8K-ready HDMI and HEOS streaming combine with comprehensive surround format support.',
    metaDescription:
      'Marantz AV 30 reference 11.4 channel balanced AV preamplifier with 8K HDMI, Dolby Atmos and Audyssey XT32. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz AV 30', 'AV 30 preamplifier', 'Marantz AV 30 UAE', 'Marantz AV 30 Pakistan', 'balanced AV preamplifier'],
    hero: '/products/marantz/av-30.png',
    finishes: [mzBlack('/products/marantz/av-30.png')],
    specs: [
      { label: 'Processing', rows: [
        { name: 'Channels', value: '11.4, balanced' },
        { name: 'Circuitry', value: 'Marantz HDAM' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32 + Dirac' },
        { name: 'Streaming', value: 'HEOS, Roon Ready' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'amp-10',
    brandSlug: 'marantz',
    name: 'AMP 10',
    collection: '16-Channel Reference Power Amplifier',
    tagline: 'Sixteen channels of reference amplification.',
    description:
      'AMP 10 is a sixteen-channel reference power amplifier delivering 200 watts per channel with custom HDAM technology. Built in Shirakawa, Japan, it pairs Marantz’s signature musicality with the channel count and headroom flagship cinema demands.',
    metaDescription:
      'Marantz AMP 10 sixteen-channel reference power amplifier, 200W per channel with custom HDAM. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz AMP 10', 'AMP 10 amplifier', 'Marantz AMP 10 UAE', 'Marantz AMP 10 Pakistan', '16 channel power amplifier'],
    hero: '/products/marantz/amp-10.png',
    finishes: [mzBlack('/products/marantz/amp-10.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '16' },
        { name: 'Power', value: '200 W/ch (8Ω)' },
      ] },
      { label: 'Engineering', rows: [
        { name: 'Amplification', value: 'Custom HDAM-SA2, Class D' },
        { name: 'Build', value: 'Crafted in Shirakawa, Japan' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Inputs', value: 'Balanced & unbalanced analog' },
        { name: 'Control', value: 'RS-232, trigger' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'amp-20',
    brandSlug: 'marantz',
    name: 'AMP 20',
    collection: '12-Channel Reference Power Amplifier',
    tagline: 'Master-level power for premium home theater.',
    description:
      'AMP 20 is a twelve-channel reference power amplifier delivering 200 watts per channel through custom Class D amplification. Hand-tuned in Japan with a copper-plated chassis, it partners with the AV 20 for elite cinema systems.',
    metaDescription:
      'Marantz AMP 20 twelve-channel reference power amplifier, 200W per channel with HDAM-SA2 and copper-plated chassis. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz AMP 20', 'AMP 20 amplifier', 'Marantz AMP 20 UAE', 'Marantz AMP 20 Pakistan', '12 channel power amplifier'],
    hero: '/products/marantz/amp-20.png',
    finishes: [mzBlack('/products/marantz/amp-20.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '12' },
        { name: 'Power', value: '200 W/ch (8Ω), 400 W (4Ω)' },
      ] },
      { label: 'Engineering', rows: [
        { name: 'Amplification', value: 'Custom Class D, HDAM-SA2' },
        { name: 'Build', value: 'Copper-plated chassis' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Inputs', value: 'Balanced & unbalanced' },
        { name: 'Control', value: 'SPKT-1+ terminals, RS-232' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'amp-30',
    brandSlug: 'marantz',
    name: 'AMP 30',
    collection: '6-Channel Power Amplifier',
    tagline: 'Flexible power for expanding systems.',
    description:
      'AMP 30 is a slimline six-channel power amplifier delivering 200 watts per channel. Built in Shirakawa with exclusive HDAM and Class D amplification, it extends AV separates or stacks with other AMP models to scale any high-performance system.',
    metaDescription:
      'Marantz AMP 30 slimline six-channel power amplifier, 200W per channel with exclusive HDAM. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz AMP 30', 'AMP 30 amplifier', 'Marantz AMP 30 UAE', 'Marantz AMP 30 Pakistan', '6 channel power amplifier'],
    hero: '/products/marantz/amp-30.png',
    finishes: [mzBlack('/products/marantz/amp-30.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '6' },
        { name: 'Power', value: '200 W/ch (8Ω), 400 W (4Ω)' },
      ] },
      { label: 'Engineering', rows: [
        { name: 'Amplification', value: 'Exclusive HDAM, Class D' },
        { name: 'Build', value: 'Crafted in Shirakawa, Japan' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Modes', value: 'BTL / Bi-Amp' },
        { name: 'Control', value: 'RS-232, trigger' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'm-cr612',
    brandSlug: 'marantz',
    name: 'M-CR612',
    collection: 'Compact Network CD Receiver',
    tagline: 'All-in-one streaming and CD, refined.',
    description:
      'M-CR612 is a compact all-in-one network CD receiver that brings refined Marantz sound to any room. CD playback, HEOS multi-room streaming and flexible connectivity arrive in an elegant, space-efficient design.',
    metaDescription:
      'Marantz M-CR612 compact network CD receiver with HEOS multi-room streaming, AirPlay 2 and 60W per channel. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz M-CR612', 'M-CR612 network CD receiver', 'Marantz M-CR612 UAE', 'Marantz M-CR612 Pakistan', 'compact network receiver'],
    hero: '/products/marantz/m-cr612.png',
    finishes: [mzBlack('/products/marantz/m-cr612.png'), mzSilverGold('/products/marantz/m-cr612-silver.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Power', value: '60 W/ch (2-channel)' },
        { name: 'Disc', value: 'CD, CD-R, CD-RW' },
      ] },
      { label: 'Streaming', rows: [
        { name: 'HEOS', value: 'Built-in, multi-room' },
        { name: 'Services', value: 'Spotify, TIDAL, Amazon Music' },
      ] },
      { label: 'Wireless', rows: [
        { name: 'Connectivity', value: 'Wi-Fi, Bluetooth, AirPlay 2' },
        { name: 'Network', value: 'Ethernet' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'cd6007',
    brandSlug: 'marantz',
    name: 'CD6007',
    collection: 'CD Player',
    tagline: 'Masterfully recreated audio, slimline design.',
    description:
      'CD6007 lets you enjoy masterfully recreated audio from CD and USB sources with high-resolution support. Custom HDAM output and precision conversion deliver refined Marantz sound in a slimline chassis.',
    metaDescription:
      'Marantz CD6007 CD player with custom HDAM, 192kHz/24-bit and DSD playback from CD and USB. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz CD6007', 'CD6007 CD player', 'Marantz CD6007 UAE', 'Marantz CD6007 Pakistan', 'hi-res CD player'],
    hero: '/products/marantz/cd6007.png',
    finishes: [mzBlack('/products/marantz/cd6007.png'), mzSilverGold('/products/marantz/cd6007-silver.png')],
    specs: [
      { label: 'Conversion', rows: [
        { name: 'D/A', value: '192 kHz / 24-bit' },
        { name: 'Output stage', value: 'Custom HDAM buffer' },
      ] },
      { label: 'Playback', rows: [
        { name: 'Media', value: 'CD, CD-R/RW, USB' },
        { name: 'Formats', value: 'WAV, FLAC, ALAC, DSD' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Outputs', value: 'RCA, optical, coaxial, headphone' },
        { name: 'Build', value: 'Metal panel, toroidal transformer' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'link-10n',
    brandSlug: 'marantz',
    name: 'LINK 10n',
    collection: 'Reference Streaming Preamplifier',
    tagline: 'Reference streaming meets high-end craft.',
    description:
      'LINK 10n is a reference-class streaming preamplifier engineered with the technology and artisanship of the 10 Series. A fully balanced architecture, advanced conversion and a full-color HD display make it a complete front-end for high-performance stereo.',
    metaDescription:
      'Marantz LINK 10n reference streaming preamplifier with fully balanced architecture, HEOS, Roon Ready and phono input. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz LINK 10n', 'LINK 10n streamer', 'Marantz LINK 10n UAE', 'Marantz LINK 10n Pakistan', 'reference streaming preamplifier'],
    hero: '/products/marantz/link-10n.png',
    finishes: [mzBlack('/products/marantz/link-10n.png')],
    specs: [
      { label: 'Architecture', rows: [
        { name: 'Design', value: 'Fully balanced 2.1' },
        { name: 'Chassis', value: 'Copper-plated, triple-layer' },
      ] },
      { label: 'Conversion', rows: [
        { name: 'D/A', value: 'MMM-Conversion, async USB' },
        { name: 'Display', value: 'Full-color HD TFT' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Inputs', value: 'XLR, RCA, optical, coaxial, HDMI ARC, phono' },
        { name: 'Streaming', value: 'HEOS, Roon Ready, Qobuz' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'model-10',
    brandSlug: 'marantz',
    name: 'MODEL 10',
    collection: 'Reference Integrated Amplifier',
    tagline: 'The most powerful integrated Marantz has made.',
    description:
      'MODEL 10 is Marantz’s new reference integrated amplifier, delivering 250 watts per channel through a fully balanced dual-mono topology and an all-new Marantz SMPS. A triple-layer copper-plated chassis and iconic design are crafted in Shirakawa, Japan.',
    metaDescription:
      'Marantz MODEL 10 reference integrated amplifier, 250W per channel with dual-mono Class D and all-new SMPS. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz MODEL 10', 'MODEL 10 integrated amplifier', 'Marantz MODEL 10 UAE', 'Marantz MODEL 10 Pakistan', 'reference integrated amplifier'],
    hero: '/products/marantz/model-10.png',
    finishes: [mzSilverGold('/products/marantz/model-10.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Power', value: '250 W/ch (8Ω)' },
        { name: 'Topology', value: 'Balanced dual-mono Class D' },
      ] },
      { label: 'Engineering', rows: [
        { name: 'Power supply', value: 'All-new Marantz SMPS' },
        { name: 'Chassis', value: 'Triple-layer copper-plated' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'Inputs', value: '4 RCA, 2 XLR balanced, phono MM/MC' },
        { name: 'Controls', value: 'HD TFT display, remote' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'grand-horizon',
    brandSlug: 'marantz',
    name: 'Grand Horizon',
    collection: 'Flagship Wireless Speaker · HEOS Built-in',
    tagline: 'The flagship wireless speaker, sculpted as an object of desire.',
    description:
      'Grand Horizon is Marantz’s flagship wireless speaker — a sculptural sphere wrapped in seamless Radiance fabric. An 8" Gravity woofer, four wideband and three high-frequency drivers are powered by 370 watts of Marantz Rise GaN amplification, streamed through HEOS.',
    metaDescription:
      'Marantz Grand Horizon flagship wireless speaker with 370W GaN amplification, HEOS, AirPlay 2 and HDMI eARC. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Grand Horizon', 'Grand Horizon wireless speaker', 'Marantz Grand Horizon UAE', 'Marantz Grand Horizon Pakistan', 'luxury wireless speaker'],
    hero: '/products/marantz/grand-horizon.png',
    finishes: [
      {
        id: 'midnight-sky',
        name: 'Midnight Sky',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/marantz/grand-horizon.png',
      },
    ],
    specs: [
      { label: 'Acoustics', rows: [
        { name: 'Drivers', value: '8" Gravity woofer, 4× 3" wideband, 3× 1" HF' },
        { name: 'Power', value: '370 W FTC (860 W peak), Marantz Rise GaN' },
      ] },
      { label: 'Streaming & Inputs', rows: [
        { name: 'Streaming', value: 'HEOS, AirPlay 2, Bluetooth 5.4' },
        { name: 'Inputs', value: 'HDMI eARC, optical, RCA, USB-C' },
      ] },
      { label: 'Design', rows: [
        { name: 'Finish', value: 'Radiance 360° seamless fabric' },
        { name: 'Weight', value: '21.3 kg' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'horizon',
    brandSlug: 'marantz',
    name: 'Horizon',
    collection: 'Reference Wireless Speaker · HEOS Built-in',
    tagline: 'Reference Marantz sound, freed from the rack.',
    description:
      'Horizon distils seventy years of Marantz voicing into a single sculptural wireless speaker. A 6.5" Gravity driver, three wideband and two high-frequency drivers are driven by 310 watts of Rise GaN amplification, with HEOS streaming and HDMI eARC for television sound.',
    metaDescription:
      'Marantz Horizon reference wireless speaker with 310W GaN amplification, HEOS, AirPlay 2 and HDMI eARC. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Marantz Horizon', 'Horizon wireless speaker', 'Marantz Horizon UAE', 'Marantz Horizon Pakistan', 'premium wireless speaker'],
    hero: '/products/marantz/horizon.png',
    finishes: [
      {
        id: 'midnight-sky',
        name: 'Midnight Sky',
        swatch: 'linear-gradient(135deg,#2a2a2a,#0a0a0a)',
        productImage: '/products/marantz/horizon.png',
      },
    ],
    specs: [
      { label: 'Acoustics', rows: [
        { name: 'Drivers', value: '6.5" Gravity woofer, 3× 2" wideband, 2× 1" HF' },
        { name: 'Power', value: '310 W FTC (745 W peak), Marantz Rise GaN' },
      ] },
      { label: 'Streaming & Inputs', rows: [
        { name: 'Streaming', value: 'HEOS, AirPlay 2, Bluetooth 5.4' },
        { name: 'Inputs', value: 'HDMI eARC, optical, RCA' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '30 Hz – 20 kHz (±3 dB)' },
        { name: 'Max SPL', value: '104 dB @ 1 m' },
      ] },
    ],
    inUse: mzInUse,
  },
  {
    slug: 'horizon-tripod',
    brandSlug: 'marantz',
    name: 'Horizon Tripod',
    collection: 'Horizon Accessory',
    tagline: 'American walnut and cast iron, at listening height.',
    description:
      'Elegantly crafted from American walnut and robust cast iron with a satin black finish, the tripod places the Marantz Horizon at the ideal height for listening. Its walnut legs recall the cabinets of iconic Marantz amplifiers of the past.',
    metaDescription:
      'Marantz Horizon Tripod in American walnut and cast iron — the optional stand for the Horizon wireless speaker. Available in the UAE and Pakistan via Leading IT.',
    keywords: ['Marantz Horizon Tripod', 'Horizon speaker stand', 'Marantz Horizon Tripod UAE', 'Marantz Horizon Tripod Pakistan'],
    hero: '/products/marantz/horizon-tripod.png',
    finishes: [
      {
        id: 'walnut',
        name: 'American Walnut',
        swatch: 'linear-gradient(135deg,#8b6a4f,#4a3526)',
        productImage: '/products/marantz/horizon-tripod.png',
      },
    ],
    specs: [
      { label: 'Construction', rows: [
        { name: 'Legs', value: 'Solid American walnut' },
        { name: 'Core', value: 'Cast iron, satin black' },
      ] },
      { label: 'Compatibility', rows: [
        { name: 'Speaker', value: 'Marantz Horizon' },
        { name: 'Placement', value: 'Optimal listening height' },
      ] },
    ],
    inUse: mzInUse,
  },

  // ─── JVC ──────────────────────────────────────────────────────────────────
  {
    slug: 'dla-nz900',
    brandSlug: 'jvc',
    name: 'DLA-NZ900',
    collection: 'Flagship 8K D-ILA Laser Projector',
    tagline: 'The reference by which private cinema is measured.',
    description:
      'DLA-NZ900 is JVC’s flagship projector — three native 4K D-ILA devices with 8K/e-shiftX, a 3,300-lumen BLU-Escent laser and 150,000:1 native contrast behind a 100 mm all-glass lens. The final word in dedicated home cinema.',
    metaDescription:
      'JVC DLA-NZ900 flagship 8K D-ILA laser projector — 3,300 lumens, 150,000:1 native contrast, HDR10+. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['JVC DLA-NZ900', 'DLA-NZ900 projector', 'JVC NZ900 UAE', 'JVC NZ900 Pakistan', '8K home cinema projector'],
    hero: '/products/jvc/dla-nz900.png',
    finishes: [mzBlack('/products/jvc/dla-nz900.png')],
    specs: [
      { label: 'Imaging', rows: [
        { name: 'Device', value: '3× 0.69" native 4K D-ILA, 8K/e-shiftX' },
        { name: 'Contrast', value: '150,000:1 native' },
      ] },
      { label: 'Light & Optics', rows: [
        { name: 'Source', value: 'BLU-Escent laser, 3,300 lm' },
        { name: 'Lens', value: '100 mm all-glass, powered shift' },
      ] },
      { label: 'Video', rows: [
        { name: 'Inputs', value: '2× HDMI 48 Gbps, 8K60 / 4K120' },
        { name: 'HDR', value: 'HDR10+, Frame Adapt HDR' },
      ] },
    ],
    inUse: jvInUse,
  },
  {
    slug: 'dla-nz800',
    brandSlug: 'jvc',
    name: 'DLA-NZ800',
    collection: 'Reference 8K D-ILA Laser Projector',
    tagline: 'Reference 8K projection for dedicated theaters.',
    description:
      'DLA-NZ800 brings JVC’s reference imaging to dedicated theatres — native 4K D-ILA with 8K/e-shiftX, a 2,700-lumen BLU-Escent laser and 100,000:1 native contrast, with second-generation Frame Adapt HDR for disc and streaming alike.',
    metaDescription:
      'JVC DLA-NZ800 reference 8K D-ILA laser projector — 2,700 lumens, 100,000:1 native contrast, HDR10+. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['JVC DLA-NZ800', 'DLA-NZ800 projector', 'JVC NZ800 UAE', 'JVC NZ800 Pakistan', '8K laser projector'],
    hero: '/products/jvc/dla-nz800.png',
    finishes: [mzBlack('/products/jvc/dla-nz800.png')],
    specs: [
      { label: 'Imaging', rows: [
        { name: 'Device', value: '3× 0.69" native 4K D-ILA, 8K/e-shiftX' },
        { name: 'Contrast', value: '100,000:1 native' },
      ] },
      { label: 'Light & Optics', rows: [
        { name: 'Source', value: 'BLU-Escent laser, 2,700 lm' },
        { name: 'Lens', value: '65 mm all-glass, powered shift' },
      ] },
      { label: 'Video', rows: [
        { name: 'Inputs', value: '2× HDMI 48 Gbps, 8K60 / 4K120' },
        { name: 'HDR', value: 'HDR10+, Frame Adapt HDR 2' },
      ] },
    ],
    inUse: jvInUse,
  },
  {
    slug: 'dla-nz700',
    brandSlug: 'jvc',
    name: 'DLA-NZ700',
    collection: 'Native 4K D-ILA Laser Projector',
    tagline: 'Native 4K D-ILA in a refined, compact body.',
    description:
      'DLA-NZ700 delivers true native 4K D-ILA imaging from a compact chassis — a 2,300-lumen BLU-Escent laser, 80,000:1 native contrast and HDR10+ with Frame Adapt HDR bring genuine cinema depth to more rooms.',
    metaDescription:
      'JVC DLA-NZ700 native 4K D-ILA laser projector — 2,300 lumens, 80,000:1 native contrast, HDR10+. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['JVC DLA-NZ700', 'DLA-NZ700 projector', 'JVC NZ700 UAE', 'JVC NZ700 Pakistan', '4K laser projector'],
    hero: '/products/jvc/dla-nz700.png',
    finishes: [mzBlack('/products/jvc/dla-nz700.png')],
    specs: [
      { label: 'Imaging', rows: [
        { name: 'Device', value: '3× 0.69" native 4K D-ILA' },
        { name: 'Contrast', value: '80,000:1 native' },
      ] },
      { label: 'Light & Optics', rows: [
        { name: 'Source', value: 'BLU-Escent laser, 2,300 lm' },
        { name: 'Lens', value: '65 mm all-glass, powered shift' },
      ] },
      { label: 'Video', rows: [
        { name: 'Inputs', value: '2× HDMI, 4K60 4:4:4' },
        { name: 'HDR', value: 'HDR10+, Frame Adapt HDR' },
      ] },
    ],
    inUse: jvInUse,
  },
  {
    slug: 'dla-nz500',
    brandSlug: 'jvc',
    name: 'DLA-NZ500',
    collection: 'Native 4K D-ILA Laser Projector',
    tagline: 'The gateway to genuine D-ILA cinema.',
    description:
      'DLA-NZ500 opens the door to genuine JVC cinema — native 4K D-ILA imaging, a 2,000-lumen BLU-Escent laser and 40,000:1 native contrast in the same compact chassis as the NZ700, with HDR10+ support throughout.',
    metaDescription:
      'JVC DLA-NZ500 native 4K D-ILA laser projector — 2,000 lumens, 40,000:1 native contrast, HDR10+. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['JVC DLA-NZ500', 'DLA-NZ500 projector', 'JVC NZ500 UAE', 'JVC NZ500 Pakistan', '4K D-ILA projector'],
    hero: '/products/jvc/dla-nz500.png',
    finishes: [mzBlack('/products/jvc/dla-nz500.png')],
    specs: [
      { label: 'Imaging', rows: [
        { name: 'Device', value: '3× 0.69" native 4K D-ILA' },
        { name: 'Contrast', value: '40,000:1 native' },
      ] },
      { label: 'Light & Optics', rows: [
        { name: 'Source', value: 'BLU-Escent laser, 2,000 lm' },
        { name: 'Lens', value: 'All-glass, powered shift' },
      ] },
      { label: 'Video', rows: [
        { name: 'Inputs', value: '2× HDMI, 4K60 4:4:4' },
        { name: 'HDR', value: 'HDR10+, Frame Adapt HDR' },
      ] },
    ],
    inUse: jvInUse,
  },
  {
    slug: 'lx-nz30',
    brandSlug: 'jvc',
    name: 'LX-NZ30',
    collection: '4K Laser DLP Projector',
    tagline: 'Bright 4K laser projection for living spaces.',
    description:
      'LX-NZ30 brings JVC picture science to bright, multi-purpose rooms — a 3,300-lumen BLU-Escent laser drives a 4K DLP engine with HDR10+ and JVC’s acclaimed auto-tone-mapping, in a compact body that installs anywhere.',
    metaDescription:
      'JVC LX-NZ30 4K laser DLP projector — 3,300 lumens, HDR10+, BLU-Escent laser light source. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['JVC LX-NZ30', 'LX-NZ30 projector', 'JVC LX-NZ30 UAE', 'JVC LX-NZ30 Pakistan', '4K laser projector'],
    hero: '/products/jvc/lx-nz30.png',
    finishes: [mzBlack('/products/jvc/lx-nz30.png'), pkWhite('/products/jvc/lx-nz30-white.png')],
    specs: [
      { label: 'Imaging', rows: [
        { name: 'Device', value: '0.47" DLP, 4K UHD' },
        { name: 'Brightness', value: '3,300 lm' },
      ] },
      { label: 'Light Source', rows: [
        { name: 'Source', value: 'BLU-Escent laser' },
        { name: 'Life', value: 'Approx. 20,000 h' },
      ] },
      { label: 'Video', rows: [
        { name: 'Inputs', value: '2× HDMI, 4K60' },
        { name: 'HDR', value: 'HDR10+, auto tone mapping' },
      ] },
    ],
    inUse: jvInUse,
  },

  // ─── Denon ────────────────────────────────────────────────────────────────
  {
    slug: 'avc-a1h',
    brandSlug: 'denon',
    name: 'AVC-A1H',
    collection: 'Flagship 15.4 Channel 8K AV Amplifier',
    tagline: 'The most powerful AV amplifier Denon has ever built.',
    description:
      'AVC-A1H is Denon’s flagship — fifteen channels of amplification, the largest transformer in the company’s history and a 9.4.6 immersive configuration, designed and manufactured at Denon’s facility in Shirakawa, Japan.',
    metaDescription:
      'Denon AVC-A1H flagship 15.4 channel 8K AV amplifier, 150W per channel with Dolby Atmos, DTS:X Pro and Auro-3D. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-A1H', 'AVC-A1H amplifier', 'Denon A1H UAE', 'Denon A1H Pakistan', '15.4 channel AV amplifier'],
    hero: '/products/denon/avc-a1h.png',
    finishes: [mzBlack('/products/denon/avc-a1h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '15.4 (up to 9.4.6)' },
        { name: 'Power', value: '150 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avc-a10h',
    brandSlug: 'denon',
    name: 'AVC-A10H',
    collection: 'Reference 13.4 Channel 8K AV Amplifier',
    tagline: 'Reference immersion, crafted in Japan.',
    description:
      'AVC-A10H drives up to thirteen speakers and four subwoofers at 150 watts per channel. Dolby Atmos, DTS:X Pro, IMAX Enhanced and Auro-3D meet audiophile-grade parts selection and Japanese craftsmanship.',
    metaDescription:
      'Denon AVC-A10H reference 13.4 channel 8K AV amplifier, 150W per channel with Dolby Atmos and DTS:X Pro. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-A10H', 'AVC-A10H amplifier', 'Denon A10H UAE', 'Denon A10H Pakistan', '13.4 channel AV amplifier'],
    hero: '/products/denon/avc-a10h.png',
    finishes: [mzBlack('/products/denon/avc-a10h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '13.4' },
        { name: 'Power', value: '150 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avc-x8500h',
    brandSlug: 'denon',
    name: 'AVC-X8500H',
    collection: 'Flagship 13.2 Channel AV Amplifier',
    tagline: 'The world’s first 13.2 channel AV amplifier.',
    description:
      'AVC-X8500H redefined what a single chassis could do — the world’s first thirteen-channel AV amplifier, delivering 150 watts per channel with monolithic amplifier construction and full immersive format support for the grandest theatres.',
    metaDescription:
      'Denon AVC-X8500H flagship 13.2 channel AV amplifier, 150W per channel with Dolby Atmos, DTS:X and Auro-3D. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-X8500H', 'AVC-X8500H amplifier', 'Denon X8500H UAE', 'Denon X8500H Pakistan', '13.2 channel AV amplifier'],
    hero: '/products/denon/avc-x8500h.png',
    finishes: [mzBlack('/products/denon/avc-x8500h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '13.2' },
        { name: 'Power', value: '150 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '8 in / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avc-x6800h',
    brandSlug: 'denon',
    name: 'AVC-X6800H',
    collection: '11.4 Channel 8K AV Amplifier',
    tagline: 'Eleven channels of theater-grade authority.',
    description:
      'AVC-X6800H commands large theatres with eleven amplified channels at 140 watts each. Full 8K connectivity, four independent subwoofer outputs and Dirac-ready calibration bring flagship capability within reach.',
    metaDescription:
      'Denon AVC-X6800H 11.4 channel 8K AV amplifier, 140W per channel with Dolby Atmos, DTS:X Pro and HEOS. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-X6800H', 'AVC-X6800H amplifier', 'Denon X6800H UAE', 'Denon X6800H Pakistan', '11.4 channel AV amplifier'],
    hero: '/products/denon/avc-x6800h.png',
    finishes: [mzBlack('/products/denon/avc-x6800h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '11.4' },
        { name: 'Power', value: '140 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in (all 8K) / 3 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avc-x4800h',
    brandSlug: 'denon',
    name: 'AVC-X4800H',
    collection: '9.4 Channel 8K AV Amplifier',
    tagline: 'Breathtaking 3D audio for larger living spaces.',
    description:
      'Designed and manufactured in Japan, AVC-X4800H drives 9.4 channels of amplification at 125 watts each. Dolby Atmos, DTS:X Pro, IMAX Enhanced and Auro-3D envelop larger living spaces in breathtaking three-dimensional sound.',
    metaDescription:
      'Denon AVC-X4800H 9.4 channel 8K AV amplifier, 125W per channel with Dolby Atmos and DTS:X Pro. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-X4800H', 'AVC-X4800H amplifier', 'Denon X4800H UAE', 'Denon X4800H Pakistan', '9.4 channel AV amplifier'],
    hero: '/products/denon/avc-x4800h.png',
    finishes: [mzBlack('/products/denon/avc-x4800h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '9.4' },
        { name: 'Power', value: '125 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '7 in / 3 out, 8K & eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X Pro, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avc-x3800h',
    brandSlug: 'denon',
    name: 'AVC-X3800H',
    collection: '9.4 Channel 8K AV Amplifier',
    tagline: 'The custom-install favourite, four subwoofers deep.',
    description:
      'AVC-X3800H pairs nine channels of amplification with up to four independent subwoofers — theatre-quality Dolby Atmos, DTS:X, IMAX Enhanced and Auro-3D with 8K video and HEOS streaming, in the channel layout integrators trust.',
    metaDescription:
      'Denon AVC-X3800H 9.4 channel 8K AV amplifier, 105W per channel with Dolby Atmos and four subwoofer outputs. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-X3800H', 'AVC-X3800H amplifier', 'Denon X3800H UAE', 'Denon X3800H Pakistan', '9.4 channel AV amplifier'],
    hero: '/products/denon/avc-x3800h.png',
    finishes: [mzBlack('/products/denon/avc-x3800h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '9.4 (11.4 processing)' },
        { name: 'Power', value: '105 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in / 3 out, 8K & eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X, Auro-3D, IMAX Enhanced' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT32, Dirac-ready' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avr-x2800h',
    brandSlug: 'denon',
    name: 'AVR-X2800H',
    collection: '7.2 Channel 8K AV Receiver',
    tagline: 'Refined immersion for medium-size rooms.',
    description:
      'AVR-X2800H fills medium-size rooms with refined 7.2 or 5.2.2 surround sound. Dolby Atmos, DTS:X and incredible 8K video meet HEOS streaming for whole-home music.',
    metaDescription:
      'Denon AVR-X2800H 7.2 channel 8K AV receiver, 95W per channel with Dolby Atmos, DTS:X and HEOS. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVR-X2800H', 'AVR-X2800H receiver', 'Denon X2800H UAE', 'Denon X2800H Pakistan', '7.2 channel AV receiver'],
    hero: '/products/denon/avr-x2800h.png',
    finishes: [mzBlack('/products/denon/avr-x2800h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '7.2' },
        { name: 'Power', value: '95 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / 2 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ XT' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avr-x1800h',
    brandSlug: 'denon',
    name: 'AVR-X1800H',
    collection: '7.2 Channel 8K AV Receiver',
    tagline: 'The effortless entry to true home theater.',
    description:
      'AVR-X1800H makes true home theatre effortless — seven amplified channels at 80 watts, Dolby Atmos and DTS:X, 8K-ready HDMI and HEOS streaming, with Denon’s guided setup assistant.',
    metaDescription:
      'Denon AVR-X1800H 7.2 channel 8K AV receiver, 80W per channel with Dolby Atmos and HEOS streaming. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVR-X1800H', 'AVR-X1800H receiver', 'Denon X1800H UAE', 'Denon X1800H Pakistan', '7.2 channel AV receiver'],
    hero: '/products/denon/avr-x1800h.png',
    finishes: [mzBlack('/products/denon/avr-x1800h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '7.2' },
        { name: 'Power', value: '80 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / 1 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X' },
      ] },
      { label: 'Calibration & Streaming', rows: [
        { name: 'Room correction', value: 'Audyssey MultEQ' },
        { name: 'Streaming', value: 'HEOS Built-in' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avr-s970h',
    brandSlug: 'denon',
    name: 'AVR-S970H',
    collection: '7.2 Channel 8K AV Receiver',
    tagline: 'Enveloping 3D audio, 8K-ready.',
    description:
      'AVR-S970H delivers enveloping 3D audio and incredible 8K video for medium-size rooms — 7.2 or 5.2.2 configurations with Dolby Atmos and DTS:X, plus HEOS streaming to share music through the home.',
    metaDescription:
      'Denon AVR-S970H 7.2 channel 8K AV receiver with Dolby Atmos, DTS:X and HEOS Built-in. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVR-S970H', 'AVR-S970H receiver', 'Denon S970H UAE', 'Denon S970H Pakistan', '7.2 channel 8K receiver'],
    hero: '/products/denon/avr-s970h.png',
    finishes: [mzBlack('/products/denon/avr-s970h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '7.2' },
        { name: 'Power', value: '90 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / 1 out, eARC' },
        { name: 'Formats', value: 'Dolby Atmos, DTS:X' },
      ] },
      { label: 'Streaming', rows: [
        { name: 'HEOS', value: 'Built-in' },
        { name: 'Wireless', value: 'Wi-Fi, Bluetooth, AirPlay 2' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avc-s670h',
    brandSlug: 'denon',
    name: 'AVC-S670H',
    collection: '5.2 Channel 8K AV Amplifier',
    tagline: 'The heart of an elegant 5.2 home theater.',
    description:
      'AVC-S670H is the heart of a refined 5.2 home theatre — incredible 8K video, high-definition Dolby TrueHD and DTS-HD Master Audio surround, and HEOS Built-in to stream music to wireless speakers in other rooms.',
    metaDescription:
      'Denon AVC-S670H 5.2 channel 8K AV amplifier with Dolby TrueHD, DTS-HD Master Audio and HEOS. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVC-S670H', 'AVC-S670H amplifier', 'Denon S670H UAE', 'Denon S670H Pakistan', '5.2 channel AV amplifier'],
    hero: '/products/denon/avc-s670h.png',
    finishes: [mzBlack('/products/denon/avc-s670h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '5.2' },
        { name: 'Power', value: '75 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / 1 out, eARC' },
        { name: 'Formats', value: 'Dolby TrueHD, DTS-HD Master Audio' },
      ] },
      { label: 'Streaming', rows: [
        { name: 'HEOS', value: 'Built-in' },
        { name: 'Wireless', value: 'Wi-Fi, Bluetooth, AirPlay 2' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avr-x580bt',
    brandSlug: 'denon',
    name: 'AVR-X580BT',
    collection: '5.2 Channel 8K AV Receiver · Bluetooth',
    tagline: 'True surround sound for smaller spaces.',
    description:
      'AVR-X580BT brings movies to life in smaller spaces — 5.2-channel surround with amazing 8K picture quality, Dolby TrueHD and DTS-HD decoding, and wireless music streaming via Bluetooth.',
    metaDescription:
      'Denon AVR-X580BT 5.2 channel 8K AV receiver with Dolby TrueHD, DTS-HD and Bluetooth streaming. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVR-X580BT', 'AVR-X580BT receiver', 'Denon X580BT UAE', 'Denon X580BT Pakistan', '5.2 channel 8K receiver'],
    hero: '/products/denon/avr-x580bt.png',
    finishes: [mzBlack('/products/denon/avr-x580bt.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '5.2' },
        { name: 'Power', value: '70 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '4 in / 1 out, 8K & eARC' },
        { name: 'Formats', value: 'Dolby TrueHD, DTS-HD' },
      ] },
      { label: 'Wireless & Gaming', rows: [
        { name: 'Streaming', value: 'Bluetooth' },
        { name: 'Gaming', value: 'VRR, ALLM, QFT' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'avr-x250bt',
    brandSlug: 'denon',
    name: 'AVR-X250BT',
    collection: '5.1 Channel 4K AV Receiver · Bluetooth',
    tagline: 'The essential first step into home cinema.',
    description:
      'AVR-X250BT is the essential first step into home cinema — 5.1-channel surround with full 4K, HDR and ARC support, five HDMI inputs and built-in Bluetooth for effortless music streaming.',
    metaDescription:
      'Denon AVR-X250BT 5.1 channel 4K AV receiver with HDR passthrough and Bluetooth streaming. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Denon AVR-X250BT', 'AVR-X250BT receiver', 'Denon X250BT UAE', 'Denon X250BT Pakistan', '5.1 channel AV receiver'],
    hero: '/products/denon/avr-x250bt.jpg',
    finishes: [mzBlack('/products/denon/avr-x250bt.jpg')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '5.1' },
        { name: 'Power', value: '130 W max/ch' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '5 in / 1 out, 4K & ARC' },
        { name: 'Video', value: '4K Ultra HD, HDR' },
      ] },
      { label: 'Wireless', rows: [
        { name: 'Streaming', value: 'Bluetooth' },
        { name: 'Setup', value: 'Denon Setup Assistant' },
      ] },
    ],
    inUse: dnInUse,
  },
  {
    slug: 'dra-900h',
    brandSlug: 'denon',
    name: 'DRA-900H',
    collection: '2.2 Channel 8K Stereo Network Receiver',
    tagline: 'Vinyl to 8K, through a two-channel soul.',
    description:
      'DRA-900H unites your music and movie collections in a two-channel system — vinyl, CD, hi-res files, Blu-ray and 8K sources through 100 watts per channel, with HEOS streaming to share it all through the home.',
    metaDescription:
      'Denon DRA-900H 2.2 channel 8K stereo network receiver, 100W per channel with phono input and HEOS. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Denon DRA-900H', 'DRA-900H receiver', 'Denon DRA-900H UAE', 'Denon DRA-900H Pakistan', 'stereo network receiver'],
    hero: '/products/denon/dra-900h.png',
    finishes: [mzBlack('/products/denon/dra-900h.png')],
    specs: [
      { label: 'Performance', rows: [
        { name: 'Channels', value: '2 (+ dual subwoofer)' },
        { name: 'Power', value: '100 W/ch (8Ω)' },
      ] },
      { label: 'Connectivity', rows: [
        { name: 'HDMI', value: '6 in (3× 8K) / 1 out, eARC' },
        { name: 'Phono', value: 'MM input' },
      ] },
      { label: 'Streaming', rows: [
        { name: 'HEOS', value: 'Built-in' },
        { name: 'Wireless', value: 'Wi-Fi, Bluetooth, AirPlay 2' },
      ] },
    ],
    inUse: dnInUse,
  },

  // ─── Polk Audio ───────────────────────────────────────────────────────────
  {
    slug: 'reserve-r700',
    brandSlug: 'polk-audio',
    name: 'Reserve R700',
    collection: 'Reserve Series · Flagship Tower',
    tagline: 'The cornerstone of the ultimate home cinema.',
    description:
      'Reserve R700 is Polk’s flagship tower — a 1" Pinnacle ring radiator tweeter, 6.5" Turbine Cone midrange and dual 8" woofers with Power Port 2.0 bass loading. IMAX Enhanced and Hi-Res certified for reference theatre and music alike.',
    metaDescription:
      'Polk Audio Reserve R700 flagship tower speaker — Pinnacle tweeter, Turbine Cone mid, dual 8" woofers, IMAX Enhanced. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R700', 'Reserve R700 tower speaker', 'Polk R700 UAE', 'Polk R700 Pakistan', 'flagship floor-standing speaker'],
    hero: '/products/polk-audio/reserve-r700.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r700.png'), pkBrown('/products/polk-audio/reserve-r700-brown.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Pinnacle ring radiator' },
        { name: 'Mid & bass', value: '6.5" Turbine Cone, 2× 8" woofers' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '30 Hz – 50 kHz' },
        { name: 'Sensitivity', value: '88 dB (2.83 V/1 m)' },
      ] },
      { label: 'Certification', rows: [
        { name: 'Standards', value: 'IMAX Enhanced, Hi-Res Audio' },
        { name: 'Bass loading', value: 'Power Port 2.0 with X-Port' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'reserve-r600',
    brandSlug: 'polk-audio',
    name: 'Reserve R600',
    collection: 'Reserve Series · Tower',
    tagline: 'Premium hi-fi balance, powerful 3D performance.',
    description:
      'Reserve R600 elegantly balances premium hi-fi quality and design — a 1" Pinnacle ring radiator tweeter over dual 6.5" Turbine Cone woofers delivers spacious stereo and powerful surround performance in equal measure.',
    metaDescription:
      'Polk Audio Reserve R600 tower speaker — 1" Pinnacle tweeter, dual 6.5" Turbine Cone woofers, Hi-Res certified. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R600', 'Reserve R600 tower speaker', 'Polk R600 UAE', 'Polk R600 Pakistan', 'floor-standing speaker'],
    hero: '/products/polk-audio/reserve-r600.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r600.png'), pkWhite('/products/polk-audio/reserve-r600-white.png'), pkBrown('/products/polk-audio/reserve-r600-brown.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Pinnacle ring radiator' },
        { name: 'Woofers', value: '2× 6.5" Turbine Cone' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '32 Hz – 50 kHz' },
        { name: 'Sensitivity', value: '87.5 dB (2.83 V/1 m)' },
      ] },
      { label: 'Certification', rows: [
        { name: 'Standards', value: 'Hi-Res Audio certified' },
        { name: 'Bass loading', value: 'Power Port 2.0' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'reserve-r500',
    brandSlug: 'polk-audio',
    name: 'Reserve R500',
    collection: 'Reserve Series · Slim Tower',
    tagline: 'Compact towers, supremely musical.',
    description:
      'Reserve R500 packs the full Reserve voicing into a compact, room-friendly tower — a 1" Pinnacle ring radiator tweeter and dual 5.25" Turbine Cone woofers that disappear into the architecture and the soundstage alike.',
    metaDescription:
      'Polk Audio Reserve R500 slim tower speaker — 1" Pinnacle tweeter, dual 5.25" Turbine Cone woofers. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R500', 'Reserve R500 tower speaker', 'Polk R500 UAE', 'Polk R500 Pakistan', 'slim floor-standing speaker'],
    hero: '/products/polk-audio/reserve-r500.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r500.png'), pkWhite('/products/polk-audio/reserve-r500-white.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Pinnacle ring radiator' },
        { name: 'Woofers', value: '2× 5.25" Turbine Cone' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '35 Hz – 50 kHz' },
        { name: 'Sensitivity', value: '87 dB (2.83 V/1 m)' },
      ] },
      { label: 'Certification', rows: [
        { name: 'Standards', value: 'Hi-Res Audio certified' },
        { name: 'Bass loading', value: 'Power Port 2.0' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'reserve-r400',
    brandSlug: 'polk-audio',
    name: 'Reserve R400',
    collection: 'Reserve Series · Center Channel',
    tagline: 'Every word anchored, every scene believed.',
    description:
      'Reserve R400 anchors the front stage with a 1" Pinnacle ring radiator tweeter and dual 6.5" Turbine Cone woofers — dialogue with weight and clarity to match the Reserve towers on either side.',
    metaDescription:
      'Polk Audio Reserve R400 center channel speaker — 1" Pinnacle tweeter, dual 6.5" Turbine Cone woofers. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R400', 'Reserve R400 center speaker', 'Polk R400 UAE', 'Polk R400 Pakistan', 'center channel speaker'],
    hero: '/products/polk-audio/reserve-r400.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r400.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Pinnacle ring radiator' },
        { name: 'Woofers', value: '2× 6.5" Turbine Cone' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '36 Hz – 50 kHz' },
        { name: 'Sensitivity', value: '89 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '20 – 200 W' },
        { name: 'Compatibility', value: '8Ω / 6Ω / 4Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'reserve-r350',
    brandSlug: 'polk-audio',
    name: 'Reserve R350',
    collection: 'Reserve Series · Slim LCR',
    tagline: 'A discreet slim profile, a full front stage.',
    description:
      'Reserve R350 is the discreet answer for premium rooms — a slim left/center/right speaker with a 1" Pinnacle ring radiator tweeter and four 4" Turbine Cone woofers. Use one for dialogue or three as an entire front stage, on-wall or in cabinetry.',
    metaDescription:
      'Polk Audio Reserve R350 slim LCR speaker — 1" Pinnacle tweeter, four 4" Turbine Cone woofers, wall-mountable. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R350', 'Reserve R350 LCR speaker', 'Polk R350 UAE', 'Polk R350 Pakistan', 'slim center channel'],
    hero: '/products/polk-audio/reserve-r350.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r350.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Pinnacle ring radiator' },
        { name: 'Woofers', value: '4× 4" Turbine Cone' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '50 Hz – 50 kHz' },
        { name: 'Recommended power', value: '25 – 200 W' },
      ] },
      { label: 'Placement', rows: [
        { name: 'Roles', value: 'Left, center or right' },
        { name: 'Mounting', value: 'Shelf or on-wall' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'reserve-r300',
    brandSlug: 'polk-audio',
    name: 'Reserve R300',
    collection: 'Reserve Series · Center Channel',
    tagline: 'Compact center, uncompromised voice.',
    description:
      'Reserve R300 delivers clear, natural dialogue from a compact chassis — a 1" Pinnacle ring radiator tweeter flanked by dual 5.25" Turbine Cone woofers, voiced to blend seamlessly with any Reserve loudspeaker pair.',
    metaDescription:
      'Polk Audio Reserve R300 center channel speaker — 1" Pinnacle tweeter, dual 5.25" Turbine Cone woofers. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R300', 'Reserve R300 center speaker', 'Polk R300 UAE', 'Polk R300 Pakistan', 'compact center channel'],
    hero: '/products/polk-audio/reserve-r300.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r300.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Pinnacle ring radiator' },
        { name: 'Woofers', value: '2× 5.25" Turbine Cone' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '45 Hz – 50 kHz' },
        { name: 'Sensitivity', value: '86.5 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '30 – 200 W' },
        { name: 'Compatibility', value: '8Ω / 6Ω / 4Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'reserve-r900',
    brandSlug: 'polk-audio',
    name: 'Reserve R900',
    collection: 'Reserve Series · Height Module',
    tagline: 'Height without hardware — Atmos from above.',
    description:
      'Reserve R900 places the height layer exactly where the mix intends it — an up-firing Dolby Atmos module with a 0.75" Pinnacle ring radiator tweeter and 4" Turbine Cone woofer that perches atop Reserve towers and bookshelves.',
    metaDescription:
      'Polk Audio Reserve R900 Dolby Atmos height module — Pinnacle tweeter and Turbine Cone woofer for Reserve towers. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Reserve R900', 'Reserve R900 height module', 'Polk R900 UAE', 'Polk R900 Pakistan', 'Dolby Atmos speaker module'],
    hero: '/products/polk-audio/reserve-r900.png',
    finishes: [mzBlack('/products/polk-audio/reserve-r900.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '0.75" Pinnacle ring radiator' },
        { name: 'Woofer', value: '4" Turbine Cone' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Sensitivity', value: '85.5 dB (2.83 V/1 m)' },
        { name: 'Recommended power', value: '45 – 100 W' },
      ] },
      { label: 'Placement', rows: [
        { name: 'Role', value: 'Dolby Atmos height, up-firing' },
        { name: 'Pairing', value: 'Reserve towers & bookshelves' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'signature-elite-es60',
    brandSlug: 'polk-audio',
    name: 'Signature Elite ES60',
    collection: 'Signature Elite · Tower',
    tagline: 'Big-room authority, American engineered.',
    description:
      'Signature Elite ES60 is the largest of the Elite towers — a 1" Terylene tweeter over three 6.5" mid-woofers with Power Port bass, filling big rooms with the dynamic, cinema-scale sound Polk built its name on.',
    metaDescription:
      'Polk Audio Signature Elite ES60 tower speaker — 1" tweeter, three 6.5" drivers, Hi-Res certified. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Signature Elite ES60', 'ES60 tower speaker', 'Polk ES60 UAE', 'Polk ES60 Pakistan', 'floor-standing speaker'],
    hero: '/products/polk-audio/signature-elite-es60.png',
    finishes: [mzBlack('/products/polk-audio/signature-elite-es60.png'), pkWhite('/products/polk-audio/signature-elite-es60-white.png'), pkBrown('/products/polk-audio/signature-elite-es60-brown.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Terylene dome' },
        { name: 'Woofers', value: '3× 6.5" mica-reinforced' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '32 Hz – 40 kHz' },
        { name: 'Sensitivity', value: '90 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '50 – 300 W' },
        { name: 'Compatibility', value: '4Ω and 8Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'signature-elite-es55',
    brandSlug: 'polk-audio',
    name: 'Signature Elite ES55',
    collection: 'Signature Elite · Tower',
    tagline: 'The balanced tower for music and movies.',
    description:
      'Signature Elite ES55 balances the Elite range — a 1" Terylene tweeter and dual 6.5" mid-woofers deliver detailed music and convincing home theatre from a gracefully proportioned cabinet.',
    metaDescription:
      'Polk Audio Signature Elite ES55 tower speaker — 1" tweeter, dual 6.5" drivers, Hi-Res certified. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Signature Elite ES55', 'ES55 tower speaker', 'Polk ES55 UAE', 'Polk ES55 Pakistan', 'floor-standing speaker'],
    hero: '/products/polk-audio/signature-elite-es55.png',
    finishes: [mzBlack('/products/polk-audio/signature-elite-es55.png'), pkWhite('/products/polk-audio/signature-elite-es55-white.png'), pkBrown('/products/polk-audio/signature-elite-es55-brown.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Terylene dome' },
        { name: 'Woofers', value: '2× 6.5" mica-reinforced' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '33 Hz – 40 kHz' },
        { name: 'Sensitivity', value: '89 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '40 – 200 W' },
        { name: 'Compatibility', value: '4Ω and 8Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'signature-elite-es50',
    brandSlug: 'polk-audio',
    name: 'Signature Elite ES50',
    collection: 'Signature Elite · Compact Tower',
    tagline: 'Slender towers with a surprising reach.',
    description:
      'Signature Elite ES50 fits the Elite sound into a slender floor-standing profile — a 1" Terylene tweeter and dual 5.25" mid-woofers that elevate music, movies and gaming in medium rooms.',
    metaDescription:
      'Polk Audio Signature Elite ES50 compact tower speaker — 1" tweeter, dual 5.25" drivers, Hi-Res certified. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Signature Elite ES50', 'ES50 tower speaker', 'Polk ES50 UAE', 'Polk ES50 Pakistan', 'compact floor-standing speaker'],
    hero: '/products/polk-audio/signature-elite-es50.png',
    finishes: [mzBlack('/products/polk-audio/signature-elite-es50.png'), pkWhite('/products/polk-audio/signature-elite-es50-white.png'), pkBrown('/products/polk-audio/signature-elite-es50-brown.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Terylene dome' },
        { name: 'Woofers', value: '2× 5.25" mica-reinforced' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '38 Hz – 40 kHz' },
        { name: 'Sensitivity', value: '88 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '40 – 200 W' },
        { name: 'Compatibility', value: '4Ω and 8Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'signature-elite-es35',
    brandSlug: 'polk-audio',
    name: 'Signature Elite ES35',
    collection: 'Signature Elite · Slim Center',
    tagline: 'A whisper-slim center with six-driver focus.',
    description:
      'Signature Elite ES35 solves the low-profile cabinet and the TV console alike — a 1" Terylene tweeter with six 3" mid-woofers in a slim enclosure that keeps dialogue locked to the screen.',
    metaDescription:
      'Polk Audio Signature Elite ES35 slim center channel speaker — 1" tweeter and six 3" drivers. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Signature Elite ES35', 'ES35 center speaker', 'Polk ES35 UAE', 'Polk ES35 Pakistan', 'slim center channel'],
    hero: '/products/polk-audio/signature-elite-es35.png',
    finishes: [mzBlack('/products/polk-audio/signature-elite-es35.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Terylene dome' },
        { name: 'Woofers', value: '6× 3" mica-reinforced' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '68 Hz – 40 kHz' },
        { name: 'Sensitivity', value: '89 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '20 – 150 W' },
        { name: 'Compatibility', value: '4Ω and 8Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'signature-elite-es30',
    brandSlug: 'polk-audio',
    name: 'Signature Elite ES30',
    collection: 'Signature Elite · Center Channel',
    tagline: 'Dialogue with presence, center of it all.',
    description:
      'Signature Elite ES30 gives the front stage its voice — a 1" Terylene tweeter and dual 5.25" mid-woofers deliver clear, dynamic dialogue that matches the Elite towers and bookshelves around it.',
    metaDescription:
      'Polk Audio Signature Elite ES30 center channel speaker — 1" tweeter and dual 5.25" drivers. Supplied across the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Signature Elite ES30', 'ES30 center speaker', 'Polk ES30 UAE', 'Polk ES30 Pakistan', 'center channel speaker'],
    hero: '/products/polk-audio/signature-elite-es30.png',
    finishes: [mzBlack('/products/polk-audio/signature-elite-es30.png')],
    specs: [
      { label: 'Drivers', rows: [
        { name: 'Tweeter', value: '1" Terylene dome' },
        { name: 'Woofers', value: '2× 5.25" mica-reinforced' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Response', value: '55 Hz – 40 kHz' },
        { name: 'Sensitivity', value: '88 dB (2.83 V/1 m)' },
      ] },
      { label: 'Amplification', rows: [
        { name: 'Recommended', value: '20 – 125 W' },
        { name: 'Compatibility', value: '4Ω and 8Ω outputs' },
      ] },
    ],
    inUse: pkInUse,
  },
  {
    slug: 'signature-elite-es90',
    brandSlug: 'polk-audio',
    name: 'Signature Elite ES90',
    collection: 'Signature Elite · Height Module',
    tagline: 'Lifelike overhead sound, certified by Dolby.',
    description:
      'Signature Elite ES90 adds a Dolby Atmos-certified height layer to Elite towers and bookshelves — up-firing modules that elevate the home theatre with lifelike overhead sound, no ceiling speakers required.',
    metaDescription:
      'Polk Audio Signature Elite ES90 Dolby Atmos-certified height module for Signature Elite speakers. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['Polk Signature Elite ES90', 'ES90 height module', 'Polk ES90 UAE', 'Polk ES90 Pakistan', 'Dolby Atmos module'],
    hero: '/products/polk-audio/signature-elite-es90.png',
    finishes: [mzBlack('/products/polk-audio/signature-elite-es90.png')],
    specs: [
      { label: 'Design', rows: [
        { name: 'Role', value: 'Up-firing Dolby Atmos module' },
        { name: 'Certification', value: 'Dolby Atmos certified' },
      ] },
      { label: 'Performance', rows: [
        { name: 'Sensitivity', value: '85 dB' },
        { name: 'Recommended power', value: '20 – 150 W' },
      ] },
      { label: 'Placement', rows: [
        { name: 'Pairing', value: 'ES20, ES55, ES60 & S-series' },
        { name: 'Inputs', value: 'Gold 5-way binding posts' },
      ] },
    ],
    inUse: pkInUse,
  },

  // ─── U&K Sound ────────────────────────────────────────────────────────────
  {
    slug: 'reference-series',
    brandSlug: 'uandksound',
    name: 'Reference Series',
    collection: 'Cinema Series · Reference',
    tagline: 'Horn-loaded reference for the dedicated cinema.',
    description:
      'The Reference Series is the culmination of a long research project with sound engineers from the film industry. A high-density enclosure meets THX standards, an oversized-magnet woofer delivers exceptional impact, and a same-plane horn tweeter locates every effect with precision. Its modular configuration is built to sit behind large projection screens without compromise.',
    metaDescription:
      'U&K Sound Reference Series cinema speakers — horn-loaded M1200LCR, M800SR and M1800SW subwoofer, THX-standard enclosures. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['U&K Sound Reference Series', 'M1200LCR', 'M1800SW subwoofer', 'U&K Sound cinema speakers UAE', 'U&K Sound Pakistan', 'horn-loaded cinema loudspeaker'],
    hero: uk('reference-m1200lcr.png'),
    finishes: [ukBlack(uk('reference-m1200lcr.png'), 'Black Yarn Paint')],
    specs: [
      { label: 'M1200LCR · LCR', rows: [
        { name: 'Impedance', value: '8 Ω' },
        { name: 'Frequency', value: '45 Hz – 20 kHz' },
        { name: 'Power', value: '500 – 1000 W' },
        { name: 'Drivers', value: '1× 12" coated paper, horn tweeter' },
        { name: 'SPL', value: '97 dB ±1.5 dB' },
      ] },
      { label: 'M800SR · Surround', rows: [
        { name: 'Impedance', value: '8 Ω' },
        { name: 'Frequency', value: '70 Hz – 20 kHz' },
        { name: 'Power', value: '450 – 900 W' },
        { name: 'Drivers', value: '2× 8" coated paper, horn tweeter' },
        { name: 'SPL', value: '95 dB ±1.5 dB' },
      ] },
      { label: 'M1800SW · Subwoofer', rows: [
        { name: 'Impedance', value: '8 Ω' },
        { name: 'Frequency', value: '25 – 500 Hz' },
        { name: 'Power', value: '800 – 1600 W' },
        { name: 'Driver', value: '1× 18" coated paper' },
        { name: 'Enclosure', value: 'Bass reflex / MDF' },
      ] },
    ],
    inUse: [uk('cinema-wall.jpg'), uk('cinema-theatre.jpg'), uk('cinema-rack.jpg')],
  },
  {
    slug: 'm8-series',
    brandSlug: 'uandksound',
    name: 'M8 Series',
    collection: 'Cinema Series · M8',
    tagline: 'Three-way flagship, Air Motion tweeter.',
    description:
      'The M8 Series renews U&K Sound\'s flagship models with hand-selected components and a meticulously built crossover network. Every model is a three-way design with a 12 dB/oct divider, crowned by an AMT Air Motion Transformer tweeter that makes the sound leap forward. The extra-slim M850-N cabinet adapts to any custom installation, partnered by the 1200 W Class D M1500-N subwoofer.',
    metaDescription:
      'U&K Sound M8 Series three-way cinema speakers with AMT Air Motion tweeter — M850N, M820IW and M1500N subwoofer. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['U&K Sound M8 Series', 'M850N', 'M1500N subwoofer', 'AMT Air Motion tweeter', 'U&K Sound UAE', 'U&K Sound Pakistan'],
    hero: uk('m8-m850n.png'),
    finishes: [ukBlack(uk('m8-m850n.png'), 'Satin Black')],
    specs: [
      { label: 'M850N · Three-way', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '300 – 600 W' },
        { name: 'Drivers', value: '2× 4" / 2× 8", AMT tweeter' },
        { name: 'SPL', value: '90 dB ±1.5 dB' },
      ] },
      { label: 'M820IW · In-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '160 – 320 W' },
        { name: 'Drivers', value: '1× 4" / 1× 8", AMT tweeter' },
        { name: 'Depth', value: '130 mm' },
      ] },
      { label: 'M1500N · Subwoofer', rows: [
        { name: 'Frequency', value: '20 Hz – 250 Hz' },
        { name: 'Driver', value: '1× 15" / 38.1 cm coated paper' },
        { name: 'Power', value: '1200 W Class D' },
        { name: 'Enclosure', value: 'MDF, room EQ' },
        { name: 'Weight', value: '44.5 kg' },
      ] },
      AMT_TWEETER_SPEC,
    ],
    inUse: [uk('amt-tweeter.jpg'), uk('cinema-inwall.jpg'), uk('cinema-theatre.jpg')],
  },
  {
    slug: 'm6-series',
    brandSlug: 'uandksound',
    name: 'M6 Series',
    collection: 'Cinema Series · M6',
    tagline: 'Slim on-wall and in-wall, Air Motion clarity.',
    description:
      'Following the concept of the M8 Series, the M6 Series mounts on — or flush to — the wall, in an extra-slim cabinet designed for complex custom installations. Its legacy Air Motion tweeter delivers more precise, cleaner high frequencies, giving the range an acoustic performance and aesthetic commitment without compromise. Full enjoyment, whether a film or a favourite artist, with none of the installation complexity.',
    metaDescription:
      'U&K Sound M6 Series slim on-wall and in-wall cinema speakers with Air Motion tweeter — M610N, M620N, in-wall models and M1200N subwoofer. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['U&K Sound M6 Series', 'M620N', 'M610IW', 'M1200N subwoofer', 'Air Motion tweeter', 'U&K Sound UAE Pakistan'],
    hero: uk('m6-m620n.png'),
    finishes: [ukBlack(uk('m6-m620n.png'), 'Satin Black')],
    specs: [
      { label: 'M610N · On-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '55 Hz – 22 kHz' },
        { name: 'Power', value: '160 – 320 W' },
        { name: 'Drivers', value: '1× 4" / 1× 6.5", AMT tweeter' },
      ] },
      { label: 'M620N · On-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '160 – 320 W' },
        { name: 'Drivers', value: '2× 4" / 2× 6.5", AMT tweeter' },
      ] },
      { label: 'M610IW · In-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '160 – 320 W' },
        { name: 'Drivers', value: '1× 4" / 1× 6.5", AMT tweeter' },
      ] },
      { label: 'M600IW · In-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '70 Hz – 20 kHz' },
        { name: 'Power', value: '80 – 160 W' },
        { name: 'Driver', value: '1× 6.5"' },
      ] },
      { label: 'M1200N · Subwoofer', rows: [
        { name: 'Frequency', value: '30 Hz – 250 Hz' },
        { name: 'Driver', value: '1× 12" / 30 cm coated paper' },
        { name: 'Power', value: '1200 W Class D' },
        { name: 'Weight', value: '30.27 kg' },
      ] },
      AMT_TWEETER_SPEC,
    ],
    inUse: [uk('cinema-inwall.jpg'), uk('amt-tweeter.jpg'), uk('cinema-installation.jpg')],
  },
  {
    slug: 's-series',
    brandSlug: 'uandksound',
    name: 'S Series',
    collection: 'Cinema Series · S',
    tagline: 'Compact wall-mount, ribbon-clear articulation.',
    description:
      'The full-range S Series are compact wall-mount loudspeakers built around an advanced crossover — massive air-core coils, high-purity copper wire and low-distortion capacitors preserve every nuance of the signal, behind a ribbon tweeter. A premium MDF enclosure and a robust mounting-lock system let installers complete horizontal or vertical installation quickly and easily. Standard finish is matte black.',
    metaDescription:
      'U&K Sound S Series compact wall-mount cinema speakers with ribbon tweeter — S6 I, S6 II and S1200 I subwoofer. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['U&K Sound S Series', 'S6 I', 'S6 II', 'S1200 I subwoofer', 'ribbon tweeter speaker', 'U&K Sound UAE Pakistan'],
    hero: uk('s-s6ii.png'),
    finishes: [ukBlack(uk('s-s6ii.png'), 'Matte Black')],
    specs: [
      { label: 'S6 I', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '55 Hz – 22 kHz' },
        { name: 'Power', value: '80 – 160 W' },
        { name: 'Drivers', value: '2× 6.5", 1" ribbon tweeter' },
        { name: 'SPL', value: '89 dB ±1.5 dB' },
      ] },
      { label: 'S6 II', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '160 – 320 W' },
        { name: 'Drivers', value: '4× 6.5", ribbon tweeter' },
        { name: 'SPL', value: '91 dB ±1.5 dB' },
      ] },
      { label: 'S1200 I · Subwoofer', rows: [
        { name: 'Frequency', value: '25 Hz – 250 Hz' },
        { name: 'Driver', value: '1× 12" / 30 cm coated paper' },
        { name: 'Power', value: '1200 W Class AB' },
        { name: 'Enclosure', value: 'MDF material' },
        { name: 'Weight', value: '46.5 kg' },
      ] },
    ],
    inUse: [uk('cinema-inwall.jpg'), uk('cinema-theatre.jpg'), uk('cinema-installation.jpg')],
  },
  {
    slug: 'e-series',
    brandSlug: 'uandksound',
    name: 'E Series',
    collection: 'Custom Series · E',
    tagline: 'The sound of invisibility — in-wall and in-ceiling.',
    description:
      'The E Series sets a fresh standard for in-wall and in-ceiling performance. Voice- and timbre-matched with one another and the rest of the range, every model features an ultra-low-profile, paintable micro-perforated grille for near-invisible integration, held by neodymium magnets. PRX Poly Resin CrossPoint molds, a Smooth Visual Flangeless System and gold-plated binding posts complete a truly custom-grade speaker.',
    metaDescription:
      'U&K Sound E Series in-wall and in-ceiling custom speakers with paintable micro-perforated grilles — E610, E620, E650 and E1200I subwoofer. Distributed in the UAE and Pakistan by Leading IT.',
    keywords: ['U&K Sound E Series', 'E620IW', 'E610C in-ceiling', 'E1200I subwoofer', 'invisible in-wall speaker', 'U&K Sound UAE Pakistan'],
    hero: uk('e-e620iw.png'),
    finishes: [ukBlack(uk('e-e620iw.png'), 'Black · Paintable Grille')],
    specs: [
      { label: 'E610IW · In-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '80 – 160 W' },
        { name: 'Drivers', value: '6.5" + 1" aluminium' },
      ] },
      { label: 'E620IW · In-wall', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '160 – 320 W' },
        { name: 'Drivers', value: '2× 6.5" + 1" aluminium' },
      ] },
      { label: 'E610C · In-ceiling', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '45 Hz – 22 kHz' },
        { name: 'Power', value: '80 – 160 W' },
        { name: 'Drivers', value: '6.5" + 1" aluminium' },
      ] },
      { label: 'E650FX · In-ceiling', rows: [
        { name: 'Impedance', value: '4 Ω' },
        { name: 'Frequency', value: '50 Hz – 22 kHz' },
        { name: 'Power', value: '80 – 120 W' },
        { name: 'Tweeter', value: '±3 dB adjustable HF' },
      ] },
      { label: 'E1200I · Subwoofer', rows: [
        { name: 'Frequency', value: '30 Hz – 250 Hz' },
        { name: 'Driver', value: '1× 12" / 30 cm coated paper' },
        { name: 'Power', value: '300 W Class AB' },
        { name: 'Enclosure', value: 'Bass reflex / MDF' },
      ] },
    ],
    inUse: [uk('e-detail.jpg'), uk('cinema-theatre.jpg'), uk('cinema-installation.jpg')],
  },
  {
    slug: 'm-series',
    brandSlug: 'uandksound',
    name: 'M Series',
    collection: 'M Series · Amplification',
    tagline: 'Multichannel muscle for the reference cinema.',
    description:
      'The M Series is U&K Sound\'s amplification platform — fully balanced Class A/AB stages (M2300, M7300) alongside high-current Class D designs (M4500D, M7300D). Ultra-low noise, per-channel transformers and an exceptional signal-to-noise ratio deliver noiseless, effortless power at every level. A 12 V trigger daisy-chains multiple stages for the most complex installations, making them the natural partner for the Reference Series.',
    metaDescription:
      'U&K Sound M Series multichannel power amplifiers — Class A/AB M2300 and M7300, Class D M4500D (750W) and M7300D. Supplied in the UAE and Pakistan by Leading IT.',
    keywords: ['U&K Sound M Series amplifier', 'M4500D', 'M7300D', 'M7300', 'multichannel cinema amplifier', 'U&K Sound UAE Pakistan'],
    hero: uk('m-m4500d.png'),
    finishes: [ukBlack(uk('m-m4500d.png'), 'Black')],
    specs: [
      { label: 'M4500D · Class D', rows: [
        { name: 'Power', value: '750 W / 4 Ω × 4 ch' },
        { name: 'Mode', value: 'Bridgeable' },
        { name: 'THD', value: '< 0.01% (20 Hz – 20 kHz)' },
        { name: 'SNR', value: '> 110 dB' },
        { name: 'Trigger', value: '12 V DC' },
      ] },
      { label: 'M7300D · Class D', rows: [
        { name: 'Power', value: '300 W / 8 Ω × 7 ch' },
        { name: 'THD', value: '< 0.01% (20 Hz – 20 kHz)' },
        { name: 'SNR', value: '> 110 dB' },
        { name: 'Trigger', value: '12 V DC' },
        { name: 'Weight', value: '24 kg' },
      ] },
      { label: 'M7300 · Class A/AB', rows: [
        { name: 'Power', value: '300 W / 4 Ω × 7 ch' },
        { name: 'SNR', value: '> 115 dB, A-weighted' },
        { name: 'THD', value: '< 0.02% (20 Hz – 20 kHz)' },
        { name: 'Inputs', value: '7× XLR / RCA' },
        { name: 'Weight', value: '57 kg' },
      ] },
      { label: 'M2300 · Class A/AB', rows: [
        { name: 'Power', value: '300 W / 4 Ω × 2 ch' },
        { name: 'SNR', value: '> 115 dB, A-weighted' },
        { name: 'THD', value: '< 0.02% (20 Hz – 20 kHz)' },
        { name: 'Inputs', value: '2× XLR / RCA' },
        { name: 'Weight', value: '22 kg' },
      ] },
    ],
    inUse: [uk('cinema-rack.jpg'), uk('cinema-wall.jpg'), uk('cinema-theatre.jpg')],
  },
];

export const PRODUCT_BY_SLUG = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

export function productsForBrand(brandSlug: string) {
  return PRODUCTS.filter((p) => p.brandSlug === brandSlug);
}
