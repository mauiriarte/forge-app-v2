import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, mix, overline, screenPane } from '../lib/ui'
import { DAYFULL, MO3, pad } from '../lib/dates'
import { Check, Chevron, Dots, Play } from '../components/icons'
import { computeConsistency } from '../lib/consistency'
import { displayInitials, displayName } from '../lib/identity'

export function Home({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { C, T, tintFg } = useTheme()

  const firstName = displayName(s).split(' ')[0]
  const initials = displayInitials(s)
  const { streak } = computeConsistency(s)
  const now = new Date()
  const hr = now.getHours()
  const base = hr < 12 ? 'Morning' : hr < 18 ? 'Afternoon' : 'Evening'
  const greeting = firstName ? base + ', ' + firstName : base
  const dateLine = DAYFULL[now.getDay()].toUpperCase() + ' · ' + MO3[now.getMonth()] + ' ' + now.getDate()

  const today = store.todayRoutine()
  const hasRoutines = s.routines.length > 0
  const heroDone = hasRoutines && s.trainedToday && !s.sessOn
  const heroTodo = hasRoutines && !(s.trainedToday && !s.sessOn)
  const woTimer = pad(Math.floor(s.sessElapsed / 60)) + ':' + pad(s.sessElapsed % 60)

  const hydFull = s.water >= s.waterGoal
  const hydNudgeOn = !hydFull && hr >= 11 && s.water < Math.ceil(s.waterGoal * Math.min(1, Math.max(0, (hr - 8) / 12)))

  return (
    <div style={screenPane(z, anim)}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          className="pr94"
          onClick={() => store.go('profile')}
          style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}
        >{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.6, color: tint(38), fontWeight: 600 }}>{dateLine}</div>
          <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, marginTop: 1 }}>{greeting}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, borderRadius: 999, padding: '9px 13px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', animation: 'fgPulse 2.4s ease-in-out infinite' }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{streak}</span>
          <span style={{ fontSize: 9, letterSpacing: 1, color: tint(45), fontWeight: 600 }}>{streak === 1 ? 'DAY' : 'DAYS'}</span>
        </div>
      </div>

      <div style={{ marginTop: 24, ...overline() }}>TODAY · {DAYFULL[now.getDay()].toUpperCase()}</div>

      {/* empty state */}
      {!hasRoutines && (
        <div style={{ marginTop: 12, borderRadius: 28, background: 'var(--color-surface)', border: `1.5px dashed ${tint(18)}`, padding: 22, boxSizing: 'border-box' }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>No routines yet</div>
          <div style={{ fontSize: 12.5, color: tint(45), marginTop: 5, lineHeight: 1.5 }}>Build your first routine and it will show up here, ready to start on its day.</div>
          <div className="pr97" onClick={() => store.openNr()} style={{ marginTop: 16, height: 52, borderRadius: 16, background: 'var(--color-accent)', color: 'var(--color-accent-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14.5, fontWeight: 600, transition: 'transform 0.15s' }}>+ Create your first routine</div>
        </div>
      )}

      {/* done-today hero */}
      {heroDone && today && (
        <div className="pr98" onClick={() => store.openRoutine(today.id)} style={{ marginTop: 12, borderRadius: 28, background: 'var(--color-surface)', border: `1px solid ${mix('var(--color-accent)', 35)}`, padding: 20, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'fgPop 0.45s cubic-bezier(0.2,0.8,0.2,1) both' }}>
              <Check w={17} h={14} color="var(--color-accent-on)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: 'var(--color-accent-hi)' }}>WORKOUT COMPLETE</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.7, marginTop: 2 }}>{today.name}</div>
              <div style={{ fontSize: 12, color: tint(45), marginTop: 2 }}>{s.lastSessMins || 0} min logged · weights saved</div>
            </div>
            <Chevron opacity={30} />
          </div>
          <div className="pr97" onClick={(e) => { e.stopPropagation(); store.startSession(today.id) }} style={{ marginTop: 14, height: 46, borderRadius: 14, border: `1px solid ${tint(14)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, color: tint(65), boxSizing: 'border-box', transition: 'transform 0.15s' }}>Train again</div>
        </div>
      )}

      {/* today's-workout hero */}
      {heroTodo && today && (
        <div className="pr98" onClick={() => store.openRoutine(today.id)} style={{ marginTop: 12, borderRadius: 28, background: 'var(--color-accent)', padding: 20, transition: 'transform 0.15s' }}>
          <div style={{ fontSize: 10, letterSpacing: 1.6, fontWeight: 700, color: mix('var(--color-accent-on)', 70) }}>{today.focus.toUpperCase()}</div>
          <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.9, color: 'var(--color-accent-on)', marginTop: 5 }}>{today.name}</div>
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

      {/* hydration */}
      <div style={{ marginTop: 14, background: 'var(--color-surface)', border: `1px solid ${tint(8)}`, borderRadius: 26, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>Hydration</div>
          </div>
          <div className="pr9" onClick={() => store.openHydra()} style={{ width: 36, height: 36, borderRadius: '50%', background: tint(7), border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s' }}>
            <Dots />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, color: 'var(--color-cool-lt)' }}>{(s.water * s.waterSize).toLocaleString('en-US')}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: tint(45) }}>/ {(s.waterGoal * s.waterSize).toLocaleString('en-US')} ml</span>
        </div>
        <div style={{ fontSize: 11.5, color: tint(42), marginTop: 2 }}>{s.water} of {s.waterGoal} glasses · {s.waterSize} ml each</div>
        {hydNudgeOn && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 9, background: mix('var(--color-cool)', 14), borderRadius: 999, padding: '6px 11px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-cool-lt)', animation: 'fgPulse 2s ease-in-out infinite' }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-cool-lt)' }}>A bit behind pace — time for a glass</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
          {Array.from({ length: s.waterGoal }, (_, i) => {
            const on = i < s.water
            return (
              <div
                key={i}
                className="pr9"
                onClick={() => store.setWaterTo(i + 1 === s.water ? i : i + 1)}
                style={{ flex: 1, height: 44, borderRadius: 12, background: on ? C.b : tintFg(0.07), border: `1px solid ${on ? 'transparent' : tintFg(0.14)}`, boxSizing: 'border-box', transition: 'all 0.25s' }}
              />
            )
          })}
        </div>
        <div className="pr97" onClick={() => store.setWaterTo(s.water + 1)} style={{ marginTop: 12, height: 48, borderRadius: 15, background: 'var(--color-cool)', color: 'var(--color-cool-on)', opacity: hydFull ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
          {hydFull ? 'Goal reached' : '+ Add glass'}
        </div>
      </div>
    </div>
  )
}
