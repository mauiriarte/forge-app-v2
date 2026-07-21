import type { Scan } from './types'

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

export const BODY_METRICS: BodyMetricDef[] = [
  { k: 'w', name: 'Weight', unit: 'kg', lo: 62, hi: 84, min: 55, max: 110, down: true, dec: 1 },
  { k: 'fat', name: 'Body fat', unit: '%', lo: 8, hi: 19, min: 4, max: 40, down: true, dec: 1 },
  { k: 'mus', name: 'Skeletal muscle', unit: 'kg', down: false, dec: 1 },
  { k: 'visc', name: 'Visceral fat', unit: '%', lo: 1, hi: 9, min: 0, max: 20, down: true, dec: 1 },
  { k: 'bmi', name: 'BMI', unit: '', lo: 18, hi: 24, min: 15, max: 36, down: true, dec: 1 },
  { k: 'ffm', name: 'Fat-free mass', unit: 'kg', lo: 60, hi: 68, min: 54, max: 76, down: false, dec: 1 },
  { k: 'wat', name: 'Body water', unit: 'L', lo: 47, hi: 61, min: 40, max: 66, down: false, dec: 1 },
  { k: 'bmr', name: 'Basal metabolism', unit: 'kcal', down: false, dec: 0 },
]

// BMI derived from weight at the user's 1.84 m height (1.84² = 3.3856).
export const mVal = (sc: Scan, k: string): number => k === 'bmi' ? sc.w / 3.3856 : (sc as unknown as Record<string, number>)[k]

export const fmtM = (v: number, dec: number): string => dec === 0 ? Math.round(v) + '' : (Math.round(v * 10) / 10).toFixed(1)

export const SEG_DATA = [
  { name: 'Trunk', mus: 32.66, fat: 17.86 },
  { name: 'Left arm', mus: 4.23, fat: 1.03 },
  { name: 'Right arm', mus: 4.2, fat: 1.06 },
  { name: 'Left leg', mus: 11.56, fat: 2.74 },
  { name: 'Right leg', mus: 11.61, fat: 2.68 },
]
