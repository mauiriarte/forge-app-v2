// Exercise library — ported verbatim from the design prototype (ForgeApp v2).
// step = weight increment in kg; 0 means bodyweight (no load tracking).

export interface LibEntry {
  name: string
  mus: string
  eq: string
  sets: number
  reps: string
  step: number
  pri: string[]
  sec: string[]
}

export const LIB: Record<string, LibEntry> = {
  bench: { name: 'Bench press', mus: 'Push', eq: 'Barbell', sets: 4, reps: '8', step: 2.5, pri: ['Chest'], sec: ['Triceps', 'Front delts'] },
  incline: { name: 'Incline dumbbell press', mus: 'Push', eq: 'Dumbbells', sets: 3, reps: '10', step: 2, pri: ['Upper chest'], sec: ['Front delts', 'Triceps'] },
  ohp: { name: 'Overhead press', mus: 'Push', eq: 'Barbell', sets: 4, reps: '8', step: 2.5, pri: ['Shoulders'], sec: ['Triceps', 'Upper chest'] },
  latraise: { name: 'Lateral raises', mus: 'Push', eq: 'Dumbbells', sets: 3, reps: '12', step: 1, pri: ['Side delts'], sec: ['Traps'] },
  dips: { name: 'Triceps dips', mus: 'Push', eq: 'Bodyweight', sets: 3, reps: '10', step: 0, pri: ['Triceps'], sec: ['Chest', 'Front delts'] },
  pushdown: { name: 'Cable pushdown', mus: 'Push', eq: 'Cable', sets: 3, reps: '12', step: 2.5, pri: ['Triceps'], sec: ['Forearms'] },
  pullup: { name: 'Pull-ups', mus: 'Pull', eq: 'Bodyweight', sets: 4, reps: '6', step: 0, pri: ['Lats'], sec: ['Biceps', 'Core'] },
  row: { name: 'Barbell row', mus: 'Pull', eq: 'Barbell', sets: 4, reps: '8', step: 2.5, pri: ['Lats', 'Mid back'], sec: ['Biceps', 'Rear delts'] },
  latpull: { name: 'Lat pulldown', mus: 'Pull', eq: 'Cable', sets: 3, reps: '10', step: 2.5, pri: ['Lats'], sec: ['Biceps'] },
  cablerow: { name: 'Seated cable row', mus: 'Pull', eq: 'Cable', sets: 3, reps: '10', step: 2.5, pri: ['Mid back'], sec: ['Lats', 'Biceps'] },
  facepull: { name: 'Face pulls', mus: 'Pull', eq: 'Cable', sets: 3, reps: '15', step: 1, pri: ['Rear delts'], sec: ['Traps', 'Rotator cuff'] },
  curl: { name: 'Bicep curls', mus: 'Pull', eq: 'Dumbbells', sets: 3, reps: '12', step: 1, pri: ['Biceps'], sec: ['Forearms'] },
  hammer: { name: 'Hammer curls', mus: 'Pull', eq: 'Dumbbells', sets: 3, reps: '12', step: 1, pri: ['Biceps'], sec: ['Forearms'] },
  squat: { name: 'Squats', mus: 'Legs', eq: 'Barbell', sets: 4, reps: '8', step: 2.5, pri: ['Quads', 'Glutes'], sec: ['Core', 'Lower back'] },
  rdl: { name: 'Romanian deadlift', mus: 'Legs', eq: 'Barbell', sets: 4, reps: '8', step: 2.5, pri: ['Hamstrings', 'Glutes'], sec: ['Lower back'] },
  legpress: { name: 'Leg press', mus: 'Legs', eq: 'Machine', sets: 3, reps: '10', step: 5, pri: ['Quads'], sec: ['Glutes'] },
  split: { name: 'Split squats', mus: 'Legs', eq: 'Dumbbells', sets: 3, reps: '10', step: 2, pri: ['Quads', 'Glutes'], sec: ['Core'] },
  legcurl: { name: 'Leg curls', mus: 'Legs', eq: 'Machine', sets: 3, reps: '12', step: 2.5, pri: ['Hamstrings'], sec: ['Calves'] },
  calf: { name: 'Calf raises', mus: 'Legs', eq: 'Machine', sets: 4, reps: '15', step: 2.5, pri: ['Calves'], sec: [] },
  hipthrust: { name: 'Hip thrusts', mus: 'Legs', eq: 'Barbell', sets: 3, reps: '10', step: 2.5, pri: ['Glutes'], sec: ['Hamstrings'] },
  deadlift: { name: 'Deadlift', mus: 'Full body', eq: 'Barbell', sets: 4, reps: '6', step: 2.5, pri: ['Glutes', 'Hamstrings'], sec: ['Lower back', 'Traps', 'Forearms'] },
  kbswing: { name: 'Kettlebell swings', mus: 'Full body', eq: 'Kettlebell', sets: 3, reps: '15', step: 4, pri: ['Glutes', 'Hamstrings'], sec: ['Core', 'Shoulders'] },
  burpee: { name: 'Burpees', mus: 'Full body', eq: 'Bodyweight', sets: 3, reps: '12', step: 0, pri: ['Quads', 'Chest'], sec: ['Core', 'Shoulders'] },
  carry: { name: 'Farmer carry', mus: 'Full body', eq: 'Dumbbells', sets: 3, reps: '40m', step: 2, pri: ['Forearms', 'Traps'], sec: ['Core'] },
  plank: { name: 'Plank', mus: 'Core', eq: 'Bodyweight', sets: 3, reps: '60s', step: 0, pri: ['Core'], sec: ['Shoulders', 'Glutes'] },
  hangraise: { name: 'Hanging leg raises', mus: 'Core', eq: 'Bodyweight', sets: 3, reps: '10', step: 0, pri: ['Abs'], sec: ['Hip flexors', 'Forearms'] },
}

export const FOCUS: Record<string, string> = {
  Push: 'Chest, shoulders & triceps',
  Pull: 'Back & biceps',
  Legs: 'Quads, glutes & hamstrings',
  'Full body': 'Compound lifts, head to toe',
  Core: 'Trunk & stability',
}

export const libOf = (key: string): LibEntry =>
  LIB[key] || { name: key, mus: '', eq: '', sets: 3, reps: '10', step: 0, pri: [], sec: [] }
