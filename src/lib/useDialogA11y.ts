import { useEffect, useRef, type KeyboardEvent } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Minimal WAI-ARIA dialog behaviour for the site's non-portaled overlays
 * (LIT Home's `DetailShell` and its nested "Fan" mode popup). The codebase
 * ships no focus-trap dependency (`package.json` has none), and these
 * overlays are small enough that a manual DOM query is cheap and auditable
 * rather than pulling in a library for two call sites.
 *
 * Provides, for the element the returned `ref` is attached to:
 * - focus moves into the dialog on mount (the container itself, per the APG
 *   dialog pattern default — it should carry `role="dialog"` and an
 *   accessible name so that's what gets announced first);
 * - focus returns to whatever was focused right before mount (the trigger
 *   that opened the dialog) when it unmounts;
 * - `Escape` calls `onClose` and stops the keydown from bubbling further,
 *   so a nested dialog's Escape doesn't also close its parent;
 * - `Tab`/`Shift+Tab` cycles within the container's focusable descendants
 *   instead of escaping into the page behind it.
 */
export function useDialogA11y<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
    // Runs once per mount/unmount only — nothing inside depends on props.
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const focusables = ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return { ref, onKeyDown };
}
