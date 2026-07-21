import type { Measurement } from './types'

export interface BodyMetricDef {
  k: string
  name: string
  unit: string
  lo?: number
  hi?: number
  min?: number
  max?: number
  down: boolean
  dec: number
}

// Chartable/enterable metrics. 'bmi' is derived from weight + height.
// Only population-generic ideal bands are defined here (body-fat %, visceral
// fat, BMI). The weight band is personal — derived from the account's height
// at render time (see idealWeightBand). No per-person values live in code.
export const BODY_METRICS: BodyMetricDef[] = [
  { k: 'w', name: 'Weight', unit: 'kg', down: true, dec: 1 },
  { k: 'h', name: 'Height', unit: 'cm', down: false, dec: 0 },
  { k: 'fat', name: 'Body fat', unit: '%', lo: 8, hi: 19, min: 4, max: 40, down: true, dec: 1 },
  { k: 'mus', name: 'Skeletal muscle', unit: 'kg', down: false, dec: 1 },
  { k: 'visc', name: 'Visceral fat', unit: '%', lo: 1, hi: 9, min: 0, max: 20, down: true, dec: 1 },
  { k: 'bmi', name: 'BMI', unit: '', lo: 18.5, hi: 24.9, min: 15, max: 36, down: true, dec: 1 },
  { k: 'ffm', name: 'Fat-free mass', unit: 'kg', down: false, dec: 1 },
  { k: 'wat', name: 'Body water', unit: 'L', down: false, dec: 1 },
  { k: 'bmr', name: 'Basal metabolism', unit: 'kcal', down: false, dec: 0 },
]

/** Healthy-weight band (BMI 18.5–24.9) for the account's height, if known. */
export function idealWeightBand(ms: Measurement[]): { lo: number; hi: number; min: number; max: number } | null {
  const h = latestOf(ms, 'h')
  if (!h || h.v <= 0) return null
  const hm = h.v / 100
  const lo = Math.round(18.5 * hm * hm * 10) / 10
  const hi = Math.round(24.9 * hm * hm * 10) / 10
  return { lo, hi, min: Math.round(lo - (hi - lo) * 0.4), max: Math.round(hi + (hi - lo) * 1.2) }
}

/** Metrics the user can enter manually (everything real, not derived). */
export const MANUAL_METRICS: BodyMetricDef[] = BODY_METRICS.filter(m => m.k !== 'bmi')

export const metricDef = (k: string): BodyMetricDef =>
  BODY_METRICS.find(m => m.k === k) || BODY_METRICS[0]

export const fmtM = (v: number, dec: number): string =>
  dec === 0 ? Math.round(v) + '' : (Math.round(v * 10) / 10).toFixed(1)

/** All entries for a metric, oldest → newest. 'bmi' derives from weight entries + latest height. */
export function seriesOf(ms: Measurement[], k: string): Measurement[] {
  if (k === 'bmi') {
    const h = latestOf(ms, 'h')
    if (!h) return []
    const hm = h.v / 100
    return seriesOf(ms, 'w').map(e => ({ k: 'bmi', v: e.v / (hm * hm), t: e.t }))
  }
  return ms.filter(e => e.k === k).slice().sort((a, b) => a.t - b.t)
}

export const latestOf = (ms: Measurement[], k: string): Measurement | null => {
  const s = seriesOf(ms, k)
  return s.length ? s[s.length - 1] : null
}

/** Metric defs that currently have data (incl. derivable BMI), in canonical order. */
export function metricsWithData(ms: Measurement[]): BodyMetricDef[] {
  return BODY_METRICS.filter(m => seriesOf(ms, m.k).length > 0)
}
