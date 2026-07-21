import type { Routine } from './types'

// Mauricio's upper/lower program, imported from his Hevy routines:
//   Upper 1  https://hevy.com/routine/dzP57tuM1Vf
//   Lower 1  https://hevy.com/routine/J3KEoMx3sto
//   Upper 2  https://hevy.com/routine/PB2sV0CIgN4
//   Lower 2  https://hevy.com/routine/54FkwgHn6BG
// Seeded ONLY into this account's existing data (hydrate migration in the
// store); brand-new accounts start with zero routines and see the
// create-your-first-routine empty state.
export const HEVY_ROUTINES: Routine[] = [
  { id: 'upper1', name: 'Upper 1', mus: 'Push', focus: 'Chest, shoulders & upper back', days: [1], exs: [
    { uid: 'h1', lib: 'dbrow', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h2', lib: 'dbshoulder', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h3', lib: 'bench', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h4', lib: 'chestfly', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h5', lib: 'curl', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h6', lib: 'facepull', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h7', lib: 'dipmachine', sets: 3, reps: '12', lastW: null, hist: [] },
  ] },
  { id: 'lower1', name: 'Lower 1', mus: 'Legs', focus: 'Glutes, hamstrings & core', days: [2], exs: [
    { uid: 'h8', lib: 'hipthrust', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h9', lib: 'dbrdl', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h10', lib: 'legext', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h11', lib: 'seatedcurl', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h12', lib: 'calfext', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h13', lib: 'crunchmachine', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h14', lib: 'kneeraise', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h15', lib: 'plank', sets: 3, reps: '60s', lastW: null, hist: [] },
  ] },
  { id: 'upper2', name: 'Upper 2', mus: 'Pull', focus: 'Back, arms & shoulders', days: [4], exs: [
    { uid: 'h16', lib: 'incline', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h17', lib: 'machinerow', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h18', lib: 'latpull', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h19', lib: 'pushdown', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h20', lib: 'latraise', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h21', lib: 'wristcurl', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h22', lib: 'preacher', sets: 3, reps: '12', lastW: null, hist: [] },
  ] },
  { id: 'lower2', name: 'Lower 2', mus: 'Legs', focus: 'Quads, glutes & core', days: [5], exs: [
    { uid: 'h23', lib: 'legpress', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h24', lib: 'backext', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h25', lib: 'singlelegpress', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h26', lib: 'seatedcurl', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h27', lib: 'calfext', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h28', lib: 'hipabd', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h29', lib: 'hipadd', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h30', lib: 'crunchmachine', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h31', lib: 'kneeraise', sets: 3, reps: '12', lastW: null, hist: [] },
    { uid: 'h32', lib: 'plank', sets: 3, reps: '60s', lastW: null, hist: [] },
  ] },
]
