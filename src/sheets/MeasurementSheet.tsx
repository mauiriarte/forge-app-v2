import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, inputStyle } from '../lib/ui'
import { MANUAL_METRICS, fmtM, latestOf } from '../lib/bodyMetrics'
import { SheetShell } from '../components/SheetShell'

/** Manual measurement entry: pick a metric from the list, type the value. */
export function MeasurementSheet() {
  const { store, state: s } = useStore()
  const { C, tintFg } = useTheme()
  const sel = MANUAL_METRICS.find(m => m.k === s.msKey) || null

  return (
    <SheetShell closing={s.msClosing} onClose={() => store.closeMs()}>
      <div style={{ marginTop: 14, fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>Add measurement</div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>
        {sel ? sel.name + ' — enter today’s value.' : 'Pick what you want to log.'}
      </div>

      {!sel ? (
        <div style={{ marginTop: 14, maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MANUAL_METRICS.map(m => {
            const last = latestOf(s.measurements, m.k)
            return (
              <div key={m.k} className="pr98" onClick={() => store.pickMs(m.k)} style={{ background: tint(5), border: `1px solid ${tint(8)}`, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: tint(42), marginTop: 2 }}>
                    {last ? 'Last · ' + fmtM(last.v, m.dec) + (m.unit ? ' ' + m.unit : '') : 'No entries yet'}
                  </div>
                </div>
                <div style={{ background: tint(7), borderRadius: 999, padding: '5px 10px', fontSize: 9, fontWeight: 700, letterSpacing: 1, color: tint(55), flexShrink: 0 }}>{m.unit ? m.unit.toUpperCase() : '—'}</div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)', color: 'var(--color-accent-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, flexShrink: 0 }}>+</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <div style={{ marginTop: 16, fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) }}>
            {sel.name.toUpperCase()}{sel.unit ? ' · ' + sel.unit.toUpperCase() : ''}
          </div>
          <input
            className="fg-input"
            value={s.msVal}
            onChange={(e) => store.setState({ msVal: e.target.value })}
            inputMode="decimal"
            autoFocus
            placeholder={sel.unit ? '0 ' + sel.unit : '0'}
            style={{ marginTop: 8, ...inputStyle('s0', '15px', 16, 15) }}
          />
          <div className="pr97" onClick={() => store.saveMs(sel.name)} style={{ marginTop: 16, height: 52, borderRadius: 16, background: C.a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: C.aOn, transition: 'transform 0.15s' }}>Save entry</div>
          <div className="pr98" onClick={() => store.setState({ msKey: null, msVal: '' })} style={{ marginTop: 10, height: 46, borderRadius: 15, border: `1px solid ${tintFg(0.14)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: tint(55), boxSizing: 'border-box', transition: 'transform 0.15s' }}>Back to list</div>
        </div>
      )}
    </SheetShell>
  )
}
