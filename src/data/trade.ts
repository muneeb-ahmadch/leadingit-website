/**
 * `/trade/` — the one page the integrator audience reads.
 *
 * Same shape as `src/data/solutions.ts` and `src/data/locationDubai.ts`: a plain
 * typed record carrying the real prose, rendered by a template that decides
 * nothing about content. Section and FAQ types come from the solutions module
 * because `src/components/AnswerBlocks.tsx` renders exactly those shapes.
 *
 * ## Three clusters, one page (`docs/04-KEYWORD-MAP.md` §5)
 *
 * T1 (trade accounts, distribution), T2 (stock and part-number availability) and
 * T3 (programming and commissioning) all land here rather than on three thin
 * pages. Structural reason as well as an editorial one: every one of the nine
 * brand hubs is specified to link `/trade/` with descriptive anchor text
 * (`docs/05-URL-TAXONOMY.md` §12), and nine links have to point at one page.
 *
 * ## The two hard limits this file exists to hold
 *
 * 1. **No stock figure and no lead-time figure — and nothing that implies
 *    either.** `docs/OPEN-QUESTIONS.md` #3/T2 is unanswered: the stronger claim
 *    *"Leading IT holds stock in Dubai and quotes lead times per part number"*
 *    has not been confirmed as a maintainable statement, so it is not written in
 *    any form. What ships is the honest T2 floor — availability and lead time are
 *    **confirmed per part number on enquiry** — which states a process, never a
 *    position. A stale stock claim is trivially disprovable and costs the
 *    relationship it was meant to win.
 * 2. **No pricing of any kind** (`_CONVENTIONS.md` §3), and that includes trade
 *    pricing: no discount tier, no margin, no minimum order value, no payment
 *    terms, no credit facility, no dispatch or response-time commitment.
 *
 * Also absent, deliberately: warehouse size or location detail, a customer list,
 * and any authorisation phrasing for any brand (`_CONVENTIONS.md` §1 — neutral
 * "supplies and installs" only, `docs/OPEN-QUESTIONS.md` #3).
 *
 * ## Where this narrows the brief, and why
 *
 * `docs/10-CONTENT-BRIEFS/trade.md` claim 3 reads *"Leading IT provides Crestron
 * programming and commissioning support for integrator projects"*, and its FAQ 5
 * answers "yes" to programming systems **for other integrators**. Nothing sources
 * that: `docs/00-CONTEXT.md` §1 confirms Leading IT installs and commissions, and
 * §4 confirms KNX and DALI commissioning (OQ #26) — both about work Leading IT
 * itself supplies. Selling programming as a service on somebody else's supply is
 * a different commercial claim. The section below therefore scopes support to
 * **the systems Leading IT supplies**, and says plainly that taking over a system
 * supplied elsewhere is discussed case by case. Logged in
 * `docs/12-PROVENANCE/phase4-solutions-build.md`.
 *
 * The brief's account-opening steps ("send the company detail and trade licence")
 * are likewise not written as requirements — no source states what Leading IT
 * asks for. The table below is framed as *what to include so the reply is
 * useful*, which is advice this site can give, and one sentence says the rest is
 * confirmed in the reply rather than published here.
 *
 * **Training is absent.** `docs/00-CONTEXT.md` §2.4 lists training among the
 * trade audience's needs; nothing confirms Leading IT runs any. A need is not a
 * capability, so there is no training H2, sentence or FAQ.
 */
import type { SolutionFaq, SolutionSection } from '@/data/solutions';

export type TradeContent = {
  /** The one `<h1>` on the page. */
  h1: string;
  /** Lead paragraph, under the h1 and above the first question H2. */
  intro: string;
  sections: SolutionSection[];
  faq: SolutionFaq[];
  /**
   * Primary prefill — the trade path leads with the part number
   * (`_CONVENTIONS.md` §7). **The trailing colon is deliberate**: it invites the
   * integrator to paste their list straight after it. Encoded once by
   * `whatsappHref()`; never hand-encoded here.
   */
  whatsappPrefill: string;
  /** Second prefill, for the account-opening block. */
  accountPrefill: string;
  /**
   * The section whose CTA is rendered inline rather than at the foot of the
   * page. `_CONVENTIONS.md` §7 puts a CTA inside the part-number block because
   * it is the highest-conversion block on the page for T2 intent.
   */
  partNumberSectionId: string;
};

export const TRADE: TradeContent = {
  h1: 'Trade supply for AV and automation integrators — Dubai',
  intro:
    'This page is written for the other side of the counter: part numbers, quantities and a ' +
    'delivery address, rather than rooms and moodboards. It covers what a trade account gets, how ' +
    'to ask for availability, and what Leading IT does during commissioning.',
  sections: [
    {
      id: 'does-leading-it-supply-trade-accounts',
      question: 'Does Leading IT supply trade accounts?',
      answer:
        'Leading IT supplies AV and automation trade accounts across the United Arab Emirates from ' +
        'Dubai, and supplies integrators in Pakistan.',
      body: [
        'A trade enquiry is answered in the integrator’s own terms. Part numbers and quantities go ' +
          'in; a quotation and an availability position come back. No room-by-room brief is needed ' +
          'to start one.',
        'The team that quotes the parts is the team that answers the commissioning question three ' +
          'months later. That matters more than it sounds: a question about a matrix, a processor ' +
          'or a dimming module does not have to be escalated to a second company.',
        'Leading IT also sells direct to end clients, and the rest of this site is that half of the ' +
          'business. An integrator would rather know it here than discover it on a project.',
      ],
    },
    {
      id: 'how-to-open-a-trade-account',
      question: 'How do I open a trade account with Leading IT?',
      answer:
        'A trade account with Leading IT starts from one message: the company, the project and the ' +
        'part numbers. Send those and the account is set up around the first quotation.',
      body: [
        // Framed as "what to include", never as a requirements list — nothing
        // sources what Leading IT actually asks for. See the file header.
        'The table below is what makes a first enquiry answerable in one reply rather than three. ' +
          'Anything further the account needs is confirmed in that reply.',
        'It is not published on this page on purpose. A requirement list nobody maintains goes ' +
          'stale, and a stale one costs an application rather than saving one.',
      ],
      table: {
        caption: 'What to include in a first trade enquiry',
        columns: ['Send', 'What it is', 'Why it changes the reply'],
        rows: [
          [
            { text: 'Company and trade activity' },
            { text: 'The business name, and whether it installs, specifies or fits out' },
            { text: 'Decides which lines and which support are relevant' },
          ],
          [
            { text: 'The project' },
            { text: 'What is being built, where, and at what stage' },
            { text: 'Lets the reply answer the scope rather than a parts list' },
          ],
          [
            { text: 'Part numbers and quantities' },
            { text: 'The manufacturer’s designation, exactly as printed' },
            { text: 'Removes the round trip a guessed model always causes' },
          ],
          [
            { text: 'Where it has to reach' },
            { text: 'The emirate, or the country for a Pakistan project' },
            { text: 'Keeps the answer specific to how the goods are supplied' },
          ],
        ],
      },
    },
    {
      id: 'which-brands-through-leading-it',
      question: 'Which brands can I buy through Leading IT?',
      answer:
        'Leading IT supplies nine manufacturers to the trade from Dubai: Crestron, Blustream, ' +
        'Basalte, Black Nova, Marantz, Denon, Polk Audio, UandKSound and JVC.',
      body: [
        'Crestron and Blustream sit at the trade end of that list. Control processors, DIN-rail ' +
          'dimming and switching, HDBaseT matrices and AV-over-IP endpoints are specified by an ' +
          'integrator rather than chosen by a homeowner.',
        'Blustream’s catalogue here is organised as ranges rather than as single units, because ' +
          'that is how the manufacturer sells it. Dante, Video over IP and Wireless / BYOD each ' +
          'have their own page with the published range detail.',
        'The remaining seven are Basalte, Black Nova, Marantz, Denon, Polk Audio, UandKSound and ' +
          'JVC. They are specified into the same projects, but they reach the client through the ' +
          'room rather than through the rack. Every one has a hub page here with its full range.',
      ],
      table: {
        caption: 'The trade end of the catalogue',
        columns: ['Line', 'What it covers', 'Where to look'],
        rows: [
          [
            { text: 'Crestron' },
            {
              text: 'Control processors, DIN-rail dimming and switching, keypads, touch screens and Avia DSP',
            },
            { text: 'Crestron', to: '/brands/crestron' },
          ],
          [
            { text: 'Blustream Dante' },
            {
              text: 'Dante encoders, decoders, the DA1414 matrix and networked power amplifiers over 1Gb infrastructure',
            },
            { text: 'Blustream Dante', to: '/brands/blustream/dante' },
          ],
          [
            { text: 'Blustream Video over IP' },
            {
              text: 'SDVoE transceivers, 1Gb 4K systems with Dante, and HD endpoints for matrix, video wall and KVM',
            },
            { text: 'Blustream Video over IP', to: '/brands/blustream/video-over-ip' },
          ],
          [
            { text: 'Blustream Wireless / BYOD' },
            {
              text: 'Wireless presentation switches and dongles for AirPlay, Chromecast, Miracast, HDMI and USB-C',
            },
            { text: 'Blustream Wireless / BYOD', to: '/brands/blustream/wireless-byod' },
          ],
          [
            { text: 'Blustream HDMI and HDBaseT' },
            {
              text: 'Matrices, extenders and the Precision 48 active 8K cable, listed on the brand hub',
            },
            { text: 'Blustream', to: '/brands/blustream' },
          ],
        ],
      },
    },
    {
      id: 'stock-and-lead-time',
      question: 'How do I check stock and lead time on a part number?',
      answer:
        'Leading IT confirms availability and lead time per part number on enquiry. Send the ' +
        'manufacturer’s part number and the quantity, and the reply answers both.',
      body: [
        // The honest T2 floor. No figure, no position, no implication — see the
        // file header and `docs/OPEN-QUESTIONS.md` #3/T2.
        'Neither figure is published on this page, deliberately. Availability and lead time move ' +
          'per part number, per quantity and per order, so a number printed here would be wrong ' +
          'more often than right.',
        'There is no stock-lookup box on this page either. No inventory feed exists behind one, and ' +
          'a search field that returns nothing is worse than a clear instruction.',
        'A list pastes fine. Send the whole schedule in one message rather than a part at a time — ' +
          'the WhatsApp message below ends in a colon for exactly that reason.',
      ],
    },
    {
      id: 'programming-and-commissioning',
      question: 'Does Leading IT provide programming and commissioning support?',
      answer:
        'Leading IT provides Crestron programming and commissioning support on the systems it ' +
        'supplies, from Dubai, and commissions KNX and DALI installations.',
      body: [
        'Scope is agreed per project rather than assumed. Remote work covers configuration, program ' +
          'loading and fault-finding over a connection the integrator provides. On-site work covers ' +
          'commissioning visits and the parts of a system that can only be proved in the room.',
        'Where the installing contractor’s responsibility ends is settled before the work starts. ' +
          'Cabling, terminations, board space, power and network are theirs, and all five have to ' +
          'be complete before a commissioning visit is worth booking.',
        // The boundary the brief did not draw. See the file header.
        'Support here means support on equipment Leading IT supplies. Taking over the programming ' +
          'of a system supplied elsewhere is discussed case by case rather than promised in advance.',
        'No response-time or dispatch commitment is published on this page. Anything of that kind ' +
          'belongs in a contract rather than on a web page.',
      ],
    },
    {
      id: 'pakistan-projects',
      question: 'Can Leading IT support an integrator’s project in Pakistan?',
      answer:
        'Leading IT supplies integrators in Pakistan from its Dubai base, and supports commissioning ' +
        'remotely or by a visit.',
      body: [
        'Goods are supplied from Dubai. Commissioning support is given remotely or by a visit, and ' +
          'warranty claims are routed through the same team that supplied the goods.',
        'There is no office there, no local address and no second phone number. The relationship is ' +
          'supply and support, stated as exactly that.',
      ],
    },
  ],
  faq: [
    {
      question: 'Who can open a trade account with Leading IT?',
      answer:
        'Trade supply is for businesses that install, specify or fit out AV and automation systems ' +
        '— integrators, electrical contractors and a fit-out contractor’s AV team. No turnover ' +
        'threshold or minimum order is published here, because none is stated on this site. ' +
        'Leading IT confirms what an account needs when it replies.',
    },
    {
      question: 'Can I get a trade quotation without an account?',
      answer:
        'Send the part numbers and the quantities, and a quotation comes back. Account arrangements ' +
        'are settled alongside that rather than before it. No pricing of any kind appears on this ' +
        'site — every figure is quoted against a specific part number, quantity and project.',
    },
    {
      question: 'Does Leading IT publish stock levels or lead times?',
      answer:
        'No, and deliberately. Both move per part number, per quantity and per order, so a figure ' +
        'printed on a page would be wrong more often than right. Send the part number and the ' +
        'quantity, and both are confirmed in the reply.',
    },
    {
      question: 'Does Leading IT sell direct to end clients as well?',
      answer:
        'Yes. Leading IT designs, supplies and installs for homeowners, developers and hotels ' +
        'alongside its trade supply, and the rest of this site is that half of the business. An ' +
        'integrator would rather read it here than find out on a project.',
    },
    {
      question: 'Can Leading IT ship to an integrator in Pakistan?',
      answer:
        'Yes, on a supply basis. Goods are supplied from Dubai, commissioning support is given ' +
        'remotely or by a visit, and warranty claims are routed through the team that supplied ' +
        'them. There is no office there and no local address.',
    },
  ],
  whatsappPrefill:
    "Hi Leading IT — I'm an integrator and need availability and a trade quote. Part numbers:",
  accountPrefill: "Hi Leading IT — I'd like to open a trade account.",
  partNumberSectionId: 'stock-and-lead-time',
};
