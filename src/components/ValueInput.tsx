import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

/**
 * Small numeric field for set logging (reps / kg). Tap to focus (value
 * auto-selects) and type; commits on every valid keystroke, snaps back to
 * the committed value on blur. Clicks never bubble to the parent card.
 */
export function ValueInput({ value, onCommit, dec = 0, style }: {
  value: number
  onCommit: (n: number) => void
  dec?: number
  style?: CSSProperties
}) {
  const fmt = (n: number) => dec === 0 ? String(Math.round(n)) : String(Math.round(n * 10) / 10)
  const [text, setText] = useState(fmt(value))
  const [editing, setEditing] = useState(false)

  useEffect(() => { if (!editing) setText(fmt(value)) }, [value, editing]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      className="fg-input"
      value={text}
      inputMode="decimal"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onFocus={(e) => { setEditing(true); e.target.select() }}
      onBlur={() => { setEditing(false); setText(fmt(value)) }}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const n = parseFloat(raw.replace(',', '.'))
        if (!isNaN(n) && n >= 0) onCommit(n)
      }}
      style={{
        boxSizing: 'border-box', textAlign: 'center', fontFamily: 'inherit',
        fontWeight: 700, outline: 'none', transition: 'border-color 0.2s',
        ...style,
      }}
    />
  )
}
