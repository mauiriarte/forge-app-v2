import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint } from '../lib/ui'
import { SheetShell } from '../components/SheetShell'

const SIZES = [200, 250, 330, 500]

export function HydrationSheet() {
  const { store, state: s } = useStore()
  const { C, tintFg } = useTheme()
  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const

  return (
    <SheetShell closing={s.hydraClosing} onClose={() => store.closeHydra()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>Hydration</div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>Tune your glass and daily goal.</div>

      <div style={{ marginTop: 16, ...label }}>GLASS SIZE</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
        {SIZES.map(v => {
          const on = s.waterSize === v
          return (
            <div key={v} className="pr96" onClick={() => store.setState({ waterSize: v })} style={{ flex: 1, height: 46, borderRadius: 14, background: on ? C.b : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.1)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: on ? C.bOn : tintFg(0.7), boxSizing: 'border-box', transition: 'all 0.2s' }}>{v} ML</div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, ...label }}>DAILY GOAL</div>
      <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="pr92" onClick={() => store.stepGoal(-1)} style={{ width: 46, height: 46, borderRadius: 15, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: tint(75), transition: 'transform 0.15s' }}>−</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>{s.waterGoal} glasses · {(s.waterGoal * s.waterSize).toLocaleString('en-US')} ml</div>
        <div className="pr92" onClick={() => store.stepGoal(1)} style={{ width: 46, height: 46, borderRadius: 15, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: tint(75), transition: 'transform 0.15s' }}>+</div>
      </div>

      <div className="pr98" onClick={() => { store.setState({ water: 0 }); store.toast('Count reset') }} style={{ marginTop: 14, height: 48, border: '1px solid rgba(217,58,43,0.4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--color-error-hi)', boxSizing: 'border-box', transition: 'transform 0.15s' }}>Reset today's count</div>
      <div className="pr97" onClick={() => store.closeHydra()} style={{ marginTop: 10, height: 50, borderRadius: 16, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'transform 0.15s' }}>Done</div>
    </SheetShell>
  )
}
