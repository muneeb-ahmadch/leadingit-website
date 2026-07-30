// Barrel export — the next wave wires these into pages. Every function here
// is pure: it takes already-loaded records (or plain scalars) and returns a
// plain JSON-LD object. None of them import a `src/data/*` value; several
// import `src/data/*` *types* only (erased at compile time, never shipped to
// the browser).
export * from './types';
export * from './ids';
export * from './graph';
export * from './organization';
export * from './website';
export * from './webpage';
export * from './brand';
export * from './product';
export * from './itemList';
export * from './breadcrumbList';
export * from './webApplication';
export * from './localBusiness';
export * from './faqPage';
export * from './service';
export * from './article';
export * from './videoObject';
