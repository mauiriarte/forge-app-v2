import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, overline, screenPane } from '../lib/ui'
import { computeConsistency } from '../lib/consistency'
import { BODY_METRICS, SEG_DATA, fmtM, mVal } from '../lib/bodyMetrics'

export function Stats({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { C, T, themeIsDark, tintFg, tintOf } = useTheme()

  const { weeks, streak } = computeConsistency(store, s)

  // ── selected body metric ──
  const bodySel = BODY_METRICS.find(m => m.k === s.bodyMetric) || BODY_METRICS[0]
  const scansShown = s.scans.slice(-6)
  const bSeries = scansShown.map(sc => mVal(sc, bodySel.k))
  const bCur = bSeries[bSeries.length - 1]
  const bPrev = bSeries.length > 1 ? bSeries[bSeries.length - 2] : bCur
  const bDelta = bCur - bPrev
  const bBetter = bodySel.down ? bDelta < 0 : bDelta > 0
  const fmtDelta = (d: number, dec: number) => (d > 0 ? '+' : d < 0 ? '−' : '±') + fmtM(Math.abs(d), dec)

  const chW = 330, chH = 118, padX = 16, padT = 14, padB = 14
  const bMin = Math.min(...bSeries), bMax = Math.max(...bSeries)
  const bSpan = (bMax - bMin) || 1
  const bXs = bSeries.map((_, i) => padX + (bSeries.length === 1 ? (chW - 2 * padX) / 2 : i * (chW - 2 * padX) / (bSeries.length - 1)))
  const bYs = bSeries.map(v => padT + (1 - (v - bMin) / bSpan) * (chH - padT - padB))
  const bodyPoly = bSeries.map((_, i) => (Math.round(bXs[i] * 10) / 10) + ',' + (Math.round(bYs[i] * 10) / 10)).join(' ')

  const hasBand = bodySel.lo != null
  const bandPct = (v: number) => Math.max(0, Math.min(100, (v - (bodySel.min || 0)) / ((bodySel.max || 1) - (bodySel.min || 0)) * 100))
  const inIdeal = hasBand && bCur >= bodySel.lo! && bCur <= bodySel.hi!
  const bodyStatus = !hasBand ? '' : inIdeal ? 'In the ideal range'
    : bCur > bodySel.hi! ? fmtM(bCur - bodySel.hi!, bodySel.dec) + (bodySel.unit ? ' ' + bodySel.unit : '') + ' over ideal'
    : fmtM(bodySel.lo! - bCur, bodySel.dec) + (bodySel.unit ? ' ' + bodySel.unit : '') + ' under ideal'

  const lastScan = s.scans[s.scans.length - 1]

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
          <div style={{ fontSize: 9.5, letterSpacing: 0.8, fontWeight: 700, color: 'var(--color-accent-hi)', marginTop: 3 }}>GOAL {s.weeklyGoal}×/WK · +{weeks * 150} XP</div>
        </div>
        <div className="pr97" onClick={() => store.openCal()} style={{ background: 'var(--color-surface)', border: `1px solid ${tintOf(C.b, 0.3)}`, borderRadius: 20, padding: 14, transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-cool)' }} />
            <div style={{ fontSize: 9.5, letterSpacing: 1.2, fontWeight: 700, color: tint(45) }}>HYDRATION STREAK</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, marginTop: 7 }}>{streak}</div>
          <div style={{ fontSize: 9.5, letterSpacing: 0.8, fontWeight: 700, color: 'var(--color-cool-lt)', marginTop: 3 }}>{streak === 1 ? 'DAY' : 'DAYS'} · +{streak * 20} XP</div>
        </div>
      </div>

      {/* scans header */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, fontWeight: 700, color: tint(42) }}>LAST SCAN · {lastScan.d}</div>
        <div className="pr95" onClick={() => store.openScan()} style={{ background: 'var(--color-accent)', color: 'var(--color-accent-on)', borderRadius: 999, padding: '9px 14px', fontSize: 12, fontWeight: 600, transition: 'transform 0.15s' }}>+ New scan</div>
      </div>

      {/* body metric chart */}
      <div style={{ marginTop: 12, background: 'var(--color-surface)', border: `1px solid ${tint(7)}`, borderRadius: 26, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tint(50) }}>{bodySel.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1.2 }}>{fmtM(bCur, bodySel.dec)}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: tint(45) }}>{bodySel.unit}</div>
            </div>
          </div>
          <div style={{ background: bBetter ? tintOf(C.a, 0.16) : tintFg(0.08), color: bBetter ? (themeIsDark ? C.aHi : C.a) : tintFg(0.6), borderRadius: 999, padding: '6px 11px', fontSize: 11.5, fontWeight: 700 }}>
            {fmtDelta(bDelta, bodySel.dec)}{bodySel.unit ? ' ' + bodySel.unit : ''}
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 10, height: 118 }}>
          <svg width="100%" height="118" viewBox={`0 0 ${chW} ${chH}`} preserveAspectRatio="none" style={{ display: 'block', position: 'absolute', inset: 0 }}>
            <polyline points={bodyPoly} fill="none" style={{ stroke: 'var(--color-accent)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {bSeries.map((_, i) => {
            const isLast = i === bSeries.length - 1
            return (
              <div key={i} style={{ position: 'absolute', left: (bXs[i] / chW * 100).toFixed(2) + '%', top: (bYs[i] / chH * 100).toFixed(2) + '%', transform: 'translate(-50%,-50%)', width: 11, height: 11, borderRadius: '50%', background: isLast ? C.a : T.dim, border: `2.5px solid ${T.s1}`, boxShadow: `0 0 0 1.5px ${isLast ? C.aTint : 'transparent'}` }} />
            )
          })}
        </div>
        <div style={{ display: 'flex', marginTop: 4 }}>
          {bSeries.map((v, i) => {
            const isLast = i === bSeries.length - 1
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: isLast ? T.text : tintFg(0.5) }}>{fmtM(v, bodySel.dec)}</div>
                <div style={{ marginTop: 1, fontSize: 8.5, letterSpacing: 0.8, fontWeight: 700, color: tint(38) }}>{scansShown[i].d}</div>
              </div>
            )
          })}
        </div>
        {hasBand && (
          <div style={{ marginTop: 15 }}>
            <div style={{ position: 'relative', height: 8, borderRadius: 99, background: tint(8) }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: bandPct(bodySel.lo!) + '%', width: (bandPct(bodySel.hi!) - bandPct(bodySel.lo!)) + '%', borderRadius: 99, background: tintOf(C.a, 0.3) }} />
              <div style={{ position: 'absolute', top: '50%', left: bandPct(bCur) + '%', transform: 'translate(-50%,-50%)', width: 15, height: 15, borderRadius: '50%', background: inIdeal ? C.a : T.text, border: `3px solid ${T.s1}` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 7, fontSize: 9.5, letterSpacing: 0.6, fontWeight: 700, color: tint(38) }}>
              <div>LOW · {bodySel.lo}</div>
              <div style={{ fontSize: 11, color: inIdeal ? (themeIsDark ? C.aHi : C.a) : tintFg(0.55), letterSpacing: 0.2 }}>{bodyStatus}</div>
              <div>{bodySel.hi} · HIGH</div>
            </div>
          </div>
        )}
      </div>

      {/* metric tiles */}
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BODY_METRICS.map(m => {
          const ser = scansShown.map(sc => mVal(sc, m.k))
          const c2 = ser[ser.length - 1], p2 = ser.length > 1 ? ser[ser.length - 2] : c2
          const d2 = c2 - p2, bet = m.down ? d2 < 0 : d2 > 0
          const on = m.k === bodySel.k
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

      {/* segmental */}
      <div style={{ marginTop: 12, background: 'var(--color-surface)', border: `1px solid ${tint(7)}`, borderRadius: 26, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Segmental</div>
          <div style={{ fontSize: 9.5, letterSpacing: 1, fontWeight: 700, color: tint(40) }}>{lastScan.d} SCAN</div>
        </div>
        <div style={{ marginTop: 3, fontSize: 11.5, color: tint(45) }}>Lean mass against fat, per segment</div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SEG_DATA.map(g => {
            const tot = g.mus + g.fat
            const mw = Math.round(g.mus / tot * 100)
            return (
              <div key={g.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 11.5, fontWeight: 600 }}>
                  <div>{g.name}</div>
                  <div style={{ color: tint(45), fontSize: 11 }}><span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{fmtM(g.mus, 1)}</span> lean · {fmtM(g.fat, 1)} fat kg</div>
                </div>
                <div style={{ marginTop: 6, height: 7, borderRadius: 99, background: tint(9), overflow: 'hidden', display: 'flex' }}>
                  <div style={{ height: '100%', width: mw + '%', background: 'var(--color-accent)' }} />
                  <div style={{ height: '100%', width: (100 - mw) + '%', background: tint(26) }} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 14, fontSize: 10, fontWeight: 600, color: tint(45) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--color-accent)' }} />Lean mass</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: 3, background: tint(26) }} />Fat</div>
        </div>
      </div>

      {/* recent workouts */}
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
  )
}
