import { useStore } from '../store/store'
import { tint, inputStyle } from '../lib/ui'
import { MO3 } from '../lib/dates'
import { SheetShell } from '../components/SheetShell'
import type { ScanVals } from '../lib/types'

const FIELDS: { k: keyof ScanVals; label: string }[] = [
  { k: 'w', label: 'WEIGHT · KG' },
  { k: 'fat', label: 'BODY FAT · %' },
  { k: 'mus', label: 'MUSCLE · KG' },
  { k: 'ffm', label: 'FAT-FREE MASS · KG' },
  { k: 'wat', label: 'WATER · L' },
  { k: 'visc', label: 'VISCERAL FAT · %' },
  { k: 'bmr', label: 'BMR · KCAL' },
]

export function ScanSheet() {
  const { store, state: s } = useStore()
  const now = new Date()
  const wv = parseFloat(('' + s.scanVals.w).replace(',', '.'))
  const bmiPreview = wv > 0 ? (Math.round(wv / 3.3856 * 10) / 10).toFixed(1) : '—'

  return (
    <SheetShell closing={s.scanClosing} onClose={() => store.closeScan()}>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.4 }}>New body scan</div>
        <div style={{ fontSize: 10, letterSpacing: 1, fontWeight: 700, color: tint(42) }}>{MO3[now.getMonth()]} {now.getDate()} · {now.getFullYear()}</div>
      </div>
      <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>Prefilled with your last scan — adjust and log.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 14 }}>
        {FIELDS.map(f => (
          <div key={f.k}>
            <div style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: tint(42), marginBottom: 5 }}>{f.label}</div>
            <input className="fg-input" value={s.scanVals[f.k]} onChange={(e) => store.setScanVal(f.k, e.target.value)} inputMode="decimal" style={inputStyle('s0', '11px 13px', 14, 13)} />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: tint(42), marginBottom: 5 }}>BMI · AUTO</div>
          <div style={{ boxSizing: 'border-box', height: 41, border: `1px dashed ${tint(16)}`, borderRadius: 13, padding: '0 13px', display: 'flex', alignItems: 'center', fontSize: 14.5, fontWeight: 700, color: tint(70) }}>{bmiPreview}</div>
        </div>
      </div>
      <div className="pr97" onClick={() => store.submitScan()} style={{ marginTop: 16, height: 50, borderRadius: 16, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}>Log scan</div>
    </SheetShell>
  )
}
