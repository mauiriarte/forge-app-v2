import { supabase } from '../lib/supabase'
import { todayKey } from '../lib/dates'
import type { AppState, Routine, Scan, SessionRecord } from '../lib/types'

// Cloud sync is coarse by design: the whole (tiny) dataset is pulled on sign-in
// and pushed debounced on change. localStorage remains the offline cache, so the
// PWA keeps working with no connection; the next push reconciles the cloud copy.

export interface CloudPatch {
  routines: Routine[]
  scans: Scan[]
  sessions: SessionRecord[]
  weeklyGoal: number
  waterSize: number
  waterGoal: number
  streak: number
  obH: string
  water: number
  trainedToday: boolean
}

/** Load everything for the signed-in user. Returns null if the account has no data yet. */
export async function pullAll(userId: string): Promise<Partial<CloudPatch> | null> {
  if (!supabase) return null
  const [profileQ, routinesQ, exsQ, scansQ, sessionsQ, dayQ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('routines').select('*').eq('user_id', userId).order('position'),
    supabase.from('routine_exercises').select('*').eq('user_id', userId).order('position'),
    supabase.from('body_scans').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('workout_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(8),
    supabase.from('daily_logs').select('*').eq('user_id', userId).eq('day', todayKey()).maybeSingle(),
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
  const scans: Scan[] = (scansQ.data || []).map(s => ({
    d: s.label, w: Number(s.w), fat: Number(s.fat), mus: Number(s.mus),
    wat: Number(s.wat), visc: Number(s.visc), bmr: Number(s.bmr), ffm: Number(s.ffm),
  }))
  const sessions: SessionRecord[] = (sessionsQ.data || []).map(s => ({
    dNum: s.d_num, dMon: s.d_mon, name: s.name, mins: s.mins, sets: s.sets, pr: s.pr,
  }))

  return {
    routines,
    scans: scans.length ? scans : undefined,
    sessions,
    weeklyGoal: profile.weekly_goal,
    waterSize: profile.water_size,
    waterGoal: profile.water_goal,
    streak: profile.streak,
    obH: profile.height_cm == null ? '' : String(profile.height_cm),
    water: dayQ.data?.water ?? 0,
    trainedToday: dayQ.data?.trained ?? false,
  }
}

/** Replace the user's cloud copy with the current local state. */
export async function pushAll(userId: string, s: AppState, name: string): Promise<void> {
  if (!supabase) return
  await supabase.from('profiles').upsert({
    user_id: userId,
    name,
    height_cm: parseFloat(s.obH) > 0 ? parseFloat(s.obH) : null,
    weekly_goal: s.weeklyGoal,
    water_size: s.waterSize,
    water_goal: s.waterGoal,
    streak: s.streak,
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

  await supabase.from('body_scans').delete().eq('user_id', userId)
  if (s.scans.length) {
    await supabase.from('body_scans').insert(s.scans.map(sc => ({
      user_id: userId, label: sc.d, w: sc.w, fat: sc.fat, mus: sc.mus,
      wat: sc.wat, visc: sc.visc, bmr: sc.bmr, ffm: sc.ffm,
    })))
  }

  await supabase.from('workout_sessions').delete().eq('user_id', userId)
  if (s.sessions.length) {
    // insert oldest-first so created_at ordering matches the list order
    await supabase.from('workout_sessions').insert(s.sessions.slice().reverse().map(h => ({
      user_id: userId, d_num: h.dNum, d_mon: h.dMon, name: h.name, mins: h.mins, sets: h.sets, pr: h.pr,
    })))
  }

  await supabase.from('daily_logs').upsert({
    user_id: userId, day: todayKey(), water: s.water, trained: s.trainedToday,
  })
}
