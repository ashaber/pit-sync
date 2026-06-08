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
- Vanilla JS, ES modules (when modularized), no framework
- localStorage for all persistence
- Static HTML — no build step in Phase 1
- GitHub Pages deployment
- UUIDs when data model matures (Phase 2+)

**Do not introduce frameworks, bundlers, or backend dependencies without updating this file and the ROADMAP.**

---

## Current State

Phase 1 — single `index.html` file. All HTML, CSS, and JS inline. Deployed to GitHub Pages from root. No build step.

Core features implemented:
- Three-tab navigation: Checklist / Pacing / Lap Tracker
- Checklist with localStorage persistence, progress tracking, reset
- Pacing reference card (read-only) — power/HR targets, signal legend, nutrition protocol
- Lap tracker: timer, lap entry form, lap history, summary stats
- All data persists via localStorage across sessions
- Mobile-first dark UI, works offline

---

## Data Model

### localStorage Keys
```
race_pit_checklist    — object: { [itemId]: boolean }
race_pit_laps         — array: Lap[]
```

Note: current keys are `9to5_2026_checklist` and `9to5_2026_laps` — these are race-specific. When generalizing, migrate to `race_pit_*` namespace with a race_id prefix.

### Lap Object
```javascript
{
  num: number,          // lap number, 1-indexed
  time: number,         // total minutes
  bottleOut: string,    // 'large-2' | 'large-3' | 'small-2' | 'water' | 'none'
  bottleRet: string,    // 'empty' | 'half' | 'mostly' | 'kept' | 'none'
  gel: string,          // 'yes' | 'yes-caff' | 'no'
  condition: string,    // 'good' | 'adjust' | 'water' | 'layers' | 'battery' | 'mechanical'
  notes: string,        // free text
  logged: string,       // display time string HH:MM
}
```

### Checklist Item
```javascript
{
  id: string,           // unique, e.g. 'fri1', 'bik3'
  text: string,         // display text
  note?: string,        // optional sub-text
}
```

---

## Design Decisions

### Why inline HTML not modular JS
Phase 1 priority is race-readiness by June 13, 2026. Single file is trivially deployable, no build errors, no module resolution issues. Refactor to ES modules in Phase 2.

### Why no framework
Same reasoning as mtb-skills. Offline-first, low complexity, no reactive state requirements that justify the overhead. Vanilla JS is sufficient and eliminates dependency risk.

### Why dark theme
Outdoor use in variable light conditions. High contrast is more readable in bright sunlight and at dusk.

### Why localStorage not IndexedDB
Simplicity. Lap data volume is small (8–10 objects per race). IndexedDB adds async complexity with no meaningful benefit at this scale. Revisit if multi-race history becomes a requirement.

### Checklist data is hardcoded
Race-specific checklists are intentional — they encode known failure modes from prior races (forgotten layers, poor pit communication). Generalizing to user-defined checklists is Phase 3+.

### Pacing reference is read-only
Pacing targets are derived from FIT file analysis of prior race data (FTP 277W, LTHR 172bpm, 9.64mi course, 1369ft climb/lap). These are not editable in the UI — they are race-specific constants. Future versions may make these configurable.

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

- [ ] localStorage keys are race-specific (`9to5_2026_*`) — not yet generalized
- [ ] No data export (JSON download) for post-race analysis
- [ ] No PWA manifest or service worker — not installable as true PWA yet
- [ ] Checklist items are hardcoded — no user-defined items
- [ ] No multi-race support
- [ ] Timer does not persist if tab is backgrounded on some iOS versions
- [ ] No undo on lap deletion

---

## Roadmap

### Phase 0.5 — Enhancements (pre-race, this week)
- [ ] ENH-001: Manual race start button for testing + pre-race countdown (within 30 min of start) — implemented, needs verification

### Phase 1 (current — race-ready)
- [x] Single HTML file
- [x] Checklist with persistence
- [x] Pacing reference
- [x] Lap tracker with timer
- [x] GitHub Pages deployment

### Phase 2 — Generalization
- [ ] google docs data sync when on-line
- [ ] shared checklist between pit and athlete
- [ ] PWA manifest + service worker (vite-plugin-pwa, matching mtb-skills Phase 2)
- [ ] Configurable race profile (FTP, LTHR, course details, pacing targets)
- [ ] Configurable pit signal vocabulary
- [ ] JSON export of lap data
- [ ] Multi-race history with race selection
- [ ] Migrate to ES modules + Vite build (matching mtb-skills stack)
- [ ] Generalize localStorage keys with race_id prefix

### Phase 3 — Integration
- [ ] Share lap data with athlete's Garmin/Strava post-race (export format)
- [ ] Optional: merge into mtb-skills repo as a separate tool under `/race`
- [ ] Optional: Google Sheets sync for Renee's post-race notes
- [ ] multi-athlete version

### Moonshot
- [ ] Live power/HR overlay if athlete device has ANT+ broadcast and pit has signal

---

## Repo Structure (Phase 1)

```
race-pit-tool/
  index.html        ← entire app (HTML + CSS + JS inline)
  CLAUDE.md         ← this file
  README.md         ← public-facing description
  race-bible.md     <- description of this race 
  race-plan.md      <- plan for this race including race week timeline
  race-checklist.md <- readiness checklist
  .github/
    workflows/
      deploy.yml    ← GitHub Pages static deploy (copy from mtb-skills)
```

---

## Development Notes

- Test on mobile Safari (iOS) and Chrome Android — these are the target browsers
- Always verify localStorage works after any storage key changes
- Do not add dependencies without confirming offline-first behavior is preserved
- The checklist sections (friday/pit/renee/morning/bike/gear/nutrition) map directly to known race failure modes — do not restructure without understanding the racing context
- Pacing targets are derived from FIT file analysis — do not change without new race data

---

## Related Projects

- `ashaber/mtb-skills` — NICA coach assessment tool. Same tech philosophy, same deployment pattern. Reference for architecture decisions.
- Race plan document: `9to5_2026_Race_Plan.md` — full pacing strategy, pit protocol, equipment checklist

---

*Last updated: June 2026 | Pre-race build*
