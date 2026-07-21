import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { LIB, FOCUS, libOf } from '../lib/library'
import { dateKey, todayKey, MO3 } from '../lib/dates'
import type { AppState, Routine, Screen, ScanVals, SessionRecord, ThemeSel } from '../lib/types'
import { DEFAULT_THEME } from '../config'
import { supabase } from '../lib/supabase'
import { pullAll, pushAll } from './sync'
import { USER_NAME } from '../config'
import { HEVY_ROUTINES } from '../lib/hevyRoutines'

const STORAGE_KEY = 'forge-v2'

// Fields that survive a reload. Everything else (sheets, swipe, animation
// bookkeeping) is transient by design. The active session persists so an
// accidental reload mid-workout doesn't lose logged sets.
const PERSIST_KEYS = [
  'themeSel', 'routines', 'sessions', 'scans', 'streak',
  'water', 'waterSize', 'waterGoal', 'weeklyGoal', 'trainedToday', 'lastSessMins',
  'obDone', 'obEmail', 'obW', 'obH', 'obGoal',
  'bodyMetric',
  'sessOn', 'sessRid', 'sessSets', 'sessW', 'sessElapsed', 'sessOrder', 'restEnd', 'restTotal',
] as const

// The original design-prototype demo routines. No longer seeded — kept only so
// hydrate() can recognize installs still carrying them and migrate to the
// real Hevy program.
const DEMO_ROUTINE_IDS = ['full', 'push', 'pull', 'legs']

const initialState = (): AppState => ({
  themeSel: DEFAULT_THEME as ThemeSel, sysDark: true,
  screen: null, prevScreen: null, navDir: 1, navved: false, detailFrom: null,
  routineOpen: null,
  exOpen: null, exFrom: null,
  sessOn: false, sessRid: null, sessSets: {}, sessW: {}, sessElapsed: 0, sessDoneOpen: false, sessOrder: [],
  restEnd: 0, restTotal: 90, restTick: 0, lastSessMins: 0,
  // New accounts start with no routines — the create-your-first-routine
  // empty states on Home/Train take over.
  routines: [],
  sessions: [
    { dNum: 10, dMon: 'JUL', name: 'Pull Day', mins: 52, sets: 17, pr: 'Lat pulldown' },
    { dNum: 9, dMon: 'JUL', name: 'Push Day', mins: 48, sets: 17, pr: null },
    { dNum: 8, dMon: 'JUL', name: 'Leg Day', mins: 61, sets: 18, pr: 'Squats' },
    { dNum: 5, dMon: 'JUL', name: 'Full Body', mins: 55, sets: 18, pr: null },
  ],
  scans: [
    { d: 'MAR 12', w: 99.1, fat: 29.4, mus: 37.9, wat: 45.9, visc: 13, bmr: 2011, ffm: 62.9 },
    { d: 'APR 16', w: 97.4, fat: 28.2, mus: 38.2, wat: 46.3, visc: 12, bmr: 2034, ffm: 63.4 },
    { d: 'MAY 21', w: 96.3, fat: 27.5, mus: 38.5, wat: 46.7, visc: 12, bmr: 2056, ffm: 63.8 },
    { d: 'JUN 24', w: 95.2, fat: 26.66, mus: 38.82, wat: 47.04, visc: 11, bmr: 2078, ffm: 64.26 },
  ],
  streak: 12,
  obDone: false, obLoggedOut: false, obStep: 0, obMode: 'signup', obEmail: '', obPass: '', obW: '', obH: '', obGoal: 4,
  nrOpen: false, nrClosing: false, nrName: '', nrMus: 'Push', nrDays: [],
  srUid: null, srClosing: false, srSets: 3, srReps: '10',
  reOpen: false, reClosing: false, reName: '', reDays: [], reConfirm: false,
  swId: null, swDx: 0, swDragging: false, swOpen: null,
  leaving: {},
  water: 5, waterSize: 250, waterGoal: 8,
  hydraOpen: false, hydraClosing: false,
  exSheet: null, exSheetClosing: false,
  weeklyGoal: 4, calOpen: false, calClosing: false, calOff: 0, trainedToday: false,
  bodyMetric: 'w', scanOpen: false, scanClosing: false,
  scanVals: { w: '', fat: '', mus: '', wat: '', visc: '', bmr: '', ffm: '' },
  toast: null, toastLeaving: false,
})

function hydrate(): AppState {
  const base = initialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<AppState> & { dayKey?: string }
    for (const k of PERSIST_KEYS) {
      if (saved[k] !== undefined) (base as unknown as Record<string, unknown>)[k] = saved[k]
    }
    if (saved.dayKey !== todayKey()) {
      // New day: hydration and "trained today" reset; a stale session is dropped.
      base.water = 0
      base.trainedToday = false
      base.sessOn = false
      base.sessRid = null
      base.sessSets = {}
      base.sessW = {}
      base.sessElapsed = 0
      base.sessOrder = []
      base.restEnd = 0
    }
    // One-time migration: installs still carrying the design-prototype demo
    // routines get the real Hevy upper/lower program instead.
    if (base.routines.length && base.routines.every(r => DEMO_ROUTINE_IDS.includes(r.id))) {
      base.routines = HEVY_ROUTINES
    }
    // Drop an active session whose routine no longer exists.
    if (base.sessOn && !base.routines.some(r => r.id === base.sessRid)) {
      base.sessOn = false
      base.sessRid = null
      base.sessSets = {}
      base.sessW = {}
      base.sessElapsed = 0
      base.sessOrder = []
      base.restEnd = 0
    }
  } catch { /* corrupted storage → fresh state */ }
  return base
}

interface SwipeTrack {
  uid: string; x: number; y: number; base: number
  hadOpen: boolean; on: boolean; el: HTMLElement; pid: number
}

const StoreCtx = createContext<{ store: Store; state: AppState } | null>(null)

export class Store extends React.Component<{ children: ReactNode }, AppState> {
  state: AppState = hydrate()

  private seq = 100
  private ti: ReturnType<typeof setInterval> | undefined
  private nt: ReturnType<typeof setTimeout> | undefined
  private tt: ReturnType<typeof setTimeout> | undefined
  private tl: ReturnType<typeof setTimeout> | undefined
  private xst: ReturnType<typeof setTimeout> | undefined
  private hyt: ReturnType<typeof setTimeout> | undefined
  private sst: ReturnType<typeof setTimeout> | undefined
  private clt: ReturnType<typeof setTimeout> | undefined
  private nrt: ReturnType<typeof setTimeout> | undefined
  private srt: ReturnType<typeof setTimeout> | undefined
  private ret: ReturnType<typeof setTimeout> | undefined
  private rct: ReturnType<typeof setTimeout> | undefined
  private lts: ReturnType<typeof setTimeout>[] = []
  private mq: MediaQueryList | undefined
  private mqFn: ((e: MediaQueryListEvent) => void) | undefined
  private sw: SwipeTrack | null = null
  private swSuppress = false
  private logCache: Record<string, { t: boolean; h: boolean }> | null = null
  private persistT: ReturnType<typeof setTimeout> | undefined
  private userId: string | null = null
  private pushT: ReturnType<typeof setTimeout> | undefined
  private pushing = false
  private pushAgain = false
  private authUnsub: (() => void) | undefined

  // ── derived helpers ────────────────────────────────────────────
  curScreen(): Screen {
    return this.state.screen || 'home'
  }

  todayRoutine(): Routine | null {
    const day = new Date().getDay()
    return this.state.routines.find(r => r.days.indexOf(day) >= 0) || this.state.routines[0] || null
  }

  findEx(uid: string | null): Routine['exs'][number] | null {
    for (const r of this.state.routines) {
      for (const e of r.exs) {
        if (e.uid === uid) return e
      }
    }
    return null
  }

  exName(lib: string) { return libOf(lib).name }

  swSuppressed(): boolean {
    if (this.swSuppress) { this.swSuppress = false; return true }
    return false
  }

  // ── navigation ─────────────────────────────────────────────────
  go(s: Screen) {
    const cur = this.curScreen()
    if (s === cur) return
    const order: Record<Screen, number> = { home: 0, train: 1, detail: 2, workout: 3, exercise: 4, stats: 5, profile: 6 }
    clearTimeout(this.nt)
    this.setState({ screen: s, prevScreen: cur, navved: true, navDir: order[s] >= order[cur] ? 1 : -1 })
    this.nt = setTimeout(() => this.setState({ prevScreen: null }), 430)
  }

  toast(msg: string) {
    clearTimeout(this.tt); clearTimeout(this.tl)
    this.setState({ toast: msg, toastLeaving: false })
    this.tl = setTimeout(() => this.setState({ toastLeaving: true }), 1800)
    this.tt = setTimeout(() => this.setState({ toast: null, toastLeaving: false }), 2150)
  }

  markLeaving(token: string, ms: number, after?: () => void) {
    this.setState(s => ({ leaving: { ...s.leaving, [token]: true } }))
    this.lts.push(setTimeout(() => {
      this.setState(s => {
        const l = { ...s.leaving }
        delete l[token]
        return { leaving: l }
      })
      if (after) after()
    }, ms))
  }

  openRoutine(id: string) {
    this.setState({ routineOpen: id, detailFrom: this.curScreen(), swOpen: null, swId: null, swDx: 0, swDragging: false })
    this.go('detail')
  }

  openExercise(uid: string, from?: Screen) {
    this.setState({ exOpen: uid, exFrom: from || this.curScreen() })
    this.go('exercise')
  }

  // ── session ────────────────────────────────────────────────────
  private startTimer() {
    clearInterval(this.ti)
    this.ti = setInterval(() => this.setState(s2 => ({ sessElapsed: s2.sessElapsed + 1, restTick: s2.restTick + 1 })), 1000)
  }

  startSession(rid: string | null) {
    if (this.state.sessOn) { this.go('workout'); return }
    const r = this.state.routines.find(x => x.id === rid) || this.todayRoutine()
    if (!r) { this.openNr(); return }
    if (!r.exs.length) { this.openRoutine(r.id); this.toast('Add exercises to this routine first'); return }
    const sessW: AppState['sessW'] = {}
    const sessSets: AppState['sessSets'] = {}
    r.exs.forEach(e => {
      const st = libOf(e.lib).step
      sessW[e.uid] = e.lastW != null ? e.lastW : (st > 0 ? (st >= 2.5 ? 20 : 10) : null)
      sessSets[e.uid] = 0
    })
    this.startTimer()
    this.setState({ sessOn: true, sessRid: r.id, sessW, sessSets, sessElapsed: 0, sessDoneOpen: false, restEnd: 0, sessOrder: r.exs.map(e => e.uid) })
    this.go('workout')
    this.toast('Workout started')
  }

  toggleSet(uid: string, i: number, total: number, name: string) {
    const cur = this.state.sessSets[uid] || 0
    const n = (i + 1 === cur) ? i : i + 1
    const upd: Partial<AppState> = { sessSets: { ...this.state.sessSets, [uid]: n } }
    if (n > cur) {
      upd.restEnd = n >= total ? 0 : Date.now() + this.state.restTotal * 1000
    }
    this.setState(upd as AppState)
    if (n >= total && cur < total) this.toast(name + ' complete')
  }

  doNow(uid: string) {
    const L = libOf(this.findEx(uid)?.lib || '')
    this.setState(s => ({ sessOrder: [uid].concat((s.sessOrder || []).filter(u => u !== uid)), restEnd: 0 }))
    this.toast('Swapped — ' + (L.name || 'exercise') + ' now')
  }

  postponeEx(uid: string) {
    const L = libOf(this.findEx(uid)?.lib || '')
    this.setState(s => ({ sessOrder: (s.sessOrder || []).filter(u => u !== uid).concat([uid]), restEnd: 0 }))
    this.toast((L.name || 'Exercise') + ' moved to the end')
  }

  stepSetW(uid: string, i: number, dir: number) {
    const ex = this.findEx(uid)
    if (!ex) return
    const step = libOf(ex.lib).step || 2.5
    const cur = this.state.sessW[uid]
    const arr = Array.isArray(cur) ? cur.slice() : Array.from({ length: ex.sets }, () => (typeof cur === 'number' ? cur : 20))
    arr[i] = Math.max(0, Math.round((arr[i] + dir * step) * 10) / 10)
    this.setState(s => ({ sessW: { ...s.sessW, [uid]: arr } }))
  }

  wOf(uid: string): number | null {
    const v = this.state.sessW[uid]
    if (v == null) return null
    return Array.isArray(v) ? Math.max(...v) : v
  }

  endSession() {
    const s = this.state
    clearInterval(this.ti)
    const r = s.routines.find(x => x.id === s.sessRid)
    const any = r ? r.exs.some(e => (s.sessSets[e.uid] || 0) > 0) : false
    if (any && r) {
      const routines = s.routines.map(rr => rr.id !== r.id ? rr : {
        ...rr,
        exs: rr.exs.map(e => {
          const done = (s.sessSets[e.uid] || 0) > 0
          const L = libOf(e.lib)
          if (!done || !(L.step > 0)) return e
          const hist = (e.hist || []).concat(e.lastW != null ? [e.lastW] : []).slice(-4)
          return { ...e, hist, lastW: this.wOf(e.uid) }
        }),
      })
      const mins = Math.max(1, Math.round(s.sessElapsed / 60))
      const now = new Date()
      let pr: string | null = null
      r.exs.forEach(e => {
        if ((s.sessSets[e.uid] || 0) === 0) return
        const L = libOf(e.lib)
        const w = this.wOf(e.uid)
        if (L.step > 0 && w != null && e.lastW != null && w > e.lastW && !pr) pr = L.name
      })
      const setsDone = r.exs.reduce((a, e) => a + Math.min(e.sets, s.sessSets[e.uid] || 0), 0)
      const sess: SessionRecord = { dNum: now.getDate(), dMon: MO3[now.getMonth()], name: r.name, mins, sets: setsDone, pr }
      this.setState({ routines, sessOn: false, trainedToday: true, lastSessMins: mins, restEnd: 0, sessions: [sess].concat(s.sessions).slice(0, 8) })
      this.toast('Workout logged — ' + mins + ' min')
    } else {
      this.setState({ sessOn: false })
      this.toast('Workout discarded')
    }
    this.go('home')
  }

  // ── swipe (routine-detail exercise rows) ───────────────────────
  swStart(uid: string, e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    this.swSuppress = false
    this.sw = { uid, x: e.clientX, y: e.clientY, base: this.state.swOpen === uid ? -148 : 0, hadOpen: !!this.state.swOpen, on: false, el: e.currentTarget, pid: e.pointerId }
  }

  swMove(uid: string, e: React.PointerEvent<HTMLElement>) {
    const sw = this.sw
    if (!sw || sw.uid !== uid) return
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y
    if (!sw.on) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        sw.on = true
        try { sw.el.setPointerCapture(sw.pid) } catch { /* older browsers */ }
      } else if (Math.abs(dy) > 12) { this.sw = null; return }
      else return
    }
    let v = sw.base + dx
    if (v > 0) v = v * 0.15
    if (v < -188) v = -188 + (v + 188) * 0.2
    this.setState({ swId: uid, swDx: v, swDragging: true })
  }

  swEnd(uid: string) {
    const sw = this.sw
    if (!sw || sw.uid !== uid) { this.sw = null; return }
    const wasOn = sw.on
    this.sw = null
    if (!wasOn) {
      if (sw.hadOpen) {
        this.swSuppress = true
        this.setState({ swOpen: null })
      }
      return
    }
    this.swSuppress = true
    const open = this.state.swDx < -74
    this.setState({ swOpen: open ? uid : null, swId: null, swDx: 0, swDragging: false })
  }

  // ── routine editing ────────────────────────────────────────────
  deleteEx(uid: string) {
    let name = ''
    this.state.routines.forEach(r => r.exs.forEach(e => { if (e.uid === uid) name = this.exName(e.lib) }))
    this.setState({ swOpen: null, swId: null, swDx: 0, swDragging: false })
    this.markLeaving('ex:' + uid, 440, () => {
      this.setState(s => ({ routines: s.routines.map(r => ({ ...r, exs: r.exs.filter(e => e.uid !== uid) })) }))
    })
    this.toast(name + ' removed')
  }

  openExSheet(mode: 'add' | 'replace', uid: string | null) {
    clearTimeout(this.xst)
    this.setState({ exSheet: { mode, uid }, exSheetClosing: false, swOpen: null, swId: null, swDx: 0, swDragging: false })
  }

  closeExSheet() {
    if (this.state.exSheetClosing) return
    this.setState({ exSheetClosing: true })
    this.xst = setTimeout(() => this.setState({ exSheet: null, exSheetClosing: false }), 300)
  }

  pickEx(libId: string) {
    const sh = this.state.exSheet
    if (!sh) return
    const L = LIB[libId]
    const rid = this.state.routineOpen || this.todayRoutine()?.id
    const routines = this.state.routines.map(r => {
      if (r.id !== rid) return r
      if (sh.mode === 'replace') {
        return { ...r, exs: r.exs.map(e => e.uid === sh.uid ? { uid: e.uid, lib: libId, sets: L.sets, reps: L.reps, lastW: null, hist: [] } : e) }
      }
      this.seq += 1
      return { ...r, exs: r.exs.concat([{ uid: 'u' + this.seq, lib: libId, sets: L.sets, reps: L.reps, lastW: null, hist: [] }]) }
    })
    this.setState({ routines })
    this.toast(sh.mode === 'replace' ? 'Swapped to ' + L.name : L.name + ' added')
    this.closeExSheet()
  }

  // ── hydration ──────────────────────────────────────────────────
  setWaterTo(n: number) {
    const g = this.state.waterGoal
    const prev = this.state.water
    n = Math.max(0, Math.min(g, n))
    this.setState({ water: n })
    if (n === g && prev < g) this.toast('Hydration goal reached')
  }

  openHydra() { clearTimeout(this.hyt); this.setState({ hydraOpen: true, hydraClosing: false }) }

  closeHydra() {
    if (this.state.hydraClosing) return
    this.setState({ hydraClosing: true })
    this.hyt = setTimeout(() => this.setState({ hydraOpen: false, hydraClosing: false }), 300)
  }

  stepGoal(d: number) {
    const g = Math.max(4, Math.min(12, this.state.waterGoal + d))
    this.setState(s => ({ waterGoal: g, water: Math.min(s.water, g) }))
  }

  // ── scans ──────────────────────────────────────────────────────
  openScan() {
    clearTimeout(this.sst)
    const last = this.state.scans[this.state.scans.length - 1]
    this.setState({ scanOpen: true, scanClosing: false, scanVals: { w: '' + last.w, fat: '' + last.fat, mus: '' + last.mus, wat: '' + last.wat, visc: '' + last.visc, bmr: '' + last.bmr, ffm: '' + last.ffm } })
  }

  closeScan() {
    if (this.state.scanClosing) return
    this.setState({ scanClosing: true })
    this.sst = setTimeout(() => this.setState({ scanOpen: false, scanClosing: false }), 300)
  }

  setScanVal(k: keyof ScanVals, v: string) {
    this.setState(s => ({ scanVals: { ...s.scanVals, [k]: v } }))
  }

  submitScan() {
    const sv = this.state.scanVals
    const num = (x: string) => { const n = parseFloat(('' + x).replace(',', '.')); return isNaN(n) ? null : n }
    const w = num(sv.w), fat = num(sv.fat)
    if (!w || w <= 0 || fat == null || fat <= 0) { this.toast('Weight and body fat needed'); return }
    const last = this.state.scans[this.state.scans.length - 1]
    const now = new Date()
    const pick = (v2: number | null, fb: number) => v2 == null ? fb : v2
    const scan = { d: MO3[now.getMonth()] + ' ' + now.getDate(), w, fat, mus: pick(num(sv.mus), last.mus), wat: pick(num(sv.wat), last.wat), visc: pick(num(sv.visc), last.visc), bmr: pick(num(sv.bmr), last.bmr), ffm: pick(num(sv.ffm), last.ffm) }
    this.setState(s => ({ scans: [...s.scans, scan] }))
    this.toast('Scan logged — ' + scan.d)
    this.closeScan()
  }

  // ── sets/reps editor ───────────────────────────────────────────
  openSr(uid: string) {
    clearTimeout(this.srt)
    const ex = this.findEx(uid)
    if (!ex) return
    this.setState({ srUid: uid, srClosing: false, srSets: ex.sets, srReps: ex.reps, swOpen: null, swId: null, swDx: 0, swDragging: false })
  }

  closeSr() {
    if (this.state.srClosing) return
    this.setState({ srClosing: true })
    this.srt = setTimeout(() => this.setState({ srUid: null, srClosing: false }), 300)
  }

  saveSr() {
    const s = this.state
    const routines = s.routines.map(r => ({ ...r, exs: r.exs.map(e => e.uid === s.srUid ? { ...e, sets: s.srSets, reps: s.srReps } : e) }))
    this.setState({ routines })
    this.toast('Updated — ' + s.srSets + ' × ' + s.srReps)
    this.closeSr()
  }

  // ── edit routine ───────────────────────────────────────────────
  openRe() {
    clearTimeout(this.ret)
    const r = this.state.routines.find(x => x.id === this.state.routineOpen)
    if (!r) return
    this.setState({ reOpen: true, reClosing: false, reName: r.name, reDays: r.days.slice(), reConfirm: false })
  }

  closeRe() {
    if (this.state.reClosing) return
    this.setState({ reClosing: true })
    this.ret = setTimeout(() => this.setState({ reOpen: false, reClosing: false }), 300)
  }

  saveRe() {
    const s = this.state
    if (!s.reDays.length) { this.toast('Pick at least one training day'); return }
    const routines = s.routines.map(r => r.id === s.routineOpen ? { ...r, name: s.reName.trim() || r.name, days: s.reDays.slice().sort() } : r)
    this.setState({ routines })
    this.toast('Routine updated')
    this.closeRe()
  }

  deleteRe() {
    const s = this.state
    if (s.sessOn && s.sessRid === s.routineOpen) { this.toast('Finish or discard your workout first'); return }
    if (!s.reConfirm) {
      clearTimeout(this.rct)
      this.setState({ reConfirm: true })
      this.rct = setTimeout(() => this.setState({ reConfirm: false }), 3000)
      return
    }
    clearTimeout(this.rct)
    const r = s.routines.find(x => x.id === s.routineOpen)
    this.setState({ routines: s.routines.filter(x => x.id !== s.routineOpen), reOpen: false, reClosing: false, reConfirm: false })
    this.toast((r ? r.name : 'Routine') + ' deleted')
    this.go('train')
  }

  // ── new routine ────────────────────────────────────────────────
  openNr() { clearTimeout(this.nrt); this.setState({ nrOpen: true, nrClosing: false, nrName: '', nrMus: 'Push', nrDays: [] }) }

  closeNr() {
    if (this.state.nrClosing) return
    this.setState({ nrClosing: true })
    this.nrt = setTimeout(() => this.setState({ nrOpen: false, nrClosing: false }), 300)
  }

  submitNr() {
    const s = this.state
    if (!s.nrDays.length) { this.toast('Pick at least one training day'); return }
    this.seq += 1
    const id = 'r' + this.seq
    const name = s.nrName.trim() || (s.nrMus === 'Full body' ? 'Full Body' : s.nrMus + ' Day')
    const routine = { id, name, mus: s.nrMus, focus: FOCUS[s.nrMus], days: s.nrDays.slice().sort(), exs: [] }
    this.setState({ routines: s.routines.concat([routine]), nrOpen: false, nrClosing: false })
    this.toast('Routine created — add exercises')
    this.openRoutine(id)
  }

  // ── onboarding / auth ──────────────────────────────────────────
  // With Supabase configured these hit real auth; otherwise local-only mode.
  hasCloud(): boolean { return !!supabase }

  async sbSignUp(email: string, pass: string): Promise<'session' | 'confirm' | string> {
    if (!supabase) return 'session'
    const { data, error } = await supabase.auth.signUp({ email, password: pass })
    if (error) return error.message
    return data.session ? 'session' : 'confirm'
  }

  async sbLogin(email: string, pass: string): Promise<true | string> {
    if (!supabase) return true
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    return error ? error.message : true
  }

  async sbForgot(email: string): Promise<true | string> {
    if (!supabase) return true
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return error ? error.message : true
  }

  finishOb(skipped: boolean) {
    this.setState(s => ({ obDone: true, obLoggedOut: false, weeklyGoal: s.obGoal }))
    this.toast(skipped ? 'You can add a scan later in Stats' : 'Welcome to Forge')
  }

  signOut() {
    if (supabase) { supabase.auth.signOut() }
    this.userId = null
    this.setState({ obDone: false, obLoggedOut: true, obMode: 'login', obStep: 0, obPass: '' })
    this.go('home')
  }

  private async onSignedIn(userId: string, email: string | undefined) {
    if (this.userId === userId) return
    this.userId = userId
    this.setState({ obDone: true, obLoggedOut: false, obEmail: email || this.state.obEmail })
    try {
      const patch = await pullAll(userId)
      if (patch) {
        this.setState(patch as Partial<AppState> as AppState)
      } else {
        // First sign-in on this account: seed the cloud with the local state.
        this.schedulePush()
      }
    } catch { /* offline — local cache remains; next push reconciles */ }
  }

  private schedulePush() {
    if (!supabase || !this.userId) return
    clearTimeout(this.pushT)
    this.pushT = setTimeout(() => this.runPush(), 2500)
  }

  private async runPush() {
    if (!supabase || !this.userId) return
    if (this.pushing) { this.pushAgain = true; return }
    this.pushing = true
    try {
      await pushAll(this.userId, this.state, USER_NAME)
    } catch { /* offline — retried on next change */ }
    this.pushing = false
    if (this.pushAgain) { this.pushAgain = false; this.schedulePush() }
  }

  // ── consistency log (deterministic demo history) ───────────────
  getLog(): Record<string, { t: boolean; h: boolean }> {
    if (this.logCache) return this.logCache
    const log: Record<string, { t: boolean; h: boolean }> = {}
    const today = new Date(); today.setHours(0, 0, 0, 0)
    for (let i = 1; i <= 130; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const k = dateKey(d)
      let h = 0
      for (let j = 0; j < k.length; j++) h = (h * 31 + k.charCodeAt(j)) >>> 0
      h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0
      h = (h ^ (h >>> 16)) >>> 0
      log[k] = { t: (h % 100) < 60, h: ((h >>> 7) % 100) < 62 }
      if (i <= 6) log[k].h = true
    }
    this.logCache = log
    return log
  }

  openCal() { clearTimeout(this.clt); this.setState({ calOpen: true, calClosing: false, calOff: 0 }) }

  closeCal() {
    if (this.state.calClosing) return
    this.setState({ calClosing: true })
    this.clt = setTimeout(() => this.setState({ calOpen: false, calClosing: false }), 300)
  }

  setTheme(k: ThemeSel) { this.setState({ themeSel: k }) }

  // ── lifecycle ──────────────────────────────────────────────────
  componentDidMount() {
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user
        if (u) this.onSignedIn(u.id, u.email)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user
        if (u) this.onSignedIn(u.id, u.email)
      })
      this.authUnsub = () => sub.subscription.unsubscribe()
    }
    if (window.matchMedia) {
      this.mq = window.matchMedia('(prefers-color-scheme: dark)')
      this.setState({ sysDark: this.mq.matches })
      this.mqFn = (e) => this.setState({ sysDark: e.matches })
      this.mq.addEventListener('change', this.mqFn)
    }
    if (this.state.sessOn) this.startTimer()
    // Continue uid/id sequence past any persisted entities.
    this.state.routines.forEach(r => {
      const rn = parseInt(r.id.replace(/^\D+/, ''), 10)
      if (!isNaN(rn)) this.seq = Math.max(this.seq, rn)
      r.exs.forEach(e => {
        const en = parseInt(e.uid.replace(/^\D+/, ''), 10)
        if (!isNaN(en)) this.seq = Math.max(this.seq, en)
      })
    })
  }

  componentDidUpdate() {
    clearTimeout(this.persistT)
    this.persistT = setTimeout(() => this.persist(), 250)
  }

  componentWillUnmount() {
    clearInterval(this.ti)
    if (this.mq && this.mqFn) this.mq.removeEventListener('change', this.mqFn)
    if (this.authUnsub) this.authUnsub()
    ;[this.tt, this.tl, this.nt, this.xst, this.hyt, this.sst, this.clt, this.nrt, this.srt, this.ret, this.rct, this.persistT, this.pushT].forEach(t => clearTimeout(t))
    this.lts.forEach(t => clearTimeout(t))
  }

  private persist() {
    try {
      const out: Record<string, unknown> = { dayKey: todayKey() }
      for (const k of PERSIST_KEYS) out[k] = this.state[k]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
    } catch { /* storage full/unavailable — app still works in-memory */ }
    this.schedulePush()
  }

  render() {
    return (
      <StoreCtx.Provider value={{ store: this, state: this.state }}>
        {this.props.children}
      </StoreCtx.Provider>
    )
  }
}

export function useStore(): { store: Store; state: AppState } {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore outside <Store>')
  return ctx
}
