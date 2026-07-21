import type { ReactNode } from 'react'
import { tint } from '../lib/ui'

/** Bottom sheet: scrim + rounded panel + grab handle, with enter/exit animation. */
export function SheetShell({ closing, onClose, children }: { closing: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'var(--color-scrim)', animation: closing ? 'fgScrimOut 0.28s ease both' : 'fgScrimIn 0.3s ease both' }}
      />
      <div style={{
        position: 'absolute', left: 10, right: 10, bottom: 12,
        background: 'var(--color-surface)', border: `1px solid ${tint(10)}`,
        borderRadius: 28, padding: 20, boxSizing: 'border-box',
        animation: closing ? 'fgSheetDown 0.3s cubic-bezier(0.6,0,0.8,0.5) both' : 'fgSheetUp 0.35s cubic-bezier(0.2,0.8,0.2,1) both',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: tint(18), margin: '0 auto' }} />
        {children}
      </div>
    </div>
  )
}
