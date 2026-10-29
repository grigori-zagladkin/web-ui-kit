import type { CSSProperties, ReactNode } from 'react';

/** Вспомогательная раскладка для историй — в кит не входит. */
export function Row({ children, gap = 12, align = 'center', wrap = true }: { children: ReactNode; gap?: number; align?: CSSProperties['alignItems']; wrap?: boolean }) {
  return <div style={{ display: 'flex', alignItems: align, gap, flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</div>;
}

export function Stack({ children, gap = 16, width }: { children: ReactNode; gap?: number; width?: CSSProperties['width'] }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, width }}>{children}</div>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h4 style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--ui-fg-muted)' }}>{title}</h4>
      {children}
    </section>
  );
}
