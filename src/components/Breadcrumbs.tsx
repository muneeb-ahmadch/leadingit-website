import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Crumb } from '@/seo/breadcrumbs';
import { href } from '@/seo/paths';

/**
 * The visible breadcrumb trail.
 *
 * It renders the **same `Crumb[]` array** the page hands to
 * `buildBreadcrumbList()` (`src/seo/jsonld/breadcrumbList.ts`). That sharing is
 * the whole mechanism: Google requires the visible trail and the
 * `BreadcrumbList` markup to agree, and two arrays built from the same data by
 * two different pieces of code eventually disagree. One array, two consumers.
 *
 * Each `Crumb.path` is in the internal, slashless form, so the anchors are
 * rendered through `href()` — the same trailing-slash rule `pageUrl()` applies
 * to the JSON-LD `item` URLs. Without it the visible trail links one URL and the
 * `BreadcrumbList` claims another, and every crumb click costs a 301.
 *
 * Contract, from `src/seo/breadcrumbs.ts`:
 * - the **last crumb is the current page** and renders as plain text, never a
 *   link — a breadcrumb must not link to the page the visitor is already on
 *   (the JSON-LD still carries a self-referencing `item` URL for it, which is
 *   Google's documented pattern);
 * - **home (`/`) has no breadcrumb at all**, so a single-entry array renders
 *   nothing rather than a one-item trail. `buildBreadcrumbList()` refuses the
 *   same case by returning `null`, keeping UI and schema symmetric.
 *
 * Accessibility: a labelled `<nav>` around an ordered list, `aria-current="page"`
 * on the final entry, and `aria-hidden` separators so a screen reader announces
 * the trail rather than a run of middots.
 */
export function Breadcrumbs({ crumbs, className = '' }: { crumbs: Crumb[]; className?: string }) {
  const { t } = useTranslation();

  if (crumbs.length < 2) return null;

  return (
    <nav aria-label={t('breadcrumbs.ariaLabel')} className={className}>
      <ol className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-luxe text-bone-500">
        {crumbs.map((crumb, i) => {
          const isCurrent = i === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true">·</span>}
              {isCurrent ? (
                <span aria-current="page" className="text-bone-300">
                  {crumb.name}
                </span>
              ) : (
                <Link to={href(crumb.path)} className="hover:text-gold transition-colors">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
