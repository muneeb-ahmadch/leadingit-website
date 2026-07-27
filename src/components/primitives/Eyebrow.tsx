import { type ReactNode } from 'react';

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="block h-px w-8 bg-gold/60" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}
