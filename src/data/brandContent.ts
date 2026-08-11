import type { SolutionFaq, SolutionSection } from './solutions';

/**
 * The AEO body of a brand hub — one record per brand, keyed by the same slug as
 * `src/data/brands.ts`.
 *
 * ## Why this is a separate file from `brands.ts`
 *
 * `brands.ts` is imported by the home page, the brands index and every product
 * breadcrumb, so it lands in a shared chunk. This copy is read by the brand hub
 * template alone, and by nothing else — keeping it here means ~10 KB of hub
 * prose is not shipped to visitors who never open a hub. `meta.ts` cannot import
 * it either way (that module takes records as parameters and imports no data
 * values by design).
 *
 * ## The rules this file exists to hold (docs/10-CONTENT-BRIEFS/_CONVENTIONS.md)
 *
 * - **Neutral supply wording only** (§1). The approved brand-hub sentence is
 *   *"Leading IT supplies and installs <Brand> in Dubai, United Arab Emirates."*
 *   Never "authorized dealer", "authorised distributor", "official distributor"
 *   or any equivalent, for any brand, until written per-brand wording exists
 *   (`docs/OPEN-QUESTIONS.md` #3). `docs/04-KEYWORD-MAP.md` §2 phrases its
 *   targets as "authorized dealer" — those are **targets, not approved copy**.
 *   When the wording arrives, the upgrade is the first `answer` sentence of each
 *   record's opening section plus the formula in `src/seo/meta.ts`. Nothing else
 *   in this file depends on it.
 * - **The question is not the claim.** These hubs are built to rank for
 *   `crestron distributor dubai`, `blustream distributor uae` and their siblings
 *   (`docs/04` §2). That is done by asking the question in the words the
 *   audience types — "Who supplies Crestron in the UAE?" — and answering it with
 *   the wording Leading IT can defend. A question is not an authorisation claim.
 * - **No pricing** (§3). No figure, no range, no "from". Price intent is
 *   answered honestly and converted to an enquiry.
 * - **No stock-on-hand or lead-time figure** (§4). Catalogue counts are
 *   verifiable from `src/data/products.ts` and are stated as catalogue size, not
 *   as stock. Lead time is "confirmed per order at quotation", the same stance
 *   `/trade/` takes.
 * - **Pakistan is a supply relationship, never a place** (§2). Country level, no
 *   city, no address, no second phone number. The publishable facts are
 *   `docs/00-CONTEXT.md` §4: the whole range is supplied, Leading IT's own team
 *   handles warranty and breakages, and its engineers travel to commission.
 * - **AEO shape is structural** (§6): a question-shaped H2 whose `answer` is a
 *   standalone extractable sentence naming Leading IT, the brand and the place;
 *   `body` paragraphs at 3–4 sentences; sentences under ~28 words; "Leading IT"
 *   rather than "we".
 * - **Never reuse manufacturer copy** (§5). Every paragraph here is first-party:
 *   what the product does in a Dubai villa or a tower apartment, what
 *   integration actually involves, support and warranty reality.
 *
 * Model designations are copied from `src/data/products.ts`, which holds the
 * manufacturer's own styling — "Cinema 50" not "Cinema50", "Basalte Miro" never
 * bare "Miro", `HZ2-FP-G1` and `C2NI-CB` by model rather than by slug.
 */

/** Same shape as a solution-page section — `AnswerSections` renders both. */
export type BrandSection = SolutionSection;
/** Same shape as a solution-page FAQ item — `FaqBlock` renders both. */
export type BrandFaq = SolutionFaq;

export type BrandContent = {
  /** Must match a `slug` in `src/data/brands.ts`. */
  brandSlug: string;
  /**
   * The visible supply line under the hero wordmark. The `<h1>` is the brand
   * wordmark (a locked design decision — `docs/02-DESIGN-SOURCE-OF-TRUTH.md`),
   * so this is where the entity, the service and the place appear in the first
   * viewport, as text a visitor reads rather than text only a crawler sees.
   */
  heroSupplyLine: string;
  sections: BrandSection[];
  faq: BrandFaq[];
};

export const BRAND_CONTENT: BrandContent[] = [
  // ---------------------------------------------------------------- Crestron
  {
    brandSlug: 'crestron',
    heroSupplyLine:
      'Supplied, installed and programmed by Leading IT in Dubai — across the United Arab Emirates, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Crestron in Dubai and the UAE?',
        answer:
          'Leading IT supplies and installs Crestron control, lighting and audio systems in Dubai, United Arab Emirates, and provides Crestron programming and commissioning across the Emirates.',
        body: [
          'The Crestron catalogue Leading IT carries runs to 26 products, from CP4 control processors and DIN-rail dimming modules to TSW-1080 touch screens. It covers a residential system end to end: processor, lighting and load control in the electrical board, keypads and screens on the wall, and audio processing.',
          'Leading IT works from a showroom in Dubai and specifies Crestron for villas, tower apartments, developer projects and hospitality rooms throughout the UAE. Enquiries are answered by the people who program the systems, not by a call centre.',
          'Leading IT also supplies Crestron to projects in Pakistan on a distribution basis. That is a supply relationship rather than a local presence — the detail is further down this page.',
        ],
      },
      {
        id: 'range',
        question: 'Which Crestron products does Leading IT supply?',
        answer:
          'Leading IT supplies Crestron across seven groups: control processors, DIN-rail lighting and load control, DIN infrastructure, audio DSP, sensors and climate, keypads, and touch screens.',
        body: [
          'The processors are CP4 and CP4-R, with DIN-AP4 and DIN-AP4-R where the appliance belongs on the DIN rail rather than in a rack. Lighting and load control is DIN-1DIM4, DIN-1DIMU4, DIN-2MC2 and DIN-8SW8-I, with DIN-DLI and DIN-KXI bridging DALI and KNX where a project already has one of those buses.',
          'On the wall, the choice is HZ2-KPCN and C2NI-CB keypads with the HZ2-FP-G1 faceplate, or the TSW-570, TSW-770, TSW-880 and TSW-1080 touch screens. Audio is handled by the Avia DSP-860, DSP-1280 and DSP-1281. Every model is listed below with its own page.',
        ],
      },
      {
        id: 'installation',
        question: 'What does a Crestron installation involve in a Dubai villa?',
        answer:
          'A Crestron installation in a Dubai villa is decided at first fix. Leading IT sets the rack position, the Cresnet and Cat6A routes and the DIN-rail layout before the walls close.',
        body: [
          'The rack position is the first decision, and it is made before the joinery is drawn. Every Cresnet and Cat6A run terminates there, so moving it later means re-pulling cable through a finished wall. In a villa the rack usually wants a service room with cooling. A rack in an unconditioned riser in August is a design decision, not an afterthought.',
          'The lighting strategy lives in the electrical board rather than behind the switch plates. DIN-AP4 with DIN-1DIM4, DIN-1DIMU4, DIN-2MC2 and DIN-8SW8-I puts dimming, motor control and switching on the DIN rail. DIN-PWS60 sizes the Cresnet power, and DIN-CENCN-2-POE and DIN-HUB distribute the bus. The electrician needs that circuit schedule early, because it changes how the board is populated.',
          'Keypad engraving and button function are decided before the order is placed, not at handover. So are the scenes: which button does what in which room, and what the astronomical clock drives at sunset. Leading IT commissions that on site, then walks the client through it room by room.',
          'Leading IT commissions KNX and DALI lighting as well as Crestron. That matters when the lighting designer has already specified a DALI driver and the control layer has to meet it. DIN-DLI and DIN-KXI are the products that do the bridging; the claim stops where those two products stop.',
        ],
      },
      {
        id: 'apartment',
        question: 'Does Crestron make sense in a tower apartment, or only in a villa?',
        answer:
          'Crestron is specified in Dubai tower apartments as well as villas, and the apartment version is smaller rather than different. That means fewer circuits, one compact rack position, and a TSW-570 or TSW-770 where a villa takes a TSW-1080.',
        body: [
          'The real threshold is not floor area. It is the number of lighting circuits worth controlling and whether the walls are open. In a fitted apartment where nothing can be re-cabled, the honest answer is often a reduced scope. Control the lighting that can be reached, plus the audio and video that run on the network.',
          'A retrofit is decided on back-box depth and cable routes, so Leading IT looks at those before proposing anything. Where the apartment cannot take a full system, saying so is cheaper for the client than discovering it at first fix.',
        ],
      },
      {
        id: 'support',
        question: 'Who programs and supports a Crestron system after handover?',
        answer:
          'Leading IT programs, commissions and supports the Crestron systems it supplies and installs in the UAE. Its own team handles faults rather than routing the client to the manufacturer.',
        body: [
          'Programming is part of the work, not a separate trade brought in at the end. The same engineers who write the scenes attend the commissioning visit and the handover walkthrough. Changes after handover are usually a revision rather than a rediscovery.',
          'Support scope is agreed per project. Leading IT does not publish a response-time figure, because a number it cannot honour on every project is worth nothing to the client who is quoting it back.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply Crestron in Pakistan?',
        answer:
          'Yes — Leading IT supplies Crestron to projects in Pakistan on a distribution basis, handled from its Dubai base, with sourcing, programming and commissioning support.',
        body: [
          'The whole Crestron range is available to Pakistan projects, not a reduced list. Leading IT engineers travel to commission where a project needs them on site.',
          'Warranty and breakages route through Leading IT rather than leaving the client to deal with the manufacturer directly. This is a supply and distribution relationship: Leading IT has no premises in Pakistan, and delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is Crestron worth it in an apartment, or is it only for villas?',
        answer:
          'It depends on circuit count and whether the walls are open, not on the size of the home. An apartment with a dozen controllable circuits and accessible back boxes takes a Crestron system well. A finished apartment that cannot be re-cabled usually justifies a reduced scope instead. Leading IT will say which one an apartment is before quoting it.',
      },
      {
        question: 'Can Crestron control KNX or DALI lighting that is already installed?',
        answer:
          'Yes, through DIN-KXI for KNX and DIN-DLI for DALI, which bridge those buses to a Crestron system. That is the extent of the claim: the bridging is what those two products do. An existing installation still has to be surveyed before anyone promises it will integrate cleanly.',
      },
      {
        question: 'Does Leading IT program Crestron systems, or only supply the hardware?',
        answer:
          'Both. Leading IT supplies Crestron hardware and does the programming and commissioning itself for projects in the UAE, including scenes, keypad function and the astronomical clock. Hardware-only supply is also available to integrators through the Leading IT trade account.',
      },
      {
        question: 'How long does a Crestron system take to deliver in Dubai?',
        answer:
          'The sequence is design, then order, then first fix, then rack build, then commissioning after the room is finished. The design and first-fix stages are usually set by the construction programme rather than by the equipment. Leading IT confirms delivery timing per order at quotation rather than publishing a figure it cannot hold to on every project.',
      },
      {
        question: 'Does Leading IT supply Crestron in Pakistan?',
        answer:
          'Yes, on a distribution basis, from its Dubai base. The whole range is available, Leading IT engineers travel to commission where a project needs it, and warranty is handled by Leading IT rather than by the client. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // --------------------------------------------------------------- Blustream
  {
    brandSlug: 'blustream',
    heroSupplyLine:
      'HDMI, HDBaseT and AV-over-IP distribution supplied and installed by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Blustream in the UAE?',
        answer:
          'Leading IT supplies and installs Blustream HDMI, HDBaseT and AV-over-IP distribution systems in Dubai, United Arab Emirates, for residential and commercial projects across the Emirates.',
        body: [
          'Leading IT carries four Blustream lines: Dante audio distribution, Wireless and BYOD presentation, Video over IP, and the Precision 48 certified HDMI cable range. Three of the four are ranges named by function rather than by model, because that is how an integrator specifies them.',
          'Blustream is a UK manufacturer of AV distribution hardware. Leading IT supplies Blustream to integrators on a trade account as well as installing it directly. Both routes are covered below.',
        ],
      },
      {
        id: 'method',
        question: 'Which AV distribution method suits which project?',
        answer:
          'Leading IT selects between HDBaseT, AV over IP, Dante and wireless presentation on four constraints. Those are cable run length, switch capability, latency tolerance and the number of endpoints.',
        body: [
          'HDBaseT is the straightforward answer for a fixed number of sources and displays over structured cable — point to point, or through a matrix. It stops being the right answer when the endpoint count grows or the runs exceed what the specification supports.',
          'AV over IP moves the switching onto a managed network, which is what makes it scale past a matrix. It also moves part of the design onto the network, so the switch has to meet Blustream\'s published requirements rather than whatever is already in the comms cabinet.',
          'Dante handles audio distribution over the same network idea. The wireless and BYOD line covers presentation where a guest device has to reach a display without a cable. Precision 48 is the cable range that keeps a 48 Gbps HDMI link inside specification over the distances a fit-out actually needs.',
        ],
      },
      {
        id: 'network',
        question: 'What does an AV-over-IP installation actually need on site?',
        answer:
          'An AV-over-IP installation needs a managed switch that meets Blustream\'s published multicast and bandwidth requirements, and it needs somebody to own that switch configuration before commissioning week.',
        body: [
          'The network requirements — IGMP snooping, multicast handling and bandwidth headroom — are a design input, not a commissioning detail. Where a client has an IT contractor, Leading IT agrees who owns the switch configuration at design stage. Left unowned, it becomes an argument on the day the system is meant to go live.',
          'Cat6A run lengths and terminations decide whether the link survives a fit-out. Terminations made in dust, then re-made after the ceiling closes, are the usual cause of an intermittent link that nobody can reproduce.',
          'Rack layout, PoE budget and heat are sized with the endpoint count, not after it. An EDID problem discovered at commissioning is almost always a design decision made months earlier. Leading IT settles the source, display and resolution matrix on paper first.',
        ],
      },
      {
        id: 'crestron',
        question: 'How does Blustream sit under a Crestron control system?',
        answer:
          'Blustream distribution is driven from a Crestron control layer where the project has one, with Crestron handling the user interface and Blustream handling the signal.',
        body: [
          'The division is clean: the control system decides what a keypad or touch screen does, and the distribution system moves the video and audio to the right endpoint. Leading IT supplies and installs both, so the integration is designed once rather than negotiated between two suppliers.',
          'Control support is claimed only as far as the published driver support goes. Where a specific combination has not been proven, Leading IT says so before it is specified.',
        ],
      },
      {
        id: 'trade',
        question: 'Can integrators buy Blustream from Leading IT on a trade account?',
        answer:
          'Yes — Leading IT supplies Blustream to AV and automation integrators in the UAE and Pakistan on a trade account, by part number.',
        body: [
          'Trade enquiries are answered with part numbers and availability confirmed per order rather than with a published stock figure. Lead time is confirmed at quotation, for the same reason.',
          'Leading IT also supplies Blustream to projects in Pakistan on a distribution basis, handled from Dubai, with warranty routed through Leading IT rather than through the client.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is the difference between HDBaseT and AV over IP?',
        answer:
          'HDBaseT carries video, audio and control over a single structured cable between a fixed transmitter and receiver, either directly or through a matrix. AV over IP puts the same signals on a managed network, so the endpoint count is limited by the network rather than by the matrix size. HDBaseT is simpler where the design is fixed; AV over IP is what scales when it is not.',
      },
      {
        question: 'Does AV over IP need a dedicated network switch?',
        answer:
          'It needs a managed switch that meets the requirements Blustream publishes for the line in question. That means multicast handling, IGMP snooping and enough bandwidth headroom for the endpoint count. Whether that switch is dedicated or a segment of an existing network is a design decision Leading IT takes with the client\'s IT contractor before installation.',
      },
      {
        question: 'Can Blustream be controlled from a Crestron system?',
        answer:
          'Yes, where the published control support covers the combination being specified. Leading IT supplies and installs both brands and confirms the specific driver support for a project before it is quoted, rather than assuming it.',
      },
      {
        question: 'Does Leading IT open trade accounts for integrators?',
        answer:
          'Yes. Leading IT supplies Blustream and the rest of its catalogue to integrators on a trade account, quoted by part number. Availability and lead time are confirmed per order at quotation.',
      },
      {
        question: 'Does Leading IT supply Blustream in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available to Pakistan projects and warranty routes through Leading IT. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // ----------------------------------------------------------------- Basalte
  {
    brandSlug: 'basalte',
    heroSupplyLine:
      'Belgian architectural switches, keypads and in-wall audio supplied and installed by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Basalte in Dubai and the UAE?',
        answer:
          'Leading IT supplies and installs Basalte architectural switches, keypads and in-wall audio in Dubai, United Arab Emirates, for villas, apartments and hospitality projects across the Emirates.',
        body: [
          'Basalte is a Belgian manufacturer of design-led architectural interfaces. Leading IT carries eight Basalte lines: Sentido, Deseo, Eve, Basalte Miro, Auro, Fibonacci and the Aalto and Plano collections.',
          'Most Basalte enquiries reaching Leading IT come from architects and interior designers rather than from homeowners. The questions below are written for the specifier\'s calendar, not for a product brochure.',
        ],
      },
      {
        id: 'range',
        question: 'What does Basalte make?',
        answer:
          'Basalte makes capacitive-touch wall switches, keypads with and without displays, and in-ceiling and wall-mounted loudspeakers — the interfaces where the building meets the hand.',
        body: [
          'Sentido is the capacitive-touch switch that usually takes the standard switch position through a whole villa. Deseo adds a display and thermostat function, which suits bedrooms and corridors where climate and scenes share one plate. Eve is the compact keypad for apartments and secondary rooms, and Basalte Miro suits rooms that need a minimal button set.',
          'Auro is the in-ceiling loudspeaker, designed alongside the lighting layout rather than after it, and Fibonacci is the wall-mounted alternative where a ceiling speaker is not possible. Aalto and Plano are collections with their own pages.',
        ],
      },
      {
        id: 'specification',
        question: 'How is Basalte specified in a Dubai project, and when?',
        answer:
          'Basalte is specified at the same point as ironmongery and sanitaryware — finish and engraving are decided with the other architectural finishes, not at commissioning.',
        body: [
          'Deciding late has a sequencing cost rather than a design cost. The plate finish and the engraved legend are made to the order, so a late change moves the delivery date. Leading IT confirms that date per order at quotation.',
          'Back-box depth and wall build-up are the other early decision, and they belong to the electrician. A plate sits flush on a plastered wall at one depth and on a stone-clad wall at another, so the difference has to be set at first fix. Retrofitting a shallow box behind finished stone is the expensive version of this conversation.',
          'On the bus, Basalte sits on KNX, with Crestron above it as the higher-level controller where the project has one. Leading IT commissions KNX and DALI as well as supplying the hardware, so the interface layer and the control layer are set up by the same team.',
          'Finishes are anodised aluminium and glass. What Leading IT states about how they behave comes from what Basalte publishes about the materials and the finishing process. A terrace on the Palm and an interior corridor are different environments. That conversation is worth having before the plates are ordered.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply Basalte in Pakistan?',
        answer:
          'Yes — Leading IT supplies Basalte to projects in Pakistan on a distribution basis, handled from its Dubai base.',
        body: [
          'The whole range is available to Pakistan projects, and warranty routes through Leading IT rather than through the client. Leading IT engineers travel to commission where a project needs it.',
          'This is a supply relationship, not a local presence: Leading IT has no premises in Pakistan, and delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Does Basalte need KNX?',
        answer:
          'The Basalte switches and keypads Leading IT supplies are KNX devices, so a project running them needs a KNX bus and a KNX programme behind it. Where the project also has a Crestron system, KNX sits underneath it as the interface layer. Leading IT commissions KNX and can confirm what a specific line supports before it is specified.',
      },
      {
        question: 'Can Basalte switches be engraved with custom text?',
        answer:
          'Basalte publishes customisation options per line, including engraved legends, and Leading IT orders to those published options rather than to a bespoke request. The practical point is timing: engraving is decided before the order is placed, because it is made to the order.',
      },
      {
        question: 'What does a Basalte switch cost in Dubai?',
        answer:
          'Leading IT quotes Basalte per project rather than publishing a price. What drives the figure is the number of plates, the finish, and how many functions each plate carries. A villa with a keypad at every door is a different quote from an apartment with six. Send a drawing or a plate schedule and Leading IT will price it.',
      },
      {
        question: 'Can Basalte replace the switches in a finished apartment?',
        answer:
          'Sometimes, and the constraint is back-box depth rather than the wall finish. Where the existing boxes are deep enough and the bus can be run, a retrofit is straightforward. Where they are not, the honest answer is that the wall has to open. Leading IT checks the boxes before quoting a retrofit.',
      },
      {
        question: 'Does Leading IT supply Basalte in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to commission where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // -------------------------------------------------------------- Black Nova
  {
    brandSlug: 'black-nova',
    heroSupplyLine:
      'Italian design keypads supplied and installed by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Black Nova keypads in the UAE?',
        answer:
          'Leading IT supplies and installs Black Nova design keypads in Dubai, United Arab Emirates, for villas, apartments and hospitality projects across the Emirates.',
        body: [
          'Leading IT carries five Black Nova collections: ALBA, ARIA, ANY, AXES and BLACK JACK. Black Nova is an Italian company based in Milan, and its Smart Design collections are made in Italy.',
          'The metal finishes come from artisanal processes — anodisation, galvanic bath plating and hand brushing — that are not fully industrialised, so no two pieces are identical. That is the reason the finish decision is worth making with a sample rather than from a screen.',
        ],
      },
      {
        id: 'designer',
        question: 'Can I design a Black Nova keypad online?',
        answer:
          'Yes — Leading IT provides a free online Black Nova keypad designer at leadingit.me. A keypad can be configured by collection, finish and button layout before any enquiry is sent.',
        body: [
          'The designer exists because the finish and the button layout are the two decisions that hold up an order. Both are easier to make when they can be seen. A configuration can be sent straight to Leading IT as the starting point for a quote.',
          'It is not a substitute for handling the metal. Leading IT keeps samples at its Dubai showroom, and for a project specifying keypads through a whole villa, that visit is worth the hour.',
        ],
      },
      {
        id: 'collections',
        question: 'Which Black Nova collections does Leading IT supply?',
        answer:
          'Leading IT supplies the ALBA, ARIA, ANY, AXES and BLACK JACK collections, each with its own finishes and button layouts.',
        body: [
          'ALBA and ARIA are the collections most often specified through a residence. ANY is a single product route rather than a collection. AXES skews towards hospitality and commercial projects, and BLACK JACK is the brass collection produced with Meljac.',
          'Each collection has its own page with the finishes and layouts Black Nova publishes for it. Member model designations are named there rather than here, so that nothing on this page runs ahead of what the manufacturer documents.',
        ],
      },
      {
        id: 'installation',
        question: 'What does a Black Nova keypad replace in a Dubai villa?',
        answer:
          'A Black Nova keypad replaces a bank of plates beside a door with one engraved object. The button schedule and the engraving are decided before the order, not at commissioning.',
        body: [
          'Beside a bedroom door, five separate switch plates become one keypad with five legends. That is a joinery and architecture decision as much as an electrical one, because the plate is visible from the bed and the corridor.',
          'In a hotel-style corridor the same logic applies at scale: one keypad per room entrance, engraved identically, is a specification that has to be right the first time. Engraving is made to the order, so a change after ordering moves the date.',
          'At first fix the constraints are back-box depth and the plaster line. A keypad sits flush only if the box depth and the wall build-up were set for it, which is a conversation with the electrician before the walls close.',
        ],
      },
      {
        id: 'integration',
        question: 'What control systems do Black Nova keypads connect to?',
        answer:
          'Black Nova keypads connect over KNX TP, RS-485 and Cresnet, which is what lets them sit under a KNX or Crestron control layer.',
        body: [
          'That list is the claim in full: it is what the datasheets support. Leading IT does not extend it to a protocol a given keypad does not publish. Where a project has a Crestron processor, the keypads become the wall interface to it; where it is a KNX project, they sit on the bus directly.',
          'Leading IT supplies and commissions both layers, so the button schedule written at specification is the one that ends up programmed.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply Black Nova in Pakistan?',
        answer:
          'Yes — Leading IT supplies Black Nova keypads to projects in Pakistan on a distribution basis, handled from its Dubai base.',
        body: [
          'The whole range is available, warranty routes through Leading IT rather than through the client, and Leading IT engineers travel to commission where a project needs it.',
          'Leading IT has no premises in Pakistan; delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is it "Black Nova" or "BlackNova"?',
        answer:
          'The manufacturer writes it as two words, Black Nova, and that is the form used throughout this site. The one-word spelling blacknova appears in its domain, blacknova.co, and in the way people search for it, which is why both forms lead to the same place here.',
      },
      {
        question: 'Which control systems do Black Nova keypads work with?',
        answer:
          'KNX TP, RS-485 and Cresnet, per the published datasheets. That means they can serve as the wall interface for a KNX installation or for a Crestron system. Leading IT confirms the protocol for the specific collection being specified before it is quoted.',
      },
      {
        question: 'Can the buttons be engraved to order?',
        answer:
          'Yes, within the customisation options Black Nova publishes for each collection. Because the engraving is made to the order, the button schedule is settled before ordering rather than at commissioning — a change afterwards moves the delivery date.',
      },
      {
        question: 'Can I see the finishes before ordering?',
        answer:
          'Two ways. The free online keypad designer at leadingit.me shows the collections, finishes and layouts, and Leading IT keeps samples at its Dubai showroom. For a project specifying keypads through a whole villa, seeing the metal in person is worth the visit. The finishes are hand-processed and no two pieces are identical.',
      },
      {
        question: 'Does Leading IT supply Black Nova in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to commission where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // ----------------------------------------------------------------- Marantz
  {
    brandSlug: 'marantz',
    heroSupplyLine:
      'AV receivers, processors and amplifiers supplied and installed by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Marantz in Dubai and the UAE?',
        answer:
          'Leading IT supplies and installs Marantz AV receivers, AV processors and amplifiers in Dubai, United Arab Emirates, for home cinemas and listening rooms across the Emirates.',
        body: [
          'The Marantz catalogue Leading IT carries runs to 19 models. It covers the Cinema series receivers, the AV 10, AV 20 and AV 30 processors, and the AMP 10, AMP 20 and AMP 30 power amplifiers. The two-channel and streaming models sit alongside them.',
          'Leading IT installs and calibrates what it supplies rather than shipping a box. For a cinema room that means specifying the receiver or processor against the speaker layout the room can physically take. A channel count on a spec sheet is not the starting point.',
        ],
      },
      {
        id: 'selection',
        question: 'Which Marantz model suits which room?',
        answer:
          'Leading IT selects a Marantz model from the room rather than from the range. The inputs are the channel count against the speaker layout, and whether the room is a cinema or a listening room.',
        body: [
          'A one-box Cinema series receiver is the straightforward answer where amplification and processing can live in one chassis. That is Cinema 30, Cinema 40, Cinema 50, Cinema 60 or Cinema 70s. It is the right answer far more often than the separates conversation suggests.',
          'Separates make sense when the channel count or the amplification demand outgrows one box. That is an AV 10, AV 20 or AV 30 processor with AMP 10, AMP 20 or AMP 30 amplification. That is a rack decision as much as an audio one, because it changes the ventilation and the power the room needs.',
          'Where the room is for listening rather than for film, the answer is different again — MODEL 10, LINK 10n, Stereo 70s, M-CR612 or CD6007. Grand Horizon, Horizon and Horizon Tripod cover single-room and portable Marantz audio.',
        ],
      },
      {
        id: 'installation',
        question: 'What does a Marantz installation involve in a Dubai villa?',
        answer:
          'A Marantz installation in a Dubai villa is decided by the rack and the first fix. That means ventilation for August ambient temperature, region-correct units for UAE mains, and conduit before the walls close.',
        body: [
          'Rack ventilation is a real specification in Dubai, not a precaution. A multi-channel amplifier in a closed cabinet in August behaves differently from the same amplifier in a ventilated rack. The difference shows up as protection cut-outs during a film.',
          'Leading IT supplies region-correct units for UAE mains, which is the part of the warranty conversation that matters after the room is finished. It is also the part that quietly goes wrong when equipment arrives through a grey channel.',
          'Speaker cable and conduit for a 7.2.4 layout are pulled at first fix, and the subwoofer position is decided before the joinery, not after the sofa arrives. Getting that order wrong is what produces a room with a bass null in the main seat.',
          'Calibration is a booked visit after the room is finished, painted and furnished. Running it before the soft furnishings arrive measures a room that will not exist by handover.',
        ],
      },
      {
        id: 'denon',
        question: 'How does Marantz sit next to Denon in the same catalogue?',
        answer:
          'Leading IT supplies both Marantz and Denon. The choice between them is made on voicing and chassis philosophy, not on which brand a supplier happens to carry.',
        body: [
          'The two share engineering lineage and much of the feature set generation by generation. Where they differ is presentation and industrial design — Marantz is the warmer, more relaxed voicing and the more deliberate chassis, Denon the more direct one.',
          'That is a preference, not a ranking, and it is best settled by listening rather than by reading. Leading IT will demonstrate both rather than talk a client into either.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply Marantz in Pakistan?',
        answer:
          'Yes — Leading IT supplies Marantz to customers and installers in Pakistan on a distribution basis, handled from its Dubai base.',
        body: [
          'The whole range is available, and warranty and breakages route through Leading IT rather than the manufacturer. Leading IT engineers travel to commission and calibrate where a project needs it.',
          'Leading IT has no premises in Pakistan; delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is the difference between the Marantz Cinema series and the AV processors?',
        answer:
          'A Cinema series model is a one-box AV receiver: processing and amplification in the same chassis. The AV 10, AV 20 and AV 30 are processors only, paired with separate amplification such as AMP 10, AMP 20 or AMP 30. Separates suit higher channel counts and bigger rooms; a Cinema receiver suits most cinema and media rooms.',
      },
      {
        question: 'Does Leading IT install and calibrate the system, or only supply it?',
        answer:
          'Both. Leading IT supplies Marantz, installs it, and calibrates the room as a booked visit after it is finished and furnished. Supply-only is available to integrators through the Leading IT trade account.',
      },
      {
        question: 'Are units supplied to the UAE the correct regional specification?',
        answer:
          'Yes — Leading IT supplies region-correct units for UAE mains, which is what keeps the warranty intact. It is worth asking any supplier that question, because equipment that arrives through an unofficial channel often answers it differently.',
      },
      {
        question: 'How much does a Marantz home cinema cost in Dubai?',
        answer:
          'Leading IT quotes per project rather than publishing a figure. What drives it is the channel count, the speaker package, and how much of the room build is in scope. The same receiver in a finished media room and in a treated cinema are different projects. Send the room and Leading IT will price it.',
      },
      {
        question: 'Does Leading IT supply Marantz in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to commission and calibrate where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // ------------------------------------------------------------------- Denon
  {
    brandSlug: 'denon',
    heroSupplyLine:
      'AVC and AVR home cinema receivers supplied and installed by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Denon in Dubai and the UAE?',
        answer:
          'Leading IT supplies and installs Denon AVC and AVR home cinema receivers in Dubai, United Arab Emirates, for cinema rooms, media rooms and family rooms across the Emirates.',
        body: [
          'The Denon catalogue Leading IT carries runs to 13 models, from the AVR-X250BT to the AVC-A1H, with the DRA-900H covering two-channel listening rather than cinema.',
          'Leading IT installs and calibrates the receivers it supplies. The model is chosen against the speaker layout the room can physically take, which is a different question from how many channels a receiver can drive.',
        ],
      },
      {
        id: 'selection',
        question: 'Which Denon receiver suits which room?',
        answer:
          'Leading IT selects a Denon receiver from the speaker layout the room can take. That is the number of speaker positions the architecture allows, not the largest channel count in the range.',
        body: [
          'AVC-A1H, AVC-A10H, AVC-X8500H and AVC-X6800H suit dedicated cinema rooms with high channel counts and the ceiling positions to justify them. AVC-X4800H, AVC-X3800H and AVC-S670H cover cinema and larger media rooms.',
          'AVR-X2800H, AVR-X1800H and AVR-S970H sit in media rooms and family rooms, and AVR-X580BT and AVR-X250BT cover small rooms and secondary systems. Where the room is for music rather than film, the DRA-900H is the honest answer.',
          'Channel counts, power figures and format support live on each model\'s own page, cited to Denon. This page is the selection logic, not the specification.',
        ],
      },
      {
        id: 'ranges',
        question: 'What is the difference between Denon\'s AVC, AVR and AVR-S ranges?',
        answer:
          'Denon uses AVC for the models where processing and amplification are packaged for higher channel counts. AVR covers the mainstream range, with AVR-S and the BT models at the entry positions.',
        body: [
          'That naming is Denon\'s own, and Leading IT states it no further than the manufacturer does. There is no hidden tier story behind the letters.',
          'What matters when choosing is the channel count against the room, not the prefix. A well-specified AVR in a media room outperforms an over-specified AVC in a room that cannot take the extra speakers.',
        ],
      },
      {
        id: 'installation',
        question: 'What does a Denon installation involve in a Dubai villa or apartment?',
        answer:
          'A Denon installation in Dubai is decided by rack ventilation, region-correct mains equipment and the speaker conduit pulled at first fix. The receiver itself is the easy part.',
        body: [
          'A receiver in a closed cabinet in a Dubai August is a thermal design decision. Leading IT sizes the ventilation with the amplifier, because a receiver that drops into protection mid-film is usually a cabinet problem rather than a fault.',
          'Leading IT supplies region-correct units for UAE mains, which is what keeps the warranty intact after handover.',
          'The speaker layout is set at first fix: cable and conduit for 5.1.2 or 7.2.4. The subwoofer position is decided against the room, not against the furniture plan. Room calibration is a booked visit after the room is finished and furnished, not a box ticked on installation day.',
        ],
      },
      {
        id: 'marantz',
        question: 'Denon or Marantz?',
        answer:
          'Leading IT supplies both Denon and Marantz, so the answer is a preference rather than a recommendation: shared engineering lineage, different voicing and different chassis philosophy.',
        body: [
          'Denon tends to be the more direct presentation and Marantz the warmer one, generation for generation, with feature sets that track closely. Neither is the better brand in the abstract.',
          'The room and the speakers matter more than the badge. Leading IT will demonstrate both against the same speakers rather than argue the point.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply Denon in Pakistan?',
        answer:
          'Yes — Leading IT supplies Denon to projects in Pakistan on a distribution basis, handled from its Dubai base.',
        body: [
          'The whole range is available, warranty and breakages route through Leading IT, and its engineers travel to commission and calibrate where a project needs it.',
          'Leading IT has no premises in Pakistan; delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'How many channels do I actually need?',
        answer:
          'Count the speaker positions the room can take before counting channels. A room with one row of seating, a flat ceiling and no side-wall depth supports a different layout from a dedicated cinema. A receiver bought for channels the room cannot host is money spent on unused terminals. Leading IT works it out from the room drawing.',
      },
      {
        question: 'Does Leading IT calibrate the receiver after installation?',
        answer:
          'Yes, for systems Leading IT supplies and installs. Calibration is booked after the room is finished, painted and furnished, because measuring an unfinished room measures a room that will not exist at handover.',
      },
      {
        question: 'Can Leading IT repair a Denon unit bought elsewhere?',
        answer:
          'No. Leading IT supports the systems it has supplied and installed. A unit bought through another channel should go to the manufacturer\'s own service network, which is also the route that protects its warranty.',
      },
      {
        question: 'What does a Denon home cinema cost in Dubai?',
        answer:
          'Leading IT quotes per project rather than publishing a figure. The drivers are the channel count, the speaker package, the cabling and whether room treatment is in scope. Send the room drawing and Leading IT will price it.',
      },
      {
        question: 'Does Leading IT supply Denon in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to commission where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // ------------------------------------------------------------- UandKSound
  {
    brandSlug: 'uandksound',
    heroSupplyLine:
      'Private cinema loudspeakers supplied, installed and calibrated by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Where can I buy private cinema loudspeakers in Dubai?',
        answer:
          'Leading IT supplies and installs UandKSound cinema and custom loudspeakers in Dubai, United Arab Emirates, for private cinema rooms across the Emirates.',
        body: [
          'UandKSound builds horn-loaded reference cinema systems, Air Motion tweeter loudspeakers, and in-wall and in-ceiling cinema speakers. Leading IT carries five series: Reference Series, M8 Series, M6 Series, E Series and M Series amplification.',
          'This is the part of the catalogue specified for rooms that are cinemas rather than living rooms with a screen. The speakers are chosen against the baffle wall and the seating layout, and they are calibrated after the room is treated.',
        ],
      },
      {
        id: 'series',
        question: 'What does UandKSound make?',
        answer:
          'UandKSound makes horn-loaded reference cinema systems, high-output and in-wall cinema loudspeakers with Air Motion tweeters, in-ceiling cinema speakers, and multichannel cinema amplification.',
        body: [
          'The Reference Series is the horn-loaded reference cinema system. M8 Series is the high-output cinema line with an Air Motion tweeter, and M6 Series is the in-wall line using the same tweeter concept.',
          'E Series covers in-ceiling and in-wall cinema positions, which is what a room with a finished ceiling and a fixed soffit usually needs. M Series is the multichannel cinema amplification, currently one model, the M4500D.',
        ],
      },
      {
        id: 'horn',
        question: 'What is a horn-loaded cinema loudspeaker, and when is it the right answer?',
        answer:
          'A horn-loaded loudspeaker uses a horn to direct the output of its driver. That raises sensitivity and controls how the sound spreads across a room with fixed seating.',
        body: [
          'The two consequences that matter in a private cinema are efficiency and dispersion. A high-sensitivity speaker reaches reference level with less amplifier effort. A controlled dispersion pattern puts more of the direct sound on the seats and less on the side walls.',
          'The trade-offs are real and worth stating. Horn systems are physically large, they are unforgiving about placement, and they expose an untreated room rather than flattering it. In a room with a proper baffle wall and treatment they are the right answer. In a media room with a plasterboard front wall and no acoustic budget, an in-wall series usually is.',
        ],
      },
      {
        id: 'installation',
        question: 'What does installing a reference cinema system involve in a Dubai villa?',
        answer:
          'A reference cinema installation is a construction sequence before it is an audio one. Leading IT agrees the baffle-wall build with the main contractor before the room is framed.',
        body: [
          'The baffle wall carries the front speakers and the screen, and its depth is set by the cabinets behind it. That depth has to be agreed with the contractor at framing. The alternative is losing it against a plasterboard build-up drawn without the speakers in mind.',
          'The amplifier rack has a position, a power requirement and a heat output, and all three are sized before first fix. Speaker cable runs back to that rack, so its position is decided with the room rather than after it.',
          'Calibration is a separate booked visit after the room is finished, painted and acoustically treated. Measuring earlier measures a different room.',
        ],
      },
      {
        id: 'amplification',
        question: 'Which amplifier and processor drive a UandKSound system?',
        answer:
          'Leading IT drives UandKSound systems from M Series amplification, or from Marantz and Denon processing and amplification where the project is specified that way.',
        body: [
          'The matching is done on published sensitivity and impedance against the channel count and the room, rather than on a power figure alone. A Marantz AV 10 processor with AMP 10 amplification is the separates route; a Denon or Marantz one-box receiver suits smaller rooms.',
          'Because Leading IT supplies all three brands, the pairing is specified rather than sold. There is no reason to fit the room to whatever is on the shelf.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply UandKSound to projects in Pakistan?',
        answer:
          'Yes — Leading IT supplies UandKSound loudspeakers to projects in Pakistan, handled from its Dubai base.',
        body: [
          'The whole range is available, warranty and breakages route through Leading IT, and its engineers travel to commission and calibrate where a project needs it.',
          'Leading IT has no premises in Pakistan; delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is it "uandksound" or "U&K Sound"?',
        answer:
          'The manufacturer writes it as one word. Its logotype, page titles and its own channels use uandksound, and UandKSound in prose. The ampersand form is a spelling that circulates but is not the manufacturer\'s own.',
      },
      {
        question: 'What makes a horn-loaded speaker different from a conventional cinema speaker?',
        answer:
          'The horn directs the driver\'s output, which raises sensitivity and narrows how the sound spreads. In practice that means more of the direct sound reaches the seats and less bounces off the side walls, at the cost of size and placement discipline. It suits a treated cinema room; it is the wrong answer for a bright living room.',
      },
      {
        question: 'Can these speakers be installed in-wall or in-ceiling?',
        answer:
          'By series. M6 Series is the in-wall cinema line and E Series covers in-ceiling and in-wall positions, which is what a room with a finished ceiling usually needs. The Reference Series and M8 Series are cabinet systems designed for a baffle wall rather than for a plasterboard cut-out.',
      },
      {
        question: 'What does a reference cinema system cost?',
        answer:
          'Leading IT quotes per project rather than publishing a figure. The drivers are the channel count, the amplification, the baffle-wall build and how much acoustic treatment the room needs. The speakers are rarely the largest line in a reference room. Send the room drawing and Leading IT will price it.',
      },
      {
        question: 'Does Leading IT supply UandKSound to projects in Pakistan?',
        answer:
          'Yes, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to commission and calibrate where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // -------------------------------------------------------------- Polk Audio
  {
    brandSlug: 'polk-audio',
    heroSupplyLine:
      'Reserve and Signature Elite loudspeakers supplied and installed by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies Polk Audio in Dubai and the UAE?',
        answer:
          'Leading IT supplies and installs Polk Audio loudspeakers in Dubai, United Arab Emirates, for home cinema and music systems across the Emirates.',
        body: [
          'Leading IT carries 13 Polk Audio models across two series, Reserve and Signature Elite. Polk Audio has engineered loudspeakers in Baltimore since 1972.',
          'Both series cover the same room roles: front left and right, centre, surround and height. The useful question is not which series is better, but which one the room and the layout call for.',
        ],
      },
      {
        id: 'series',
        question: 'What is the difference between Polk Reserve and Signature Elite?',
        answer:
          'Polk Reserve is the upper series and Polk Signature Elite is the broader one, and both cover the same cinema roles. The difference is where each sits in Polk Audio\'s own range, not what each is for.',
        body: [
          'Reserve runs from Reserve R900 through R700, R600, R500, R400, R350 and R300, covering towers, bookshelf models, centre and height positions.',
          'Signature Elite runs Signature Elite ES90, ES60, ES55, ES50, ES35 and ES30 across the same roles. Model names carry the series word for a reason: "R700" alone is ambiguous, "Reserve R700" is not.',
          'Driver configuration and enclosure type per model come from Polk Audio\'s own product pages. Each is stated on that model\'s page here rather than summarised into a ranking on this one.',
        ],
      },
      {
        id: 'layout',
        question: 'How do Polk models combine into one cinema layout?',
        answer:
          'Leading IT builds a Polk Audio cinema layout by role rather than by model number. Towers or bookshelf models take the front left and right, a dedicated centre sits below or above the screen, with matched surrounds and height models overhead.',
        body: [
          'The front three matter most, and they should stay within one series so the timbre matches across a pan. Mixing series across the front is the usual cause of a soundtrack that changes character as it moves left to right.',
          'Surround and height positions are decided by the room rather than by the model list. What matters is how far the side walls sit from the seats, and whether the ceiling can take a speaker. Where it cannot, an in-ceiling route from another part of the catalogue is the honest answer.',
          'This is Leading IT\'s selection guidance built from each model\'s published driver configuration, not a package published by Polk Audio.',
        ],
      },
      {
        id: 'installation',
        question: 'What does a Polk Audio installation involve in a Dubai villa?',
        answer:
          'A Polk Audio installation in a Dubai villa is decided at first fix and on the floor. That means cable and conduit before the walls close, and the right footing under a tower on marble.',
        body: [
          'Towers on polished marble need spikes or pads chosen for the floor, or the cabinet moves and the finish suffers. It is a small detail that gets noticed every time someone walks past the speaker.',
          'Wall construction decides what an on-wall or in-wall mount actually needs: blocking behind plasterboard, or a fixing strategy for blockwork. Both are agreed at first fix, not improvised on installation day.',
          'Speaker cable gauge is chosen for the run length back to the rack, and the subwoofer position is decided against the room\'s modes rather than against the sofa. Calibration follows once the room is painted and furnished.',
        ],
      },
      {
        id: 'receiver',
        question: 'Which receiver drives Polk Audio speakers?',
        answer:
          'Leading IT drives Polk Audio speakers with Marantz or Denon processing and amplification, matched on the published impedance and sensitivity of the models being used.',
        body: [
          'Because Leading IT supplies all three brands, the match is specified against the room and the layout rather than around whatever is available. The channel count of the receiver has to meet the layout the room can physically take.',
          'No wattage claim is made here beyond what Polk Audio publishes for each model. Those figures are on the model pages, where they can be read against the receiver being considered.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply Polk Audio in Pakistan?',
        answer:
          'Yes — Leading IT supplies Polk Audio to projects in Pakistan on a distribution basis, handled from its Dubai base.',
        body: [
          'The whole range is available, warranty and breakages route through Leading IT, and its engineers travel to commission and calibrate where a project needs it.',
          'Leading IT has no premises in Pakistan; delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Which Polk speakers do I need for a 7.2.4 cinema?',
        answer:
          'A 7.2.4 layout needs a front left and right, a centre, two side surrounds, two rear surrounds, two subwoofers and four height positions. Leading IT fills those roles from one Polk series so the timbre matches across the front. It then checks that the room can physically host the surround and height positions.',
      },
      {
        question: 'Are Polk speakers a good match for Marantz or Denon receivers?',
        answer:
          'Yes, and Leading IT can be specific because it supplies all three. The match is made on the published impedance and sensitivity of the Polk models, against the receiver\'s rated capability and the size of the room. A headline power figure is not the input.',
      },
      {
        question: 'Can Polk speakers be installed in-wall or in-ceiling?',
        answer:
          'The Polk models Leading IT carries — Reserve and Signature Elite — are cabinet loudspeakers for floor, stand or wall positions rather than in-wall or in-ceiling models. Where a room needs speakers hidden in the ceiling, Leading IT specifies from the in-ceiling models elsewhere in its catalogue.',
      },
      {
        question: 'What does a Polk Audio speaker package cost in Dubai?',
        answer:
          'Leading IT quotes per project rather than publishing a figure. What drives it is the number of speaker positions, which series they come from, and the cabling and mounting the room needs. Send the layout and Leading IT will price it.',
      },
      {
        question: 'Does Leading IT supply Polk Audio in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to commission where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },

  // --------------------------------------------------------------------- JVC
  {
    brandSlug: 'jvc',
    heroSupplyLine:
      'D-ILA home cinema projectors supplied, installed and calibrated by Leading IT in Dubai — across the UAE, and to projects in Pakistan.',
    sections: [
      {
        id: 'supply',
        question: 'Who supplies JVC projectors in Dubai and the UAE?',
        answer:
          'Leading IT supplies and installs JVC D-ILA home cinema projectors in Dubai, United Arab Emirates, for private cinema and media rooms across the Emirates.',
        body: [
          'Leading IT carries five JVC projectors: DLA-NZ900, DLA-NZ800, DLA-NZ700, DLA-NZ500 and LX-NZ30. The four DLA-NZ models are D-ILA projectors; the LX-NZ30 is a different technology and is not part of that series.',
          'Leading IT installs and calibrates what it supplies. A projector specified without the screen, the throw distance and the room\'s light is a number on an invoice rather than a picture.',
        ],
      },
      {
        id: 'selection',
        question: 'Which JVC projector should I choose?',
        answer:
          'Leading IT chooses a JVC projector from the screen width and the light in the room, not from the model hierarchy. A larger screen or an unsealed room needs more light output.',
        body: [
          'Screen width sets the light demand first. A modest screen in a sealed, dark-painted cinema room asks far less of a projector than a wide screen in a room with a window. The second case is where the higher-output models earn their place.',
          'Room finish is the second input. Light-coloured walls and a pale ceiling bounce image light back onto the screen. That lowers the contrast the projector was bought for, and it is a room decision rather than a projector one.',
          'Stated brightness, native resolution and e-shift capability per model are published on each projector\'s own page, cited to JVC. Leading IT works from those figures and the room, and will say when a smaller model is the correct answer.',
        ],
      },
      {
        id: 'installation',
        question: 'What does a JVC projector installation involve in a Dubai villa?',
        answer:
          'A JVC projector installation in a Dubai villa is set by the ceiling void and the cable run. Leading IT fixes the mounting position from the throw distance before the ceiling closes.',
        body: [
          'Throw distance and lens shift decide where the projector actually mounts, and the ceiling void decides whether that position is available. Both are settled on the drawing, because a projector position discovered after the ceiling is boarded is a rebuild.',
          'Heat and dust are the Dubai-specific part. A sealed ceiling enclosure looks tidy and becomes a serviceability problem. Filter access and the projector\'s position relative to an AC supply are decided with the mount, not after it.',
          'At first fix the room needs power at the mount, and an HDMI, HDBaseT or fibre run of the right length back to the rack. Conduit for a future upgrade goes in at the same time. Long runs are where an unplanned cable choice fails at 4K120.',
          'Calibration is a booked visit after the room is finished and painted. Calibrating against primer measures a room that will not exist by handover.',
        ],
      },
      {
        id: 'd-ila',
        question: 'What is D-ILA, and how is it different from DLP or LCD?',
        answer:
          'D-ILA is JVC\'s own reflective imaging technology, used across the DLA-NZ series, and it is what the native contrast figures on those models are measured from.',
        body: [
          'The practical difference a viewer notices is in the dark parts of the image — black level and shadow detail rather than peak brightness. That is why D-ILA projectors are specified for dedicated cinema rooms more often than for bright multipurpose rooms.',
          'Leading IT states contrast and brightness only as JVC publishes them per model, on the model pages. A contrast figure quoted without its model and its measurement basis is marketing rather than specification.',
        ],
      },
      {
        id: '8k',
        question: 'Do I need an 8K-capable model?',
        answer:
          'For most Dubai cinema rooms the answer is decided by screen width and seating distance rather than by the resolution label. 8K capability matters when the seats are close enough to a wide screen to resolve it.',
        body: [
          'The e-shift capability of each model is published by JVC, and Leading IT works from those figures rather than from a tier story. A room where the front row sits well back from a modest screen will not show the difference.',
          'Where the room does justify it, the same room usually justifies attention to the screen and to light control first. A better screen in a well-finished room is visible more often than a higher resolution label.',
        ],
      },
      {
        id: 'pakistan',
        question: 'Does Leading IT supply JVC projectors in Pakistan?',
        answer:
          'Yes — Leading IT supplies JVC projectors to projects in Pakistan on a distribution basis, handled from its Dubai base.',
        body: [
          'The whole range is available, warranty and breakages route through Leading IT, and its engineers travel to install and calibrate where a project needs it.',
          'Leading IT has no premises in Pakistan; delivery timing is confirmed per order at quotation.',
        ],
      },
    ],
    faq: [
      {
        question: 'Which JVC projector is right for a 3.5 m screen?',
        answer:
          'A screen that wide is where the higher-output DLA-NZ models start to matter, and the deciding factor is how much light the room gives back. In a sealed, dark-finished cinema room the requirement is lower than in a room with a window or pale walls. Leading IT works the answer out from the published brightness figures against the screen and the room rather than naming one model in the abstract.',
      },
      {
        question: 'Does Leading IT install and calibrate projectors, or only supply them?',
        answer:
          'Both. Leading IT supplies JVC projectors, mounts and aligns them, and calibrates as a booked visit after the room is finished and painted. Supply-only is available to integrators through the Leading IT trade account.',
      },
      {
        question: 'Can a JVC projector work in a room with windows?',
        answer:
          'It can, and the specification changes. The projector\'s stated brightness, the screen\'s gain and the room\'s finishes all have to be chosen for the light that is actually present. The result will not match a sealed room. Light control itself is a matter for the client\'s own contractor; Leading IT specifies the projector and screen for the room as it will be.',
      },
      {
        question: 'What does a JVC projector cost in Dubai?',
        answer:
          'Leading IT quotes per project rather than publishing a figure. The drivers are the model, the screen, the mount, the cabling and calibration. Send the room dimensions and the intended screen width and Leading IT will price it.',
      },
      {
        question: 'Does Leading IT supply JVC projectors in Pakistan?',
        answer:
          'Yes, on a distribution basis, handled from Dubai. The whole range is available, warranty routes through Leading IT, and its engineers travel to install and calibrate where a project needs it. Leading IT has no premises in Pakistan.',
      },
    ],
  },
];

export const BRAND_CONTENT_BY_SLUG: Record<string, BrandContent> = Object.fromEntries(
  BRAND_CONTENT.map((content) => [content.brandSlug, content]),
);
