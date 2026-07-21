import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, overline, screenPane } from '../lib/ui'
import { libOf } from '../lib/library'
import { gifFor } from '../lib/exerciseGifs'
import { BackChevron } from '../components/icons'
import { ImageSlot } from '../components/ImageSlot'
import { SetMarkers } from '../components/SetMarkers'
import type { RoutineExercise } from '../lib/types'

export function ExerciseDetail({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { C, T, themeIsDark, tintFg, tintOf } = useTheme()

  const today = store.todayRoutine()
  const ex: RoutineExercise = store.findEx(s.exOpen)
    || today?.exs[0]
    || { uid: 'x', lib: 'bench', sets: 4, reps: '8', lastW: null, hist: [] }
  const L = libOf(ex.lib)

  const rSess = s.routines.find(r => r.id === s.sessRid) || today
  const exInSess = s.sessOn && !!rSess && rSess.exs.some(e => e.uid === ex.uid)
  const exW = store.wOf(ex.uid)

  // progression series: history + last logged + live session weight
  const ser = (ex.hist || []).slice()
  if (ex.lastW != null) ser.push(ex.lastW)
  if (exInSess && L.step > 0 && exW != null) ser.push(exW)

  const wArr = (() => {
    const v = s.sessW[ex.uid]
    if (Array.isArray(v)) return v
    return Array.from({ length: ex.sets }, () => (typeof v === 'number' ? v : 20))
  })()
  const setsDone = s.sessSets[ex.uid] || 0

  const chartOn = ser.length >= 2
  let chartPts = ''
  let chartDots: { cx: number; cy: number; r: number; fill: string; stroke: string }[] = []
  let chartLabels: { w: string; wc: string; t: string }[] = []
  let deltaLine = ''
  if (chartOn) {
    const lo = Math.min(...ser), hi = Math.max(...ser)
    const span = Math.max(1, hi - lo)
    const xs = ser.map((_, j) => 18 + j * (284 / (ser.length - 1)))
    const ys = ser.map(w => 78 - ((w - lo) / span) * 58)
    chartPts = ser.map((_, j) => (Math.round(xs[j] * 10) / 10) + ',' + (Math.round(ys[j] * 10) / 10)).join(' ')
    chartDots = ser.map((_, j) => ({ cx: xs[j], cy: ys[j], r: j === ser.length - 1 ? 5 : 3.5, fill: j === ser.length - 1 ? C.a : T.dim, stroke: j === ser.length - 1 ? C.aTint : 'none' }))
    chartLabels = ser.map((w, j) => ({ w: w + '', wc: j === ser.length - 1 ? (themeIsDark ? C.aHi : C.a) : tintFg(0.75), t: j === ser.length - 1 ? 'NOW' : 'S' + (j + 1) }))
    const diff = Math.round((ser[ser.length - 1] - ser[0]) * 10) / 10
    deltaLine = (diff >= 0 ? '+' : '') + diff + ' kg · ' + ser.length + ' sessions'
  }

  const muscles = (L.pri || []).map(l => ({ label: l, bg: tintOf(C.a, themeIsDark ? 0.16 : 0.12), tc: themeIsDark ? C.aHi : C.a }))
    .concat((L.sec || []).map(l => ({ label: l, bg: tintFg(0.07), tc: tintFg(0.6) })))

  return (
    <div style={screenPane(z, anim)}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div className="pr92" onClick={() => store.go(s.exFrom || 'detail')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BackChevron />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.name}</div>
          <div style={{ fontSize: 12, color: tint(45), marginTop: 1 }}>{L.eq} · {L.mus}</div>
        </div>
      </div>

      {/* demo media */}
      <div style={{ marginTop: 16, height: 210, borderRadius: 22, overflow: 'hidden', background: 'var(--color-surface)', border: `1px solid ${tint(8)}` }}>
        <ImageSlot id={'fx-' + ex.lib} placeholder="Drop a demo GIF of the movement" fallbackSrc={gifFor(ex.lib)} />
      </div>

      {/* live session panel */}
      {exInSess && (
        <div style={{ marginTop: 14, background: 'var(--color-surface)', border: `1px solid ${tintOf(C.a, 0.35)}`, borderRadius: 22, padding: 16, animation: 'fgFadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: 'var(--color-accent-hi)' }}>THIS SESSION</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: tint(50) }}>{Math.min(ex.sets, setsDone)} / {ex.sets} SETS</div>
          </div>
          <SetMarkers ex={ex} hero={false} />
          {L.step > 0 ? (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wArr.map((w, i) => {
                const done = i < setsDone
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, background: done ? tintOf(C.a, themeIsDark ? 0.12 : 0.09) : tintFg(0.04), border: `1px solid ${done ? tintOf(C.a, 0.3) : tintFg(0.09)}`, padding: '8px 10px', boxSizing: 'border-box', transition: 'all 0.25s' }}>
                    <div style={{ width: 44, fontSize: 9.5, letterSpacing: 1, fontWeight: 700, color: done ? (themeIsDark ? C.aHi : C.a) : tintFg(0.45) }}>SET {i + 1}</div>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: T.text }}>{w} kg</div>
                    <div className="pr9" onClick={() => store.stepSetW(ex.uid, i, -1)} style={{ width: 38, height: 38, borderRadius: 12, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: tint(75), transition: 'transform 0.15s' }}>−</div>
                    <div className="pr9" onClick={() => store.stepSetW(ex.uid, i, 1)} style={{ width: 38, height: 38, borderRadius: 12, background: tint(6), border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: tint(75), transition: 'transform 0.15s' }}>+</div>
                  </div>
                )
              })}
              <div style={{ fontSize: 10.5, color: tint(38), marginTop: 2 }}>Per-set weight — the heaviest set becomes your logged weight.</div>
            </div>
          ) : (
            <div style={{ marginTop: 13, fontSize: 12, color: tint(45) }}>Bodyweight movement — no load to track. Focus on tempo and range.</div>
          )}
        </div>
      )}

      {/* info chips */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {['SETS · ' + ex.sets, 'REPS · ' + ex.reps, (L.eq || '').toUpperCase()].map(label => (
          <div key={label} style={{ background: tint(6), borderRadius: 999, padding: '7px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 0.9, color: tint(55) }}>{label}</div>
        ))}
      </div>

      {/* muscles */}
      <div style={{ marginTop: 20, ...overline() }}>MUSCLES ACTIVATED</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {muscles.map(mu => (
          <div key={mu.label} style={{ background: mu.bg, color: mu.tc, borderRadius: 999, padding: '8px 13px', fontSize: 12, fontWeight: 600 }}>{mu.label}</div>
        ))}
      </div>

      {/* progression */}
      <div style={{ marginTop: 20, background: 'var(--color-surface)', border: `1px solid ${tint(7)}`, borderRadius: 22, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Weight progression</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent-hi)' }}>{deltaLine}</div>
        </div>
        {chartOn ? (
          <div style={{ marginTop: 10 }}>
            <svg width="100%" height="88" viewBox="0 0 320 88">
              <line x1="18" y1="78" x2="302" y2="78" style={{ stroke: tint(8) }} strokeWidth="1" />
              <line x1="18" y1="46" x2="302" y2="46" style={{ stroke: tint(5) }} strokeWidth="1" />
              <line x1="18" y1="14" x2="302" y2="14" style={{ stroke: tint(5) }} strokeWidth="1" />
              <polyline points={chartPts} fill="none" style={{ stroke: 'var(--color-accent)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {chartDots.map((d, i) => (
                <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} stroke={d.stroke} strokeWidth="2" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 0' }}>
              {chartLabels.map((l, i) => (
                <div key={i} style={{ width: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: l.wc }}>{l.w}</div>
                  <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.8, color: tint(35) }}>{l.t}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, border: `1.5px dashed ${tint(15)}`, borderRadius: 16, padding: 18, textAlign: 'center', fontSize: 12.5, color: tint(45) }}>
            {L.step > 0 ? 'No weights logged yet — finish a session with this movement to start the chart.' : 'Bodyweight movement — nothing to chart.'}
          </div>
        )}
      </div>
    </div>
  )
}
