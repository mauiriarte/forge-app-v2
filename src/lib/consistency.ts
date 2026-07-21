import { dateKey } from './dates'
import type { AppState } from './types'
import type { Store } from '../store/store'

/** Complete-weeks + hydration-streak counters (Stats tiles & calendar sheet). */
export function computeConsistency(store: Store, s: AppState): { weeks: number; streak: number } {
  const log = store.getLog()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const hydTodayMet = s.water >= s.waterGoal

  let streak = hydTodayMet ? 1 : 0
  for (let i = 1; i <= 200; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const f = log[dateKey(d)]
    if (f && f.h) streak += 1
    else break
  }

  const monday = new Date(today); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  let weeks = 0
  for (let w = 1; w <= 16; w++) {
    const start = new Date(monday); start.setDate(start.getDate() - 7 * w)
    let n = 0, have = true
    for (let j = 0; j < 7; j++) {
      const d = new Date(start); d.setDate(d.getDate() + j)
      const f = log[dateKey(d)]
      if (!f) { have = false; break }
      if (f.t) n += 1
    }
    if (!have) break
    if (n >= s.weeklyGoal) weeks += 1
  }
  return { weeks, streak }
}
