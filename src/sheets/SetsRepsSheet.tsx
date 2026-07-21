import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint } from '../lib/ui'
import { SheetShell } from '../components/SheetShell'

const REP_OPTIONS = ['5', '6', '8', '10', '12', '15', '20', '30s', '60s', '40m']

export function SetsRepsSheet() {
  const { store, state: s } = useStore()
  const { C, tintFg } = useTheme()
  const ex = store.findEx(s.srUid)
  const title = ex ? store.exName(ex.lib) : 'Exercise'
  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const

  return (
    <SheetShell closing={s.srClosing} onClose={() => store.closeSr()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>Sets and reps for this routine.</div>

      <div style={{ marginTop: 16, ...label }}>SETS</div>
      <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="pr92" onClick={() => store.setState({ srSets: Math.max(1, s.srSets - 1) })} style={{ width: 46, height: 46, borderRadius: 15, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: tint(75), transition: 'transform 0.15s' }}>−</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700 }}>{s.srSets}</div>
        <div className="pr92" onClick={() => store.setState({ srSets: Math.min(8, s.srSets + 1) })} style={{ width: 46, height: 46, borderRadius: 15, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: tint(75), transition: 'transform 0.15s' }}>+</div>
      </div>

      <div style={{ marginTop: 16, ...label }}>REPS</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
        {REP_OPTIONS.map(rp => {
          const on = s.srReps === rp
          return (
            <div key={rp} className="pr94" onClick={() => store.setState({ srReps: rp })} style={{ height: 42, padding: '0 16px', borderRadius: 13, background: on ? C.a : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: on ? C.aOn : tintFg(0.6), boxSizing: 'border-box', transition: 'all 0.2s' }}>{rp}</div>
          )
        })}
      </div>

      <div className="pr97" onClick={() => store.saveSr()} style={{ marginTop: 18, height: 52, borderRadius: 16, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'transform 0.15s' }}>Save</div>
    </SheetShell>
  )
}
