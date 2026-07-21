import type { AppState } from './types'

/** Display name for the signed-in person: profile name, else email prefix. */
export function displayName(s: AppState): string {
  if (s.profileName.trim()) return s.profileName.trim()
  const prefix = (s.obEmail || '').split('@')[0]
  if (prefix) return prefix.charAt(0).toUpperCase() + prefix.slice(1)
  return ''
}

export function displayInitials(s: AppState): string {
  const name = displayName(s)
  if (!name) return 'F'
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
