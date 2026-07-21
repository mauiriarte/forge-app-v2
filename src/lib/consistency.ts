import { dateKey } from './dates'
import type { AppState, DayFlags } from './types'

/** dayLog with today's live values overlaid. */
export function liveLog(s: AppState): Record<string, DayFlags> {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return { ...s.dayLog, [dateKey(today)]: { t: s.trainedToday, h: s.water >= s.waterGoal } }
}

/**
 * Real consistency counters from tracked days only (no fabricated history):
 * complete weeks = past weeks with ≥ weeklyGoal trained days; streak =
 * consecutive days (ending today) with the hydration goal met.
 */
export function computeConsistency(s: AppState): { weeks: number; streak: number } {
  const log = liveLog(s)
  const today = new Date(); today.setHours(0, 0, 0, 0)

  let streak = log[dateKey(today)]?.h ? 1 : 0
  for (let i = 1; i <= 400; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    if (log[dateKey(d)]?.h) streak += 1
    else break
  }

  const monday = new Date(today); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  let weeks = 0
  for (let w = 1; w <= 16; w++) {
    const start = new Date(monday); start.setDate(start.getDate() - 7 * w)
    let n = 0
    for (let j = 0; j < 7; j++) {
      const d = new Date(start); d.setDate(d.getDate() + j)
      if (log[dateKey(d)]?.t) n += 1
    }
    if (n >= s.weeklyGoal) weeks += 1
  }
  return { weeks, streak }
}
