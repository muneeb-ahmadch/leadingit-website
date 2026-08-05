/**
 * `/locations/dubai/` — the copy for the one location page this site will ever
 * have.
 *
 * Same shape as `src/data/solutions.ts`: a plain typed record carrying the real
 * prose, rendered by a template that decides nothing about content. The section
 * and FAQ types are imported from the solutions module rather than redeclared,
 * because `src/components/AnswerBlocks.tsx` renders exactly those shapes — one
 * renderer, one contract, and a second near-identical type would drift.
 *
 * ## The NAP was confirmed 2026-08-05 — one source feeds every mention
 *
 * Muneeb answered `docs/OPEN-QUESTIONS.md` #1/#8: the tower is the **Business
 * Bay** International Business Tower, and the showroom is **by appointment
 * only**. The canonical strings live in `src/data/nap.ts` (`NAP_ADDRESS_LINE`,
 * `SHOWROOM_VISIT_POLICY`) and are composed into the copy below — never
 * retyped — so the footer, the contact page, this page and the `LocalBusiness`
 * JSON-LD (now emitted sitewide by `<Seo>`) stay character-identical.
 *
 * Still absent, not hedged, because still unsupplied: the PO Box, the street
 * line, and day/time opening hours (there are none — the policy is
 * appointment-only, so no `openingHours` is emitted in schema and no invented
 * times appear in copy).
 *
 * ## What the brief asked for and is not here
 *
 * `docs/10-CONTENT-BRIEFS/locations-dubai.md` outline item 2 describes what a
 * visitor can see **in the showroom** — keypad finishes in the hand, a Crestron
 * interface running, loudspeakers playing in a room. **Nothing sources the
 * contents of that room.** `docs/00-CONTEXT.md` §4 confirms the showroom exists
 * and nothing else about it, and the brief's own FAQ 4 says not to describe a
 * demonstration room that has not been confirmed. That block is therefore
 * replaced by what *is* first-party and verifiable: the keypad designer, the
 * LIT Home demonstration and the catalogue, all published on this site, all
 * genuinely useful before someone travels. Logged for the content-strategist in
 * `docs/12-PROVENANCE/phase4-solutions-build.md`.
 *
 * ## Karachi
 *
 * Not a word, in any form. No Pakistani city appears on this page, in copy, in
 * an anchor or in schema. Pakistan is country-level supply intent in exactly two
 * places below (`docs/05-URL-TAXONOMY.md` §5a).
 */
import type { SolutionFaq, SolutionSection } from '@/data/solutions';
import { NAP_ADDRESS_LINE, SHOWROOM_VISIT_POLICY } from '@/data/nap';

export type LocationContent = {
  /** The one `<h1>` on the page. */
  h1: string;
  /** Lead paragraph, under the h1 and above the first question H2. */
  intro: string;
  sections: SolutionSection[];
  faq: SolutionFaq[];
  /** Plain-text WhatsApp prefill for the first-viewport and FAQ CTAs. */
  whatsappPrefill: string;
  /**
   * Second prefill, used once, beneath the areas-served block. A visit enquiry
   * and a project enquiry are different messages, and the brief specifies both
   * (`_CONVENTIONS.md` §7 — one sentence, first person, names the subject).
   */
  projectPrefill: string;
};

export const DUBAI_LOCATION: LocationContent = {
  h1: 'Leading IT in Dubai — automation showroom and enquiries',
  intro:
    'Leading IT works from one place: a showroom in Dubai, United Arab Emirates. This page covers ' +
    'where that is, what the team supplies and installs from it, how far it travels, and what to ' +
    'send before a visit.',
  sections: [
    {
      id: 'where-is-leading-it-in-dubai',
      question: 'Where is Leading IT based in Dubai?',
      answer:
        `Leading IT operates a showroom at ${NAP_ADDRESS_LINE}. ` +
        'It is the only Leading IT premises.',
      body: [
        // Address and visit policy render from `src/data/nap.ts` — the one
        // source — never retyped here (see the file header).
        `Visits are ${SHOWROOM_VISIT_POLICY.toLowerCase()}. Send a message on either channel ` +
          'below to arrange one, and the team confirms a time and directions in the reply.',
        'There is no second office. Work in the other Emirates, and supply into Pakistan, is ' +
          'delivered from Dubai rather than from a local branch. This site therefore has no page ' +
          'claiming one.',
      ],
    },
    {
      id: 'what-leading-it-supplies-from-dubai',
      question: 'What does Leading IT supply and install from Dubai?',
      answer:
        'Leading IT designs, supplies and installs home cinema, whole-home control, lighting ' +
        'control, multi-room audio and hospitality automation in Dubai, United Arab Emirates.',
      body: [
        'Nine manufacturers sit behind that work. Crestron, Basalte, Black Nova and Blustream cover ' +
          'control, keypads and signal distribution; Marantz, Denon, Polk Audio and UandKSound cover ' +
          'audio; JVC covers projection. Each has a hub page here carrying its full range.',
        'LIT Home, the control interface Leading IT builds itself, runs alongside them. It is ' +
          'demonstrated in full on this site rather than described.',
        'Security systems are supplied on the same basis. They are specified per project rather ' +
          'than from a catalogue page, so the route to them is the two channels below.',
        'Integrators have their own path. Trade supply runs on part numbers and quantities rather ' +
          'than on rooms, and it has a separate page.',
      ],
    },
    {
      id: 'which-areas-does-leading-it-cover',
      question: 'Which areas does Leading IT cover from Dubai?',
      answer:
        'Leading IT covers Dubai and works across the United Arab Emirates from its Dubai base, ' +
        'including Abu Dhabi and Sharjah. Projects in Pakistan are supplied from the same place.',
      body: [
        // Emirates named in body copy only — never as their own URL
        // (`docs/04-KEYWORD-MAP.md` §10.2, `docs/05-URL-TAXONOMY.md` §5a).
        'There is no separate office, phone number or address for the other Emirates. Engineers ' +
          'travel to site from Dubai, which is how a villa in Abu Dhabi and an apartment in Dubai ' +
          'are served by one team.',
        'Pakistan is a supply relationship rather than a premises. Equipment ships from Dubai, ' +
          'commissioning support is given remotely or by a visit, and warranty claims are routed ' +
          'through the same team that supplied the goods.',
      ],
    },
    {
      id: 'what-to-see-before-visiting',
      question: 'What can I see online before travelling to the showroom?',
      answer:
        'Leading IT publishes its full catalogue, a Black Nova keypad designer and a live LIT Home ' +
        'demonstration on this site. Most of the choosing can happen before anyone travels to Dubai.',
      body: [
        'The keypad designer is the most useful of the three beforehand. It builds a Black Nova ' +
          'keypad the way it will sit on the wall: collection, layout, finish, engraving and ' +
          'backlight. The result is a design link the team can quote from.',
        'The LIT Home demonstration runs the interface itself: rooms, lighting, climate, audio and ' +
          'cinema, on the page, with nothing to install.',
        'The catalogue carries every model Leading IT supplies, with the manufacturer’s published ' +
          'specifications on each page. A specifier can arrive with the model numbers already ' +
          'decided.',
      ],
      table: {
        caption: 'What to look at before a showroom visit',
        columns: ['If you want to…', 'Open', 'What it gives you'],
        rows: [
          [
            { text: 'Choose a keypad finish and layout' },
            { text: 'Black Nova keypad designer', to: '/brands/black-nova/keypad-designer' },
            { text: 'A saved design link the team can quote from' },
          ],
          [
            { text: 'See a control interface running' },
            { text: 'LIT Home demonstration', to: '/lit-home' },
            { text: 'The live interface, room by room' },
          ],
          [
            { text: 'Compare models and specifications' },
            { text: 'The brand catalogue', to: '/brands' },
            { text: 'Nine manufacturers, with published specifications' },
          ],
          [
            { text: 'Work out which system the project needs' },
            { text: 'The solutions index', to: '/solutions' },
            { text: 'Five categories, each with its own page' },
          ],
        ],
      },
    },
    {
      id: 'what-to-bring-to-a-visit',
      question: 'What should I bring to a showroom visit?',
      answer:
        'Leading IT can be specific about a Dubai project as soon as it has the drawings. Bring or ' +
        'send a floor plan, the room dimensions, and a note of which rooms matter.',
      body: [
        'A lighting layout is the next most useful document. Lighting control is decided from a ' +
          'circuit schedule rather than from a room count, so the electrical drawings answer more ' +
          'questions than a wish list does.',
        'The stage of the build changes the answer more than the equipment list does. A villa at ' +
          'first fix and a finished apartment are two different conversations, so say which one it is.',
        'For a cinema room, bring the ceiling height and the distance from the front seat to the ' +
          'screen wall. Those two numbers decide the screen size and the channel layout before any ' +
          'model is chosen.',
      ],
    },
    {
      id: 'how-to-reach-leading-it',
      question: 'How do I get in touch with Leading IT in Dubai?',
      answer:
        'Leading IT can be reached on WhatsApp at +971 58 586 5222 or by email at ' +
        'services@leadingit.me. Both reach the same team in Dubai.',
      body: [
        'The enquiry form on this site sends to that same address, so nothing is lost by choosing ' +
          'one channel over another. A message naming the area, the rooms and the stage of the build ' +
          'gets a specific reply rather than a brochure.',
      ],
    },
  ],
  faq: [
    {
      question: 'Is the Leading IT showroom open by appointment only?',
      answer:
        'Yes. The Dubai showroom at Shop 6, International Business Tower, Business Bay receives ' +
        'visitors by appointment only. Message +971 58 586 5222 on WhatsApp or email ' +
        'services@leadingit.me and the team confirms a time and sends directions.',
    },
    {
      question: 'Does Leading IT cover Abu Dhabi and Sharjah?',
      answer:
        'Yes, from Dubai. Leading IT works across the United Arab Emirates from its Dubai showroom ' +
        'and engineers travel to site. There is no Abu Dhabi or Sharjah office, no separate number ' +
        'and no local address, so this site has no page claiming one.',
    },
    {
      question: 'Does Leading IT have more than one showroom?',
      answer:
        'No. Dubai is the only Leading IT premises: one showroom, one team, one number. Everything ' +
        'supplied across the Emirates, and everything supplied into Pakistan, is delivered from there.',
    },
    {
      question: 'Does Leading IT work outside the United Arab Emirates?',
      answer:
        'Yes, on a supply basis. Equipment is supplied to projects in Pakistan from Dubai, and ' +
        'commissioning support is given remotely or by a visit. Warranty claims are routed through ' +
        'the team that supplied the goods. There is no office there and no local address.',
    },
    {
      question: 'Can I choose a keypad finish before visiting the showroom?',
      answer:
        'Yes. The Black Nova keypad designer on this site builds a keypad the way it will sit on ' +
        'the wall: collection, layout, finish, engraving and backlight. It produces a design link — ' +
        'send that, and the reply can quote the exact configuration.',
    },
    {
      question: 'What does Leading IT need in order to quote a project in Dubai?',
      answer:
        'A floor plan, the room dimensions and the stage of the build answer most of it. For ' +
        'lighting, a circuit schedule; for a cinema room, the ceiling height and the seating ' +
        'distance. Pricing is quoted per project, so drawings produce a far more useful reply than ' +
        'a model list.',
    },
  ],
  whatsappPrefill: "Hi Leading IT — I'd like to visit the Dubai showroom.",
  projectPrefill:
    "Hi Leading IT — I'm in Dubai and would like to discuss an automation project.",
};
