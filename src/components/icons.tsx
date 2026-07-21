import type { CSSProperties } from 'react'
import { tint } from '../lib/ui'

/** Right chevron (list rows). */
export const Chevron = ({ opacity = 35, style }: { opacity?: number; style?: CSSProperties }) => (
  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0, ...style }}>
    <path d="M1 1l5 5-5 5" style={{ stroke: tint(opacity) }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Back chevron (round buttons). */
export const BackChevron = () => (
  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
    <path d="M7 1L1.5 7L7 13" style={{ stroke: tint(70) }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Check mark; color is any CSS color. */
export const Check = ({ w = 16, h = 13, color, strokeWidth = 2.4 }: { w?: number; h?: number; color: string; strokeWidth?: number }) => (
  <svg width={w} height={h} viewBox="0 0 15 12" fill="none" style={{ flexShrink: 0 }}>
    <path d="M1.5 6l4 4L13.5 1.5" style={{ stroke: color }} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Double-arrow swap (replace / do-now / postpone). */
export const Swap = ({ w = 12, h = 11 }: { w?: number; h?: number }) => (
  <svg width={w} height={h} viewBox="0 0 16 14" fill="none">
    <path d="M1 4h11M12 4L8.8 1M12 4L8.8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 10H4M4 10l3.2-3M4 10l3.2 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Vertical ⋮ dots. */
export const Dots = () => (
  <svg width="4" height="16" viewBox="0 0 4 16">
    <circle cx="2" cy="2" r="1.7" style={{ fill: tint(65) }} />
    <circle cx="2" cy="8" r="1.7" style={{ fill: tint(65) }} />
    <circle cx="2" cy="14" r="1.7" style={{ fill: tint(65) }} />
  </svg>
)

/** Bolt (Train). */
export const Bolt = ({ size = 22, color }: { size?: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M11 1.5L4 11h4.4L8 18.5 16 8.5h-4.6L11 1.5z" style={{ fill: color }} />
  </svg>
)

/** Pencil (edit sets/reps). */
export const Pencil = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M9.9 1.8l2.3 2.3L4.6 11.7l-3 0.7 0.7-3L9.9 1.8z" style={{ stroke: tint(60) }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Trash (delete exercise). */
export const Trash = () => (
  <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
    <path d="M1 3.5h12M5 3.5V1.5h4v2M2.5 3.5l1 10h7l1-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Play triangle. */
export const Play = ({ color }: { color: string }) => (
  <svg width="12" height="14" viewBox="0 0 12 14">
    <path d="M1 1.5v11L11 7 1 1.5z" style={{ fill: color }} />
  </svg>
)
