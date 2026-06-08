## Ideas

### IDEA-001 — Add race start and stop button
Add a stop race button either if I finish or for testing. Maybe hide during actual race. Add reset button when stopped.

**Decision: In scope this week.**
- Stop button blocks new lap entries when active
- Lives near existing start/reset buttons in the lap tracker
- Reset clears the stopped state

---

### IDEA-002 — Race .md files rendered into HTML via build
Phase 1: allow updates to md files and have build load into html. Phase 2: upload md files to create a new race.

**Decision: Phase 1 in scope this week.**
- Vite `?raw` import + marked.js renders race-plan.md and race-bible.md at build time
- Fully replaces current hardcoded HTML in Plan and Bible tab panels
- Phase 2 (upload md for new race) deferred post-race

---

### IDEA-003 — Make links in race sources active (open in new tab)
Links in race source files should be clickable, open in a different browser tab.

**Decision: In scope this week, flows from IDEA-002.**
- marked.js renders `[text](url)` links automatically with `target="_blank"`
- Will update race-plan.md and race-bible.md with proper link syntax for Zone4.ca, email, Strava

---

### IDEA-004 — Allow edit to laps after save
Reopen lap entry form, allow changes, save over prior entry.

**Decision: Deferred post-race.**
- Delete + re-enter is acceptable for race day
- Adds state complexity too close to race

---

### IDEA-005 — Refine lap entry
Make returned bottle a scale. Allow multiple signal flags per lap.

**Decision: In scope this week.**
- Returned bottle: replace current options with {empty | 1/4 | 1/2 | 3/4 | kept | nothing} (6 options)
- Signal flags: allow multi-select (e.g., LAYERS + BATTERY together)
- GOOD still pre-selects large2 + gel as default

---

### IDEA-006 — Checked items move to bottom of section
Like Google Keep, checked items move to the bottom within their section so unchecked items stay visible at top.

**Decision: In scope this week.**
- Within each section: unchecked items render first, checked items append below with visual separator

---

### IDEA-007 — Overall race notes
Add a free-text race notes field for overall observations.

**Decision: In scope this week.**
- Persistent text area stored in localStorage
- Lives at the bottom of the Lap Tracker tab (visible during race, editable post-race)

---

### IDEA-008 — Notes on Plan, Bible, and Checklist tabs
Per-tab notes (feedback to organizer, notes for next year's race).

**Decision: In scope this week.**
- Mobile-optimized text area at the bottom of each tab (Plan, Bible, Checklist)
- Stored in localStorage per tab
- Written by Renee during or after race; full debrief done post-race via JSON export

---

### IDEA-009 — Race timeline tab
Race timeline as its own tab. Shows at least day before. Focus on nearest upcoming time and allow checklist behavior to mark timeline items completed. Plan ahead that cyclocross races this fall will have 2 days racing. Race day timeline is offset-based — plan defines offsets (e.g. meal 3hr before race start, warmup 55 min before race start).

**Status: Deferred — not in current build. Needs to be included before race day.**

---

### IDEA-010 — Restructure signal form (from post-release feedback)
Signal should be two modes, not six buttons:
- **STANDARD EXCHANGE** (replaces GOOD): pre-fills large2 + gel
- **ADJUST**: pre-fills large2 + gel (standard items stay checked), reveals adjustment checkboxes: WATER / LAYERS / BATTERY / MECH

When ADJUST is selected, standard items remain pre-checked. Renee selects which adjustments apply on top.

**Status: In scope — assign to CLI.**

---

### IDEA-011 — Returned bottle as visual scale (from post-release feedback)
Replace returned checkboxes with a horizontal single-select scale:
`Empty — 1/4 — 1/2 — 3/4 — Kept`
Faster to tap, visually clearer. "Nothing back" can be left unselected.

**Status: In scope — assign to CLI.**

---

### IDEA-012 — Rider condition scale (from post-release feedback)
Add a 5-point rider observation field to the lap form:
`😞 — 😕 — 😐 — 🙂 — 😊`
Color-coded red → green. Captured per lap for post-race analysis.

**Status: In scope — assign to CLI.**

---

### ENH-JSON — JSON export of lap data
Download all lap data and race overview as a single JSON file for post-race analysis.

**Decision: In scope this week.**
- One button in the lap tracker, visible after ≥1 lap logged
- Export includes all lap records + race overview (count, avg, best, gel count)


### ENH-lap-UI - tighten up view
move stop and reset buttons small and to right of "PITSYNC <RACENAME>" (STOP).  
reset button only shows when race is stopped, like a stopwatch  Reset clears the race
Start button reappears if race is stopped 
including removing laps.  Always show record lap on lap screen (no need for add lap button) - save lap records  Default to standard handup.  

