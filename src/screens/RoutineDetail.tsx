import { useStore } from '../store/store'
import { useTheme } from '../lib/useTheme'
import { tint, screenPane } from '../lib/ui'
import { DAY3 } from '../lib/dates'
import { libOf } from '../lib/library'
import { BackChevron, Chevron, Dots, Pencil, Swap, Trash } from '../components/icons'
import { ImageSlot } from '../components/ImageSlot'

export function RoutineDetail({ z, anim }: { z: number; anim: string }) {
  const { store, state: s } = useStore()
  const { C, themeIsDark, tintOf } = useTheme()

  const today = store.todayRoutine()
  const rid = s.routineOpen || today?.id
  const rOpen = s.routines.find(r => r.id === rid) || today
  if (!rOpen) return null

  const chips = [
    rOpen.days.map(d => DAY3[d]).join(' · '),
    rOpen.exs.length + ' EXERCISES',
    '~' + (rOpen.exs.length * 8) + ' MIN',
  ]

  return (
    <div style={screenPane(z, anim)}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div className="pr92" onClick={() => store.go(s.detailFrom || 'train')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BackChevron />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6 }}>{rOpen.name}</div>
          <div style={{ fontSize: 12, color: tint(45), marginTop: 1 }}>{rOpen.focus}</div>
        </div>
        <div className="pr9" onClick={() => store.openRe()} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s' }}>
          <Dots />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {chips.map(label => (
          <div key={label} style={{ background: tint(6), borderRadius: 999, padding: '7px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 0.9, color: tint(55) }}>{label}</div>
        ))}
      </div>

      {/* exercise cards (swipe left → replace / delete) */}
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rOpen.exs.map(e => {
          const L = libOf(e.lib)
          const uid = e.uid
          const dragging = s.swDragging && s.swId === uid
          const tx = dragging ? s.swDx : (s.swOpen === uid ? -148 : 0)
          const rowAnim = s.leaving['ex:' + uid]
            ? 'fgRowOut 0.42s cubic-bezier(0.55,0,0.7,1) both'
            : 'fgFadeUp 0.35s cubic-bezier(0.2,0.8,0.2,1) both'
          return (
            <div key={uid} style={{ borderRadius: 22, position: 'relative', overflow: 'hidden', animation: rowAnim }}>
              {/* actions revealed behind the card */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 148, display: 'flex', gap: 8, paddingLeft: 8, boxSizing: 'border-box' }}>
                <div className="pr94" onClick={() => store.openExSheet('replace', uid)} style={{ flex: 1, borderRadius: 18, background: 'var(--color-cool)', color: 'var(--color-cool-on)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Swap w={16} h={14} />
                  <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1 }}>REPLACE</div>
                </div>
                <div className="pr94" onClick={() => store.deleteEx(uid)} style={{ flex: 1, borderRadius: 18, background: 'var(--color-error)', color: '#FFF5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Trash />
                  <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1 }}>DELETE</div>
                </div>
              </div>
              {/* the card itself */}
              <div
                onClick={() => { if (store.swSuppressed()) return; store.openExercise(uid, 'detail') }}
                onPointerDown={(ev) => store.swStart(uid, ev)}
                onPointerMove={(ev) => store.swMove(uid, ev)}
                onPointerUp={() => store.swEnd(uid)}
                onPointerCancel={() => store.swEnd(uid)}
                style={{
                  cursor: 'pointer', position: 'relative', background: 'var(--color-surface)',
                  border: `1px solid ${tint(8)}`, borderRadius: 22, padding: 12,
                  display: 'flex', alignItems: 'center', gap: 13, boxSizing: 'border-box',
                  touchAction: 'pan-y',
                  transform: `translateX(${Math.round(tx * 10) / 10}px)`,
                  transition: dragging ? 'none' : 'transform 0.34s cubic-bezier(0.2,0.8,0.2,1)',
                }}
              >
                <div onClick={(ev) => ev.stopPropagation()} style={{ width: 78, height: 78, borderRadius: 16, overflow: 'hidden', background: 'var(--color-bg)', border: `1px solid ${tint(7)}`, flexShrink: 0 }}>
                  <ImageSlot id={'fx-' + e.lib} placeholder="GIF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L.name}</div>
                  <div style={{ fontSize: 12.5, color: tint(45), marginTop: 3 }}>{e.sets} sets × {e.reps}{L.eq ? ' · ' + L.eq : ''}</div>
                  {e.lastW != null && (
                    <div style={{ display: 'inline-flex', marginTop: 8, background: tintOf(C.a, themeIsDark ? 0.16 : 0.12), color: themeIsDark ? C.aHi : C.a, borderRadius: 999, padding: '4px 9px', fontSize: 9.5, fontWeight: 700, letterSpacing: 1 }}>
                      LAST · {e.lastW} KG
                    </div>
                  )}
                </div>
                <div className="pr88" onClick={(ev) => { ev.stopPropagation(); store.openSr(uid) }} style={{ width: 34, height: 34, borderRadius: '50%', background: tint(6), border: `1px solid ${tint(10)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.15s' }}>
                  <Pencil />
                </div>
                <Chevron opacity={22} style={{ marginRight: 2 }} />
              </div>
            </div>
          )
        })}
      </div>

      {rOpen.exs.length === 0 && (
        <div style={{ marginTop: 18, background: 'var(--color-surface)', border: `1px solid ${tint(7)}`, borderRadius: 20, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Nothing in here yet</div>
          <div style={{ fontSize: 12, color: tint(45), marginTop: 4, lineHeight: 1.5 }}>Add movements below — sets, reps and weights start tracking automatically.</div>
        </div>
      )}

      <div className="pr98" onClick={() => store.openExSheet('add', null)} style={{ marginTop: 14, height: 56, border: `1.5px dashed ${tint(18)}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: tint(55), boxSizing: 'border-box', transition: 'transform 0.15s' }}>+ Add exercise</div>
      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5, color: tint(32) }}>Tap a card for detail — swipe left to replace or delete</div>
    </div>
  )
}
