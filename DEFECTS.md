# PitSync Defects

## Open

*(none)*

---

## Closed

### BUG-001 — Checklist tab blank in browser
- **Status:** Closed
- **Root cause:** Unescaped apostrophe in single-quoted JS string (`it's been`) inside `<script>` tag — syntax error silently killed entire script block. Original write used `\'` which was then incorrectly "fixed" by removing the backslash.
- **Fix:** Changed string delimiter to double quotes for that item.
