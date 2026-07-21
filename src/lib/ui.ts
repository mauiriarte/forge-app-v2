import type { CSSProperties } from 'react'

/** color-mix of the theme overlay base (white on dark / ink on light) at pct%. */
export const tint = (pct: number): string =>
  `color-mix(in srgb, var(--color-fg-overlay) ${pct}%, transparent)`

/** color-mix of an arbitrary color/var at pct% over transparent. */
export const mix = (color: string, pct: number): string =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`

/** Overline label (uppercase section headers). */
export const overline = (extra?: CSSProperties): CSSProperties => ({
  fontSize: 10,
  letterSpacing: 1.8,
  fontWeight: 700,
  color: tint(42),
  ...extra,
})

/** Full-screen pane base (Home, Train, Stats…). */
export const screenPane = (z: number, animation: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  overflowY: 'auto',
  padding: '76px 20px 132px',
  boxSizing: 'border-box',
  background: 'var(--color-bg)',
  zIndex: z,
  animation,
})

/** Text input style shared by sheets/onboarding. */
export const inputStyle = (surface: 's0' | 's1', pd = '13px 14px', fs = 14.5, radius = 14): CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  background: surface === 's0' ? 'var(--color-bg)' : 'var(--color-surface)',
  border: `1px solid ${tint(12)}`,
  borderRadius: radius,
  padding: pd,
  color: 'var(--color-text-primary)',
  fontSize: fs,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
})
