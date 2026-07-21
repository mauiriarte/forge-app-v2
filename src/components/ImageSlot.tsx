import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { tint } from '../lib/ui'

const SLOTS_KEY = 'forge-v2-slots'

function readSlots(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(SLOTS_KEY) || '{}') } catch { return {} }
}

function writeSlot(id: string, dataUrl: string | null) {
  try {
    const all = readSlots()
    if (dataUrl == null) delete all[id]
    else all[id] = dataUrl
    localStorage.setItem(SLOTS_KEY, JSON.stringify(all))
  } catch { /* quota exceeded — image stays for this session only */ }
}

/**
 * User-fillable image placeholder (the prototype's <image-slot>).
 * Click to browse or drag an image on; persists per-id in localStorage.
 * `fallbackSrc` shows when the user hasn't dropped their own image
 * (e.g. the ExerciseDB demo GIF for a movement).
 */
export function ImageSlot({ id, placeholder, fallbackSrc, style }: { id: string; placeholder: string; fallbackSrc?: string; style?: CSSProperties }) {
  const [dropped, setDropped] = useState<string | null>(() => readSlots()[id] || null)
  const [fallbackBroken, setFallbackBroken] = useState(false)
  const [over, setOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDropped(readSlots()[id] || null); setFallbackBroken(false) }, [id])
  const src = dropped || (fallbackSrc && !fallbackBroken ? fallbackSrc : null)

  const load = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setDropped(url)
      writeSlot(id, url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); load(e.dataTransfer.files[0]) }}
      style={{
        width: '100%', height: '100%', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: over ? tint(8) : 'transparent', transition: 'background 0.2s',
        boxSizing: 'border-box', overflow: 'hidden', position: 'relative',
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line -- no loading="lazy": Chromium skips lazy-load
        // inside these animated absolutely-positioned panes (image never loads)
        <img
          src={src}
          alt=""
          onError={() => { if (!dropped) setFallbackBroken(true) }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#FFFFFF' }}
          draggable={false}
        />
      ) : (
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.6, color: tint(30), textAlign: 'center', padding: '0 14px', lineHeight: 1.5 }}>
          {placeholder}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { load(e.target.files?.[0]); e.target.value = '' }}
      />
    </div>
  )
}
