import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, inputStyle } from '../lib/ui'
import { SheetShell } from '../components/SheetShell'

const MUS_OPTIONS = ['Push', 'Pull', 'Legs', 'Full body', 'Core']
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function NewRoutineSheet() {
  const { store, state: s } = useStore()
  const { C, tintFg } = useTheme()
  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const

  return (
    <SheetShell closing={s.nrClosing} onClose={() => store.closeNr()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>New routine</div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>Name it, pick a focus and your training days.</div>

      <div style={{ marginTop: 16, ...label }}>NAME</div>
      <input className="fg-input" value={s.nrName} onChange={(e) => store.setState({ nrName: e.target.value })} placeholder="e.g. Upper Body A" style={{ marginTop: 8, ...inputStyle('s0') }} />

      <div style={{ marginTop: 16, ...label }}>FOCUS</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 9 }}>
        {MUS_OPTIONS.map(m => {
          const on = s.nrMus === m
          return (
            <div key={m} className="pr95" onClick={() => store.setState({ nrMus: m })} style={{ height: 40, padding: '0 15px', borderRadius: 13, background: on ? C.a : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600, color: on ? C.aOn : tintFg(0.6), boxSizing: 'border-box', transition: 'all 0.2s' }}>{m}</div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, ...label }}>TRAINING DAYS</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
        {DAY_LETTERS.map((d3, i) => {
          const on = s.nrDays.indexOf(i) >= 0
          return (
            <div key={i} className="pr92" onClick={() => store.setState({ nrDays: on ? s.nrDays.filter(x => x !== i) : s.nrDays.concat([i]) })} style={{ flex: 1, height: 42, borderRadius: 12, background: on ? C.b : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: on ? C.bOn : tintFg(0.6), boxSizing: 'border-box', transition: 'all 0.2s' }}>{d3}</div>
          )
        })}
      </div>

      <div className="pr97" onClick={() => store.submitNr()} style={{ marginTop: 18, height: 52, borderRadius: 16, background: 'var(--color-accent)', opacity: s.nrDays.length > 0 ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}>Create routine</div>
      <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11, color: tint(38) }}>You'll add exercises right after</div>
    </SheetShell>
  )
}
