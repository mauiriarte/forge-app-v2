import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint } from '../lib/ui'
import { dateKey, MONF } from '../lib/dates'
import { SheetShell } from '../components/SheetShell'

const DOWS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const GOALS = [2, 3, 4, 5, 6]

interface Cell { n: string; op: number; bg: string; bd: string; tc: string; tDot: string; hDot: string }

export function CalendarSheet() {
  const { store, state: s } = useStore()
  const { C, T, tintFg } = useTheme()
  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const

  const log = store.getLog()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tKey = dateKey(today)
  const hydTodayMet = s.water >= s.waterGoal
  const vm = new Date(today.getFullYear(), today.getMonth() + s.calOff, 1)
  const dim = new Date(vm.getFullYear(), vm.getMonth() + 1, 0).getDate()
  const lead = vm.getDay()

  const cells: Cell[] = []
  for (let i = 0; i < lead; i++) cells.push({ n: '', op: 0, bg: 'transparent', bd: 'transparent', tDot: 'transparent', hDot: 'transparent', tc: 'transparent' })
  for (let d2 = 1; d2 <= dim; d2++) {
    const dd = new Date(vm.getFullYear(), vm.getMonth(), d2)
    const k2 = dateKey(dd)
    const isToday = k2 === tKey
    const future = dd.getTime() > today.getTime()
    const f = future ? { t: false, h: false } : (isToday ? { t: s.trainedToday, h: hydTodayMet } : (log[k2] || { t: false, h: false }))
    cells.push({
      n: '' + d2,
      op: future ? 0.35 : 1,
      bg: isToday ? tintFg(0.08) : 'transparent',
      bd: isToday ? tintFg(0.18) : 'transparent',
      tc: T.text,
      tDot: f.t ? C.a : 'transparent',
      hDot: f.h ? C.b : 'transparent',
    })
  }

  return (
    <SheetShell closing={s.calClosing} onClose={() => store.closeCal()}>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>{MONF[vm.getMonth()]} {vm.getFullYear()}</div>
          <div style={{ fontSize: 12, color: tint(45), marginTop: 2 }}>Consistency, day by day</div>
        </div>
        <div className="pr9" onClick={() => store.setState({ calOff: Math.max(-5, s.calOff - 1) })} style={{ width: 38, height: 38, borderRadius: '50%', background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.calOff <= -5 ? 0.35 : 1, transition: 'transform 0.15s' }}>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6l5 5" style={{ stroke: tint(65) }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="pr9" onClick={() => store.setState({ calOff: Math.min(0, s.calOff + 1) })} style={{ width: 38, height: 38, borderRadius: '50%', background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s.calOff >= 0 ? 0.35 : 1, transition: 'transform 0.15s' }}>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" style={{ stroke: tint(65) }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {DOWS.map((dw, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 9, letterSpacing: 1, fontWeight: 700, color: tint(38) }}>{dw}</div>
        ))}
      </div>
      <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {cells.map((d, i) => (
          <div key={i} style={{ height: 42, borderRadius: 11, background: d.bg, border: `1px solid ${d.bd}`, opacity: d.op, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxSizing: 'border-box' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: d.tc }}>{d.n}</div>
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: d.tDot }} />
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: d.hDot }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 14, fontSize: 10.5, fontWeight: 600, color: tint(50) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} />Trained</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-cool)' }} />Hydration goal met</div>
      </div>

      <div style={{ marginTop: 16, ...label }}>WEEKLY TRAINING GOAL</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
        {GOALS.map(g => {
          const on = s.weeklyGoal === g
          return (
            <div key={g} className="pr94" onClick={() => store.setState({ weeklyGoal: g })} style={{ flex: 1, height: 44, borderRadius: 14, background: on ? C.a : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: on ? C.aOn : tintFg(0.6), boxSizing: 'border-box', transition: 'all 0.2s' }}>{g}×</div>
          )
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: tint(40) }}>A week counts as complete when you train at least this many days — worth 150 XP each.</div>
    </SheetShell>
  )
}
