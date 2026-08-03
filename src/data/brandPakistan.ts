/**
 * `/brands/<brand>/pakistan/` — the non-local Pakistan distribution-coverage
 * pages. Two records today, Crestron and Marantz, and the launch set is capped
 * at those two on purpose (`docs/05-URL-TAXONOMY.md` §6).
 *
 * Same shape as `src/data/solutions.ts`, `src/data/trade.ts` and
 * `src/data/locationDubai.ts`: a plain typed record carrying the real prose,
 * rendered by a template that decides nothing about content. Section, table and
 * FAQ types come from the solutions module because
 * `src/components/AnswerBlocks.tsx` renders exactly those shapes — one renderer,
 * one contract.
 *
 * ## Rule 1 of this file: Pakistan is a country, never a place
 *
 * `_CONVENTIONS.md` §2 and `docs/05-URL-TAXONOMY.md` §5a/§6. Country level only.
 * **No city, ever** — not Karachi, Lahore, Islamabad or any other. No address,
 * no "near you", no opening hours, no map, no second phone number, and no
 * `LocalBusiness`, `Place` or `PostalAddress` node on either page. Dubai is the
 * only physical premises this business has, and both pages say so in as many
 * words, in the first three sentences, because stating it plainly is what stops
 * an answer engine inventing an office that does not exist.
 *
 * A page that drifts toward city-level intent is a doorway page, and the
 * remedy is deletion rather than editing.
 *
 * ## Rule 2: no lead-time figure, in any form
 *
 * `docs/OPEN-QUESTIONS.md` #24 resolved four operational facts on 2026-08-02.
 * Three are published below as stated — **warranty and RMA route through Leading
 * IT's own team**, **the whole range is supplied** (not a subset), and
 * **engineers travel to commission**. The fourth, lead time, came with an
 * explicit instruction not to quote it, and the instruction is the operative
 * half of the answer.
 *
 * So **no duration appears anywhere on either page**: not the figure, not a
 * rounded version of it, not "about two weeks", not "typically under a month",
 * not a range built around it, and not in a table cell, an FAQ answer, a meta
 * description or a WhatsApp prefill. Both pages say lead time is confirmed per
 * order at quotation — the same stance `/trade/` already takes on stock and lead
 * time, deliberately worded to match it.
 *
 * *Why softening it would be worse than either extreme, so a later pass does not
 * "helpfully" restore it:* a published lead time is a promise a buyer plans a
 * programme around. Muneeb declined to make it one. A vaguer paraphrase is the
 * same promise with deniability attached, which is the worst of the three.
 *
 * ## Rule 3: no authorisation wording, no pricing, no stock position
 *
 * The approved Pakistan-page sentence is *"Leading IT supplies <Brand> to
 * projects in Pakistan from its Dubai base."* (`_CONVENTIONS.md` §1). Never
 * "authorized dealer", "official distributor" or any equivalent, for either
 * brand (`docs/OPEN-QUESTIONS.md` #3). No price, no range, no "from" figure, no
 * duty percentage, no shipping cost (§3). No stock-on-hand claim.
 *
 * ## Rule 4: the two pages must not read as one template with the brand swapped
 *
 * `docs/05` §6 names that pattern as the anti-pattern to refuse. The audiences
 * genuinely differ — PK1 is an integrator sourcing control hardware, PK2 is a
 * person buying a cinema — so the two records share no sentence, ask different
 * questions in a different order, and their comparison tables compare different
 * things. The Marantz record additionally carries a price-intent H2 that the
 * Crestron record does not, because `marantz price in pakistan` is a real query
 * and this page answers the intent without publishing a figure
 * (`docs/04-KEYWORD-MAP.md` §10.5).
 *
 * ## What is deliberately absent because nothing sources it
 *
 * - **Who acts as importer of record, and who pays duty.** Not confirmed
 *   anywhere. Both pages say the arrangement is settled in the quotation, which
 *   is a statement about process and not about who bears a cost.
 * - **Any installer, integrator or client named in Pakistan.** Naming a company
 *   needs that company's agreement, and none has been given.
 * - **Any turnaround figure on a warranty claim**, for the same reason the lead
 *   time is absent.
 * - **Photography.** No image on this site depicts supply into Pakistan, and
 *   `ResponsiveImage` throws at build time on an asset that is not in the
 *   manifest, so both pages use the text-only hero that `/trade/`, `/brands/`
 *   and `/locations/dubai/` already use.
 */
import type { SolutionFaq, SolutionSection } from '@/data/solutions';

export type BrandPakistanPage = {
  /**
   * Parent brand slug. The route is `/brands/<brandSlug>/pakistan/`, and
   * `'pakistan'` is in `RESERVED_BRAND_CHILD_SLUGS` (`src/seo/routes.ts`) so no
   * product can ever be authored at the same path.
   */
  brandSlug: string;
  /** Brand display name, exactly as `src/data/brands.ts` spells it. */
  brandName: string;
  /** The one `<h1>` on the page. */
  h1: string;
  /** Lead paragraph, under the h1 and above the first question H2. */
  intro: string;
  /**
   * Second sentence of the meta description, after the approved supply
   * sentence. `brandPakistanMeta()` budgets the pair against
   * DESCRIPTION_MAX_LENGTH — see the count in that builder's comment.
   */
  metaDetail: string;
  sections: SolutionSection[];
  faq: SolutionFaq[];
  /** Primary plain-text WhatsApp prefill. Encoded once by `whatsappHref()`. */
  whatsappPrefill: string;
  /** Second prefill, used by the CTA that follows the warranty section. */
  secondaryPrefill: string;
  /**
   * The section the second CTA is rendered beneath, found by `id` rather than
   * by index so re-ordering the record cannot silently move the conversion
   * block. Both briefs put it after the warranty answer, which is where the
   * reader who came for that question stops.
   */
  warrantySectionId: string;
  /**
   * Sibling brand hubs to cross-link, **excluding this page's own parent** —
   * the parent is reached by the breadcrumb and by a body link, and a hub must
   * not appear twice in the same cross-link block. Every slug here emits HTML
   * today (`_CONVENTIONS.md` §8).
   */
  relatedBrandSlugs: string[];
};

/**
 * `/brands/crestron/pakistan/` — PK1, trade-led.
 *
 * The audience is an integrator, a specifier or a developer procuring across a
 * border, so the questions are the ones that decide a supply relationship:
 * route to market, lead time, who owns a failure, how a system gets
 * commissioned when the supplier is in another country, and what part of the
 * range is actually available.
 */
const CRESTRON_PAKISTAN: BrandPakistanPage = {
  brandSlug: 'crestron',
  brandName: 'Crestron',
  h1: 'Crestron in Pakistan — supplied from Leading IT in Dubai',
  intro:
    'This page is about supply, not presence. It sets out how Crestron equipment reaches a project ' +
    'in Pakistan, who programs and commissions it, and who deals with a unit that fails. All of it ' +
    'is answered from Dubai, which is where Leading IT is.',
  // 72 chars. The supply sentence with "Crestron" in it is 73, so the
  // description totals 73 + 1 + 72 = 146 against the 155 ceiling.
  metaDetail: 'Warranty is handled by the same team, and lead time is quoted per order.',
  sections: [
    {
      id: 'does-leading-it-supply-crestron-in-pakistan',
      question: 'Does Leading IT supply Crestron in Pakistan?',
      answer:
        'Leading IT supplies Crestron to projects in Pakistan from its Dubai base, with sourcing, ' +
        'programming, commissioning and warranty handling from the same team. Leading IT is based ' +
        'in Dubai, United Arab Emirates, and has no premises in Pakistan.',
      body: [
        // The counter-intuitive sentence the brief asks for, and the reason it
        // is here rather than buried at the bottom of the page.
        'That second sentence is on the page deliberately. There is no office in Pakistan, no ' +
          'local address and no second phone number, and a page implying otherwise would be ' +
          'describing a business that does not exist.',
        'What does exist is a supply relationship with real obligations attached. Equipment is ' +
          'sourced and shipped from Dubai, and the order is placed with the team that will answer ' +
          'the commissioning question long after the order closes. A fault comes back to that same ' +
          'team.',
        'Every Crestron line Leading IT carries is available on that basis. Nothing in the ' +
          'catalogue is fenced off as available in the Emirates only.',
      ],
    },
    {
      id: 'how-crestron-reaches-a-pakistan-project',
      question: 'How does Crestron equipment reach a project in Pakistan?',
      answer:
        'Crestron equipment for a Pakistan project is ordered from Leading IT in Dubai, sourced ' +
        'there, and shipped to the project. The order and the support that follows it stay with ' +
        'one company rather than splitting across two.',
      body: [
        'A useful first enquiry is a schedule rather than a question. Part numbers as the ' +
          'manufacturer prints them, quantities, and what the system has to do — that is enough for ' +
          'a quotation to come back without a round trip.',
        'How import and clearance are arranged is settled in that quotation rather than published ' +
          'here. It depends on how the order is placed, so a rule printed on a page would be wrong ' +
          'as often as it was right.',
        'The commercial relationship is with Leading IT throughout. There is no second supplier in ' +
          'the middle to escalate through when a part number changes or a delivery has to move.',
      ],
    },
    {
      id: 'crestron-lead-time-for-a-pakistan-project',
      question: 'What lead time should a Pakistan project plan for?',
      answer:
        'Leading IT confirms lead time per order at quotation, for a Pakistan project as for a ' +
        'project in the UAE. No duration is published on this page, because the honest answer ' +
        'moves from one order to the next.',
      // No figure, no range, no rounded paraphrase — see the file header and
      // `docs/OPEN-QUESTIONS.md` #24.
      body: [
        'Four things move it: which part numbers are on the schedule, the quantities, the shipping ' +
          'mode chosen for the consignment, and clearance at the far end. Change any one and the ' +
          'answer changes with it.',
        'This is the same position `/trade/` takes on stock and lead time, and it is taken for the ' +
          'same reason. A number printed on a web page is a commitment nobody re-reads before ' +
          'quoting against it.',
        'The practical answer is to send the schedule at design stage rather than at order stage. ' +
          'A quoted lead time can be planned around; an assumed one cannot.',
      ],
    },
    {
      id: 'crestron-warranty-and-rma-in-pakistan',
      question: 'Who handles warranty and RMA on equipment supplied into Pakistan?',
      answer:
        'Leading IT handles breakages on Crestron it has supplied into Pakistan. The claim is ' +
        'raised with Leading IT rather than by the client approaching the manufacturer, and it is ' +
        'the same team that quoted and shipped the order.',
      body: [
        'For an integrator this is usually the question that decides the sale. A failed processor ' +
          'in a commissioned house is a programme problem before it is a hardware problem. How ' +
          'long it lasts depends on how many companies sit between the fault and the fix.',
        'Quote the original order when raising one — the part number, the quantity and the ' +
          'approximate ship date. The reply can then be about the unit rather than about ' +
          'establishing what was bought.',
        // No turnaround figure, for the same reason there is no lead-time figure.
        'No turnaround figure or replacement policy is published here. Both are settled per case, ' +
          'and a published one would be a commitment made without the case in front of anyone.',
      ],
    },
    {
      id: 'crestron-commissioning-and-programming-at-a-distance',
      question: 'How does commissioning and programming work at a distance?',
      answer:
        'Leading IT programs and commissions Crestron systems for Pakistan projects from Dubai. ' +
        'Its engineers travel to site for the parts of commissioning that need a person in the ' +
        'room.',
      body: [
        'Remote work covers what can be proved over a connection the site provides. That means ' +
          'loading the program, configuring scenes and keypad behaviour, addressing devices, and ' +
          'reading a processor back when something does not respond.',
        'Travelling covers what cannot. That is dimming curves against the fittings actually ' +
          'installed, levels in the room as built, and touch screen placement. It is also the ' +
          'handover, where somebody is shown how the house works. None of the four survives being ' +
          'done from a desk.',
        'The order of operations matters more on a cross-border project than on a local one. ' +
          'Containment, cable, board space, power and network all have to be finished before a ' +
          'visit is worth booking, because a visit cannot be rescheduled cheaply.',
      ],
    },
    {
      id: 'which-crestron-products-are-supplied-to-pakistan',
      question: 'Which Crestron products are supplied to Pakistan projects?',
      answer:
        'Leading IT supplies the whole Crestron range it carries to Pakistan projects, not a ' +
        'subset. That covers 4-Series control processors, Horizon and Cameo keypads, touch ' +
        'screens, DIN-rail dimming and switching, Avia DSP, sensors and Cresnet infrastructure.',
      body: [
        'There is no reduced list for the market and no line held back. The Crestron hub carries ' +
          'the full catalogue with a page per part, and every one of those parts can be quoted ' +
          'for a project in Pakistan.',
        'The DIN-rail half of the range tends to be the deciding factor on a residential project. ' +
          'Dimming, high-voltage switching, motor control and the DALI and KNX interfaces all ' +
          'mount in the board, which changes what the electrical contractor has to leave space for.',
        'The table below is the honest difference between the two markets, set out row by row.',
      ],
      table: {
        caption: 'A UAE project and a Pakistan project, compared',
        columns: ['', 'UAE project', 'Pakistan project'],
        rows: [
          [
            { text: 'Where equipment comes from' },
            { text: 'Supplied from Dubai' },
            { text: 'Supplied from Dubai and shipped to the project' },
          ],
          [
            { text: 'What of the range is available' },
            { text: 'The full Crestron catalogue', to: '/brands/crestron' },
            { text: 'The same catalogue, with no market subset', to: '/brands/crestron' },
          ],
          [
            { text: 'Who programs and commissions' },
            { text: 'Leading IT, from Dubai and on site' },
            { text: 'Leading IT, remotely and by travelling to site' },
          ],
          [
            { text: 'Who handles a failed unit' },
            { text: 'Leading IT' },
            { text: 'Leading IT — the claim is not the client’s to raise with the manufacturer' },
          ],
          [
            { text: 'Lead time' },
            { text: 'Confirmed per order at quotation', to: '/trade' },
            { text: 'Confirmed at quotation, alongside the shipping arrangement', to: '/trade' },
          ],
        ],
      },
    },
    {
      id: 'who-installs-crestron-in-pakistan',
      question: 'Who installs Crestron on a project in Pakistan?',
      answer:
        'Crestron on a Pakistan project is installed by the contractor or integrator already on ' +
        'site, with Leading IT supplying the equipment and commissioning the system. Integrators ' +
        'can buy directly for their own projects.',
      body: [
        'That split is the normal one on a cross-border job, and it works when the boundary is ' +
          'agreed in writing at the start. First fix, containment, terminations, board space, ' +
          'power and network belong to the contractor on site.',
        'The trade page is written for the other half of that relationship: what to include in a ' +
          'first enquiry, how availability is confirmed, and what commissioning support covers. It ' +
          'is the right starting point for an integrator rather than this page.',
        'No installer or integrator in Pakistan is named anywhere on this site. A company’s name ' +
          'is theirs to give, and none has agreed to appear here.',
      ],
    },
  ],
  faq: [
    {
      question: 'Does Leading IT have an office in Pakistan?',
      answer:
        'No. Leading IT has one premises, in Dubai, United Arab Emirates. Pakistan is a supply ' +
        'relationship: equipment is shipped from Dubai, and commissioning is done remotely and by ' +
        'travelling to site. There is no local address and no second phone number.',
    },
    {
      question: 'Can an integrator in Pakistan buy Crestron directly from Leading IT?',
      answer:
        'Yes. Send the part numbers, the quantities and what the system has to do, and a quotation ' +
        'and an availability position come back. The trade page sets out what makes a first ' +
        'enquiry answerable in one reply rather than three.',
    },
    {
      question: 'Who programs a Crestron system on a Pakistan project?',
      answer:
        'Leading IT. Programming, scene configuration and diagnostics are done from Dubai, over a ' +
        'connection the site provides. Leading IT engineers travel to site for the parts that have ' +
        'to be proved in the room.',
    },
    {
      question: 'What happens if Crestron equipment supplied into Pakistan fails?',
      answer:
        'Leading IT handles it. The claim is raised with Leading IT rather than with the ' +
        'manufacturer, by the team that quoted and shipped the order. Quote the part number and ' +
        'roughly when it shipped, and the reply is about the unit rather than about paperwork.',
    },
  ],
  whatsappPrefill: 'Hi Leading IT — I need Crestron supplied for a project in Pakistan.',
  secondaryPrefill:
    "Hi Leading IT — I'm an integrator in Pakistan and need Crestron pricing and lead times.",
  warrantySectionId: 'crestron-warranty-and-rma-in-pakistan',
  relatedBrandSlugs: ['blustream', 'basalte', 'black-nova'],
};

/**
 * `/brands/marantz/pakistan/` — PK2, consumer-led.
 *
 * The reader is a person buying a cinema, not an integrator sourcing a rack, so
 * the order of questions is different: what it costs comes third, warranty comes
 * before lead time, and calibration gets a section that the Crestron page has no
 * equivalent of. `marantz price in pakistan` is answered as intent — quoted per
 * order, and here is what drives it — with no figure anywhere, including in the
 * table and the FAQ (`docs/04-KEYWORD-MAP.md` §10.5).
 */
const MARANTZ_PAKISTAN: BrandPakistanPage = {
  brandSlug: 'marantz',
  brandName: 'Marantz',
  h1: 'Marantz in Pakistan — supplied from Leading IT in Dubai',
  intro:
    'A Marantz receiver bought for a room in Pakistan comes from Dubai, and so does everything ' +
    'that happens afterwards. This page covers how one is ordered, what a quotation depends on, ' +
    'who deals with a fault, and who sets the system up once it arrives.',
  // 74 chars. The supply sentence with "Marantz" in it is 72, so the
  // description totals 72 + 1 + 74 = 147 against the 155 ceiling.
  metaDetail: 'Receivers, processors and amplifiers shipped from Dubai, quoted per order.',
  sections: [
    {
      id: 'does-leading-it-supply-marantz-in-pakistan',
      question: 'Does Leading IT supply Marantz in Pakistan?',
      answer:
        'Leading IT supplies Marantz AV receivers, processors and amplifiers to customers and ' +
        'installers in Pakistan from its Dubai base. Leading IT is based in Dubai, United Arab ' +
        'Emirates, and has no premises in Pakistan.',
      body: [
        'There is no shop to walk into in Pakistan, no local address and no second phone number. ' +
          'Saying so plainly is the point of this paragraph: everything below describes supply from ' +
          'Dubai, and nothing on this page describes a presence that is not there.',
        'An order starts as a message rather than a counter visit. Name the model and describe the ' +
          'room, and the reply covers what is involved in getting that unit to the address on the ' +
          'order.',
        'The relationship after delivery is the part worth reading. Commissioning support and ' +
          'anything that goes wrong come back to the same team in Dubai.',
      ],
    },
    {
      id: 'how-a-marantz-receiver-reaches-a-buyer-in-pakistan',
      question: 'How does a Marantz receiver reach a buyer in Pakistan?',
      answer:
        'A Marantz unit bound for Pakistan is bought from Leading IT in Dubai, then sourced and ' +
        'shipped to the address on the order. The same team answers for it afterwards.',
      body: [
        'The useful things to send first are the model, the room and the rest of the system. ' +
          'Whether the loudspeakers are already chosen changes the answer more than most buyers ' +
          'expect, because it decides how many channels actually have to be amplified.',
        'Import and clearance are arranged as part of the quotation, not decided by a rule on a ' +
          'web page. What applies depends on how the order is placed, so it is confirmed in ' +
          'writing alongside everything else.',
        'A room that is still being built is worth mentioning too. Cable routes for surrounds and ' +
          'height channels are decided long before the receiver is switched on, and they are the ' +
          'expensive thing to get wrong.',
      ],
    },
    {
      id: 'what-a-marantz-system-costs-in-pakistan',
      question: 'What does a Marantz system cost in Pakistan?',
      answer:
        'Leading IT quotes a Marantz system for Pakistan per order. No price is published on this ' +
        'site, for any model, in any market. The figure that matters is the one quoted against a ' +
        'named model and a real shipping arrangement.',
      body: [
        'Four things decide it. Which model — Cinema 70s, Cinema 50, Cinema 30 and AV 10 are ' +
          'different classes of machine, not the same machine at different sizes. Whether the ' +
          'amplification lives in the receiver or in a separate AMP 10 or AMP 20.',
        'Then the shipping mode chosen for the consignment, and the clearance at the far end. A ' +
          'published range would have to cover all four at once, which is how a range ends up ' +
          'accurate for nobody.',
        'So the fastest route to a real number is to name the model. A quotation against ' +
          'Cinema 50 with a known speaker layout can be specific in one reply.',
      ],
    },
    {
      id: 'marantz-lead-time-for-pakistan',
      question: 'What lead time should I plan for?',
      answer:
        'Lead time on Marantz shipped to Pakistan is confirmed by Leading IT per order, at ' +
        'quotation. No duration is published on this page, because it moves per model and per ' +
        'order.',
      // No figure, no range, no rounded paraphrase — see the file header.
      body: [
        'It moves with which model is ordered, the shipping mode chosen, and clearance at the far ' +
          'end. Those are also the three things a quotation settles, so the answer arrives with ' +
          'the price rather than before it.',
        'This is the same position the trade page takes on availability, and it is taken for the ' +
          'same reason. A duration printed on a web page is a promise nobody re-reads before ' +
          'repeating it.',
        'If the room is on a build programme, say so in the first message. A date to work back ' +
          'from changes which options are worth quoting.',
      ],
    },
    {
      id: 'marantz-warranty-and-service-in-pakistan',
      question: 'How does warranty and service work on a unit supplied into Pakistan?',
      answer:
        'Leading IT handles breakages on Marantz it has supplied into Pakistan. A fault is raised ' +
        'with Leading IT rather than with the manufacturer, and it is the same team that sourced ' +
        'and shipped the unit.',
      body: [
        'For a buyer this matters more than lead time. A receiver bought across a border is only ' +
          'as good as the answer to one question: what happens if it stops working. Here the ' +
          'answer is one company rather than a chain of them.',
        'Keep the order reference. Send the model, roughly when it shipped, and what the unit is ' +
          'doing now. That is enough for the reply to be about the fault rather than the paperwork.',
        'No turnaround figure is published here. It is settled per case, and a figure published ' +
          'without the case in front of anyone is a commitment made blind.',
      ],
    },
    {
      id: 'which-marantz-models-are-supplied-to-pakistan',
      question: 'Which Marantz models are supplied to Pakistan?',
      answer:
        'Leading IT supplies the whole Marantz range it carries to Pakistan, not a subset. That ' +
        'covers the Cinema and Stereo receivers, the AV processors and preamplifiers, the AMP ' +
        'power amplifiers, MODEL 10, LINK 10n, M-CR612, CD6007 and the Horizon wireless speakers.',
      body: [
        'There is no reduced list for the market. The Marantz hub carries every model with its own ' +
          'page and its published specification, and any of them can be quoted for delivery to ' +
          'Pakistan.',
        'A cinema is rarely one box, which is why the rest of the stack is worth looking at in the ' +
          'same session. Denon covers the receiver alternatives, Polk Audio the loudspeakers, and ' +
          'JVC the projection end of the room.',
        'The table below sets out what actually differs between buying in the Emirates and having ' +
          'a system supplied into Pakistan.',
      ],
      table: {
        caption: 'Buying in the UAE and buying into Pakistan, compared',
        columns: ['', 'Bought in the UAE', 'Supplied into Pakistan'],
        rows: [
          [
            { text: 'Where the unit ships from' },
            { text: 'Dubai' },
            { text: 'Dubai, shipped to the address on the order' },
          ],
          [
            { text: 'Which models are available' },
            { text: 'The full Marantz range', to: '/brands/marantz' },
            { text: 'The same range, with no market subset', to: '/brands/marantz' },
          ],
          [
            { text: 'Who installs and calibrates' },
            { text: 'Leading IT' },
            { text: 'The installer on the project, supported by Leading IT' },
          ],
          [
            { text: 'Who handles a fault' },
            { text: 'Leading IT' },
            { text: 'Leading IT — raised with the supplier, not the manufacturer' },
          ],
          [
            { text: 'Price and lead time' },
            { text: 'Quoted per order' },
            { text: 'Quoted per order, with the shipping arrangement' },
          ],
        ],
      },
    },
    {
      id: 'who-installs-and-calibrates-marantz-in-pakistan',
      question: 'Who installs and calibrates it?',
      answer:
        'A Marantz system supplied into Pakistan is installed and calibrated by the installer on ' +
        'the project. Leading IT supplies the equipment and supports the work remotely or by ' +
        'travelling to site.',
      body: [
        'Calibration is mostly not a software step. Speaker positions, listening distance, levels ' +
          'and the amount of soft furnishing decide most of what a system will ever sound like. ' +
          'All four are settled before a microphone is plugged in.',
        'After that the receiver does its part. Cinema 30, Cinema 40 and Cinema 50 carry Audyssey ' +
          'MultEQ XT32 and are Dirac-ready, which is the measurement stage rather than the whole ' +
          'job.',
        'No installer in Pakistan is named on this site. Naming a company is that company’s ' +
          'decision to give, and none has been asked. The honest offer is support to whoever is ' +
          'doing the work, rather than a referral.',
      ],
    },
  ],
  faq: [
    {
      question: 'Does Leading IT have a shop in Pakistan?',
      answer:
        'No. Leading IT has one premises, in Dubai, United Arab Emirates. Marantz for Pakistan is ' +
        'sourced and shipped from Dubai, and support is given remotely or by travelling to site. ' +
        'Orders are placed by message or email rather than over a counter.',
    },
    {
      question: 'How much is a Marantz Cinema 50 in Pakistan?',
      answer:
        'It is quoted per order, and no price is published on this site for any model. The figure ' +
        'depends on the model, whether separate amplification is part of the system, the shipping ' +
        'mode and clearance. Name the model and the room, and the reply is specific.',
    },
    {
      question: 'What happens if a Marantz unit supplied into Pakistan develops a fault?',
      answer:
        'Leading IT handles it. Take it up with Leading IT rather than with Marantz — the same ' +
        'team sourced and shipped the unit. Keep the order reference: the model and roughly when ' +
        'it shipped is enough to start.',
    },
    {
      question: 'Can Leading IT recommend an installer in Pakistan?',
      answer:
        'No installer is named on this site, because naming a company is that company’s decision ' +
        'to give. What is offered instead is support to whoever is doing the work: configuration ' +
        'and fault-finding remotely, and travel to site for commissioning.',
    },
  ],
  whatsappPrefill: "Hi Leading IT — I'd like to buy a Marantz system for a project in Pakistan.",
  secondaryPrefill:
    'Hi Leading IT — I have a Marantz question about warranty and support in Pakistan.',
  warrantySectionId: 'marantz-warranty-and-service-in-pakistan',
  relatedBrandSlugs: ['denon', 'polk-audio', 'jvc'],
};

/**
 * The launch set, and it is capped at two (`docs/05-URL-TAXONOMY.md` §6).
 *
 * **Do not add the other seven brands from this template.** Generating nine
 * near-identical PK pages by swapping a brand name is the doorway pattern with a
 * country in place of a city, and §6 names it as the anti-pattern to refuse — it
 * would put the whole `/brands/` directory under quality suspicion. The later
 * order, each one gated on genuinely distinct content rather than on a slug
 * being available, is Denon → JVC → Polk Audio → Basalte → Blustream →
 * Black Nova → uandksound. Until a brand has its own page, Pakistan supply
 * intent for it is served by an H2 on its brand hub.
 */
export const BRAND_PAKISTAN_PAGES: BrandPakistanPage[] = [CRESTRON_PAKISTAN, MARANTZ_PAKISTAN];

/** Slug lookup for the template. Keyed by the **parent brand** slug. */
export const BRAND_PAKISTAN_BY_SLUG: Record<string, BrandPakistanPage> = Object.fromEntries(
  BRAND_PAKISTAN_PAGES.map((page) => [page.brandSlug, page]),
);
