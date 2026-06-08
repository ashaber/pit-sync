# CLAUDE.md — Race Pit Tool

AI working context for this project. Read this before making any changes.

---

## What This Is

A mobile-first pit crew tool for solo endurance MTB racing. Built for use by a pit crew person (Renee) during the 9 to 5 @ Jug Mountain Ranch (June 13, 2026) and intended to generalize for future races.

**Primary user:** Pit crew (Renee) — not the athlete. Phone in hand at pit area. Little or no cell service. Race brain environment — UI must be fast, clear, and require zero cognitive load.

**Secondary user:** Athlete (Andrew) — post-race review of lap data, pre-race checklist management.

---

## Architecture Philosophy

Follows the same patterns as `ashaber/mtb-skills`:
- Offline-first throughout — no network dependency
- Vanilla JS, ES modules, no framework
- localStorage for all persistence
- Vite build step (as of June 2026) — outputs to `dist/`, deployed to GitHub Pages
- UUIDs when data model matures (Phase 2+)

**Do not introduce frameworks or backend dependencies without updating this file.**

---

## Current State

Phase 1.5 — modular ES modules, Vite build, 51 unit tests. Deployed to GitHub Pages via CI.

Core features implemented:
- Five-tab navigation: Lap Tracker / Checklist / Pacing / Race Plan / Race Bible
- Checklist with localStorage persistence, progress tracking, reset
- Pacing reference card (read-only) — power/HR targets, signal legend, nutrition protocol
- Lap tracker: timer, manual race start, lap entry form, lap history, summary stats
- All data persists via localStorage across sessions
- Mobile-first dark UI, works offline

---

## Data Model

### localStorage Keys
```
9to5_2026_laps          — array: Lap[]
9to5_2026_checklist     — object: { [itemId]: boolean }
9to5_2026_lapstart      — epoch ms string: current lap start time
9to5_2026_manual_start  — epoch ms string: manual race start override
9to5_2026_race_stopped  — epoch ms string: manual race stop time (set by stop button)
9to5_2026_race_notes    — string: free-text overall race notes
```

Note: keys are race-specific. When generalizing, migrate to `race_pit_*` namespace with a race_id prefix (Phase 2).

### Lap Object
```javascript
{
  num: number,        // lap number, 1-indexed
  timeMs: number,     // lap duration in milliseconds
  timeMin: number,    // lap duration rounded to minutes
  signal: string[],   // array of signal words e.g. ['LAYERS', 'BATTERY']
  given: string[],    // items given: 'large2' | 'large3' | 'small' | 'water' | 'gel' | 'gel-caff'
  returned: string[], // items returned: 'empty' | '1/4' | '1/2' | '3/4' | 'kept' | 'nothing'
  notes: string,      // free text
  logged: string,     // display time string HH:MM
}
```

### Checklist Item
```javascript
{
  id: string,    // unique, e.g. 'bd9'
  text: string,  // display text
  def?: boolean, // true = checked by default
}
```

---

## Design Decisions

### Why ES modules + Vite (not single inline file)
Migrated in June 2026 after a Claude Desktop edit introduced smart/curly quotes that broke the entire script block (45 JS errors). Vite + Vitest gives us a test gate in CI — smart-quote regression and logic bugs are caught before deploy.

### Why no framework
Offline-first, low complexity, no reactive state requirements that justify the overhead. Vanilla JS eliminates dependency risk.

### Why dark theme
Outdoor use in variable light conditions. High contrast is more readable in bright sunlight and at dusk.

### Why localStorage not IndexedDB
Simplicity. Lap data volume is small (8–10 objects per race). Revisit if multi-race history becomes a requirement.

### Checklist data is hardcoded
Race-specific checklists encode known failure modes from prior races. Generalizing to user-defined checklists is Phase 3+.

### Pacing reference is read-only
Pacing targets derived from FIT file analysis (FTP 277W, LTHR 172bpm, 9.64mi course, 1369ft climb/lap). Not editable in UI — race-specific constants.

### Race Plan and Bible are rendered from .md files
`race-plan.md` and `race-bible.md` are the source of truth. Vite imports them as raw strings and marked.js renders them into the Plan and Bible tab panels at build time. Edit the .md files to update content; rebuild to see changes.

---

## Athlete Context (for race-specific configuration)

```
see race-plan.md for full profile
```

### Pit Signal Vocabulary (one-word, pre-agreed)
see race-plan.md for signal vocabulary

### Nutrition Protocol
see race-plan.md for nutrition protocol

---

## Known Issues / Deferred

- [ ] localStorage keys are race-specific (`9to5_2026_*`) — not yet generalized (Phase 2)
- [ ] No PWA manifest or service worker — not installable as true PWA (Phase 2)
- [ ] Checklist items are hardcoded — no user-defined items (Phase 3+)
- [ ] No multi-race support (Phase 2)
- [ ] No undo on lap deletion — delete + re-enter is acceptable workaround
- [x] ~~No data export~~ — JSON export added Phase 0.5
- [x] ~~Timer does not persist if tab backgrounded on iOS~~ — not using iOS; using Chrome Android. `tickClock` uses `Date.now()` so self-corrects on foreground. Deferred.

---

## Roadmap

### Phase 0.5 — Enhancements (pre-race, this week)
- [x] ENH-001: Manual race start button + pre-race countdown (within 30 min of start)
- [x] Build tooling: Vite + Vitest, modular ES modules, CI gate
- [ ] IDEA-001: Manual race stop button — blocks lap entry when stopped
- [ ] IDEA-002/003: race-plan.md + race-bible.md rendered via marked.js, links active
- [ ] IDEA-005: Returned bottle scale {empty|1/4|1/2|3/4|kept|nothing}, multi-select signals
- [ ] IDEA-006: Checked checklist items float to bottom of their section
- [ ] IDEA-007: Overall race notes text area (Lap Tracker tab, localStorage)
- [ ] IDEA-008: Per-tab notes on Plan/Bible/Checklist — mobile text area, localStorage per tab
- [ ] ENH-JSON: JSON export button (lap data + race overview)

### Phase 1 (race-ready baseline — complete)
- [x] Checklist with persistence
- [x] Pacing reference
- [x] Lap tracker with timer
- [x] GitHub Pages deployment

### Phase 2 — Generalization (post-race)
- [ ] Google Docs data sync when online
- [ ] Shared checklist between pit and athlete
- [ ] PWA manifest + service worker
- [ ] Configurable race profile (FTP, LTHR, course details, pacing targets)
- [ ] Configurable pit signal vocabulary
- [ ] Multi-race history with race selection
- [ ] Generalize localStorage keys with race_id prefix

### Phase 3 — Integration (post-race)
- [ ] Share lap data with Garmin/Strava post-race
- [ ] Optional: merge into mtb-skills repo under `/race`
- [ ] Optional: Google Sheets sync for Renee's post-race notes
- [ ] Multi-athlete version
- [ ] User-defined checklist items

### Moonshot
- [ ] Live power/HR overlay if athlete device has ANT+ broadcast and pit has signal

---

## Repo Structure

```
pit-sync/
  index.html          ← HTML + CSS only; JS entry via <script type="module" src="/src/app.js">
  src/
    app.js            ← DOM layer, event handlers, global window bindings
    storage.js        ← all localStorage read/write
    timer.js          ← race timing, getRaceStart/End, formatHMS/HM/MM
    checklist.js      ← CHECKLIST data, buildDefaultClState, countChecklist
    laps.js           ← GIVEN_LABELS, RET_LABELS, calcLapStats
  tests/
    unit/             ← vitest unit tests (51 tests)
  race-plan.md        ← race plan source — edit here, rebuild to update Plan tab
  race-bible.md       ← race bible source — edit here, rebuild to update Bible tab
  CLAUDE.md           ← this file
  IDEAS.md            ← enhancement ideas and decisions
  DEFECTS.md          ← bug log
  vite.config.js
  package.json
  .github/
    workflows/
      deploy.yml      ← npm test → vite build → GitHub Pages deploy from dist/
```

---

## Development Notes

- Run `npm test` after any JS change — 51 tests including smart-quote regression
- Run `npm run dev` for local dev server with HMR
- Target browser: Chrome Android (Renee's phone). Also test Chrome desktop.
- Always verify localStorage works after any storage key changes
- Do not restructure checklist sections without understanding the racing context
- Pacing targets are derived from FIT file analysis — do not change without new race data
- `race-plan.md` and `race-bible.md` are the authoritative content source for Plan/Bible tabs

---

## Definition of Done (pre-race build)
- All unit tests pass (`npm test`)
- Can log laps and view lap history
- Can rebuild to update checklist, race plan, and race bible content
- Can start, stop, and reset the race timer
- JSON export downloads correctly
- Checklist checked items float to bottom of section
- Deployed and smoke-tested on target device

---

## Related Projects

- `ashaber/mtb-skills` — NICA coach assessment tool. Same tech philosophy, same deployment pattern. Reference for architecture decisions.

---

*Last updated: June 2026 | Pre-race build*
