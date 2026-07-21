import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useStore } from './store/store'
import { useTheme } from './lib/useTheme'
import { tint } from './lib/ui'
import { PALETTE } from './config'
import type { Screen } from './lib/types'
import { Home } from './screens/Home'
import { Train } from './screens/Train'
import { Workout } from './screens/Workout'
import { RoutineDetail } from './screens/RoutineDetail'
import { ExerciseDetail } from './screens/ExerciseDetail'
import { Stats } from './screens/Stats'
import { Profile } from './screens/Profile'
import { Onboarding } from './screens/Onboarding'
import { SetsRepsSheet } from './sheets/SetsRepsSheet'
import { EditRoutineSheet } from './sheets/EditRoutineSheet'
import { HydrationSheet } from './sheets/HydrationSheet'
import { ExercisePickerSheet } from './sheets/ExercisePickerSheet'
import { ScanSheet } from './sheets/ScanSheet'
import { MeasurementSheet } from './sheets/MeasurementSheet'
import { CalendarSheet } from './sheets/CalendarSheet'
import { NewRoutineSheet } from './sheets/NewRoutineSheet'

const NAV_EASE = 'cubic-bezier(0.24,0.85,0.32,1)'

function TabBar() {
  const { store } = useStore()
  const { T, tintFg } = useTheme()
  const screen = store.curScreen()
  const tabIdx = ({ home: 0, train: 1, detail: 1, workout: 1, exercise: 1, stats: 2 } as Partial<Record<Screen, number>>)[screen]
  const tc = (i: number) => (tabIdx === i ? T.text : tintFg(0.4))

  const tabs: { label: string; icon: ReactNode; go: () => void }[] = [
    {
      label: 'HOME',
      go: () => store.go('home'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="10" cy="10" r="2.6" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'TRAIN',
      go: () => store.go('train'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M11 1.5L4 11h4.4L8 18.5 16 8.5h-4.6L11 1.5z" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: 'STATS',
      go: () => store.go('stats'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <rect x="3" y="10.5" width="3.4" height="6.5" rx="1.4" fill="currentColor" />
          <rect x="8.3" y="4.5" width="3.4" height="12.5" rx="1.4" fill="currentColor" />
          <rect x="13.6" y="7.8" width="3.4" height="9.2" rx="1.4" fill="currentColor" />
        </svg>
      ),
    },
  ]

  return (
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px) / 2)', zIndex: 30, height: 66, borderRadius: 24, background: 'var(--color-nav)', border: `1px solid ${tint(9)}`, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', display: 'flex', animation: 'fgTabIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both' }}>
      <div style={{ position: 'absolute', top: 5, bottom: 5, width: 'calc(33.333% - 10px)', left: tabIdx === undefined ? 5 : `calc(${tabIdx * 33.333}% + 5px)`, borderRadius: 19, background: tint(8), transition: 'left 0.3s cubic-bezier(0.3,0.8,0.3,1)', opacity: tabIdx === undefined ? 0 : 1 }} />
      {tabs.map((t, i) => (
        <div key={t.label} onClick={t.go} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', position: 'relative', color: tc(i), transition: 'color 0.25s' }}>
          {t.icon}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.7 }}>{t.label}</div>
        </div>
      ))}
    </div>
  )
}

function Toast() {
  const { state: s } = useStore()
  const { T } = useTheme()
  if (!s.toast) return null
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 96, transform: 'translateX(-50%)', zIndex: 60, background: T.p, color: T.pOn, borderRadius: 999, padding: '11px 18px', fontWeight: 600, fontSize: 13, letterSpacing: 0.2, animation: s.toastLeaving ? 'fgToastOut 0.3s ease both' : 'fgToast 0.3s cubic-bezier(0.2,0.8,0.2,1) both', whiteSpace: 'nowrap' }}>
      {s.toast}
    </div>
  )
}

export function App() {
  const { store, state: s } = useStore()
  const { themeKey } = useTheme()

  // Theme + palette routed through the design-token data attributes.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeKey)
    document.documentElement.setAttribute('data-palette', PALETTE)
  }, [themeKey])

  const screen = store.curScreen()
  const prev = s.prevScreen === screen ? null : s.prevScreen
  const anim = (name: Screen) => {
    if (name === screen) {
      if (!s.navved) return 'fgFadeUp 0.4s cubic-bezier(0.2,0.8,0.2,1) both'
      return (s.navDir > 0 ? 'fgInRight' : 'fgInLeft') + ' 0.4s ' + NAV_EASE + ' both'
    }
    return (s.navDir > 0 ? 'fgOutLeft' : 'fgOutRight') + ' 0.4s ' + NAV_EASE + ' both'
  }
  const zOf = (name: Screen) => (name === screen ? 2 : 1)
  const show = (name: Screen) => screen === name || prev === name

  const obOn = !s.obDone || s.obLoggedOut

  return (
    <div className="app">
      {show('home') && <Home z={zOf('home')} anim={anim('home')} />}
      {show('train') && <Train z={zOf('train')} anim={anim('train')} />}
      {show('workout') && <Workout z={zOf('workout')} anim={anim('workout')} />}
      {show('detail') && <RoutineDetail z={zOf('detail')} anim={anim('detail')} />}
      {show('exercise') && <ExerciseDetail z={zOf('exercise')} anim={anim('exercise')} />}
      {show('stats') && <Stats z={zOf('stats')} anim={anim('stats')} />}
      {show('profile') && <Profile z={zOf('profile')} anim={anim('profile')} />}

      <TabBar />

      {s.srUid && <SetsRepsSheet />}
      {s.reOpen && <EditRoutineSheet />}
      {s.hydraOpen && <HydrationSheet />}
      {s.exSheet && <ExercisePickerSheet />}
      {s.scanOpen && <ScanSheet />}
      {s.msOpen && <MeasurementSheet />}
      {s.calOpen && <CalendarSheet />}
      {s.nrOpen && <NewRoutineSheet />}

      {obOn && <Onboarding />}

      <Toast />
    </div>
  )
}
