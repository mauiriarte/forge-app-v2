import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, inputStyle } from '../lib/ui'
import { BackChevron } from '../components/icons'
import { ImageSlot } from '../components/ImageSlot'

const EMAIL_RE = /\S+@\S+\.\S+/

export function Onboarding() {
  const { store, state: s } = useStore()
  const { C, tintFg } = useTheme()

  const ob0ok = EMAIL_RE.test(s.obEmail) && s.obPass.length >= 6
  const ob1ok = s.obName.trim().length > 0 && parseFloat(s.obW) > 0 && parseFloat(s.obH) > 0

  const label = { fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, color: tint(42) } as const
  const bigInput = inputStyle('s1', '15px', 15, 15)

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'var(--color-bg)', overflowY: 'auto', padding: '84px 24px 40px', boxSizing: 'border-box', animation: 'fgFadeUp 0.4s cubic-bezier(0.2,0.8,0.2,1) both' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {s.obMode === 'signup' && s.obStep > 0 && (
          <div className="pr92" onClick={() => store.setState({ obStep: Math.max(0, s.obStep - 1) })} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BackChevron />
          </div>
        )}
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: 'var(--color-accent-on)' }}>F</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>Forge</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 18, height: 6, borderRadius: 99, background: s.obMode === 'signup' && i <= s.obStep ? C.a : tintFg(0.14), transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* step 0 — account */}
      {s.obMode === 'signup' && s.obStep === 0 && (
        <div style={{ marginTop: 36, animation: 'fgFadeUp 0.35s cubic-bezier(0.2,0.8,0.2,1) both' }}>
          <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>Create your account</div>
          <div style={{ fontSize: 13, color: tint(50), marginTop: 7, lineHeight: 1.5 }}>Train, hydrate and track your body — all in one place.</div>
          <div style={{ marginTop: 26, ...label }}>EMAIL</div>
          <input className="fg-input" value={s.obEmail} onChange={(e) => store.setState({ obEmail: e.target.value })} type="email" inputMode="email" placeholder="you@email.com" style={{ marginTop: 8, ...bigInput }} />
          <div style={{ marginTop: 16, ...label }}>PASSWORD</div>
          <input className="fg-input" value={s.obPass} onChange={(e) => store.setState({ obPass: e.target.value })} type="password" placeholder="6+ characters" style={{ marginTop: 8, ...bigInput }} />
          <div className="pr97" onClick={async () => {
            if (!ob0ok) { store.toast('Enter an email and a 6+ character password'); return }
            const res = await store.sbSignUp(s.obEmail, s.obPass)
            if (res === 'session') { store.setState({ obStep: 1 }); return }
            if (res === 'confirm') { store.toast('Confirmation email sent — check your inbox'); store.setState({ obStep: 1 }); return }
            store.toast(res)
          }} style={{ marginTop: 28, height: 54, borderRadius: 17, background: 'var(--color-accent)', opacity: ob0ok ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}>Continue</div>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12.5, color: tint(45) }}>
            Already training with us? <span onClick={() => store.setState({ obMode: 'login' })} style={{ cursor: 'pointer', color: 'var(--color-accent-hi)', fontWeight: 600 }}>Log in</span>
          </div>
        </div>
      )}

      {/* login */}
      {s.obMode === 'login' && (
        <div style={{ marginTop: 36, animation: 'fgInRight 0.35s cubic-bezier(0.24,0.85,0.32,1) both' }}>
          <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: tint(50), marginTop: 7, lineHeight: 1.5 }}>Pick up where you left off.</div>
          <div style={{ marginTop: 26, ...label }}>EMAIL</div>
          <input className="fg-input" value={s.obEmail} onChange={(e) => store.setState({ obEmail: e.target.value })} type="email" inputMode="email" placeholder="you@email.com" style={{ marginTop: 8, ...bigInput }} />
          <div style={{ marginTop: 16, ...label }}>PASSWORD</div>
          <input className="fg-input" value={s.obPass} onChange={(e) => store.setState({ obPass: e.target.value })} type="password" placeholder="Your password" style={{ marginTop: 8, ...bigInput }} />
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: tint(45) }}>
            <span style={{ cursor: 'pointer' }} onClick={async () => {
              if (!EMAIL_RE.test(s.obEmail)) { store.toast('Enter your email first'); return }
              const res = await store.sbForgot(s.obEmail)
              store.toast(res === true ? 'Reset link sent — check your inbox' : res)
            }}>Forgot password?</span>
          </div>
          <div className="pr97" onClick={async () => {
            if (!ob0ok) { store.toast('Enter your email and password'); return }
            const res = await store.sbLogin(s.obEmail, s.obPass)
            if (res !== true) { store.toast(res); return }
            store.setState({ obDone: true, obLoggedOut: false })
            store.toast('Welcome back')
          }} style={{ marginTop: 22, height: 54, borderRadius: 17, background: 'var(--color-accent)', opacity: ob0ok ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}>Log in</div>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12.5, color: tint(45) }}>
            New here? <span onClick={() => store.setState({ obMode: 'signup', obStep: 0 })} style={{ cursor: 'pointer', color: 'var(--color-accent-hi)', fontWeight: 600 }}>Create an account</span>
          </div>
        </div>
      )}

      {/* step 1 — about you */}
      {s.obMode === 'signup' && s.obStep === 1 && (
        <div style={{ marginTop: 36, animation: 'fgInRight 0.35s cubic-bezier(0.24,0.85,0.32,1) both' }}>
          <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>About you</div>
          <div style={{ fontSize: 13, color: tint(50), marginTop: 7, lineHeight: 1.5 }}>Your starting point for body stats and weekly goals.</div>
          <div style={{ marginTop: 26, ...label }}>NAME</div>
          <input className="fg-input" value={s.obName} onChange={(e) => store.setState({ obName: e.target.value })} placeholder="How should we greet you?" style={{ marginTop: 8, ...bigInput }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <div>
              <div style={label}>WEIGHT · KG</div>
              <input className="fg-input" value={s.obW} onChange={(e) => store.setState({ obW: e.target.value })} inputMode="decimal" placeholder="e.g. 70" style={{ marginTop: 8, ...bigInput }} />
            </div>
            <div>
              <div style={label}>HEIGHT · CM</div>
              <input className="fg-input" value={s.obH} onChange={(e) => store.setState({ obH: e.target.value })} inputMode="decimal" placeholder="e.g. 175" style={{ marginTop: 8, ...bigInput }} />
            </div>
          </div>
          <div style={{ marginTop: 18, ...label }}>TRAINING DAYS PER WEEK</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
            {[2, 3, 4, 5, 6].map(g => {
              const on = s.obGoal === g
              return (
                <div key={g} className="pr94" onClick={() => store.setState({ obGoal: g })} style={{ flex: 1, height: 46, borderRadius: 14, background: on ? C.a : tintFg(0.06), border: `1.5px solid ${on ? 'transparent' : tintFg(0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: on ? C.aOn : tintFg(0.6), boxSizing: 'border-box', transition: 'all 0.2s' }}>{g}×</div>
              )
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: tint(40) }}>Weeks where you hit this count as complete.</div>
          <div className="pr97" onClick={() => { if (!ob1ok) { store.toast('Name, weight and height needed'); return } store.setState({ obStep: 2 }) }} style={{ marginTop: 28, height: 54, borderRadius: 17, background: 'var(--color-accent)', opacity: ob1ok ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'all 0.2s' }}>Continue</div>
        </div>
      )}

      {/* step 2 — body scan */}
      {s.obMode === 'signup' && s.obStep === 2 && (
        <div style={{ marginTop: 36, animation: 'fgInRight 0.35s cubic-bezier(0.24,0.85,0.32,1) both' }}>
          <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1 }}>Add a body scan</div>
          <div style={{ fontSize: 13, color: tint(50), marginTop: 7, lineHeight: 1.5 }}>Drop an InBody-style report or a photo of it — it becomes your first entry in Stats. You can always add one later.</div>
          <div style={{ marginTop: 22, height: 220, borderRadius: 22, overflow: 'hidden', background: 'var(--color-surface)', border: `1.5px dashed ${tint(18)}`, boxSizing: 'border-box' }}>
            <ImageSlot id="fg-ob-scan" placeholder="Drop your measurement document here" />
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: tint(40), lineHeight: 1.5 }}>When you finish, the scan becomes your first entry in Stats and prefills your body metrics.</div>
          <div className="pr97" onClick={() => store.finishOb(false)} style={{ marginTop: 20, height: 54, borderRadius: 17, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 600, color: 'var(--color-accent-on)', transition: 'transform 0.15s' }}>Finish setup</div>
          <div className="pr97" onClick={() => store.finishOb(true)} style={{ marginTop: 12, height: 50, borderRadius: 16, border: `1px solid ${tint(14)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: tint(55), boxSizing: 'border-box', transition: 'transform 0.15s' }}>Skip for now</div>
        </div>
      )}
    </div>
  )
}
