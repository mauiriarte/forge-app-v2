import { FG_PALS, THEMES, fgTint } from './theme'
import type { Palette, Theme } from './theme'
import { useStore } from '../store/store'
import { PALETTE } from '../config'

export interface ThemeInfo {
  C: Palette
  T: Theme
  themeKey: 'dark' | 'light'
  themeIsDark: boolean
  tintFg: (alpha: number) => string
  tintOf: (hex: string, alpha: number) => string
}

/** Resolved palette + theme colors for JS-computed styles (chips, charts…). */
export function useTheme(): ThemeInfo {
  const { state } = useStore()
  const themeSel = state.themeSel || 'dark'
  const themeKey = themeSel === 'system' ? (state.sysDark === false ? 'light' : 'dark') : (themeSel === 'light' ? 'light' : 'dark')
  const T = THEMES[themeKey]
  const C = FG_PALS[PALETTE] || FG_PALS.verdant
  return {
    C,
    T,
    themeKey,
    themeIsDark: themeKey === 'dark',
    tintFg: (alpha: number) => fgTint(T.fg, alpha),
    tintOf: fgTint,
  }
}
