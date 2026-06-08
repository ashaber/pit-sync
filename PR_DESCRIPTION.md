# PR: Phase 0.5 enhancements — pre-race build

**Branch:** `enhancements` → `main`

## Summary

- Implement all Phase 0.5 roadmap items in preparation for the 9 to 5 @ JMR 2026 race (June 13)
- Add race stop button, multi-select signals, improved returned bottle tracking, notes fields, JSON export, and markdown-rendered Plan/Bible tabs
- 51 unit tests passing; build clean

## Changes

- **IDEA-001 — Stop race button:** New button blocks lap entry when activated. Reset clears stopped state. Hidden pre-race and after stop.
- **IDEA-002/003 — Plan + Bible tabs from markdown:** `race-plan.md` and `race-bible.md` are now rendered at build time via marked.js. Links open in new tab. Hardcoded HTML removed.
- **IDEA-005 — Lap entry refinements:** Signal buttons are now multi-select (e.g. GOOD + BATTERY together). GOOD still auto-fills large2 + gel. Returned bottle scale updated to {empty | 1/4 | 1/2 | 3/4 | kept | nothing}.
- **IDEA-006 — Checklist float:** Checked items move to bottom of their section with a "Completed" divider, keeping unchecked items visible at top.
- **IDEA-007 — Race notes:** Persistent free-text textarea at bottom of Lap Tracker tab, stored in localStorage.
- **IDEA-008 — Per-tab notes:** Notes textareas on Checklist, Plan, and Bible tabs, each persisted independently in localStorage.
- **ENH-JSON — Export:** "↓ Export lap data" button appears after first lap is logged. Downloads full race JSON (laps + stats + notes).

## Test plan

- [ ] CI passes (npm test + vite build)
- [ ] Smoke-test on Chrome Android (Renee's phone) after Pages deploys
- [ ] Verify Plan and Bible tabs render markdown content (not blank)
- [ ] Log a lap and confirm multi-signal and new returned options save correctly
- [ ] Check off a checklist item and confirm it floats to bottom
- [ ] Confirm race notes persist across tab close/reopen
- [ ] Confirm export downloads valid JSON
