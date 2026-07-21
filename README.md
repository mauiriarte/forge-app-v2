# Forge — Habit, Workout & Nutrition Tracker

Production implementation of the **ForgeApp v2** design (Claude Design handoff, July 2026).
A mobile-first React + TypeScript + Vite web app: 430px design width, dark-first, flat,
"the forge at night".

## Run

```sh
npm install
npm run dev      # http://localhost:5178
npm run build    # typecheck + production build to dist/
```

## What's in the app

- **Onboarding** — signup (email/password → body info → optional scan upload) and login,
  with validation gates. Sign out returns to login.
- **Home** — today's-workout hero (todo / complete / empty states), hydration card with
  tappable glass cells, behind-pace nudge, and a settings sheet (glass size, daily goal, reset).
- **Train** — today hero plus all routines; new-routine sheet (name, focus, training days).
- **Routine detail** — exercise cards with swipe-left to **Replace / Delete**, pencil →
  sets/reps sheet, add-exercise picker (26-movement library, routine-focus-first sort),
  ⋮ → edit-routine sheet (rename, days, two-tap delete confirm).
- **Active workout** — elapsed timer, per-set completion pills, 90s rest countdown ring
  (+30s / skip), per-set weight steppers (heaviest set becomes the logged weight),
  exercise reordering (DO NOW / BUSY · SKIP), collapsible completed section, finish/discard.
- **Exercise detail** — demo-GIF slot, live session panel, muscles, weight-progression chart.
- **Stats** — complete-weeks & hydration-streak counters → consistency calendar sheet
  (month grid, weekly goal), body-scan chart with ideal-range band, 8 metric tiles
  (BMI derived), segmental lean/fat, recent-workout history with PR pills.
- **Profile** — appearance (Dark / Light / Auto via `prefers-color-scheme`), body info, sign out.

Beyond the prototype: state persists to `localStorage` (including an in-flight workout),
hydration and trained-today reset on a new day, and exercise image slots accept a
dropped/browsed image that persists per exercise.

## Architecture

- `src/store/store.tsx` — single store (React class component + context), a faithful port
  of the prototype's logic: navigation stack + slide direction, session engine, swipe
  state machine, sheets, toasts, persistence.
- `src/screens/` — one component per screen; `src/sheets/` — the seven bottom sheets.
- `src/styles/tokens/` — the design-system tokens **verbatim** from the handoff
  (colors, typography, spacing/radii, motion). Theme/palette switch via
  `data-theme` / `data-palette` on `<html>`; JS-computed colors come from
  `src/lib/theme.ts`, which mirrors the same values. Never hardcode hex.
- `src/lib/library.ts` — the 26-movement exercise library.
- Font: Open Sauce One (self-hosted via `@fontsource`).

Design source of truth: the handoff bundle's `ForgeApp v2.dc.html` and
`design_handoff_forge/` design system (padding 76/20/132, radii 13–28+pill, one spring
curve `cubic-bezier(0.2,0.8,0.2,1)`, no shadows — borders + scrims + halos).
