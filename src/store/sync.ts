import { supabase } from '../lib/supabase'
import { todayKey } from '../lib/dates'
import type { AppState, DayFlags, Measurement, Routine, SessionRecord } from '../lib/types'

// Cloud sync is coarse by design: the whole (tiny) dataset is pulled on sign-in
// and pushed debounced on change. localStorage remains the offline cache, so the
// PWA keeps working with no connection; the next push reconciles the cloud copy.

export interface CloudPatch {
  routines: Routine[]
  measurements: Measurement[]
  sessions: SessionRecord[]
  dayLog: Record<string, DayFlags>
  profileName: string
  weeklyGoal: number
  waterSize: number
  waterGoal: number
  obH: string
  water: number
  trainedToday: boolean
}

/** Load everything for the signed-in user. Returns null if the account has no data yet. */
export async function pullAll(userId: string): Promise<Partial<CloudPatch> | null> {
  if (!supabase) return null
  const [profileQ, routinesQ, exsQ, measQ, sessionsQ, daysQ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('routines').select('*').eq('user_id', userId).order('position'),
    supabase.from('routine_exercises').select('*').eq('user_id', userId).order('position'),
    supabase.from('measurements').select('*').eq('user_id', userId).order('t'),
    supabase.from('workout_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(8),
    supabase.from('daily_logs').select('*').eq('user_id', userId),
  ])
  const profile = profileQ.data
  if (!profile) return null

  const exsByRoutine: Record<string, Routine['exs']> = {}
  for (const e of exsQ.data || []) {
    ;(exsByRoutine[e.routine_id] ||= []).push({
      uid: e.uid,
      lib: e.lib,
      sets: e.sets,
      reps: e.reps,
      lastW: e.last_w == null ? null : Number(e.last_w),
      hist: (e.hist || []).map(Number),
    })
  }
  const routines: Routine[] = (routinesQ.data || []).map(r => ({
    id: r.id, name: r.name, mus: r.mus, focus: r.focus, days: r.days || [], exs: exsByRoutine[r.id] || [],
  }))
  const measurements: Measurement[] = (measQ.data || []).map(m => ({
    k: m.k, v: Number(m.v), t: new Date(m.t).getTime(),
  }))
  const sessions: SessionRecord[] = (sessionsQ.data || []).map(s => ({
    dNum: s.d_num, dMon: s.d_mon, name: s.name, mins: s.mins, sets: s.sets, pr: s.pr, rid: s.rid,
  }))
  const dayLog: Record<string, DayFlags> = {}
  for (const d of daysQ.data || []) dayLog[d.day] = { t: !!d.trained, h: !!d.water_goal_met }

  const today = dayLog[todayKey()]
  return {
    routines,
    measurements,
    sessions,
    dayLog,
    profileName: profile.name || '',
    weeklyGoal: profile.weekly_goal,
    waterSize: profile.water_size,
    waterGoal: profile.water_goal,
    obH: profile.height_cm == null ? '' : String(profile.height_cm),
    water: (daysQ.data || []).find(d => d.day === todayKey())?.water ?? 0,
    trainedToday: today?.t ?? false,
  }
}

/** Replace the user's cloud copy with the current local state. */
export async function pushAll(userId: string, s: AppState): Promise<void> {
  if (!supabase) return
  await supabase.from('profiles').upsert({
    user_id: userId,
    name: s.profileName,
    height_cm: parseFloat(s.obH) > 0 ? parseFloat(s.obH) : null,
    weekly_goal: s.weeklyGoal,
    water_size: s.waterSize,
    water_goal: s.waterGoal,
    theme: s.themeSel,
    updated_at: new Date().toISOString(),
  })

  // routines + exercises: replace-all (cascade removes exercises)
  await supabase.from('routines').delete().eq('user_id', userId)
  if (s.routines.length) {
    await supabase.from('routines').insert(s.routines.map((r, i) => ({
      id: r.id, user_id: userId, name: r.name, mus: r.mus, focus: r.focus, days: r.days, position: i,
    })))
    const exRows = s.routines.flatMap(r => r.exs.map((e, i) => ({
      uid: e.uid, user_id: userId, routine_id: r.id, lib: e.lib,
      sets: e.sets, reps: e.reps, last_w: e.lastW, hist: e.hist, position: i,
    })))
    if (exRows.length) await supabase.from('routine_exercises').insert(exRows)
  }

  await supabase.from('measurements').delete().eq('user_id', userId)
  if (s.measurements.length) {
    await supabase.from('measurements').insert(s.measurements.map(m => ({
      user_id: userId, k: m.k, v: m.v, t: new Date(m.t).toISOString(),
    })))
  }

  await supabase.from('workout_sessions').delete().eq('user_id', userId)
  if (s.sessions.length) {
    // insert oldest-first so created_at ordering matches the list order
    await supabase.from('workout_sessions').insert(s.sessions.slice().reverse().map(h => ({
      user_id: userId, d_num: h.dNum, d_mon: h.dMon, name: h.name, mins: h.mins, sets: h.sets, pr: h.pr, rid: h.rid ?? null,
    })))
  }

  const days = Object.entries({ ...s.dayLog, [todayKey()]: { t: s.trainedToday, h: s.water >= s.waterGoal } })
  await supabase.from('daily_logs').upsert(days.map(([day, f]) => ({
    user_id: userId, day, water: day === todayKey() ? s.water : 0, trained: f.t, water_goal_met: f.h,
  })))
}
