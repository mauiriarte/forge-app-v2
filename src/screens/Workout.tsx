import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, mix, overline, screenPane } from '../lib/ui'
import { pad } from '../lib/dates'
import { libOf } from '../lib/library'
import { BackChevron, Check, Chevron, Swap } from '../components/icons'
import { SetMarkers } from '../components/SetMarkers'

export function Workout({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { T } = useTheme()

  const today = store.todayRoutine()
  const rSess = s.routines.find(r => r.id === s.sessRid) || today
  const exsBase = rSess ? rSess.exs : []
  const ordIdx: Record<string, number> = {}
  ;(s.sessOrder || []).forEach((u, i) => { ordIdx[u] = i })
  const exsAll = s.sessOn && (s.sessOrder || []).length
    ? exsBase.slice().sort((a, b) => ((ordIdx[a.uid] ?? 99) - (ordIdx[b.uid] ?? 99)))
    : exsBase
  const doneExs = exsAll.filter(e => (s.sessSets[e.uid] || 0) >= e.sets)
  const undoneExs = exsAll.filter(e => (s.sessSets[e.uid] || 0) < e.sets)
  const curEx = undoneExs[0] || null
  const upNext = undoneExs.slice(1)
  const totSets = exsAll.reduce((a, e) => a + e.sets, 0)
  const doneSetsN = exsAll.reduce((a, e) => a + Math.min(e.sets, s.sessSets[e.uid] || 0), 0)
  const woTimer = pad(Math.floor(s.sessElapsed / 60)) + ':' + pad(s.sessElapsed % 60)
  const anyLogged = doneSetsN > 0
  const curLib = curEx ? libOf(curEx.lib) : null

  // rest timer
  const restLeftS = s.sessOn && s.restEnd > Date.now() ? Math.ceil((s.restEnd - Date.now()) / 1000) : 0
  const restOn = restLeftS > 0 && !!curEx
  const restFrac = restOn
    ? restLeftS / Math.max(1, s.restTotal + (s.restEnd - Date.now() > s.restTotal * 1000 ? Math.ceil(((s.restEnd - Date.now()) / 1000 - s.restTotal) / 30) * 30 : 0))
    : 0
  const restDash = (138.2 * (1 - Math.max(0, Math.min(1, restFrac)))).toFixed(1)

  return (
    <div style={screenPane(z, anim)}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div className="pr92" onClick={() => store.go('home')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BackChevron />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: 'var(--color-accent-hi)' }}>ACTIVE WORKOUT</div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.6, marginTop: 1 }}>{rSess?.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, borderRadius: 999, padding: '9px 13px', flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', animation: 'fgPulse 1.4s ease-in-out infinite' }} />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>{woTimer}</span>
        </div>
      </div>

      {/* progress */}
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: tint(9), overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'var(--color-accent)', width: Math.round(doneSetsN / Math.max(1, totSets) * 100) + '%', transition: 'width 0.5s cubic-bezier(0.2,0.8,0.2,1)' }} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: tint(50) }}>{doneSetsN} / {totSets} SETS</div>
      </div>

      {/* rest timer */}
      {restOn && curEx && curLib && (
        <div style={{ marginTop: 16, borderRadius: 22, background: 'var(--color-surface)', border: `1px solid ${mix('var(--color-cool)', 40)}`, padding: 16, display: 'flex', alignItems: 'center', gap: 14, animation: 'fgFadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="26" cy="26" r="22" fill="none" style={{ stroke: tint(10) }} strokeWidth="4" />
              <circle cx="26" cy="26" r="22" fill="none" style={{ stroke: 'var(--color-cool)' }} strokeWidth="4" strokeLinecap="round" strokeDasharray="138.2" strokeDashoffset={restDash} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--color-cool-lt)' }}>{restLeftS}s</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: 'var(--color-cool-lt)' }}>REST</div>
            <div style={{ fontSize: 12.5, color: tint(50), marginTop: 2 }}>Next: {curLib.name} · set {Math.min(curEx.sets, (s.sessSets[curEx.uid] || 0) + 1)}</div>
          </div>
          <div className="pr94" onClick={() => store.setState({ restEnd: Math.max(Date.now(), s.restEnd) + 30000 })} style={{ height: 38, padding: '0 13px', borderRadius: 12, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: tint(65), transition: 'transform 0.15s' }}>+30s</div>
          <div className="pr94" onClick={() => store.setState({ restEnd: 0 })} style={{ height: 38, padding: '0 13px', borderRadius: 12, background: 'var(--color-cool)', color: 'var(--color-cool-on)', display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 700, transition: 'transform 0.15s' }}>Skip</div>
        </div>
      )}

      {/* current-exercise hero */}
      {s.sessOn && curEx && curLib && (
        <div className="pr98" onClick={() => store.openExercise(curEx.uid, 'workout')} style={{ marginTop: 16, borderRadius: 28, background: 'var(--color-accent)', padding: 20, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.6, fontWeight: 700, color: mix('var(--color-accent-on)', 70) }}>
              CURRENT · EXERCISE {exsAll.indexOf(curEx) + 1} OF {exsAll.length}
            </div>
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" style={{ stroke: mix('var(--color-accent-on)', 60) }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: -0.8, color: 'var(--color-accent-on)', marginTop: 5 }}>{curLib.name}</div>
          <div style={{ fontSize: 13, color: mix('var(--color-accent-on)', 75), marginTop: 3 }}>
            {curEx.sets} × {curEx.reps}{curLib.step > 0 ? ' · ' + (store.wOf(curEx.uid) || 0) + ' kg' : ' · bodyweight'}
          </div>
          <SetMarkers ex={curEx} hero />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1, fontSize: 11, color: mix('var(--color-accent-on)', 60) }}>Tap a set when it's done — tap the card to adjust weight</div>
            {upNext.length > 0 && (
              <div className="pr94" onClick={(e) => { e.stopPropagation(); store.postponeEx(curEx.uid) }} style={{ height: 36, padding: '0 13px', borderRadius: 999, background: 'rgba(10,26,18,0.26)', border: `1px solid ${mix('var(--color-accent-on)', 28)}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: 'var(--color-accent-on)', flexShrink: 0, boxSizing: 'border-box', transition: 'transform 0.15s' }}>
                <Swap />
                BUSY · SKIP
              </div>
            )}
          </div>
        </div>
      )}

      {/* all-done card */}
      {s.sessOn && !curEx && (
        <div style={{ marginTop: 16, borderRadius: 28, background: T.p, color: T.pOn, padding: 22, animation: 'fgPop 0.4s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check w={16} h={13} color="var(--color-accent-on)" />
            </div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.6 }}>Workout complete</div>
              <div style={{ fontSize: 12.5, color: mix(T.pOn, 55), marginTop: 2 }}>{exsAll.length} exercises · {woTimer}</div>
            </div>
          </div>
          <div className="pr97" onClick={() => store.endSession()} style={{ marginTop: 16, height: 52, borderRadius: 16, background: 'var(--color-accent)', color: 'var(--color-accent-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, transition: 'transform 0.15s' }}>Finish &amp; log weights</div>
        </div>
      )}

      {/* up next */}
      {upNext.length > 0 && (
        <div>
          <div style={{ marginTop: 24, ...overline() }}>UP NEXT</div>
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {upNext.map(e => {
              const L = libOf(e.lib)
              return (
                <div key={e.uid} className="pr98" onClick={() => store.openExercise(e.uid, 'workout')} style={{ background: 'var(--color-surface)', border: `1px solid ${tint(8)}`, borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'transform 0.15s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{L.name}</div>
                    <div style={{ fontSize: 11.5, color: tint(42), marginTop: 2 }}>{e.sets} × {e.reps}{L.step > 0 ? ' · ' + (store.wOf(e.uid) || 0) + ' kg' : ''}</div>
                  </div>
                  <div className="pr92" onClick={(ev) => { ev.stopPropagation(); store.doNow(e.uid) }} style={{ height: 36, padding: '0 13px', borderRadius: 999, background: mix('var(--color-cool)', 16), color: 'var(--color-cool-lt)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, flexShrink: 0, transition: 'transform 0.15s' }}>
                    <Swap />
                    DO NOW
                  </div>
                  <Chevron />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* completed */}
      {doneExs.length > 0 && (
        <div>
          <div className="pr99" onClick={() => store.setState({ sessDoneOpen: !s.sessDoneOpen })} style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px' }}>
            <div style={{ flex: 1, ...overline() }}>COMPLETED · {doneExs.length}</div>
            <svg width="11" height="7" viewBox="0 0 11 7" fill="none" style={{ transform: `rotate(${s.sessDoneOpen ? '180deg' : '0deg'})`, transition: 'transform 0.25s' }}>
              <path d="M1 1l4.5 4.5L10 1" style={{ stroke: tint(45) }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {s.sessDoneOpen && (
            <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 8, animation: 'fgFadeUp 0.25s cubic-bezier(0.2,0.8,0.2,1) both' }}>
              {doneExs.map(e => {
                const L = libOf(e.lib)
                return (
                  <div key={e.uid} className="pr98" onClick={() => store.openExercise(e.uid, 'workout')} style={{ background: tint(3), border: `1px solid ${tint(7)}`, borderRadius: 16, padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Check w={13} h={11} color="var(--color-accent-hi)" strokeWidth={2.2} />
                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: tint(60) }}>{L.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: tint(40) }}>{e.sets} sets{L.step > 0 ? ' · ' + (store.wOf(e.uid) || 0) + ' kg' : ''}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* end button */}
      <div
        className="pr98"
        onClick={() => store.endSession()}
        style={{
          marginTop: 22, height: 52, borderRadius: 16,
          background: anyLogged ? T.p : 'transparent',
          border: `1px solid ${anyLogged ? 'transparent' : 'rgba(217,58,43,0.4)'}`,
          color: anyLogged ? T.pOn : 'var(--color-error-hi)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, boxSizing: 'border-box', transition: 'transform 0.15s',
        }}
      >
        {anyLogged ? 'Finish workout · log weights' : 'Discard workout'}
      </div>
    </div>
  )
}
