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
 * ## Six slugs are locked, five are built
 *
 * `docs/05-URL-TAXONOMY.md` §2 locks six slugs: `home-cinema`,
 * `whole-home-control`, `lighting-control`, `multi-room-audio`,
 * `industrial-automation`, `hospitality`. Five are authored here.
 *
 * **`industrial-automation` is deliberately absent and must not be added on the
 * strength of the locked slug alone.** There is no industrial product in the
 * 98-record catalogue, no named platform, and no reference work that may be
 * described (`docs/00-CONTEXT.md` §4 — no usable project references exist).
 * Writing it would mean writing a capability page with nothing behind it, which
 * is the shading failure with a different noun. It is blocked on
 * `docs/OPEN-QUESTIONS.md` #23 and is with Muneeb; when it clears it arrives as
 * a sixth record plus a sixth row in `SOLUTIONS_INDEX`.
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
 * ## Why this page now names five categories, and still not six
 *
 * The first build of this record asserted three capabilities, because
 * `docs/00-CONTEXT.md` §1 confirmed home, cinema and industrial automation and
 * `docs/10-CONTENT-BRIEFS/solutions.md`'s six-category claim was flagged
 * `UNCONFIRMED CAPABILITY`. That has moved, on evidence rather than on second
 * thoughts: `docs/00-CONTEXT.md` §4 gained three Muneeb confirmations dated
 * 2026-08-01 — KNX/DALI commissioning (`docs/OPEN-QUESTIONS.md` #26), security
 * supply (#25) and GRMS delivery (#27). Lighting control and hospitality are
 * therefore confirmed capabilities; what remains blocked is the security brand
 * name and the GRMS platform name, and neither child page claims either.
 *
 * So the claim below names the **five categories that have a page emitting HTML
 * today**, and the routing table has five rows for the same reason. Industrial
 * and building automation stays in the prose — `docs/00-CONTEXT.md` §1 confirms
 * it as scope — but has **no row and no link**: there is no industrial product
 * in the catalogue, no named platform and no describable reference work, so
 * `/solutions/industrial-automation/` is not built (OQ #23). A row pointing at
 * nothing is the shading failure with a different noun.
 *
 * When #23 clears, this record, `solutionsIndexMeta()` and `SOLUTIONS` are the
 * three places the sixth row lands; nothing else depends on it.
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
        'Leading IT designs, supplies and installs home cinema, whole-home control, lighting ' +
        'control, multi-room audio and hospitality automation in Dubai, United Arab Emirates.',
      body: [
        'Each of those five has its own page, and each one names the equipment behind it rather than ' +
          'describing a capability in the abstract. The table below is the fastest way in: find the ' +
          'sentence that sounds like the project and follow the link.',
        'Industrial and building automation is part of the same scope and has no category page yet. ' +
          'It is quoted from drawings and a specification rather than from a page, so the route to it ' +
          'is the two contact channels on this page.',
        'The other way in is the brand axis. Nine manufacturers each have a hub page and a full ' +
          'product listing, covering control processors, keypads, dimming, loudspeakers, projection ' +
          'and signal distribution.',
      ],
      table: {
        caption: 'Which page answers which project',
        columns: ['If you want…', 'The page', 'Typically involves'],
        rows: [
          [
            { text: 'A dedicated cinema room' },
            { text: 'Home cinema', to: '/solutions/home-cinema' },
            { text: 'Projector, screen, loudspeakers, acoustics and a seating layout' },
          ],
          [
            { text: 'One interface for the whole house' },
            { text: 'Whole-home control', to: '/solutions/whole-home-control' },
            { text: 'A control processor, keypads, and every subsystem brought together' },
          ],
          [
            { text: 'Scenes, dimming and circuits that behave' },
            { text: 'Lighting control', to: '/solutions/lighting-control' },
            { text: 'DIN-rail dimming, keypads, sensors and commissioning' },
          ],
          [
            { text: 'Music in every room' },
            { text: 'Multi-room audio', to: '/solutions/multi-room-audio' },
            { text: 'Amplification, zones, in-ceiling and in-wall loudspeakers' },
          ],
          [
            { text: 'Guest rooms in a hotel' },
            { text: 'Hospitality automation', to: '/solutions/hospitality' },
            { text: 'Guest-room control, keypads, and integration with the specified GRMS' },
          ],
          // TODO(OQ #23): the sixth row — "Plant, BMS or an industrial facility"
          // → /solutions/industrial-automation/ — lands here when that route
          // exists. It is the last evidence-free locked slug: no industrial
          // product in the catalogue, no named platform, no describable
          // reference work. Six rows then, never seven — no shading row, ever
          // (docs/05 §14).
        ],
      },
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

  /**
   * ## The one page on this site where two claims look alike and are not
   *
   * 1. **Leading IT commissions KNX and DALI.** Confirmed by Muneeb 2026-08-01
   *    (`docs/OPEN-QUESTIONS.md` #26) and recorded in `docs/00-CONTEXT.md` §4.
   *    It is a first-party service claim, he is its only possible source, and he
   *    has sourced it — so the page states it plainly and the comparison table's
   *    "Who commissions it" row reads "Leading IT" across all three columns.
   * 2. **What Crestron publishes about its two modules is narrower**, and is
   *    established by `docs/12-PROVENANCE/crestron-c2.md` §4-B:
   *    - `DIN-DLI` is a **DALI interface** — Crestron never calls it a gateway.
   *      It commissions the DALI devices on its loop through its own web UI and
   *      supplies the loop power (external DALI supplies are prohibited).
   *    - `DIN-KXI` is a **KNX Secure IP Gateway** (Crestron's own subtitle), and
   *      the route through which third-party **ETS5/ETS6** reaches the bus. It
   *      takes its power *from* the KNX bus.
   *
   * So: nothing below says Crestron commissions KNX, and nothing below calls the
   * DIN-DLI a gateway. Leading IT commissions; Crestron supplies a commissioning
   * tool (DLI) and an interface (KXI).
   *
   * **No certification claim of any kind.** ETS or equivalent certification is
   * *not* confirmed (`docs/00-CONTEXT.md` §4, same entry) and must not appear —
   * "DALI-2 certified" is said of the DIN-DLI module by Crestron and is not said
   * of Leading IT anywhere.
   *
   * **`DIN-2MC2` is not named on this page**, though the brief permits it. The
   * only loads Crestron publishes for it are drapes, shades, projection screens,
   * lifts, skylights and gates; naming the module without its loads tells a
   * specifier nothing, and naming the loads reintroduces the retired shading
   * intent on the page most likely to rank for it. Omitting a row is free.
   */
  {
    slug: 'lighting-control',
    name: 'Lighting Control',
    h1: 'Lighting control systems in Dubai — design, supply and installation',
    intro:
      'Lighting control is decided in two places that never meet: the distribution board, where the ' +
      'dimming actually happens, and the wall, where someone presses a button. This page sets out ' +
      'what Leading IT puts in each of them, who commissions what, and what the electrician needs ' +
      'before the walls close.',
    supplySubject: 'architectural lighting control systems',
    // 59 chars, inside the 66 the title formula leaves for this record.
    metaDetail: 'Crestron DIN-rail dimming, with KNX and DALI commissioning.',
    serviceType: 'Lighting control design, installation and commissioning',
    // A Crestron Horizon keypad with scene buttons beside a softly lit bedroom —
    // this page's subject, and `altFor()` already carries the drafted caption
    // (src/components/media/altText.ts, DRAFTED_ALT).
    hero: '/products/crestron/lifestyle/horizon-keypad-bedroom-brass.jpg',
    sections: [
      {
        id: 'does-leading-it-install-lighting-control',
        question: 'Does Leading IT install lighting control systems in Dubai?',
        answer:
          'Leading IT designs, supplies, installs and commissions architectural lighting control ' +
          'systems in Dubai, United Arab Emirates, including KNX and DALI installations.',
        body: [
          'The dimming and switching are built on Crestron DIN-rail modules inside the distribution ' +
            'board, with Basalte, Black Nova or Crestron keypads on the wall. Occupancy and daylight ' +
            'sensing is added where a room earns it rather than everywhere.',
          'Where a project is specified around a KNX bus or a DALI loop, Leading IT commissions that ' +
            'bus or loop as well. Crestron publishes the two modules that connect them to a control ' +
            'system: DIN-KXI is its KNX Secure IP gateway, and DIN-DLI is its DALI interface.',
          'Every module named on this page is in the catalogue on this site, with its own page and ' +
            'its published specification. A specifier can go from here to an exact model rather than ' +
            'to a category.',
        ],
      },
      {
        id: 'knx-dali-crestron-difference',
        question: 'What is the difference between KNX, DALI and Crestron dimming?',
        answer:
          'KNX is a wired bus that devices sit on, DALI addresses each fitting individually over its ' +
          'own loop, and Crestron dimming is Crestron’s own DIN-rail hardware. Leading IT designs, ' +
          'installs and commissions all three in Dubai.',
        body: [
          'The choice is usually made by the project rather than by preference. If the electrical ' +
            'specification already names KNX devices, the system is built around that bus. If the ' +
            'lighting design uses fittings with DALI drivers, it is built around DALI.',
          'Crestron dimming is the usual choice where one platform runs the whole house. The dimming, ' +
            'the keypads, the processor and the interface then come from one manufacturer, with one ' +
            'support route behind all four.',
          'The table below records what Crestron publishes about the two modules, and what Leading IT ' +
            'does. No standard wins here; the specification decides.',
        ],
        table: {
          caption: 'Crestron dimming, KNX and DALI compared',
          columns: ['', 'Crestron dimming', 'KNX', 'DALI'],
          rows: [
            [
              { text: 'Where the dimming happens' },
              { text: 'Crestron modules on the DIN rail in the distribution board' },
              { text: 'Devices sitting on the KNX bus' },
              { text: 'Drivers inside the light fittings themselves' },
            ],
            [
              { text: 'How Leading IT reaches it' },
              { text: 'Native to the Crestron control processor' },
              // Crestron's own subtitle for DIN-KXI is "KNX Secure IP Gateway",
              // so "gateway" is correct here and only here.
              { text: 'Crestron DIN-KXI, a KNX Secure IP gateway', to: '/brands/crestron/din-kxi' },
              // Crestron calls DIN-DLI an *interface*, never a gateway
              // (crestron-c2.md §4-B). Do not "improve" this word.
              { text: 'Crestron DIN-DLI, a DALI interface', to: '/brands/crestron/din-dli' },
            ],
            [
              { text: 'How much it addresses' },
              { text: 'Four dimmed channels per module' },
              { text: 'Up to 1,000 KNX datapoints' },
              { text: 'One loop, up to 64 DALI devices' },
            ],
            [
              { text: 'Where the bus power comes from' },
              { text: 'Cresnet, from a DIN-rail supply in the same board' },
              { text: 'DIN-KXI draws its own power from the KNX bus' },
              { text: 'DIN-DLI supplies the loop; external DALI supplies cannot be used' },
            ],
            [
              { text: 'What it is set up with' },
              { text: 'The module front panel, or Crestron software' },
              { text: 'ETS5 or ETS6 software, reaching the bus through DIN-KXI' },
              { text: 'The web interface built into the DIN-DLI' },
            ],
            [
              { text: 'Who commissions it' },
              { text: 'Leading IT' },
              { text: 'Leading IT' },
              { text: 'Leading IT' },
            ],
          ],
        },
      },
      {
        id: 'board-and-wall',
        question: 'What sits in the electrical board, and what sits on the wall?',
        answer:
          'In a Leading IT lighting control system, the dimming sits on the DIN rail in the ' +
          'distribution board and the wall holds only the keypad. That split is why board space has ' +
          'to be agreed with the electrician early.',
        body: [
          'Dimming modules are wide. A four-channel Crestron dimmer occupies twelve DIN module ' +
            'spaces, the eight-channel switching module nine, and the DALI interface three; the KNX ' +
            'gateway takes one. If the board is sized before the lighting control is chosen, ' +
            'extending it becomes a change to the electrical scope rather than the automation one.',
          'Heat and clearance are board decisions too. Crestron publishes a minimum clearance of ' +
            'four inches above and below its dimming modules, and recommends six, which a board ' +
            'packed to the last space cannot give it.',
          'Power and the control bus live in the same board. DIN-PWS60 supplies Cresnet at 24 volts ' +
            'across six ports, and DIN-HUB splits the bus into further segments once a villa or a ' +
            'hotel floor outgrows a single run.',
          'The wall holds the keypad and nothing else. Engraving, button count and finish are settled ' +
            'at finishes stage with the interior designer, not at commissioning. The engraving is ' +
            'manufactured into the plate; it is not a setting.',
          'Sensing is one ceiling point doing two jobs. The Crestron GLS-OIRLCL-C-CN detects presence ' +
            'across an area of up to 450 square feet. It also reads the daylight already in the room, ' +
            'so the lights stay off while the room is bright enough without them.',
        ],
        table: {
          caption: 'What lighting control puts in the distribution board',
          columns: ['Module', 'What it does', 'DIN rail space'],
          rows: [
            [
              { text: 'DIN-1DIM4', to: '/brands/crestron/din-1dim4' },
              { text: 'Four dimmer channels on one feed, for leading-edge ELV, incandescent and magnetic low voltage loads' },
              { text: '12 module spaces' },
            ],
            [
              { text: 'DIN-1DIMU4', to: '/brands/crestron/din-1dimu4' },
              { text: 'Four universal channels, each detecting forward or reverse phase for the load on it' },
              { text: '12 module spaces' },
            ],
            [
              { text: 'DIN-8SW8-I', to: '/brands/crestron/din-8sw8-i' },
              { text: 'Eight switched channels for non-dimmable lighting and fans, with eight isolated inputs' },
              { text: '9 module spaces' },
            ],
            [
              { text: 'DIN-DLI', to: '/brands/crestron/din-dli' },
              { text: 'One DALI loop of up to 64 devices, with the loop power supplied by the module' },
              { text: '3 module spaces' },
            ],
            [
              { text: 'DIN-KXI', to: '/brands/crestron/din-kxi' },
              { text: 'KNX Secure IP gateway for up to 1,000 datapoints, powered from the KNX bus' },
              { text: '1 module space' },
            ],
            [
              { text: 'DIN-PWS60', to: '/brands/crestron/din-pws60' },
              { text: '60 W of Cresnet power on six ports, wired from the front of the board' },
              { text: '6 module spaces' },
            ],
            [
              { text: 'DIN-HUB', to: '/brands/crestron/din-hub' },
              { text: 'Three further Cresnet segments, once one run is not enough' },
              { text: '6 module spaces' },
            ],
          ],
        },
      },
      {
        id: 'first-fix',
        question: 'What does the electrician need at first fix?',
        answer:
          'Before first fix closes, Leading IT issues the electrician a circuit schedule, a board ' +
          'space allocation, and the cable runs for keypads and sensors. The table below is that ' +
          'list, in the order it is usually needed.',
        body: [
          'Two items on it surprise a contractor who has only wired conventional lighting. Every ' +
            'keypad position needs a neutral, because a keypad is a powered device rather than a ' +
            'mechanical switch. And the back box has to be deep enough for the plate going into it.',
          'The rest is coordination. The circuit schedule is agreed with the lighting designer, the ' +
            'board allocation with the electrical contractor, and the sensor positions with whoever ' +
            'is drawing the ceiling.',
        ],
        table: {
          caption: 'The first-fix list for a lighting control system',
          columns: ['At first fix', 'What lighting control needs'],
          rows: [
            [
              { text: 'Circuit schedule' },
              { text: 'Every lighting circuit named, with its load type and the room it serves' },
            ],
            [
              { text: 'Board space' },
              { text: 'Module spaces reserved on the DIN rail, with the published clearance above and below' },
            ],
            [
              { text: 'Control cabling' },
              { text: 'A home run to each keypad and sensor position, back to the board or the rack' },
            ],
            [
              { text: 'Back boxes' },
              { text: 'Set at the depth and gang size the specified keypad needs' },
            ],
            [
              { text: 'Neutrals' },
              { text: 'A neutral at every keypad position, not only at the light fitting' },
            ],
            [
              { text: 'Board and rack position' },
              { text: 'Agreed with the architect, somewhere that can be ventilated' },
            ],
          ],
        },
      },
      {
        id: 'how-scenes-are-commissioned',
        question: 'How are dimming curves and scenes commissioned?',
        answer:
          'Leading IT commissions lighting control in Dubai in three stages: addressing, then dimming ' +
          'curves, then scenes. Only the first of the three can be done before the fittings are in.',
        body: [
          'Addressing is the paperwork made real: every channel is proved to switch the circuit the ' +
            'schedule says it does. It is done with the electrician present, because the corrections ' +
            'are at the board.',
          'Dimming curves come next. Each load type behaves differently at the bottom of its range. ' +
            'The curve is set per channel, so that ten per cent looks like ten per cent in the room ' +
            'rather than on the dimmer.',
          'Scenes are set at night, in the finished room, with the lighting designer where there is ' +
            'one. A scene set from a drawing is a guess; a scene set in the room is a decision.',
          'An astronomical clock is set at the same time, so exterior and circulation lighting ' +
            'follows sunset through the year rather than a fixed hour. A return visit once the client ' +
            'has lived with the house is normal, and is where the scenes usually settle.',
        ],
      },
      {
        id: 'which-lamps-dim',
        question: 'Which lamps and drivers dim properly?',
        answer:
          'Leading IT specifies lighting control in Dubai around the drivers the fittings actually ' +
          'contain, because a dimmer and an LED driver have to agree before anything dims smoothly.',
        body: [
          'The failure everyone meets is an LED that flickers or drops out near the bottom of its ' +
            'range. Two things cause it: the dimmer is driving the load on the wrong phase, or the ' +
            'circuit sits below the minimum load the module needs to see.',
          'Phase is the first of those. Crestron publishes leading-edge support on the DIN-1DIM4, for ' +
            'electronic low voltage, incandescent and magnetic low voltage loads. The DIN-1DIMU4 ' +
            'detects forward or reverse phase on each channel, and each channel can also be set by hand.',
          'Minimum load is the second. Each module publishes a minimum wattage per channel, and a ' +
            'single low-power LED downlight alone on a circuit can sit below it. That is a ' +
            'specification problem rather than a fault, and it is cheaper to find on a schedule than ' +
            'on site.',
          'No lamp brand is endorsed here, because compatibility is a property of the specific driver ' +
            'rather than of the name on the box. Send the fitting schedule and the drivers can be ' +
            'checked against the module before anything is ordered.',
        ],
      },
      {
        id: 'lighting-control-pakistan',
        question: 'Does Leading IT supply lighting control to Pakistan?',
        answer:
          'Leading IT supplies lighting control equipment to projects in Pakistan from its Dubai base.',
        body: [
          'Modules and keypads ship from Dubai, commissioning support is given remotely or by a ' +
            'visit, and warranty claims are routed through the same team that supplied the goods. ' +
            'There is no Pakistan office and no local address; the relationship is supply and ' +
            'support, stated as exactly that.',
        ],
      },
    ],
    faq: [
      {
        question: 'Do I need KNX or Crestron for a villa in Dubai?',
        answer:
          'Neither is the right answer on its own. The deciding factor is whether the electrical ' +
          'specification already names KNX devices: if it does, that bus stays and a Crestron DIN-KXI ' +
          'brings it into the same interface. If the lighting is still being specified, a ' +
          'single-platform Crestron system is simpler to own, because the dimming, the keypads and ' +
          'the processor share one support route.',
      },
      {
        question: 'Can lighting control be retrofitted into a finished villa?',
        answer:
          'Partly, and the constraints are physical rather than technical. The board needs space for ' +
          'the modules, every keypad position needs a neutral, and the back boxes have to be deep ' +
          'enough for the plate. Where those three exist a retrofit is straightforward; where they do ' +
          'not, the work becomes an electrical alteration rather than an automation one.',
      },
      {
        question: 'Why do my dimmable LEDs flicker?',
        answer:
          'Usually one of two reasons: the dimmer is driving the load on the wrong phase for the ' +
          'driver, or the circuit is below the module’s published minimum load. Both are settled at ' +
          'specification stage rather than by turning something up afterwards. Sending the fitting ' +
          'and driver schedule is what makes the answer specific.',
      },
      {
        question: 'Can I keep my existing light fittings?',
        answer:
          'Usually yes, with one caveat: it depends on the driver inside the fitting rather than on ' +
          'the fitting itself. Electronic and magnetic low voltage loads generally want leading-edge ' +
          'dimming and many LED drivers want trailing edge, which is why a universal module exists. ' +
          'Fittings whose drivers are not dimmable at all cannot be dimmed by any control system.',
      },
      {
        question: 'What does lighting control cost in a Dubai villa?',
        answer:
          'It is quoted per project. The figure follows the number of dimmed and switched circuits, ' +
          'the keypad count and finish, the board space available, and whether KNX or DALI is in the ' +
          'specification. A circuit schedule and a keypad count therefore produce a far more useful ' +
          'answer than a room count.',
      },
    ],
    relatedBrandSlugs: ['crestron', 'basalte', 'black-nova'],
    relatedProductPaths: [
      '/brands/crestron/din-1dim4',
      '/brands/crestron/din-1dimu4',
      '/brands/crestron/din-8sw8-i',
      '/brands/crestron/din-dli',
      '/brands/crestron/din-kxi',
      '/brands/crestron/gls-oirlcl-c-cn',
      '/brands/crestron/hz2-kpcn',
      '/brands/basalte/sentido',
      '/brands/black-nova/alba',
    ],
    whatsappPrefill: 'Hi Leading IT — I need a lighting control system for a project in Dubai.',
  },

  /**
   * ## The brief's component table named two products that are not loudspeakers
   *
   * `docs/10-CONTENT-BRIEFS/solutions-multi-room-audio.md` lists "Basalte Auro"
   * as an in-ceiling speaker and "Basalte Fibonacci" as a wall-mounted speaker.
   * Against `src/data/products.ts`, **Auro is a flush motion sensor with an
   * integrated night light and Fibonacci is a design switch.** Neither is an
   * audio product and neither appears below.
   *
   * Basalte's actual loudspeakers in the catalogue are **Aalto** (in-wall,
   * on-wall, freestanding and soundbars) and **Plano** (passive in-wall, R3 and
   * R5). The in-ceiling models are **UandKSound E Series** (E610C, E650FX). The
   * table was rebuilt from the records rather than from the brief, and the
   * discrepancy is logged in `docs/12-PROVENANCE/phase4-solutions-build.md` §12
   * for the content-strategist to correct at source.
   *
   * **No outdoor or landscape audio anywhere on this page.** The brief asks for a
   * terrace-and-pool paragraph and warns that only published ingress ratings may
   * be stated. The catalogue contains no outdoor loudspeaker and therefore no
   * published rating to state, so the subject is absent rather than hedged.
   */
  {
    slug: 'multi-room-audio',
    name: 'Multi-Room Audio',
    h1: 'Multi-room audio systems in Dubai — design, supply and installation',
    intro:
      'Music in every room is an amplification and cabling decision made long before anyone chooses ' +
      'a speaker. This page covers how zones are counted, where the loudspeakers can physically go, ' +
      'what the ceiling contractor needs to know, and which equipment Leading IT supplies for it.',
    supplySubject: 'multi-room and multi-zone audio systems',
    // 56 chars, inside the 65 the title formula leaves for this record.
    metaDetail: 'Crestron Avia DSP, Basalte speakers and Blustream Dante.',
    serviceType: 'Multi-room and multi-zone audio design and installation',
    // A Marantz amplifier on a sideboard in a warmly lit living room — music in a
    // room, which is this page's subject. Captioned in `altText.ts` CURATED.
    hero: '/brands/marantz.jpg',
    sections: [
      {
        id: 'what-is-multi-room-audio',
        question: 'What is a multi-room audio system?',
        answer:
          'A multi-room audio system is one set of amplification and sources feeding several zones, ' +
          'each with its own volume and its own choice of what is playing. Leading IT designs, ' +
          'supplies and installs multi-room and multi-zone audio systems across Dubai villas and ' +
          'apartments.',
        body: [
          'A zone is a room, or part of one, that can be controlled on its own. The amplification is ' +
            'central, usually in a rack, and only speaker cable and network reach the rooms ' +
            'themselves.',
          'That is the whole difference from a shelf of wireless speakers. One rack, one interface, ' +
            'one place to service it, and no box sitting in a room that was designed not to have one.',
        ],
      },
      {
        id: 'what-leading-it-installs-for-audio',
        question: 'What does Leading IT install for multi-room audio?',
        answer:
          'Leading IT builds multi-room audio in Dubai on Crestron Avia DSP amplification, with ' +
          'Basalte and UandKSound architectural loudspeakers, and Blustream Dante where the audio ' +
          'travels over the network.',
        body: [
          'The DSP is the centre of it. The DSP-1280 carries twelve mic/line inputs and eight ' +
            'balanced outputs, and the DSP-860 is the same idea at eight in and six out. The DSP-1281 ' +
            'adds 32 Dante channels each way, which is how channel count grows without a second rack.',
          'Loudspeakers are chosen by where they have to disappear. UandKSound E Series covers the ' +
            'in-wall and in-ceiling positions with paintable micro-perforated grilles, and Basalte ' +
            'Aalto and Plano cover the rooms where the speaker is meant to be seen.',
          'Control is whatever the rest of the house already uses: a Crestron touch screen or keypad, ' +
            'or LIT Home, the interface Leading IT builds itself. Nothing about the audio system ' +
            'requires a second app.',
        ],
        table: {
          caption: 'What Leading IT supplies for a multi-room audio system',
          columns: ['Element', 'What Leading IT supplies', 'Where to look'],
          rows: [
            [
              { text: 'Zone amplification and DSP' },
              { text: 'Crestron Avia DSP-1280, DSP-1281 and DSP-860' },
              { text: 'Crestron', to: '/brands/crestron' },
            ],
            [
              { text: 'In-ceiling and in-wall speakers' },
              { text: 'UandKSound E Series, in-wall and in-ceiling, with paintable grilles' },
              { text: 'UandKSound', to: '/brands/uandksound' },
            ],
            [
              { text: 'Speakers meant to be seen' },
              { text: 'Basalte Aalto in-wall, on-wall and freestanding; Basalte Plano passive in-wall' },
              { text: 'Basalte', to: '/brands/basalte' },
            ],
            [
              { text: 'Audio over the network' },
              { text: 'Blustream Dante encoders and decoders, the DA1414 matrix and NPA amplifiers' },
              { text: 'Blustream', to: '/brands/blustream' },
            ],
            [
              { text: 'A compact single-room source' },
              { text: 'Marantz M-CR612 network CD receiver' },
              { text: 'Marantz', to: '/brands/marantz' },
            ],
            [
              { text: 'Control' },
              { text: 'Crestron touch screens and keypads, or LIT Home' },
              { text: 'LIT Home', to: '/lit-home' },
            ],
            [
              { text: 'Cinema audio in the same house' },
              { text: 'A separate specification that shares sources rather than speakers' },
              { text: 'Home cinema', to: '/solutions/home-cinema' },
            ],
          ],
        },
      },
      {
        id: 'how-many-zones',
        question: 'How many zones does a villa actually need?',
        answer:
          'The zone count follows how rooms are used, not how many rooms there are. Leading IT ' +
          'specifies multi-room audio in Dubai by deciding which rooms need a stereo pair, which need ' +
          'a single point, and which need nothing at all.',
        body: [
          'Living rooms, kitchens, the majlis and a terrace are usually stereo pairs, because people ' +
            'sit in them and stay. Corridors, utility rooms and walk-in wardrobes take one point or ' +
            'none, and a room nobody listens in should not be counted as a zone at all.',
          'The real trade-off is amplifier channels against zones, not budget against rooms. Every ' +
            'stereo zone takes two channels and a cable run, so a house with fourteen zones is a ' +
            'different rack from a house with six.',
          'Deciding this early is what keeps it cheap. A zone that exists on the drawing costs a ' +
            'cable; a zone added after the ceiling closes costs a ceiling.',
        ],
      },
      {
        id: 'where-the-speakers-go',
        question: 'Where do the speakers go, and who decides?',
        answer:
          'Speaker positions in a Dubai villa are a ceiling coordination problem before they are an ' +
          'audio one. Leading IT agrees them with the lighting designer and the MEP contractor before ' +
          'the ceiling closes.',
        body: [
          'The ceiling is crowded. Downlights, sprinklers, air-conditioning grilles and the ceiling ' +
            'grid all have prior claims. A speaker moved 400 mm to clear a sprinkler head is no ' +
            'longer aimed where it was drawn.',
          'Depth above the plasterboard decides what can be used at all. An E620IW needs 98 mm behind ' +
            'a 456 × 186 mm cut-out; an E650FX in-ceiling model needs 121.5 mm. A shallow apartment ' +
            'soffit rules some of that out before any listening happens.',
          'Cable is a home run per speaker back to the rack, not a chain from room to room. A chain ' +
            'shares one amplifier channel between rooms that then cannot be controlled separately, ' +
            'which defeats the point of zoning them.',
          'The rack is the last physical decision and the one most often left late. Amplification ' +
            'produces heat, a rack in an unconditioned riser through a Dubai August runs hot, and ' +
            'ventilation belongs on the drawing rather than in a service call.',
        ],
        table: {
          caption: 'What a UandKSound E Series loudspeaker needs behind the finish',
          columns: ['Model', 'Where it goes', 'Mounting depth'],
          rows: [
            [
              { text: 'E610IW' },
              { text: 'In-wall, cut-out H286 × W186 mm' },
              { text: '98 mm' },
            ],
            [
              { text: 'E620IW' },
              { text: 'In-wall, cut-out H456 × W186 mm' },
              { text: '98 mm' },
            ],
            [
              { text: 'E610C' },
              { text: 'In-ceiling' },
              { text: '92 mm' },
            ],
            [
              { text: 'E650FX' },
              { text: 'In-ceiling' },
              { text: '121.5 mm' },
            ],
          ],
        },
      },
      {
        id: 'which-sources',
        question: 'Which sources feed a multi-room audio system?',
        answer:
          'Leading IT feeds multi-room audio in Dubai from streaming services, local sources in the ' +
          'rack, and the cinema room where the house has one. All of them arrive at the same DSP.',
        body: [
          'A small system can be a single source and a single amplifier. A Marantz M-CR612 in a ' +
            'guest apartment or a staff kitchen is a complete zone on its own, with network audio and ' +
            'a disc player in one box.',
          'A large system moves audio over the network instead of over analogue cable. Blustream ' +
            'Dante distributes multi-channel audio across standard gigabit infrastructure, and the ' +
            'Crestron DSP-1281 speaks the same protocol, so the two ends meet without a converter.',
          'Cinema audio is deliberately not shared as a speaker feed. The cinema room is its own ' +
            'specification with its own amplification; what the two systems share is sources and the ' +
            'interface in front of them.',
        ],
      },
      {
        id: 'multi-room-audio-cost',
        question: 'What does a multi-room audio system cost in Dubai?',
        answer:
          'Leading IT quotes multi-room audio in Dubai per project, because the zone count and the ' +
          'state of the ceilings move the figure more than the speaker choice does.',
        body: [
          'Four things drive it: the number of stereo zones, the loudspeakers the interiors will ' +
            'accept, whether the ceilings are open, and whether audio travels over cable or network.',
          'A zone plan on a floor layout is therefore worth more at the first conversation than a ' +
            'model list. Send the plan and the reply can be specific about channels and cable.',
        ],
      },
      {
        id: 'multi-room-audio-pakistan',
        question: 'Does Leading IT supply multi-room audio to Pakistan?',
        answer:
          'Leading IT supplies multi-room audio equipment to projects in Pakistan from its Dubai base.',
        body: [
          'Amplification, loudspeakers and distribution ship from Dubai, commissioning support is ' +
            'given remotely or by a visit, and warranty claims are routed through the same team that ' +
            'supplied the goods. There is no Pakistan office and no local address; the relationship ' +
            'is supply and support, stated as exactly that.',
        ],
      },
    ],
    faq: [
      {
        question: 'How many speakers does one room need?',
        answer:
          'It follows the size of the room and what happens in it, and any fixed rule of thumb is a ' +
          'sales figure rather than an engineering one. A room people sit and listen in wants a ' +
          'stereo pair placed for where the seating actually is. A corridor or a utility room is ' +
          'served by a single point, and adding a second changes nothing anyone will hear.',
      },
      {
        question: 'Can in-ceiling speakers be added to a finished apartment?',
        answer:
          'Sometimes, and the two constraints are access and route. There has to be enough depth ' +
          'above the plasterboard for the model chosen: 92 mm for a UandKSound E610C. There also has ' +
          'to be a way to pull cable back to the rack without opening the ceiling end to end. Where ' +
          'the second is impossible, an in-wall or on-wall speaker usually is not.',
      },
      {
        question: 'Can each room play something different?',
        answer:
          'Yes, and that is exactly what the zone count buys. Each independent stereo zone occupies ' +
          'two amplifier channels. How many rooms can play different things at once is therefore ' +
          'decided by the DSP and amplification in the rack, not by the app.',
      },
      {
        question: 'Can the same system feed the cinema room?',
        answer:
          'They share sources, not speakers. A cinema room is a separate specification: its own ' +
          'processing, its own amplification, its own channel layout. Distributed audio is built ' +
          'for coverage; a cinema system is built for one seating position. The streaming services ' +
          'and the control interface are common to both.',
      },
      {
        question: 'Does Leading IT supply multi-room audio in Pakistan?',
        answer:
          'Yes, on a supply basis. Equipment ships from Dubai, commissioning support is remote or by ' +
          'a visit, and warranty runs back through the team that supplied it. There is no Pakistan ' +
          'office and no local address.',
      },
    ],
    relatedBrandSlugs: ['crestron', 'basalte', 'uandksound', 'blustream', 'marantz'],
    relatedProductPaths: [
      '/brands/crestron/dsp-1280',
      '/brands/crestron/dsp-1281',
      '/brands/crestron/dsp-860',
      '/brands/uandksound/e-series',
      '/brands/basalte/plano',
      '/brands/basalte/aalto',
      '/brands/blustream/dante',
      '/brands/marantz/m-cr612',
    ],
    whatsappPrefill: 'Hi Leading IT — I want multi-room audio in a villa in Dubai.',
  },

  /**
   * ## Two subsystems are deliberately missing from this page
   *
   * 1. **Security.** Muneeb confirmed on 2026-08-01 (`docs/OPEN-QUESTIONS.md`
   *    #25, recorded in `docs/00-CONTEXT.md` §4) that Leading IT does supply
   *    security — and the same entry blocks the claim on a **brand name plus a
   *    manufacturer source**, because there is no security product anywhere in
   *    the catalogue. A capability being real is not the same as a claim being
   *    defensible: "and security" in the subsystem table would point at nothing
   *    a reader could open, which is rule 1 regardless of the capability being
   *    true. No security row, no security sentence, no hint of one. When a brand
   *    is named and sourced, this page gains a row and the H2 answer gains a
   *    noun.
   * 2. **Shading.** `/solutions/shading/` was retired 2026-07-31 (OQ #22) and
   *    301s to `/solutions/`. This is the page most at risk of quietly absorbing
   *    that intent, so it holds no shading row, no shading FAQ, no shading
   *    moment in the "what it feels like" section, and not the single
   *    integration sentence the brief would have permitted in FAQ 3 — the
   *    orchestrator's standing instruction for this slice is none, anywhere
   *    (`docs/04` §10.10).
   */
  {
    slug: 'whole-home-control',
    name: 'Whole-Home Control',
    h1: 'Whole-home control in Dubai — one system for lighting, climate, audio and cinema',
    intro:
      'A whole-home system is judged on one thing: whether the house is easier to use than it was ' +
      'with ordinary switches. This page sets out what Leading IT installs in a Dubai villa or ' +
      'apartment, what changes between the two, and what can still be done once the walls are shut.',
    supplySubject: 'whole-home control systems',
    // 71 chars, inside the 77 the title formula leaves for this record.
    metaDetail: 'Crestron control, Basalte and Black Nova keypads, and the LIT Home app.',
    serviceType: 'Whole-home control system design and installation',
    // A white Crestron Horizon keypad with scene and volume buttons backlit —
    // several subsystems on one plate, which is this page's argument. Captioned
    // in `altText.ts` DRAFTED_ALT.
    hero: '/products/crestron/lifestyle/horizon-keypad-white-backlit.jpg',
    sections: [
      {
        id: 'what-is-whole-home-control',
        question: 'What is whole-home control?',
        answer:
          'Whole-home control is a single system that runs the lighting, climate, audio and cinema in ' +
          'a house from one interface, instead of an app per product. Leading IT installs whole-home ' +
          'control systems in Dubai that bring those subsystems together.',
        body: [
          'The difference from a set of smart devices is where the logic lives. In a whole-home ' +
            'system a processor holds it, the keypads and screens are just ways of reaching it, and a ' +
            'scene can change four subsystems on one press.',
          'That is also why it is specified rather than bought. The equipment list follows the ' +
            'circuits, the rooms and the way the house is used, and two villas of the same size ' +
            'rarely produce the same list.',
        ],
      },
      {
        id: 'what-leading-it-installs',
        question: 'What does Leading IT actually install?',
        answer:
          'Leading IT builds whole-home control in Dubai on Crestron processors and DIN-rail lighting ' +
          'modules, with Basalte and Black Nova keypads on the wall, and LIT Home as the daily ' +
          'interface.',
        body: [
          'Each row of the table below is a subsystem with a page behind it. Nothing is listed there ' +
            'that Leading IT does not carry, which is why the table is shorter than a generic ' +
            'automation brochure.',
          'The processor is the one component a client never sees and never touches. It sits in the ' +
            'rack or on the DIN rail beside the dimming. It is what keeps the house running when a ' +
            'phone, a screen or an internet line is not available.',
        ],
        table: {
          caption: 'What a whole-home system is made of',
          columns: ['Subsystem', 'What Leading IT supplies', 'Where to read more'],
          rows: [
            [
              { text: 'Lighting' },
              { text: 'Crestron DIN-rail dimming and switching, scenes and sensors' },
              { text: 'Lighting control', to: '/solutions/lighting-control' },
            ],
            [
              { text: 'Climate' },
              { text: 'Crestron HZ-THSTAT thermostat control, with an integrated humidistat' },
              { text: 'Crestron', to: '/brands/crestron' },
            ],
            [
              { text: 'Audio' },
              { text: 'Crestron Avia DSP amplification with architectural loudspeakers' },
              { text: 'Multi-room audio', to: '/solutions/multi-room-audio' },
            ],
            [
              { text: 'Cinema' },
              { text: 'Projection, processing and loudspeakers, recalled as one scene' },
              { text: 'Home cinema', to: '/solutions/home-cinema' },
            ],
            [
              { text: 'Keypads and wall plates' },
              { text: 'Basalte and Black Nova keypads, engraved to the room they serve' },
              { text: 'Design a keypad online', to: '/brands/black-nova/keypad-designer' },
            ],
            [
              { text: 'Interface' },
              { text: 'Crestron touch screens and keypads, and the LIT Home app' },
              { text: 'LIT Home', to: '/lit-home' },
            ],
          ],
        },
      },
      {
        id: 'living-with-it',
        question: 'What does it feel like to live with?',
        answer:
          'A whole-home system in Dubai is noticed in the corridor, not in the app. Leading IT builds ' +
          'systems around the four or five moments a household actually repeats every day.',
        body: [
          'The first is the corridor wall. Five switch plates and a thermostat become one engraved ' +
            'keypad, and the visitor who has never been in the house before can still find the ' +
            'lights.',
          'The second is six in the morning. One press takes the ground floor from night to day: ' +
            'circulation lighting up, the kitchen at working level, the cooling already running ' +
            'before anyone comes downstairs.',
          'The third is the afternoon at forty-five degrees. Coming in from the terrace changes the ' +
            'cooling and the lighting scene together, because they were commissioned as one state ' +
            'rather than two settings.',
          'The last is the end of the evening. One press puts the house to bed — the ground floor ' +
            'dark, the cinema off, the corridor at ten per cent so nobody navigates the stairs by ' +
            'phone light.',
        ],
      },
      {
        id: 'villa-or-apartment',
        question: 'What does a villa system need that an apartment does not?',
        answer:
          'A Dubai villa needs more circuits, more keypads and a real rack position; an apartment ' +
          'usually needs a smaller system built around what can be reached. Leading IT specifies both ' +
          'from the same catalogue.',
        body: [
          'Circuit count is the honest divider. A villa with three floors, a garden and a majlis has ' +
            'several times the dimmed and switched circuits of a two-bedroom apartment. That decides ' +
            'board size before it decides anything else.',
          'Interfaces scale with the same logic. A 10.1-inch Crestron TSW-1080 earns its place in a ' +
            'villa hallway, where it replaces a wall of plates. A 5-inch TSW-570 beside an apartment ' +
            'door does the same job at the scale of that home.',
          'The rack is the last difference and the one apartments feel most. A villa can be given a ' +
            'ventilated cupboard for equipment; a tower apartment usually cannot. The equipment list ' +
            'is then chosen to fit the space that exists rather than the space that would be ideal.',
        ],
      },
      {
        id: 'retrofit',
        question: 'Can whole-home control be added to a finished home?',
        answer:
          'Yes, within limits set by cable rather than by software. Leading IT retrofits control ' +
          'systems in Dubai homes wherever the back boxes, the neutrals and a route back to the board ' +
          'already exist.',
        body: [
          'Keypads are the usual starting point. Where a switch position has a neutral and a back box ' +
            'of the right depth, a keypad can take the place of the plate already there. The scene ' +
            'behind it is new even though the wiring is not.',
          'Dimming is next, because it lives in the distribution board rather than behind the plate. ' +
            'If there is board space, the circuits can be brought under control without touching a ' +
            'single wall.',
          'What retrofits badly is anything needing a new cable route through a finished ceiling — ' +
            'in-ceiling loudspeakers, new sensor positions, a new rack location. That is the line, ' +
            'and it is worth drawing it before the scope is agreed rather than after.',
        ],
      },
      {
        id: 'which-app',
        question: 'Which app runs a whole-home system?',
        answer:
          'Leading IT installs its own interface, LIT Home, on the systems it builds in Dubai, and ' +
          'the Crestron app where a project specifies one.',
        body: [
          'LIT Home is software Leading IT builds and supports itself, which is why it is ' +
            'demonstrated in full on this site rather than described. A visitor can open the demo and ' +
            'use the same screens a client uses.',
          'Where a project has standardised on Crestron throughout, the Crestron app runs it instead. ' +
            'The processor and the wiring are identical either way; the choice is about which ' +
            'interface the household prefers to live with.',
        ],
      },
      {
        id: 'whole-home-control-cost',
        question: 'What does whole-home automation cost in Dubai?',
        answer:
          'Leading IT quotes whole-home control in Dubai per project. The circuit count and the ' +
          'state of the building move the figure far more than the brand on the keypad does.',
        body: [
          'Four things drive it: the number of dimmed and switched circuits, the keypad and screen ' +
            'count, which subsystems are included, and new build versus retrofit.',
          'The useful first conversation is therefore about the house and the programme. A floor plan ' +
            'and a rough circuit count produce a specific answer; a request for a price per square ' +
            'foot cannot.',
        ],
      },
      {
        id: 'whole-home-control-pakistan',
        question: 'Does Leading IT supply whole-home control to Pakistan?',
        answer:
          'Leading IT supplies whole-home control equipment to projects in Pakistan and supports ' +
          'commissioning remotely from Dubai.',
        body: [
          'Processors, dimming modules, keypads and screens ship from Dubai. Commissioning support is ' +
            'given remotely or by a visit, and warranty claims are routed through the same team that ' +
            'supplied the goods.',
          'There is no Pakistan office and no local address. The relationship is supply, shipping and ' +
            'support, and this site says nothing more than that about it.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is the difference between a smart home and a whole-home control system?',
        answer:
          'The number of systems, not the number of features. A smart home is usually several ' +
          'products that each work well and each keep their own app, their own account and their own ' +
          'failure. A whole-home control system puts the logic in one processor, so a scene can ' +
          'change lighting, climate and audio together and one keypad speaks for all three.',
      },
      {
        question: 'Do I have to decide everything before construction?',
        answer:
          'No, but some decisions get much more expensive after first fix. Cable routes, back boxes, ' +
          'neutrals at switch positions, board space and a rack location are cheap while the walls ' +
          'are open and awkward afterwards. Which keypad finish, which screens and which scenes can ' +
          'all wait.',
      },
      {
        question: 'Can it work with the air conditioning already installed?',
        answer:
          'Often, and the answer depends on the plant rather than on the control system. The Crestron ' +
          'HZ-THSTAT drives two-stage heating and cooling, two-stage heat pumps, 2-pipe and 4-pipe ' +
          'fan-coil systems, floor warming and humidity control. That covers most of what is fitted ' +
          'in Dubai homes. The way to get a real answer is to send the HVAC schedule rather than to ' +
          'accept a blanket compatibility promise.',
      },
      {
        question: 'What happens if the internet goes down?',
        answer:
          'The wired parts keep working, because they were never on the internet. Keypads, dimming ' +
          'and the processor are on a local bus. Crestron publishes that its DIN-8SW8-I switching ' +
          'module can be triggered by ordinary momentary switches with or without a control system. ' +
          'What stops is anything that is genuinely a cloud service: streaming, remote access from ' +
          'outside the house, and voice assistants.',
      },
      {
        question: 'Does Leading IT supply whole-home control in Pakistan?',
        answer:
          'Yes, on a supply basis. Equipment ships from Dubai, commissioning support is remote or by ' +
          'a visit, and warranty runs back through the team that supplied it. There is no Pakistan ' +
          'office and no local address.',
      },
    ],
    relatedBrandSlugs: ['crestron', 'basalte', 'black-nova'],
    relatedProductPaths: [
      '/brands/crestron/din-ap4',
      '/brands/crestron/tsw-1080',
      '/brands/crestron/tsw-570',
      '/brands/crestron/hz-thstat',
      '/brands/crestron/hz2-kpcn',
      '/brands/crestron/din-1dimu4',
      '/brands/basalte/sentido',
      '/brands/black-nova/alba',
    ],
    whatsappPrefill: 'Hi Leading IT — I’d like whole-home automation for my villa in Dubai.',
  },

  /**
   * ## The GRMS line, and why it is neither a claim nor a denial
   *
   * Muneeb confirmed on 2026-08-01 (`docs/OPEN-QUESTIONS.md` #27, recorded in
   * `docs/00-CONTEXT.md` §4) that Leading IT **does** deliver a GRMS platform —
   * and the same entry blocks any on-page claim until **the platform is named
   * and a manufacturer source exists.** That leaves exactly one honest position,
   * and it is narrower than either of the two obvious ones:
   *
   * - It may **not** claim to supply a GRMS platform. No platform is named, no
   *   source exists, and the catalogue holds no GRMS head-end, no door-lock
   *   system and no PMS interface.
   * - It may **not** say Leading IT does not supply one, which the brief's FAQ 1
   *   ("**no**; plain answer, no hedging") predates the confirmation and would
   *   now assert something Muneeb has told us is false.
   *
   * So the page says what is true in both worlds: Leading IT supplies the
   * in-room control layer and **integrates it with the GRMS the project
   * specifies.** The component table's GRMS row reads "Integrated, not supplied"
   * and that wording is load-bearing. FAQ 1's question was rewritten from "Does
   * Leading IT supply a GRMS platform?" to an integration question for the same
   * reason. **No PMS claim in either direction** — a separate unanswered
   * question, so the noun does not appear.
   *
   * **No hotel name, brand, room count, project reference or photograph.** Not
   * one (`docs/00-CONTEXT.md` §4). Hospitality references are the most tempting
   * fabrication on this site and the easiest to disprove.
   *
   * **No curtains, blinds or motors** — the shading retirement is inherited, not
   * re-litigated (`docs/04` §10.10).
   */
  {
    slug: 'hospitality',
    name: 'Hospitality Automation',
    h1: 'Guest-room control and hospitality automation in the UAE',
    intro:
      'A hotel room is not a small villa. It is one design repeated across every key, serviced by ' +
      'people who did not install it, and used by a guest who will not read anything. This page ' +
      'sets out what Leading IT supplies inside the room, what it integrates with, and what an ' +
      'operator has to decide before the mock-up room is built.',
    supplySubject: 'guest-room control and hospitality AV systems',
    // 50 chars, inside the 58 the title formula leaves for this record.
    metaDetail: 'Black Nova AXES panels with Crestron and Blustream.',
    serviceType: 'Guest-room control and hospitality AV integration',
    // A Crestron keypad controlling temperature on a concrete wall — the in-room
    // control layer this page is about. Captioned in `altText.ts` DRAFTED_ALT.
    hero: '/products/crestron/lifestyle/horizon-keypad-bathroom.jpg',
    sections: [
      {
        id: 'what-a-guest-room-controls',
        question: 'What does a hotel guest room need to control?',
        answer:
          'A guest room needs lighting scenes, climate, a door status the corridor can read, and the ' +
          'AV in the room. Leading IT supplies and installs guest-room control systems for hotels in ' +
          'Dubai and across the United Arab Emirates.',
        body: [
          'The list is short on purpose. Every function added to a guest room is one housekeeping ' +
            'has to understand, engineering has to maintain, and a guest has to work out in the dark.',
          'The operator’s test is not how much the room can do. It is whether a guest arriving at ' +
            'one in the morning can turn on one light and find the temperature without reading ' +
            'anything.',
        ],
      },
      {
        id: 'what-leading-it-supplies-for-a-guest-room',
        question: 'What does Leading IT supply for a guest room?',
        answer:
          'Leading IT supplies Black Nova AXES panels for guest rooms, with Crestron control and ' +
          'lighting and Blustream AV distribution, for hotel projects in Dubai and the United Arab ' +
          'Emirates.',
        body: [
          'AXES is Black Nova’s hospitality family: guest-room touch panels, door panels with an RGB ' +
            'status indicator, numeric keypads, and card holders that can carry a Mifare-compatible ' +
            'reader. Engraved icons and per-point programmable backlights let a whole floor be ' +
            'finished to one identity.',
          'Behind the plate the room is ordinary engineering. A Crestron processor with DIN-rail ' +
            'dimming and switching runs the circuits, and an HZ-THSTAT or an AXES TT panel handles ' +
            'the climate. Blustream carries the AV to the screen and to the public areas.',
          'The last row of the table is the one specifiers should read twice. The guest-room ' +
            'management system is integrated, not supplied, and that distinction is stated the same ' +
            'way everywhere on this site.',
        ],
        table: {
          caption: 'What Leading IT supplies in a guest room',
          columns: ['In the room', 'What Leading IT supplies', 'Where to read more'],
          rows: [
            [
              { text: 'Guest keypads' },
              { text: 'Black Nova AXES glass touch panels, with engraved icons and per-point backlight' },
              { text: 'Black Nova AXES', to: '/brands/black-nova/axes' },
            ],
            [
              { text: 'Door and card holder' },
              { text: 'AXES DR door panel with an RGB status indicator; AXES CH card holder' },
              { text: 'Black Nova', to: '/brands/black-nova' },
            ],
            [
              { text: 'Room controller and lighting' },
              { text: 'Crestron control processors with DIN-rail dimming and switching' },
              { text: 'Crestron', to: '/brands/crestron' },
            ],
            [
              { text: 'Climate' },
              { text: 'Crestron HZ-THSTAT thermostat control, or the AXES TT temperature panel' },
              { text: 'Crestron', to: '/brands/crestron' },
            ],
            [
              { text: 'In-room and public-area AV' },
              { text: 'Blustream HDMI, HDBaseT and AV-over-IP distribution' },
              { text: 'Blustream', to: '/brands/blustream' },
            ],
            [
              { text: 'Keypad layout and engraving' },
              { text: 'Laid out per room type and agreed before the mock-up room is built' },
              { text: 'Design a keypad online', to: '/brands/black-nova/keypad-designer' },
            ],
            [
              { text: 'GRMS or BMS' },
              // Wording is load-bearing — see this record's header comment. Do not
              // soften "Integrated, not supplied" into an implied supply.
              { text: 'Integrated, not supplied — Leading IT interfaces to the platform the project specifies' },
              // TODO(OQ #23): the brief points this cell at
              // /solutions/industrial-automation/, which is not built and is not
              // buildable on today's evidence. No link until that route returns
              // 200 (_CONVENTIONS.md §8).
              { text: 'Agreed at specification stage' },
            ],
          ],
        },
      },
      {
        id: 'grms-integration',
        question: 'What is a GRMS, and how does the in-room hardware connect to it?',
        answer:
          'A guest-room management system holds the occupancy, housekeeping and energy logic for a ' +
          'hotel. Leading IT integrates the in-room control it installs in Dubai with the GRMS or BMS ' +
          'the project specifies.',
        body: [
          'The division of labour is straightforward once it is written down. The keypads and the ' +
            'room controller sit in the room and act on it. The GRMS sits centrally and decides what ' +
            'the room should do when nobody is in it.',
          'The interface between the two is a specification item, and it is the one most often left ' +
            'until the rooms are being built. Which system owns occupancy, which owns setback ' +
            'temperatures, and which owns the corridor status light are three questions with three ' +
            'different right answers per project.',
          'Agreeing them early is what makes the mock-up room a decision rather than a rehearsal. ' +
            'Agreeing them late is what makes a hundred rooms need a second commissioning visit.',
        ],
      },
      {
        id: 'before-the-mock-up-room',
        question: 'What must an operator specify before the mock-up room is built?',
        answer:
          'Leading IT asks a hotel operator to settle keypad layout, engraving, finish and the ' +
          'back-of-house model before the mock-up room is built, because everything after it is ' +
          'repetition.',
        body: [
          'The mock-up room is the last cheap place to change your mind. Button count, icon set, ' +
            'engraving language and finish are agreed there once and then repeated across every key ' +
            'of that room type.',
          'Repeatability is the real cost driver, not the equipment. The same rack, the same wiring ' +
            'and the same commissioning script per room type is what keeps a large key count ' +
            'affordable. Three variants of a standard king is what does not.',
          'Back-of-house has to be decided at the same time. Who holds the head-end, who has the ' +
            'passwords, who is called at midnight and who trains the incoming engineering team are ' +
            'operational answers, not technical ones. They belong in the specification.',
          'Then there is the guest. A keypad has to be understood in three seconds, in the dark, ' +
            'without instructions, which makes engraving and icon choice a usability decision rather ' +
            'than a styling one. Public areas and meeting rooms are a separate specification again, ' +
            'built around AV distribution rather than around room control.',
        ],
      },
      {
        id: 'hospitality-versus-residential',
        question: 'How does hotel automation differ from a residential system?',
        answer:
          'Scale, repeatability and who maintains it. Leading IT specifies hotel projects in the UAE ' +
          'around a room type repeated many times, and a villa around one household.',
        body: [
          'A villa is commissioned once, for people who will learn it. A hotel floor is commissioned ' +
            'to a script, for staff who change and guests who never learn it at all, so the design ' +
            'has to survive both.',
          'Serviceability follows from that. A hotel system is specified so that a failed panel is a ' +
            'like-for-like swap by the operator’s own engineer, rather than a visit that has to be ' +
            'scheduled around occupancy.',
        ],
      },
      {
        id: 'hospitality-pakistan',
        question: 'Does Leading IT supply hospitality projects in Pakistan?',
        answer:
          'Leading IT supplies guest-room control and hospitality AV equipment to projects in ' +
          'Pakistan from its Dubai base.',
        body: [
          'Panels, controllers, dimming and AV distribution ship from Dubai. Commissioning support ' +
            'is given remotely or by a visit, and warranty claims are routed through the same team ' +
            'that supplied the goods. There is no Pakistan office and no local address; the ' +
            'relationship is supply and support, stated as exactly that.',
        ],
      },
    ],
    faq: [
      {
        // Rewritten from the brief's "Does Leading IT supply a GRMS platform?" —
        // see this record's header comment. A flat "no" would now contradict a
        // confirmed fact (OQ #27); a "yes" would claim an unnamed, unsourced
        // platform. The integration question is true in both worlds.
        question: 'How does Leading IT work with the guest-room management system?',
        answer:
          'By integration. Leading IT supplies the in-room control layer — keypads, room controller, ' +
          'lighting, climate and AV — and interfaces it to the guest-room management or building ' +
          'management system the project specifies. Which system owns occupancy, setback and ' +
          'housekeeping status is agreed at specification stage, in writing, before the rooms are ' +
          'built.',
      },
      {
        question: 'Can Black Nova AXES panels be engraved per room type?',
        answer:
          'Black Nova publishes engraved icons, a glass faceplate with customisable background ' +
          'colours, and backlight colour and brightness that are programmable individually per touch ' +
          'point. The AXES family covers guest-room panels, a temperature panel, door and card-holder ' +
          'panels, a numeric keypad and an outdoor panel, in York Black, Ice White and Venetian Gold. ' +
          'Anything beyond what the manufacturer publishes is confirmed against Black Nova per ' +
          'project rather than promised here.',
      },
      {
        question: 'Who maintains the system after handover?',
        answer:
          'The operator’s engineering team runs it day to day, which is why the head-end location, ' +
          'the credentials and the training are agreed before handover rather than after. Leading IT ' +
          'supports the equipment it supplied and holds the commissioning record for the project. No ' +
          'response-time commitment is published here; it is agreed per contract.',
      },
      {
        question: 'Can Leading IT work from a consultant’s specification?',
        answer:
          'Yes, and that is the usual route on a hotel project. What it needs to respond properly is ' +
          'the room-type schedule, the key count per type, the electrical and MEP drawings, and ' +
          'whichever GRMS or BMS the specification names. With those four, the response can be ' +
          'specific rather than indicative.',
      },
      {
        question: 'Does Leading IT supply hospitality projects in Pakistan?',
        answer:
          'Yes, on a supply basis. Equipment ships from Dubai, commissioning support is remote or by ' +
          'a visit, and warranty runs back through the team that supplied it. There is no Pakistan ' +
          'office and no local address.',
      },
    ],
    relatedBrandSlugs: ['black-nova', 'crestron', 'blustream'],
    relatedProductPaths: [
      '/brands/black-nova/axes',
      '/brands/crestron/din-ap4',
      '/brands/crestron/hz-thstat',
      '/brands/crestron/din-1dimu4',
      '/brands/crestron/tsw-570',
      '/brands/blustream/video-over-ip',
      '/brands/blustream/wireless-byod',
    ],
    whatsappPrefill:
      'Hi Leading IT — I’m looking at guest-room automation for a hotel project in the UAE.',
  },
];

export const SOLUTION_BY_SLUG: Record<string, Solution | undefined> = Object.fromEntries(
  SOLUTIONS.map((solution) => [solution.slug, solution]),
);
