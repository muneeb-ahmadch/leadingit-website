/**
 * The `/solutions/` category axis — one record per solution page, plus the copy
 * for the index that parents them.
 *
 * Modelled on `src/data/brands.ts`: a plain, typed record set that carries the
 * page's real prose. The template in `src/pages/SolutionPage.tsx` renders it and
 * decides nothing about content; `src/seo/meta.ts` composes the title and
 * description from the same record, so a copy change happens in exactly one file.
 *
 * ## Rules this file exists to hold, not to re-argue (docs/10-CONTENT-BRIEFS/_CONVENTIONS.md)
 *
 * - **Neutral supply wording only.** The approved solution-page sentence is
 *   *"Leading IT designs, supplies and installs <thing> in Dubai."* Never
 *   "authorized dealer", "official distributor" or any equivalent, for any brand
 *   (§1; `docs/OPEN-QUESTIONS.md` #3).
 * - **No pricing, ever** — no figure, no range, no "from" (§3). Price intent is
 *   answered honestly and converted to an enquiry.
 * - **Pakistan is a supply relationship, never a place** (§2): country level, no
 *   city, no address, no second phone number.
 * - **AEO shape is structural, not stylistic** (§6): every section is a
 *   question-shaped H2 whose `answer` is a standalone extractable sentence naming
 *   Leading IT, the thing and Dubai. `body` paragraphs stay at 3–4 sentences.
 * - **Every `to` in a table cell, `relatedBrandSlugs` entry and
 *   `relatedProductPaths` entry must name a route that emits HTML today** (§8).
 *   A live link to a 404 is worse than no link.
 *
 * ## Six solutions exist, one is built
 *
 * `docs/05-URL-TAXONOMY.md` §2 locks six slugs: `home-cinema`,
 * `whole-home-control`, `lighting-control`, `multi-room-audio`,
 * `industrial-automation`, `hospitality`. Only `home-cinema` is authored here;
 * the other five arrive with their own briefs and their own capability sign-off.
 *
 * **`shading` is not a seventh.** `/solutions/shading/` was retired 2026-07-31
 * (`docs/OPEN-QUESTIONS.md` #22 — there is no shading product in the catalogue)
 * and 301s to `/solutions/` from `public/.htaccess`. It must never reappear as a
 * record, a table row, a link or a line of prose, and being the redirect target
 * does not entitle the index to shading queries
 * (`docs/12-PROVENANCE/wp4-shading-retirement-log.md`).
 */

/** One cell of a rendered table. `to` is an internal, slashless route path. */
export type SolutionTableCell = {
  text: string;
  /**
   * Site-relative router path in the internal (slashless) form, rendered through
   * `href()`. Only ever a route that returns 200 today — see the link rule above.
   */
  to?: string;
};

/**
 * A comparison or component table. Answer engines quote tables
 * disproportionately (`_CONVENTIONS.md` §6.4), so the two places a solution page
 * is genuinely choosing between things get one.
 */
export type SolutionTable = {
  /** Rendered as the `<caption>`; also the table's accessible name. */
  caption: string;
  columns: string[];
  rows: SolutionTableCell[][];
};

export type SolutionSection = {
  /** Anchor target and React key. Lowercase, hyphenated. */
  id: string;
  /** Question-shaped H2, phrased the way the audience types it. */
  question: string;
  /**
   * The answer, rendered as the first paragraph directly beneath the H2. One
   * standalone sentence pair that survives being quoted with no context: it
   * names Leading IT, the subject and Dubai.
   */
  answer: string;
  /** Supporting paragraphs, each ≤ 3–4 sentences. */
  body: string[];
  table?: SolutionTable;
};

export type SolutionFaq = { question: string; answer: string };

export type Solution = {
  /** Locked in `docs/05-URL-TAXONOMY.md` §2. The page is `/solutions/<slug>/`. */
  slug: string;
  /** Display name, used in breadcrumbs, cross-links and the `<title>` formula. */
  name: string;
  /** The one `<h1>` on the page. */
  h1: string;
  /** Lead paragraph, directly under the h1 and above the first question H2. */
  intro: string;
  /**
   * The `<thing>` in the approved supply sentence — *"Leading IT designs,
   * supplies and installs `<supplySubject>` in Dubai."* (`_CONVENTIONS.md` §1).
   * Written as a plural noun phrase so the sentence reads as a capability rather
   * than a single job.
   */
  supplySubject: string;
  /**
   * Second sentence of the meta description, after the supply sentence. Kept
   * short: `solutionMeta()` budgets the pair against DESCRIPTION_MAX_LENGTH.
   */
  metaDetail: string;
  /** `serviceType` on the page's `Service` node. Plain English, not a slug. */
  serviceType: string;
  /**
   * Hero image, site-relative, and it must already exist in
   * `src/components/media/image-manifest.generated.json` — `ResponsiveImage`
   * throws at build time otherwise. Alt text is resolved from the src alone by
   * `altFor()`; never pass a caption in from here.
   */
  hero: string;
  sections: SolutionSection[];
  faq: SolutionFaq[];
  /** Brand hubs that serve this solution — the cross-axis link (§8). */
  relatedBrandSlugs: string[];
  /** Product/range routes, internal slashless form. Resolved and validated in the template. */
  relatedProductPaths: string[];
  /**
   * Plain-text WhatsApp prefill. One first-person sentence naming this page's
   * subject so the reply can skip a round trip. Encoded at render time by the
   * shared helper — never hand-encoded here (`_CONVENTIONS.md` §7).
   */
  whatsappPrefill: string;
};

/**
 * The `/solutions/` index copy. Same AEO shape as a solution page, but it is a
 * `CollectionPage` rather than a `Service` — each child carries its own
 * `Service` node, and duplicating them on the parent creates competing nodes for
 * one offering (`docs/10-CONTENT-BRIEFS/solutions.md`, JSON-LD section).
 */
export type SolutionsIndexContent = {
  h1: string;
  intro: string;
  sections: SolutionSection[];
  faq: SolutionFaq[];
  whatsappPrefill: string;
};

/**
 * ## Why this page names three categories and not six
 *
 * `docs/10-CONTENT-BRIEFS/solutions.md` proposes an extractable claim listing six
 * delivery categories, and flags it itself: `UNCONFIRMED CAPABILITY — needs
 * Muneeb's sign-off before it ships`. `docs/00-CONTEXT.md` §1 confirms **home,
 * cinema and industrial automation**. Lighting control, multi-room audio and
 * hospitality are consistent with the catalogue but are not confirmed as
 * delivered services, and the brief's own instruction is that this index must not
 * assert a capability its child page cannot defend — the shading retirement being
 * that rule taken to its conclusion.
 *
 * So the copy below asserts the three confirmed categories and points at the
 * category page that exists. When the remaining capabilities are signed off, this
 * record and `solutionsIndexMeta()` are where the sentence widens; nothing else
 * depends on it.
 */
export const SOLUTIONS_INDEX: SolutionsIndexContent = {
  h1: 'Automation design and installation in Dubai — what Leading IT builds',
  intro:
    'Automation is not one product. It is a cinema room, a lighting scene that behaves, a control ' +
    'interface a family actually uses, and the first-fix cable that makes all three possible. This ' +
    'page is the map of what Leading IT designs, supplies and installs, and where to start reading.',
  sections: [
    {
      id: 'what-leading-it-builds',
      question: 'What does Leading IT design and install?',
      answer:
        'Leading IT designs, supplies and installs home, cinema and industrial automation in Dubai, ' +
        'United Arab Emirates.',
      body: [
        'The category page published so far is home cinema, which covers the design, equipment and ' +
          'build sequence of a private cinema room in a Dubai villa or apartment. Pages for the ' +
          'remaining categories are being written, and each one ships only when the catalogue and ' +
          'the delivery record behind it can carry the claim.',
        'Until then the honest route into the rest of the range is the brand axis. Nine ' +
          'manufacturers each have a hub page and a full product listing, covering control ' +
          'processors, keypads, dimming, loudspeakers, projection and signal distribution.',
      ],
      // TODO(phase4): the mandatory six-row routing table from
      // docs/10-CONTENT-BRIEFS/solutions.md ("If you want… | The page | Typically
      // involves") lands here once /solutions/{whole-home-control,lighting-control,
      // multi-room-audio,industrial-automation,hospitality}/ return 200 AND the
      // capability behind each row is signed off. Six rows, never seven — no
      // shading row, ever (docs/05 §14).
    },
    {
      id: 'who-leading-it-works-with',
      question: 'Who does Leading IT work with?',
      answer:
        'Leading IT works on private homes, developments, hotels and industrial facilities in the ' +
        'United Arab Emirates, and supplies projects in Pakistan.',
      body: [
        'Homeowners usually arrive with a room in mind — a cinema, a music system, a house that ' +
          'should behave from one interface. Developers and their consultants arrive earlier, at ' +
          'the stage where conduit routes and rack positions are still drawings rather than walls.',
        'Hospitality groups and industrial clients arrive with a specification and a programme, and ' +
          'the conversation starts at integration and commissioning rather than at product choice. ' +
          'Integrators and installers are a separate audience with their own path — part numbers, ' +
          'quantities and lead times — and reach the team on the same two channels below.',
      ],
    },
    {
      id: 'brands-used',
      question: 'Which brands are used in these systems?',
      answer:
        'Leading IT builds these systems in Dubai from the nine manufacturers it carries. Control ' +
        'and interfaces come from Crestron, Basalte and Black Nova; audio from Marantz, Denon, ' +
        'Polk Audio and UandKSound; projection from JVC and signal distribution from Blustream.',
      body: [
        'Each brand has its own hub page with the full product range, so a specifier can go straight ' +
          'to a model rather than through a category. LIT Home, the control interface built by ' +
          'Leading IT, runs alongside them and is demonstrated in full on this site.',
      ],
    },
    {
      id: 'outside-dubai',
      question: 'Does Leading IT deliver these outside Dubai?',
      answer:
        'Leading IT works across the United Arab Emirates from its Dubai base, and supplies projects ' +
        'in Pakistan.',
      body: [
        'Dubai is the only physical location: one showroom, one team, one set of engineers who ' +
          'travel to site. Work in the other Emirates is delivered from there rather than from a ' +
          'second office, which is why this site has no page claiming one.',
        'Pakistan is a supply relationship, not a premises. Equipment is shipped from Dubai, ' +
          'commissioning support is given remotely or by a visit, and warranty claims are routed ' +
          'through the same team that supplied the goods.',
      ],
    },
  ],
  faq: [
    {
      question: 'Does Leading IT design as well as install?',
      answer:
        'Both. Design here means the documents a contractor can build from: equipment schedules, ' +
        'cable and conduit schedules, rack elevations, keypad and speaker layouts, and power and ' +
        'ventilation requirements. A commissioning plan sets out who tests what, and when.',
    },
    {
      question: 'Can automation be added to a finished home, or only during construction?',
      answer:
        'Both, with different constraints. During construction anything is possible, because the ' +
        'cable routes are still open. In a finished home the scope depends on what can be reached ' +
        'without opening walls. Wireless keypads, retrofit dimming modules and equipment sharing an ' +
        'existing rack position usually can be; a new in-ceiling speaker layout usually cannot.',
    },
    {
      question: 'Does Leading IT work outside Dubai?',
      answer:
        'Yes. Leading IT works across the United Arab Emirates from its Dubai showroom, and supplies ' +
        'projects in Pakistan from the same base. There is no second office and no local Pakistan ' +
        'address — supply, shipping and warranty routing all run through Dubai.',
    },
    {
      question: 'Does Leading IT only install the brands it supplies?',
      answer:
        'Design, supply and installation work is scoped around the nine brands Leading IT carries, ' +
        'because that is where the engineering support, the spares and the warranty route exist. ' +
        'Integrating an existing system from another manufacturer is discussed case by case rather ' +
        'than promised in advance.',
    },
  ],
  whatsappPrefill:
    "Hi Leading IT — I'm planning an automation project in Dubai and not sure where to start.",
};

export const SOLUTIONS: Solution[] = [
  {
    slug: 'home-cinema',
    name: 'Home Cinema',
    h1: 'Home cinema design and installation in Dubai',
    intro:
      'One room, one seating position, and every discipline has to agree — projection, acoustics, ' +
      'power, control and the building itself. This is how a private cinema room is specified and ' +
      'built in Dubai, what each stage decides, and which equipment Leading IT supplies for it.',
    supplySubject: 'private home cinema rooms',
    metaDetail: 'JVC projection with Marantz, Denon, Polk Audio and UandKSound audio.',
    serviceType: 'Home cinema design and installation',
    // The one photograph on this site that shows the subject of this page: a
    // private cinema with tiered seating and a large screen. `altFor()` already
    // carries its verified caption (src/components/media/altText.ts, CURATED).
    hero: '/brands/uandksound-hero.jpg',
    sections: [
      {
        id: 'does-leading-it-install-home-cinema',
        question: 'Does Leading IT install home cinema rooms in Dubai?',
        answer:
          'Leading IT designs, supplies and installs private home cinema rooms in Dubai, United ' +
          'Arab Emirates.',
        body: [
          'Rooms are built around JVC D-ILA projection, with processing and amplification from ' +
            'Marantz and Denon, and loudspeakers from Polk Audio and UandKSound. Sources and signal ' +
            'are distributed with Blustream, and the room is controlled by Crestron or by LIT Home, ' +
            "Leading IT's own interface.",
          'Every brand named there is carried on this site with its full range. A cinema room is ' +
            'therefore specified, supplied and commissioned from one catalogue, rather than ' +
            'assembled across three suppliers who each blame the other two.',
        ],
      },
      {
        id: 'what-goes-into-a-cinema-room',
        question: 'What goes into a private cinema room?',
        answer:
          'A private cinema room is five systems sharing one space: projection and screen, ' +
          'processing and amplification, loudspeakers, signal distribution, and control. Leading IT ' +
          'supplies the equipment below and coordinates the room build around it.',
        body: [
          'Screens, seating, acoustic treatment and equipment racks are specified and coordinated ' +
            'rather than supplied. They are not in the catalogue, so no brand is named for them ' +
            'here that Leading IT does not carry. The specification still covers all four, because ' +
            'a cinema room where they are chosen late is a cinema room that gets rebuilt.',
        ],
        table: {
          caption: 'What Leading IT supplies for a private cinema room',
          columns: ['Element', 'What Leading IT supplies', 'Where to look'],
          rows: [
            [
              { text: 'Projection' },
              { text: 'JVC D-ILA projectors, DLA-NZ series' },
              { text: 'JVC', to: '/brands/jvc' },
            ],
            [
              { text: 'Processing and amplification' },
              {
                text: 'Marantz Cinema receivers, AV processors and AMP power amplifiers; Denon AVC and AVR amplifiers',
              },
              { text: 'Marantz', to: '/brands/marantz' },
            ],
            [
              { text: 'Loudspeakers' },
              { text: 'Polk Audio Reserve and Signature Elite; UandKSound cinema loudspeakers' },
              { text: 'Polk Audio', to: '/brands/polk-audio' },
            ],
            [
              { text: 'Signal distribution' },
              { text: 'Blustream HDMI, HDBaseT and AV-over-IP' },
              { text: 'Blustream', to: '/brands/blustream' },
            ],
            [
              { text: 'Control' },
              { text: 'Crestron control processors and touch screens, or LIT Home' },
              { text: 'LIT Home', to: '/lit-home' },
            ],
            [
              { text: 'Lighting in the room' },
              { text: 'Crestron DIN-rail dimming, with scenes recalled alongside the projector' },
              // TODO(phase4): this cell points at /solutions/lighting-control/
              // in the brief. It links the Crestron hub until that route returns
              // 200 (_CONVENTIONS.md §8).
              { text: 'Crestron', to: '/brands/crestron' },
            ],
          ],
        },
      },
      {
        id: 'how-a-cinema-room-is-built',
        question: 'How is a cinema room built in a Dubai villa?',
        answer:
          'A cinema room in a Dubai villa is built in sequence: room geometry first, then acoustics, ' +
          'then first fix, then finishes, with calibration last. Leading IT works to that order ' +
          'because each stage closes options for the one after it.',
        body: [
          'The room decides the screen, not the other way round. Seating rows, the distance from the ' +
            'front row to the screen wall and the ceiling height set the screen width and the ' +
            'channel layout before a single model is chosen.',
          'A villa room finished in marble, glass and plaster returns almost everything the ' +
            'loudspeakers produce, and that is what makes dialogue hard to follow at volume. ' +
            'Absorption, diffusion and a heavy door change the result more than a larger amplifier ' +
            'does. A room-within-a-room build changes what the rest of the house hears, and it has ' +
            'to be decided before the walls close.',
          'First fix is where a cinema room is won or lost. It covers conduit for signal and speaker ' +
            'cable, a dedicated power circuit to the rack, and projector power and signal to the ' +
            'ceiling position. The rack location is agreed with the architect then, not found later.',
          'Heat is a design decision in this climate, not a repair. A rack in an unconditioned riser ' +
            'through a Dubai August runs hot enough to shorten the life of everything in it. ' +
            'Ventilation and rack position are therefore settled at first fix.',
          'Then the room goes quiet. Finishes go in, the lighting scene falls to around ten per ' +
            'cent, and the projector starts on one button. That is the only part of the sequence ' +
            'anyone remembers afterwards.',
          'Calibration is booked as a visit after paint and joinery are complete. Measuring a room ' +
            'that still has bare walls and no seating produces settings for a room that will not ' +
            'exist by handover.',
        ],
      },
      {
        id: 'how-many-speakers',
        question: 'How many speakers do I need — 5.1, 7.2.4 or more?',
        answer:
          'The channel count comes from the room rather than from a price tier. Seating positions, ' +
          'wall space and above all ceiling height decide whether height channels can be installed ' +
          'at all.',
        body: [
          'Two rows of seating need surround placement that works for both rows, which usually means ' +
            'more surround channels than a single-row room of the same size. A low soffit or a ' +
            'services void can rule out in-ceiling height speakers entirely, and that caps the ' +
            'layout before any processor is chosen.',
          'The catalogue covers the whole span that follows. Marantz and Denon models run from 5.1 ' +
            'and 7.2 channel receivers up to 15.4 channel reference processors, with matching ' +
            'multi-channel power amplifiers. The layout is decided first, then the model that ' +
            'serves it.',
        ],
      },
      {
        id: 'cinema-room-or-media-room',
        question: 'Cinema room or media room — which one is being built?',
        answer:
          'A cinema room is a dedicated, light-controlled room built for one purpose; a media room ' +
          'is a living space that also plays films properly. Leading IT specifies both in Dubai, and ' +
          'most apartments get the second.',
        body: [
          'The distinction matters because it changes the specification, not just the budget. It is ' +
            'also the single most common misunderstanding at the first meeting: two people can agree ' +
            'on "home cinema" and mean two different rooms.',
        ],
        table: {
          caption: 'Dedicated cinema room compared with a media room',
          columns: ['', 'Dedicated cinema room', 'Media room'],
          rows: [
            [
              { text: 'The room' },
              { text: 'Built or converted for one purpose, and can be dark and quiet' },
              { text: 'Shares walls, windows and furniture with daily life' },
            ],
            [
              { text: 'Image' },
              { text: 'Projector and a fixed screen sized to the seating distance' },
              { text: 'A large display, or a high-output laser projector' },
            ],
            [
              { text: 'Sound' },
              { text: 'Full channel layout with height channels and acoustic treatment' },
              { text: 'On-wall and in-ceiling loudspeakers chosen to disappear into the room' },
            ],
            [
              { text: 'Equipment' },
              { text: 'Separates in a ventilated rack, often outside the room' },
              { text: 'A single receiver in a cabinet, with the rack avoided entirely' },
            ],
            [
              { text: 'Typical setting' },
              { text: 'A villa with a basement or a spare ground-floor room' },
              { text: 'A tower apartment, or a family living room' },
            ],
          ],
        },
      },
      {
        id: 'what-does-a-home-cinema-cost',
        question: 'What does a home cinema cost in Dubai?',
        answer:
          'Leading IT quotes home cinema in Dubai per project, because the room drives the figure ' +
          'more than the equipment list does.',
        body: [
          'Six things move it: whether the room is built or adapted, the channel count, the ' +
            'projector and screen size, acoustic treatment, seating, and the control system. Two ' +
            'rooms with identical equipment lists can be a long way apart on the first item alone.',
          'The useful first conversation is therefore about the room and the programme, not about a ' +
            'model list. Send the floor plan or the room dimensions and the reply can be specific.',
        ],
      },
      {
        id: 'cinema-equipment-pakistan',
        question: 'Does Leading IT supply cinema equipment to Pakistan?',
        answer:
          'Leading IT supplies cinema equipment to projects in Pakistan from its Dubai base.',
        body: [
          'Equipment ships from Dubai, commissioning support is given remotely or by a visit, and ' +
            'warranty claims are routed through the same team that supplied the goods. There is no ' +
            'Pakistan office and no local address; the relationship is supply and support, stated ' +
            'as exactly that.',
        ],
      },
    ],
    faq: [
      {
        question: 'How big does a room need to be for a proper cinema?',
        answer:
          'There is no fixed minimum, and any number quoted as one is a sales figure rather than an ' +
          'engineering one. The usable size comes from seating distance against screen width, and ' +
          'from ceiling height, which decides whether height channels are possible. A long, narrow ' +
          'room with a generous ceiling often outperforms a larger room with a low soffit.',
      },
      {
        question: 'What is the difference between a home cinema and a home theater?',
        answer:
          'Nothing. "Home cinema" is the usual term in the UAE and the UK, and "home theater" is the ' +
          'US spelling of the same room. Leading IT builds the same room whichever word appears on ' +
          'the drawings.',
      },
      {
        question: 'Can a cinema go into an apartment in Dubai?',
        answer:
          'Yes, with honest constraints. A tower apartment rarely permits a room-within-a-room ' +
          'build, so structure-borne sound reaching neighbouring units becomes the limit on output ' +
          'rather than the equipment. Slab depth, ceiling voids and building management rules decide ' +
          'what is possible, which is why an apartment usually becomes a well-specified media room.',
      },
      {
        question: 'Does Leading IT design the room or only install the equipment?',
        answer:
          'Both. Design means the drawings a contractor can build from: seating and screen geometry, ' +
          'loudspeaker positions, conduit and cable schedules, rack elevations, power and ' +
          'ventilation requirements, and a commissioning plan.',
      },
      {
        question: 'What does a cinema room cost in Dubai?',
        answer:
          'It is quoted per project. The figure is driven by the room build, the channel count, the ' +
          'projector and screen, acoustic treatment and seating, and the control system. A floor ' +
          'plan and the room dimensions therefore produce a far more useful answer than a model list.',
      },
    ],
    relatedBrandSlugs: ['jvc', 'marantz', 'denon', 'polk-audio', 'uandksound', 'blustream', 'crestron'],
    relatedProductPaths: [
      '/brands/jvc/dla-nz900',
      '/brands/marantz/av-10',
      '/brands/marantz/amp-10',
      '/brands/denon/avc-a1h',
      '/brands/polk-audio/reserve-r700',
      '/brands/uandksound/reference-series',
      '/brands/blustream/video-over-ip',
    ],
    whatsappPrefill: 'Hi Leading IT — I want to build a home cinema room in Dubai.',
  },
];

export const SOLUTION_BY_SLUG: Record<string, Solution | undefined> = Object.fromEntries(
  SOLUTIONS.map((solution) => [solution.slug, solution]),
);
