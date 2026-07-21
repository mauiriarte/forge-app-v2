// Demo GIFs for the exercise library, served by the open ExerciseDB API
// (https://exercisedb.dev, oss deployment — animated GIFs on static.exercisedb.dev).
// Matched against the ExerciseDB catalog per movement; a user-dropped image on
// any slot still overrides these defaults. The service worker runtime-caches
// them (CacheFirst) so they work offline after first view.

export const EXERCISE_GIFS: Record<string, string> = {
  bench: 'https://static.exercisedb.dev/media/EIeI8Vf.gif',      // barbell bench press
  incline: 'https://static.exercisedb.dev/media/ns0SIbU.gif',    // dumbbell incline bench press
  ohp: 'https://static.exercisedb.dev/media/kTbSH9h.gif',        // barbell seated overhead press
  latraise: 'https://static.exercisedb.dev/media/DsgkuIt.gif',   // dumbbell lateral raise
  dips: 'https://static.exercisedb.dev/media/X6C6i5Y.gif',       // triceps dip
  pushdown: 'https://static.exercisedb.dev/media/3ZflifB.gif',   // cable pushdown
  pullup: 'https://static.exercisedb.dev/media/lBDjFxJ.gif',     // pull-up
  row: 'https://static.exercisedb.dev/media/eZyBC3j.gif',        // barbell bent over row
  latpull: 'https://static.exercisedb.dev/media/RVwzP10.gif',    // cable pulldown
  cablerow: 'https://static.exercisedb.dev/media/fUBheHs.gif',   // cable seated row
  facepull: 'https://static.exercisedb.dev/media/wqNPGCg.gif',   // cable rear delt row (with rope)
  curl: 'https://static.exercisedb.dev/media/NbVPDMW.gif',       // dumbbell biceps curl
  hammer: 'https://static.exercisedb.dev/media/slDvUAU.gif',     // dumbbell hammer curl
  squat: 'https://static.exercisedb.dev/media/qXTaZnJ.gif',      // barbell full squat
  rdl: 'https://static.exercisedb.dev/media/wQ2c4XD.gif',        // barbell romanian deadlift
  legpress: 'https://static.exercisedb.dev/media/10Z2DXU.gif',   // sled 45° leg press
  split: 'https://static.exercisedb.dev/media/qx4fgX7.gif',      // dumbbell single leg split squat
  legcurl: 'https://static.exercisedb.dev/media/17lJ1kr.gif',    // lever lying leg curl
  calf: 'https://static.exercisedb.dev/media/ykUOVze.gif',       // lever standing calf raise
  hipthrust: 'https://static.exercisedb.dev/media/qKBpF7I.gif',  // barbell glute bridge
  deadlift: 'https://static.exercisedb.dev/media/ila4NZS.gif',   // barbell deadlift
  kbswing: 'https://static.exercisedb.dev/media/UHJlbu3.gif',    // kettlebell swing
  burpee: 'https://static.exercisedb.dev/media/dK9394r.gif',     // burpee
  carry: 'https://static.exercisedb.dev/media/qPEzJjA.gif',      // farmers walk
  plank: 'https://static.exercisedb.dev/media/VBAWRPG.gif',      // weighted front plank
  hangraise: 'https://static.exercisedb.dev/media/I3tsCnC.gif',  // hanging leg raise
  // ── Hevy upper/lower program movements ──
  dbrow: 'https://static.exercisedb.dev/media/BJ0Hz5L.gif',          // dumbbell bent over row
  dbshoulder: 'https://static.exercisedb.dev/media/znQUdHY.gif',     // dumbbell seated shoulder press
  chestfly: 'https://static.exercisedb.dev/media/v3xmPAR.gif',       // lever seated fly
  dipmachine: 'https://static.exercisedb.dev/media/BRImeP8.gif',     // lever seated dip
  dbrdl: 'https://static.exercisedb.dev/media/rR0LJzx.gif',          // dumbbell romanian deadlift
  legext: 'https://static.exercisedb.dev/media/my33uHU.gif',         // lever leg extension
  seatedcurl: 'https://static.exercisedb.dev/media/Zg3XY7P.gif',     // lever seated leg curl
  calfext: 'https://static.exercisedb.dev/media/7B4F5nZ.gif',        // lever calf press
  crunchmachine: 'https://static.exercisedb.dev/media/Wgaz7pm.gif',  // lever seated crunch
  kneeraise: 'https://static.exercisedb.dev/media/weoDEpH.gif',      // captains chair straight leg raise
  machinerow: 'https://static.exercisedb.dev/media/7I6LNUG.gif',     // lever seated row
  wristcurl: 'https://static.exercisedb.dev/media/2dImyQ8.gif',      // dumbbell seated palms up wrist curl
  preacher: 'https://static.exercisedb.dev/media/qOgPVf6.gif',       // barbell preacher curl
  backext: 'https://static.exercisedb.dev/media/zhMwOwE.gif',        // hyperextension
  singlelegpress: 'https://static.exercisedb.dev/media/WWD6FzI.gif', // sled 45° one leg press
  hipabd: 'https://static.exercisedb.dev/media/CHpahtl.gif',         // lever seated hip abduction
  hipadd: 'https://static.exercisedb.dev/media/oHsrypV.gif',         // lever seated hip adduction
}

export const gifFor = (lib: string): string | undefined => EXERCISE_GIFS[lib]
