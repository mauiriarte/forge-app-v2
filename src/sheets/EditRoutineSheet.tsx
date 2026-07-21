import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, inputStyle } from '../lib/ui'
import { SheetShell } from '../components/SheetShell'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function EditRoutineSheet() {
  const { store, state: s } = useStore()
  const { C, tintFg } = useTheme()
  const today = store.todayRoutine()
  const rOpen = s.routines.find(r => r.id === s.routineOpen) || today
  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const

  return (
    <SheetShell closing={s.reClosing} onClose={() => store.closeRe()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>Edit routine</div>

      <div style={{ marginTop: 16, ...label }}>NAME</div>
      <input className="fg-input" value={s.reName} onChange={(e) => store.setState({ reName: e.target.value })} style={{ marginTop: 8, ...inputStyle('s0') }} />

      <div style={{ marginTop: 16, ...label }}>TRAINING DAYS</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
        {DAY_LETTERS.map((d3, i) => {
          const on = s.reDays.indexOf(i) >= 0
          return (
            <div key={i} className="pr92" onClick={() => store.setState({ reDays: on ? s.reDays.filter(x => x !== i) : s.reDays.concat([i]) })} style={{ flex: 1, height: 42, borderRadius: 12, background: on ? C.b : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: on ? C.bOn : tintFg(0.6), boxSizing: 'border-box', transition: 'all 0.2s' }}>{d3}</div>
          )
        })}
      </div>

      <div className="pr97" onClick={() => store.saveRe()} style={{ marginTop: 18, height: 52, borderRadius: 16, background: 'var(--color-accent)', opacity: s.reDays.length > 0 ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}>Save changes</div>
      <div className="pr98" onClick={() => store.deleteRe()} style={{ marginTop: 10, height: 48, border: '1px solid rgba(217,58,43,0.4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--color-error-hi)', boxSizing: 'border-box', transition: 'transform 0.15s' }}>
        {s.reConfirm ? 'Tap again to confirm delete' : 'Delete ' + (rOpen?.name || 'routine')}
      </div>
    </SheetShell>
  )
}
