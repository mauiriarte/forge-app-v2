import { useStore } from '../store/store'
import { tint, mix } from '../lib/ui'
import { DAY3 } from '../lib/dates'
import { Check } from '../components/icons'
import { SheetShell } from '../components/SheetShell'

/** Change today's workout: the in-order recommendation is tagged, any routine can be picked. */
export function PickWorkoutSheet() {
  const { store, state: s } = useStore()
  const current = store.todayRoutine()
  const recommended = store.recommendedRoutine()

  return (
    <SheetShell closing={s.pwClosing} onClose={() => store.closePw()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>Today's workout</div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>The program runs in order — pick another if today calls for it.</div>
      <div style={{ marginTop: 14, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {s.routines.map(r => {
          const isCurrent = r.id === current?.id
          const isRec = r.id === recommended?.id
          return (
            <div key={r.id} className="pr98" onClick={() => store.pickToday(r.id)} style={{ background: isCurrent ? mix('var(--color-accent)', 10) : tint(5), border: `1px solid ${isCurrent ? mix('var(--color-accent)', 40) : tint(8)}`, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, transition: 'all 0.15s' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: tint(42), marginTop: 2 }}>{r.days.map(d => DAY3[d]).join(' · ')}{r.days.length ? ' — ' : ''}{r.exs.length} exercises</div>
              </div>
              {isRec && (
                <div style={{ background: mix('var(--color-accent)', 16), color: 'var(--color-accent-hi)', borderRadius: 999, padding: '5px 9px', fontSize: 8.5, fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>RECOMMENDED</div>
              )}
              {isCurrent && <Check w={14} h={12} color="var(--color-accent-hi)" strokeWidth={2.2} />}
            </div>
          )
        })}
      </div>
    </SheetShell>
  )
}
