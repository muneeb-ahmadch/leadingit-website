import { Link } from 'react-router-dom';
import { Eyebrow } from '@/components/primitives/Eyebrow';

/**
 * One destination in a hub-and-spoke cross-link block.
 *
 * `label` is the anchor text and must describe the destination on its own — a
 * crawler and a screen-reader user both read the anchor out of context, so
 * "Marantz Cinema 30" is a link and "click here" / "read more" is not. `hint` is
 * secondary context (a collection, a tagline); it is *not* part of the anchor,
 * so it never dilutes it.
 */
export type InternalLink = {
  /** Site-relative router path, no trailing slash — same convention as `Crumb.path`. */
  to: string;
  label: string;
  hint?: string;
};

/**
 * Reusable brands ↔ products ↔ solutions cross-linking block.
 *
 * Why a component rather than ad-hoc markup per template: internal links are the
 * mechanism that distributes authority from the hubs (`/brands/`, a brand page)
 * to the spokes (product pages) and back, and they only work if they are real
 * `<a href>` elements *in the prerendered HTML*. Everything here renders through
 * react-router's `<Link>`, which emits a plain anchor server-side and keeps
 * client-side navigation after hydration — no JS-only handlers, nothing that
 * appears only after an effect runs.
 *
 * Visual language is deliberately minimal: the A-vs-B design decision is still
 * open (`docs/02-DESIGN-SOURCE-OF-TRUTH.md`), so this composes only the existing
 * `Eyebrow` primitive and the Tailwind tokens already in use across
 * `src/pages/*` (`border-white/5`, `text-bone-*`, `hover:text-gold`,
 * `tracking-luxe`). No new visual idiom is introduced here.
 */
export function InternalLinks({
  title,
  links,
  className = '',
}: {
  /** Section heading, also the accessible name of the nav landmark. */
  title: string;
  links: InternalLink[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <nav aria-label={title} className={className}>
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
        {links.map((link) => (
          <li key={link.to} className="border-b border-white/5">
            <Link
              to={link.to}
              className="group flex flex-col gap-1 py-4 text-bone-300 hover:text-gold transition-colors duration-500"
            >
              <span className="font-serif text-xl">{link.label}</span>
              {link.hint && <span className="text-sm text-bone-500">{link.hint}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
