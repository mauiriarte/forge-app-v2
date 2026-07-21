import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, overline, screenPane } from '../lib/ui'
import { computeConsistency } from '../lib/consistency'
import { BODY_METRICS, fmtM, metricsWithData, seriesOf } from '../lib/bodyMetrics'
import { MO3 } from '../lib/dates'
import type { Measurement, Timeline } from '../lib/types'

const WINDOWS: { k: Timeline; label: string; ms: number }[] = [
  { k: 'w', label: 'Week', ms: 7 * 864e5 },
  { k: 'm', label: 'Month', ms: 31 * 864e5 },
  { k: 'y', label: 'Year', ms: 366 * 864e5 },
]

const dLabel = (t: number) => { const d = new Date(t); return MO3[d.getMonth()] + ' ' + d.getDate() }

export function Stats({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { C, T, themeIsDark, tintFg, tintOf } = useTheme()

  const { weeks, streak } = computeConsistency(s)
  const withData = metricsWithData(s.measurements)
  const hasAny = withData.length > 0
  const win = WINDOWS.find(w => w.k === s.timeline) || WINDOWS[2]
  const now = Date.now()
  const from = now - win.ms

  const inWindow = (ser: Measurement[]) => {
    const w = ser.filter(e => e.t >= from)
    // keep the last point before the window so a sparse series still draws
    if (w.length < 2) {
      const before = ser.filter(e => e.t < from)
      if (before.length) return [before[before.length - 1], ...w]
    }
    return w.slice(-24)
  }

  // ≤2 real (non-derived) tracked metrics → one chart, one line per measurement.
  // More → the tile-selected metric drives a single-line chart.
  const realMetrics = withData.filter(m => m.k !== 'bmi')
  const multiMode = realMetrics.length > 0 && realMetrics.length <= 2
  const chartDefs = multiMode
    ? realMetrics
    : [withData.find(m => m.k === s.bodyMetric) || withData[0] || BODY_METRICS[0]]
  const chartSeries = chartDefs.map(def => ({ def, pts: inWindow(seriesOf(s.measurements, def.k)) }))
    .filter(x => x.pts.length > 0)

  const lineColors = [C.a, C.b]
  const chW = 330, chH = 118, padX = 16, padT = 14, padB = 14
  const tSpan = Math.max(1, now - Math.min(from, ...chartSeries.flatMap(x => x.pts.map(p => p.t))))
  const t0 = now - tSpan
  const geom = chartSeries.map(({ def, pts }, si) => {
    const vals = pts.map(p => p.v)
    const lo = Math.min(...vals), hi = Math.max(...vals)
    const span = (hi - lo) || Math.max(1, Math.abs(hi) * 0.05)
    const xs = pts.map(p => padX + ((p.t - t0) / tSpan) * (chW - 2 * padX))
    const ys = pts.map(p => padT + (1 - (p.v - lo) / span) * (chH - padT - padB))
    return { def, pts, xs, ys, color: lineColors[si % 2] }
  })

  const single = !multiMode && geom.length === 1 ? geom[0] : null
  const selDef = single ? single.def : chartDefs[0] || BODY_METRICS[0]
  const selSer = single ? single.pts : []
  const bCur = selSer.length ? selSer[selSer.length - 1].v : null
  const bPrev = selSer.length > 1 ? selSer[selSer.length - 2].v : bCur
  const bDelta = bCur != null && bPrev != null ? bCur - bPrev : 0
  const bBetter = selDef.down ? bDelta < 0 : bDelta > 0
  const fmtDelta = (d: number, dec: number) => (d > 0 ? '+' : d < 0 ? '−' : '±') + fmtM(Math.abs(d), dec)

  const hasBand = single != null && selDef.lo != null && bCur != null
  const bandPct = (v: number) => Math.max(0, Math.min(100, (v - (selDef.min || 0)) / ((selDef.max || 1) - (selDef.min || 0)) * 100))
  const inIdeal = hasBand && bCur! >= selDef.lo! && bCur! <= selDef.hi!
  const bodyStatus = !hasBand ? '' : inIdeal ? 'In the ideal range'
    : bCur! > selDef.hi! ? fmtM(bCur! - selDef.hi!, selDef.dec) + (selDef.unit ? ' ' + selDef.unit : '') + ' over ideal'
    : fmtM(selDef.lo! - bCur!, selDef.dec) + (selDef.unit ? ' ' + selDef.unit : '') + ' under ideal'

  const lastEntry = s.measurements.length ? s.measurements.reduce((a, b) => (b.t > a.t ? b : a)) : null

  const buttonRow = (
    <div style={{ marginTop: 12, display: 'flex', gap: 9 }}>
      <div className="pr97" onClick={() => store.openScan()} style={{ flex: 1, height: 50, borderRadius: 16, background: 'var(--color-accent)', color: 'var(--color-accent-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, transition: 'transform 0.15s' }}>Upload scan · PDF</div>
      <div className="pr97" onClick={() => store.openMs()} style={{ flex: 1, height: 50, borderRadius: 16, border: `1px solid ${tint(14)}`, color: tint(70), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, boxSizing: 'border-box', transition: 'transform 0.15s' }}>+ Add measurement</div>
    </div>
  )

  return (
    <div style={screenPane(z, anim)}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>Stats</div>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: tint(42), fontWeight: 700 }}>BODY</div>
      </div>

      {/* consistency counters */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="pr97" onClick={() => store.openCal()} style={{ background: 'var(--color-surface)', border: `1px solid ${tintOf(C.a, 0.3)}`, borderRadius: 20, padding: 14, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)' }} />
            <div style={{ fontSize: 9.5, letterSpacing: 1.2, fontWeight: 700, color: tint(45) }}>COMPLETE WEEKS</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginTop: 7 }}>{weeks}</div>
          <div style={{ fontSize: 9.5, letterSpacing: 0.8, fontWeight: 700, color: 'var(--color-accent-hi)', marginTop: 3 }}>GOAL {s.weeklyGoal}×/WK</div>
        </div>
        <div className="pr97" onClick={() => store.openCal()} style={{ background: 'var(--color-surface)', border: `1px solid ${tintOf(C.b, 0.3)}`, borderRadius: 20, padding: 14, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-cool)' }} />
            <div style={{ fontSize: 9.5, letterSpacing: 1.2, fontWeight: 700, color: tint(45) }}>HYDRATION STREAK</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginTop: 7 }}>{streak}</div>
          <div style={{ fontSize: 9.5, letterSpacing: 0.8, fontWeight: 700, color: 'var(--color-cool-lt)', marginTop: 3 }}>{streak === 1 ? 'DAY' : 'DAYS'}</div>
        </div>
      </div>

      {/* timeline selector */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, maxWidth: 240 }}>
          {WINDOWS.map(w => {
            const on = s.timeline === w.k
            return (
              <div key={w.k} className="pr96" onClick={() => store.setState({ timeline: w.k })} style={{ flex: 1, height: 36, borderRadius: 12, background: on ? T.p : tintFg(0.06), border: `1px solid ${on ? 'transparent' : tintFg(0.12)}`, color: on ? T.pOn : tintFg(0.55), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, boxSizing: 'border-box', transition: 'all 0.2s' }}>{w.label}</div>
            )
          })}
        </div>
        {lastEntry && (
          <div style={{ fontSize: 9.5, letterSpacing: 1, fontWeight: 700, color: tint(40), flexShrink: 0 }}>LAST · {dLabel(lastEntry.t).toUpperCase()}</div>
        )}
      </div>

      {/* chart card */}
      {!hasAny ? (
        <div>
          <div style={{ marginTop: 12, borderRadius: 26, background: 'var(--color-surface)', border: `1.5px dashed ${tint(18)}`, padding: 22, boxSizing: 'border-box', textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>No measurements yet</div>
            <div style={{ fontSize: 12.5, color: tint(45), marginTop: 5, lineHeight: 1.5 }}>Log your weight or upload a body scan — your progress charts start here.</div>
          </div>
          {buttonRow}
        </div>
      ) : (
        <div>
          <div style={{ marginTop: 12, background: 'var(--color-surface)', border: `1px solid ${tint(7)}`, borderRadius: 26, padding: 18 }}>
            {single && bCur != null ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: tint(50) }}>{selDef.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                    <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.2 }}>{fmtM(bCur, selDef.dec)}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tint(45) }}>{selDef.unit}</div>
                  </div>
                </div>
                <div style={{ background: bBetter ? tintOf(C.a, 0.16) : tintFg(0.08), color: bBetter ? (themeIsDark ? C.aHi : C.a) : tintFg(0.6), borderRadius: 999, padding: '6px 11px', fontSize: 11.5, fontWeight: 700 }}>
                  {fmtDelta(bDelta, selDef.dec)}{selDef.unit ? ' ' + selDef.unit : ''}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {geom.map(g => {
                  const cur = g.pts[g.pts.length - 1]
                  return (
                    <div key={g.def.k} style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 3, background: g.color, alignSelf: 'center' }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: tint(50) }}>{g.def.name}</div>
                      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.5 }}>{fmtM(cur.v, g.def.dec)}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: tint(45) }}>{g.def.unit}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {geom.length > 0 ? (
              <div>
                <div style={{ position: 'relative', marginTop: 10, height: 118 }}>
                  <svg width="100%" height="118" viewBox={`0 0 ${chW} ${chH}`} preserveAspectRatio="none" style={{ display: 'block', position: 'absolute', inset: 0 }}>
                    <line x1={padX} y1={chH - padB} x2={chW - padX} y2={chH - padB} style={{ stroke: tint(8) }} strokeWidth="1" />
                    <line x1={padX} y1={chH / 2} x2={chW - padX} y2={chH / 2} style={{ stroke: tint(5) }} strokeWidth="1" />
                    <line x1={padX} y1={padT} x2={chW - padX} y2={padT} style={{ stroke: tint(5) }} strokeWidth="1" />
                    {geom.map(g => (
                      <polyline key={g.def.k} points={g.pts.map((_, i) => (Math.round(g.xs[i] * 10) / 10) + ',' + (Math.round(g.ys[i] * 10) / 10)).join(' ')} fill="none" style={{ stroke: g.color }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    ))}
                  </svg>
                  {geom.map(g => g.pts.map((_, i) => {
                    const isLast = i === g.pts.length - 1
                    return (
                      <div key={g.def.k + i} style={{ position: 'absolute', left: (g.xs[i] / chW * 100).toFixed(2) + '%', top: (g.ys[i] / chH * 100).toFixed(2) + '%', transform: 'translate(-50%,-50%)', width: isLast ? 11 : 9, height: isLast ? 11 : 9, borderRadius: '50%', background: isLast ? g.color : T.dim, border: `2.5px solid ${T.s1}`, boxShadow: `0 0 0 1.5px ${isLast ? tintOf(g.color, 0.35) : 'transparent'}` }} />
                    )
                  }))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 8.5, letterSpacing: 0.8, fontWeight: 700, color: tint(38) }}>
                  <div>{dLabel(t0).toUpperCase()}</div>
                  <div>{win.label.toUpperCase()}</div>
                  <div>NOW</div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12, border: `1.5px dashed ${tint(15)}`, borderRadius: 16, padding: 18, textAlign: 'center', fontSize: 12.5, color: tint(45) }}>
                No entries in this period — switch the timeline or log a new one.
              </div>
            )}

            {hasBand && (
              <div style={{ marginTop: 15 }}>
                <div style={{ position: 'relative', height: 8, borderRadius: 99, background: tint(8) }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: bandPct(selDef.lo!) + '%', width: (bandPct(selDef.hi!) - bandPct(selDef.lo!)) + '%', borderRadius: 99, background: tintOf(C.a, 0.3) }} />
                  <div style={{ position: 'absolute', top: '50%', left: bandPct(bCur!) + '%', transform: 'translate(-50%,-50%)', width: 15, height: 15, borderRadius: '50%', background: inIdeal ? C.a : T.text, border: `3px solid ${T.s1}` }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 7, fontSize: 9.5, letterSpacing: 0.6, fontWeight: 700, color: tint(38) }}>
                  <div>LOW · {selDef.lo}</div>
                  <div style={{ fontSize: 11, color: inIdeal ? (themeIsDark ? C.aHi : C.a) : tintFg(0.55), letterSpacing: 0.2 }}>{bodyStatus}</div>
                  <div>{selDef.hi} · HIGH</div>
                </div>
              </div>
            )}
          </div>
          {buttonRow}
        </div>
      )}

      {/* metric tiles — only metrics with data */}
      {withData.length > 2 && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {withData.map(m => {
            const ser = seriesOf(s.measurements, m.k)
            const c2 = ser[ser.length - 1].v
            const p2 = ser.length > 1 ? ser[ser.length - 2].v : c2
            const d2 = c2 - p2, bet = m.down ? d2 < 0 : d2 > 0
            const on = m.k === selDef.k
            const subC = on ? tintOf(T.pOn, 0.55) : tintFg(0.5)
            return (
              <div key={m.k} className="pr97" onClick={() => store.setState({ bodyMetric: m.k })} style={{ background: on ? T.p : T.s1, border: `1px solid ${on ? 'transparent' : tintFg(0.07)}`, color: on ? T.pOn : T.text, borderRadius: 18, padding: '13px 14px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: subC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: bet ? C.a : (on ? tintOf(T.pOn, 0.55) : tintFg(0.45)), flexShrink: 0 }}>
                    {(d2 > 0 ? '▲ ' : d2 < 0 ? '▼ ' : '· ') + fmtM(Math.abs(d2), m.dec)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                  <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.6 }}>{fmtM(c2, m.dec)}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: subC }}>{m.unit}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* recent workouts — only when there is history */}
      {s.sessions.length > 0 && (
        <div>
          <div style={{ marginTop: 22, ...overline() }}>RECENT WORKOUTS</div>
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {s.sessions.map((h, i) => (
              <div key={i} style={{ background: 'var(--color-surface)', border: `1px solid ${tint(7)}`, borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{h.dNum}</div>
                  <div style={{ fontSize: 8.5, letterSpacing: 1, fontWeight: 700, color: tint(40) }}>{h.dMon}</div>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: tint(9) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{h.name}</div>
                  <div style={{ fontSize: 11.5, color: tint(42), marginTop: 2 }}>{h.mins} min · {h.sets} sets</div>
                </div>
                {h.pr && (
                  <div style={{ background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)', color: 'var(--color-accent-hi)', borderRadius: 999, padding: '5px 9px', fontSize: 8.5, fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>PR · {h.pr.toUpperCase()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
