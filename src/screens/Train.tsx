import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, mix, overline, screenPane } from '../lib/ui'
import { DAY3, MO3, pad } from '../lib/dates'
import { Bolt, Check, Chevron, Play, Swap } from '../components/icons'

export function Train({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { T } = useTheme()

  const now = new Date()
  const today = store.todayRoutine()
  const hasRoutines = s.routines.length > 0
  const heroDone = hasRoutines && s.trainedToday && !s.sessOn
  const heroTodo = hasRoutines && !(s.trainedToday && !s.sessOn)
  const woTimer = pad(Math.floor(s.sessElapsed / 60)) + ':' + pad(s.sessElapsed % 60)
  const rowsSorted = hasRoutines && today ? [today].concat(s.routines.filter(r => r.id !== today.id)) : []

  return (
    <div style={screenPane(z, anim)}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>Train</div>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: tint(42), fontWeight: 700 }}>
          {DAY3[now.getDay()]} · {MO3[now.getMonth()]} {now.getDate()}
        </div>
      </div>

      {!hasRoutines && (
        <div style={{ marginTop: 18, borderRadius: 28, background: 'var(--color-surface)', border: `1.5px dashed ${tint(18)}`, padding: 24, boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: mix('var(--color-accent)', 16), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Bolt color="var(--color-accent-hi)" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginTop: 14 }}>No routines yet</div>
          <div style={{ fontSize: 12.5, color: tint(45), marginTop: 5, lineHeight: 1.5 }}>A routine is a set of exercises tied to days of the week.<br />Create one and your training week takes shape.</div>
          <div className="pr97" onClick={() => store.openNr()} style={{ marginTop: 18, height: 52, borderRadius: 16, background: 'var(--color-accent)', color: 'var(--color-accent-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14.5, fontWeight: 600, transition: 'transform 0.15s' }}>+ Create your first routine</div>
        </div>
      )}

      {heroDone && today && (
        <div className="pr98" onClick={() => store.openRoutine(today.id)} style={{ marginTop: 18, borderRadius: 28, background: 'var(--color-surface)', border: `1px solid ${mix('var(--color-accent)', 35)}`, padding: 20, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'fgPop 0.45s cubic-bezier(0.2,0.8,0.2,1) both' }}>
              <Check w={16} h={13} color="var(--color-accent-on)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: 'var(--color-accent-hi)' }}>DONE FOR TODAY</div>
              <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.6, marginTop: 2 }}>{s.sessions[0]?.name || today.name}</div>
              <div style={{ fontSize: 12, color: tint(45), marginTop: 2 }}>{s.lastSessMins || 0} min logged · weights saved</div>
            </div>
            <Chevron opacity={30} />
          </div>
        </div>
      )}

      {heroTodo && today && (
        <div className="pr98" onClick={() => store.openRoutine(today.id)} style={{ marginTop: 18, borderRadius: 28, background: 'var(--color-accent)', padding: 20, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.6, fontWeight: 700, color: mix('var(--color-accent-on)', 70) }}>UP TODAY</div>
            {s.routines.length > 1 && (
              <div className="pr94" onClick={(e) => { e.stopPropagation(); store.openPw() }} style={{ height: 30, padding: '0 11px', borderRadius: 999, background: 'rgba(10,26,18,0.26)', border: `1px solid ${mix('var(--color-accent-on)', 28)}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, color: 'var(--color-accent-on)', flexShrink: 0, boxSizing: 'border-box', transition: 'transform 0.15s' }}>
                <Swap w={11} h={10} />
                CHANGE
              </div>
            )}
          </div>
          <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: -0.8, color: 'var(--color-accent-on)', marginTop: 5 }}>{today.name}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[today.exs.length + ' EXERCISES', '~' + (today.exs.length * 8) + ' MIN'].map(label => (
              <div key={label} style={{ background: 'rgba(10,26,18,0.26)', borderRadius: 999, padding: '6px 11px', fontSize: 10, fontWeight: 700, letterSpacing: 0.9, color: mix('var(--color-accent-on)', 88) }}>{label}</div>
            ))}
          </div>
          <div className="pr97" onClick={(e) => { e.stopPropagation(); store.startSession(today.id) }} style={{ marginTop: 16, height: 54, borderRadius: 17, background: T.p, color: T.pOn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15.5, fontWeight: 600, transition: 'transform 0.15s' }}>
            <Play color={T.pOn} />
            {s.sessOn ? 'Resume workout · ' + woTimer : 'Start workout'}
          </div>
        </div>
      )}

      {hasRoutines && (
        <div>
          <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={overline()}>ALL ROUTINES</div>
            <div className="pr95" onClick={() => store.openNr()} style={{ background: tint(7), border: `1px solid ${tint(12)}`, borderRadius: 999, padding: '7px 13px', fontSize: 11.5, fontWeight: 600, color: tint(70), transition: 'transform 0.15s' }}>+ New</div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rowsSorted.map(r => (
              <div key={r.id} className="pr98" onClick={() => store.openRoutine(r.id)} style={{ background: 'var(--color-surface)', border: `1px solid ${tint(8)}`, borderRadius: 20, padding: 16, display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.15s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: tint(42), marginTop: 3 }}>{r.days.map(d => DAY3[d]).join(' · ')} — {r.exs.length} exercises</div>
                </div>
                {r.id === today?.id && (
                  <div style={{ background: mix('var(--color-accent)', 16), color: 'var(--color-accent-hi)', borderRadius: 999, padding: '6px 10px', fontSize: 9, fontWeight: 700, letterSpacing: 1.2, flexShrink: 0 }}>TODAY</div>
                )}
                <Chevron />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
