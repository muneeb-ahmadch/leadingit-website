import { type ReactNode } from 'react';

type Variant = 'ipad' | 'panel';

export function DeviceFrame({
  variant,
  children,
  className = '',
}: {
  variant: Variant;
  children: ReactNode;
  className?: string;
}) {
  if (variant === 'ipad') {
    return (
      <div
        className={`relative mx-auto rounded-[2.5rem] bg-ink-950 p-3 shadow-card border border-white/10 ${className}`}
        style={{ aspectRatio: '4 / 3', maxWidth: 920 }}
      >
        {/* camera */}
        <span className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ink-800" />
        <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-ink-900">
          {children}
        </div>
      </div>
    );
  }

  // wall touch panel — thinner bezel, landscape
  return (
    <div
      className={`relative mx-auto rounded-md bg-ink-900 p-1.5 shadow-card border border-white/10 ${className}`}
      style={{ aspectRatio: '16 / 10', maxWidth: 520 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-sm bg-ink-900 ring-1 ring-gold/10">
        {children}
      </div>
      {/* mounting screws */}
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-ink-900" />
    </div>
  );
}
