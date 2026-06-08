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

### IDEA-009
**Decision: Dropped — not filled in. Re-open if needed.**

---

### ENH-JSON — JSON export of lap data
Download all lap data and race overview as a single JSON file for post-race analysis.

**Decision: In scope this week.**
- One button in the lap tracker, visible after ≥1 lap logged
- Export includes all lap records + race overview (count, avg, best, gel count)
