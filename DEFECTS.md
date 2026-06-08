# PitSync Defects

## Open

---

## Closed

### BUG-005 — Resume vs Reset are one button
- **Status:** Closed
- **Root cause:** Stopped UI had a single "Resume / Reset Timer" button backed by `resetRace()`, which called `clearManualStart()` — wiping the clock position instead of just unblocking lap entry.
- **Fix:** Split into two functions: `resumeRace()` (clears stopped flag only, timer continues) and `resetRace()` (clears manual start + stopped, returns to pre-race). Stopped UI now shows three buttons: Resume Race / Reset Timer / Clear All Data.


### BUG-002 — Start and Stop buttons not showing
- **Status:** Closed
- **Root cause:** `inWindow` guard required being within 30 min of race start for the start button to appear.
- **Fix:** Removed `inWindow` guard — start button shows whenever pre-race and no manual start set.

### BUG-003/004 — Signal form two-mode redesign
- **Status:** Closed
- **Root cause:** Signal form had 6 individual toggle buttons instead of STANDARD/ADJUST two-mode system.
- **Fix:** Replaced with STANDARD (pre-fills large2 + gel) and ADJUST (same pre-fill + reveals WATER/LAYERS/BATTERY/MECH checkboxes). Lap data stores `['STANDARD']` or `['ADJUST', ...]`.

### BUG-001 — Checklist tab blank in browser
- **Status:** Closed
- **Root cause:** Unescaped apostrophe in single-quoted JS string caused silent syntax error killing entire script.
- **Fix:** Changed string delimiter to double quotes.
