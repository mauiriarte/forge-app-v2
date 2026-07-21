import type { RoutineExercise } from '../lib/types'
import { libOf } from '../lib/library'
import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'

/**
 * Tappable SET 1…N pills for an exercise in the active session.
 * hero=true renders on the accent hero card; false on a surface card.
 */
export function SetMarkers({ ex, hero }: { ex: RoutineExercise; hero: boolean }) {
  const { store, state } = useStore()
  const { C, T, tintFg, tintOf } = useTheme()
  const L = libOf(ex.lib)
  const done = state.sessSets[ex.uid] || 0
  return (
    <div style={{ display: 'flex', gap: 7, marginTop: hero ? 15 : 12 }}>
      {Array.from({ length: ex.sets }, (_, i) => {
        const on = i < done
        const bg = on ? (hero ? T.p : C.a) : (hero ? 'rgba(10,26,18,0.26)' : tintFg(0.05))
        const tc = on ? (hero ? T.pOn : C.aOn) : (hero ? tintOf(C.aOn, 0.8) : tintFg(0.5))
        const border = on ? 'transparent' : (hero ? tintOf(C.aOn, 0.28) : tintFg(0.12))
        return (
          <div
            key={i}
            className="pr92"
            onClick={(e) => { e.stopPropagation(); store.toggleSet(ex.uid, i, ex.sets, L.name) }}
            style={{
              flex: 1, height: 44, borderRadius: 13, background: bg, border: `1.5px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, letterSpacing: 1, color: tc,
              boxSizing: 'border-box', transition: 'all 0.25s',
            }}
          >
            SET {i + 1}
          </div>
        )
      })}
    </div>
  )
}
