import { useStore } from '../store/store'
import { tint, mix } from '../lib/ui'
import { LIB } from '../lib/library'
import { SheetShell } from '../components/SheetShell'

export function ExercisePickerSheet() {
  const { store, state: s } = useStore()
  const sh = s.exSheet
  const today = store.todayRoutine()
  const rOpen = s.routines.find(r => r.id === (s.routineOpen || today?.id)) || today
  if (!sh || !rOpen) return null

  const replTarget = sh.mode === 'replace' ? rOpen.exs.find(e => e.uid === sh.uid) : null
  const inRoutine: Record<string, boolean> = {}
  rOpen.exs.forEach(e => { inRoutine[e.lib] = true })
  const list = Object.keys(LIB).filter(k => !inRoutine[k]).map(k => ({ k, L: LIB[k] }))
    .sort((a, b) => {
      const am = a.L.mus === rOpen.mus ? 0 : 1, bm = b.L.mus === rOpen.mus ? 0 : 1
      return am !== bm ? am - bm : a.L.name.localeCompare(b.L.name)
    })

  return (
    <SheetShell closing={s.exSheetClosing} onClose={() => store.closeExSheet()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>
        {sh.mode === 'replace' ? 'Replace ' + (replTarget ? store.exName(replTarget.lib) : 'exercise') : 'Add exercise'}
      </div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>
        {sh.mode === 'replace' ? 'The new movement starts with fresh tracking.' : 'Pick a movement for ' + rOpen.name + '.'}
      </div>
      <div style={{ marginTop: 14, maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {list.map(({ k, L }) => (
          <div key={k} className="pr98" onClick={() => store.pickEx(k)} style={{ background: tint(5), border: `1px solid ${tint(8)}`, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{L.name}</div>
              <div style={{ fontSize: 11.5, color: tint(42), marginTop: 2 }}>{L.sets} × {L.reps} · {L.eq}</div>
            </div>
            <div style={{ background: tint(7), borderRadius: 999, padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: 1, color: tint(55), flexShrink: 0 }}>{L.mus.toUpperCase()}</div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: mix('var(--color-accent)', 16), color: 'var(--color-accent-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, flexShrink: 0 }}>+</div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ border: `1.5px dashed ${tint(15)}`, borderRadius: 16, padding: 18, textAlign: 'center', fontSize: 12.5, color: tint(45) }}>Every movement in the library is already in this routine.</div>
        )}
      </div>
    </SheetShell>
  )
}
