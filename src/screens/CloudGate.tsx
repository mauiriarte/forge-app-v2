import { useState } from 'react'
import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, inputStyle } from '../lib/ui'

const EMAIL_RE = /\S+@\S+\.\S+/

/**
 * Shown when the app is onboarded locally but has no cloud session yet.
 * Lets the user create an account (or log in) so their existing on-device
 * progress is pushed to the cloud and synced across devices. Dismissible —
 * the app keeps working local-only if they choose "Maybe later".
 */
export function CloudGate() {
  const { store, state: s } = useStore()
  const { tintFg } = useTheme()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')

  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const
  const bigInput = inputStyle('s1', '15px', 15, 15)
  const ok = EMAIL_RE.test(s.obEmail) && s.obPass.length >= (mode === 'signup' ? 6 : 1)

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, background: 'var(--color-bg)', overflowY: 'auto', padding: '84px 24px 40px', boxSizing: 'border-box', animation: 'fgFadeUp 0.4s cubic-bezier(0.2,0.8,0.2,1) both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--color-accent-on)' }}>F</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>Forge</div>
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>Save your progress</div>
        <div style={{ fontSize: 13, color: tint(50), marginTop: 7, lineHeight: 1.5 }}>
          Your workouts and measurements currently live only on this device. {mode === 'signup' ? 'Create an account' : 'Log in'} to back them up to the cloud and keep them safe across devices and reinstalls.
        </div>

        <div style={{ marginTop: 26, ...label }}>EMAIL</div>
        <input className="fg-input" value={s.obEmail} onChange={(e) => store.setState({ obEmail: e.target.value })} type="email" inputMode="email" placeholder="you@email.com" style={{ marginTop: 8, ...bigInput }} />
        <div style={{ marginTop: 16, ...label }}>PASSWORD</div>
        <input className="fg-input" value={s.obPass} onChange={(e) => store.setState({ obPass: e.target.value })} type="password" placeholder={mode === 'signup' ? '6+ characters' : 'Your password'} style={{ marginTop: 8, ...bigInput }} />

        <div
          className="pr97"
          onClick={() => { if (s.cloudBusy) return; mode === 'signup' ? store.cloudSignUp() : store.cloudLogin() }}
          style={{ marginTop: 28, height: 54, borderRadius: 17, background: 'var(--color-accent)', opacity: ok && !s.cloudBusy ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}
        >
          {s.cloudBusy ? 'Working…' : mode === 'signup' ? 'Create account & back up' : 'Log in & sync'}
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12.5, color: tint(45) }}>
          {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
          <span onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={{ cursor: 'pointer', color: 'var(--color-accent-hi)', fontWeight: 600 }}>
            {mode === 'signup' ? 'Log in' : 'Create an account'}
          </span>
        </div>

        <div className="pr97" onClick={() => store.dismissCloudGate()} style={{ marginTop: 22, height: 50, borderRadius: 16, border: `1px solid ${tintFg(0.14)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: tint(55), boxSizing: 'border-box', transition: 'transform 0.15s' }}>Maybe later</div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: tint(35), lineHeight: 1.5 }}>
          You can keep using Forge without an account — but your data stays only on this device until you sign in.
        </div>
      </div>
    </div>
  )
}
