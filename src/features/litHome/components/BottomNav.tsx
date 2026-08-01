import { useTranslation } from 'react-i18next';
import { Home, LayoutGrid, MoreHorizontal } from 'lucide-react';
import type { LitAction, View } from '../state';

type Props = { view: View; dispatch: (a: LitAction) => void; compact: boolean };

export function BottomNav({ view, dispatch, compact }: Props) {
  const { t } = useTranslation();
  const items: { id: View | 'more'; icon: typeof Home; label: string }[] = [
    { id: 'showroom', icon: Home, label: t('litHome.navHome') },
    { id: 'suite', icon: LayoutGrid, label: t('litHome.navRooms') },
    { id: 'more', icon: MoreHorizontal, label: t('litHome.navMore') },
  ];
  return (
    <nav
      className={`shrink-0 border-t border-white/[0.06] bg-ink-900/95 backdrop-blur-sm
        flex items-center justify-around ${compact ? 'h-11' : 'h-14'}`}
    >
      {items.map(({ id, icon: Icon, label }) => {
        const active = id !== 'more' && view === id;
        return (
          <button
            key={id}
            onClick={() => {
              if (id === 'more') return;
              dispatch({ type: 'set_view', view: id as View });
            }}
            // The visible <span> label only renders for the active item (by
            // design), which left the other two buttons icon-only with NO
            // accessible name at all — a hard SC 4.1.2 failure, not a colour
            // one. `aria-label` carries the name unconditionally.
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-2 px-4 py-1.5 transition-colors
              ${active ? 'text-gold' : 'text-bone-500 hover:text-bone-100'}`}
          >
            <Icon size={compact ? 16 : 18} strokeWidth={1.5} aria-hidden="true" />
            {active && (
              <span aria-hidden="true" className="text-[10px] uppercase tracking-luxe">{label}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
