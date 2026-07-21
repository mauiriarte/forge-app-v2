import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, overline, screenPane } from '../lib/ui'
import { BackChevron } from '../components/icons'
import { latestOf } from '../lib/bodyMetrics'
import { displayInitials, displayName } from '../lib/identity'
import type { ThemeSel } from '../lib/types'

export function Profile({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { T, themeIsDark, tintFg } = useTheme()

  const name = displayName(s) || 'Athlete'
  const initials = displayInitials(s)
  const themeSel = s.themeSel
  const themeNote = themeSel === 'system'
    ? 'Following your device — ' + (themeIsDark ? 'dark' : 'light') + ' right now'
    : (themeIsDark ? 'Charcoal — the forge at night' : 'Warm paper — easy in daylight')

  const wNow = latestOf(s.measurements, 'w')
  const hNow = latestOf(s.measurements, 'h')
  const rows = [
    { label: 'Weight', val: wNow ? wNow.v.toFixed(1) + ' kg' : '—' },
    { label: 'Height', val: hNow ? Math.round(hNow.v) + ' cm' : (s.obH ? s.obH + ' cm' : '—') },
    { label: 'Weekly goal', val: s.weeklyGoal + '× per week' },
    { label: 'Email', val: s.obEmail || '—' },
  ]

  return (
    <div style={screenPane(z, anim)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div className="pr92" onClick={() => store.go('home')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BackChevron />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Profile</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 22 }}>
        <div style={{ width: 86, height: 86, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700 }}>{initials}</div>
        <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: -0.8, marginTop: 14 }}>{name}</div>
      </div>

      <div style={{ marginTop: 26, ...overline() }}>APPEARANCE</div>
      <div style={{ marginTop: 11, background: 'var(--color-surface)', border: `1px solid ${tint(8)}`, borderRadius: 18, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {([{ k: 'dark', label: 'Dark' }, { k: 'light', label: 'Light' }, { k: 'system', label: 'Auto' }] as { k: ThemeSel; label: string }[]).map(o => {
            const on = themeSel === o.k
            return (
              <div key={o.k} className="pr97" onClick={() => store.setTheme(o.k)} style={{ flex: 1, height: 42, borderRadius: 13, background: on ? T.p : 'transparent', border: `1px solid ${on ? 'transparent' : tintFg(0.16)}`, color: on ? T.pOn : tintFg(0.55), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }}>{o.label}</div>
            )
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: tint(40) }}>{themeNote}</div>
      </div>

      <div style={{ marginTop: 22, ...overline() }}>BODY INFO</div>
      <div style={{ marginTop: 11, background: 'var(--color-surface)', border: `1px solid ${tint(8)}`, borderRadius: 18, overflow: 'hidden' }}>
        {rows.map(pr => (
          <div key={pr.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tint(6)}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: tint(55) }}>{pr.label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{pr.val}</div>
          </div>
        ))}
        <div style={{ padding: '11px 16px', fontSize: 10.5, color: tint(38) }}>Weight and body data update from your scans in Stats.</div>
      </div>

      <div className="pr98" onClick={() => store.signOut()} style={{ marginTop: 22, height: 50, border: '1px solid rgba(217,58,43,0.4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, color: 'var(--color-error-hi)', boxSizing: 'border-box', transition: 'transform 0.15s' }}>Sign out</div>
    </div>
  )
}
