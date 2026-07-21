// JS-side color access. Values mirror src/styles/tokens/colors.css exactly —
// single source is the design system tokens; never hardcode hex in components.

export interface Palette {
  a: string; aHi: string; aDeep: string; aOn: string; aTint: string
  b: string; bDeep: string; bOn: string; bLt: string; bTint: string
}

export const FG_PALS: Record<string, Palette> = {
  ember: { a: '#F04A21', aHi: '#FF7A54', aDeep: '#B23310', aOn: '#FFF7F2', aTint: '#FFDACC', b: '#2E4BE8', bDeep: '#2036AC', bOn: '#F2F4FF', bLt: '#7B8FFF', bTint: '#C9D2FF' },
  verdant: { a: '#1F8A5B', aHi: '#3FBD85', aDeep: '#14603F', aOn: '#F0FBF5', aTint: '#BFEAD6', b: '#2E86C1', bDeep: '#1F5F8C', bOn: '#F0F8FD', bLt: '#7FC2E8', bTint: '#C5E5F6' },
  oxide: { a: '#D93A2B', aHi: '#FF7261', aDeep: '#9E2418', aOn: '#FFF5F2', aTint: '#FFCFC5', b: '#1D8F87', bDeep: '#135F5A', bOn: '#EFFAF8', bLt: '#6FCEC6', bTint: '#BFEBE6' },
  bronze: { a: '#B96F15', aHi: '#E29A38', aDeep: '#83500E', aOn: '#FFF8EC', aTint: '#F2D9A8', b: '#26697D', bDeep: '#194955', bOn: '#F0F9FB', bLt: '#7FBFD1', bTint: '#C3E4ED' },
}

export interface Theme {
  s0: string; s1: string; s2: string; text: string
  p: string; pOn: string; fg: string; dim: string
}

export const THEMES: Record<'dark' | 'light', Theme> = {
  dark: { s0: '#15161A', s1: '#1E2026', s2: '#26282F', text: '#FAFAF4', p: '#FAFAF4', pOn: '#17181C', fg: '#FFFFFF', dim: '#3A3D46' },
  light: { s0: '#F1EFE8', s1: '#FFFFFF', s2: '#E9E6DC', text: '#17181C', p: '#17181C', pOn: '#FAFAF4', fg: '#17181C', dim: '#C8C5B9' },
}

/** hex → rgba at the given alpha (the prototype's fgTint). */
export const fgTint = (hex: string, al: number): string => {
  const n = parseInt(hex.slice(1), 16)
  return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + al + ')'
}
