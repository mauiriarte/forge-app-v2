export interface RoutineExercise {
  uid: string
  lib: string
  sets: number
  reps: string
  lastW: number | null
  hist: number[]
}

export interface Routine {
  id: string
  name: string
  mus: string
  focus: string
  days: number[]
  exs: RoutineExercise[]
}

export interface Scan {
  d: string
  w: number
  fat: number
  mus: number
  wat: number
  visc: number
  bmr: number
  ffm: number
}

export interface SessionRecord {
  dNum: number
  dMon: string
  name: string
  mins: number
  sets: number
  pr: string | null
}

export type Screen = 'home' | 'train' | 'detail' | 'workout' | 'exercise' | 'stats' | 'profile'
export type ThemeSel = 'dark' | 'light' | 'system'

export interface ScanVals {
  w: string; fat: string; mus: string; wat: string; visc: string; bmr: string; ffm: string
}

export interface AppState {
  themeSel: ThemeSel
  sysDark: boolean
  screen: Screen | null
  prevScreen: Screen | null
  navDir: number
  navved: boolean
  detailFrom: Screen | null
  routineOpen: string | null
  exOpen: string | null
  exFrom: Screen | null
  // active session
  sessOn: boolean
  sessRid: string | null
  sessSets: Record<string, number>
  sessW: Record<string, number | number[] | null>
  sessElapsed: number
  sessDoneOpen: boolean
  sessOrder: string[]
  restEnd: number
  restTotal: number
  restTick: number
  lastSessMins: number
  // data
  routines: Routine[]
  sessions: SessionRecord[]
  scans: Scan[]
  streak: number
  // onboarding
  obDone: boolean
  obLoggedOut: boolean
  obStep: number
  obMode: 'signup' | 'login'
  obEmail: string
  obPass: string
  obW: string
  obH: string
  obGoal: number
  // new-routine sheet
  nrOpen: boolean
  nrClosing: boolean
  nrName: string
  nrMus: string
  nrDays: number[]
  // sets/reps sheet
  srUid: string | null
  srClosing: boolean
  srSets: number
  srReps: string
  // edit-routine sheet
  reOpen: boolean
  reClosing: boolean
  reName: string
  reDays: number[]
  reConfirm: boolean
  // swipe
  swId: string | null
  swDx: number
  swDragging: boolean
  swOpen: string | null
  leaving: Record<string, boolean>
  // hydration
  water: number
  waterSize: number
  waterGoal: number
  hydraOpen: boolean
  hydraClosing: boolean
  // exercise picker sheet
  exSheet: { mode: 'add' | 'replace'; uid: string | null } | null
  exSheetClosing: boolean
  // consistency
  weeklyGoal: number
  calOpen: boolean
  calClosing: boolean
  calOff: number
  trainedToday: boolean
  // body
  bodyMetric: string
  scanOpen: boolean
  scanClosing: boolean
  scanVals: ScanVals
  // toast
  toast: string | null
  toastLeaving: boolean
}
