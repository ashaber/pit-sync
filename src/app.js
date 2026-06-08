import {
  getLaps, saveLaps,
  getClState, saveClState, clearClState,
  setLapStartEpoch,
  setManualStartEpoch, clearManualStart, getRawManualStart,
  getRaceStopped, setRaceStopped, clearRaceStopped,
  getRaceNotes, saveRaceNotes,
  getTabNotes, saveTabNotes,
} from './storage.js';
import {
  RACE_START_FIXED, RACE_DURATION_MS, COUNTDOWN_WINDOW,
  getRaceStart, getRaceEnd, getLapStartTime,
  formatHMS, formatHM, formatMM,
} from './timer.js';
import { CHECKLIST, buildDefaultClState, countChecklist } from './checklist.js';
import { GIVEN_LABELS, RET_LABELS, calcLapStats, exportRaceData } from './laps.js';
import { marked } from 'marked';
import racePlanMd  from '../race-plan.md?raw';
import raceBibleMd from '../race-bible.md?raw';

let laps          = getLaps();
let clState       = getClState();
let lapFormOpen   = false;
let capturedLapMs = 0;
let timeAdjustMin = 0;

// ── Checklist ─────────────────────────────────────────────────────────────────

function initClState() {
  if (clState) return;
  clState = buildDefaultClState(CHECKLIST);
  saveClState(clState);
}

function toggleClItem(id) {
  clState[id] = !clState[id];
  saveClState(clState);
  renderChecklist();
}

function resetChecklist() {
  if (!confirm('Reset all checklist items to defaults?')) return;
  clState = null;
  clearClState();
  initClState();
  renderChecklist();
}

function renderChecklist() {
  const body = document.getElementById('checklist-body');
  const { total, done } = countChecklist(CHECKLIST, clState);
  let html = '';
  CHECKLIST.forEach(section => {
    const unchecked = section.items.filter(item => !clState[item.id]);
    const checked   = section.items.filter(item =>  clState[item.id]);
    html += `<div class="checklist-section"><div class="section-header">${section.title}</div>`;
    unchecked.forEach(item => {
      html += `<div class="checklist-item" onclick="toggleClItem('${item.id}')">`;
      html += `<div class="cl-check"></div><div class="cl-text">${item.text}</div></div>`;
    });
    if (checked.length) {
      if (unchecked.length) html += `<div class="cl-done-divider">Completed</div>`;
      checked.forEach(item => {
        html += `<div class="checklist-item done" onclick="toggleClItem('${item.id}')">`;
        html += `<div class="cl-check"></div><div class="cl-text">${item.text}</div></div>`;
      });
    }
    html += `</div>`;
  });
  body.innerHTML = html;
  document.getElementById('cl-done').textContent  = done;
  document.getElementById('cl-total').textContent = total;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
}

// ── Race timer / pre-race UI ──────────────────────────────────────────────────

function startRaceNow() {
  setManualStartEpoch(Date.now());
  setLapStartEpoch(Date.now());
  renderLapTimerUI();
}

function stopRace() {
  if (!confirm('Stop the race? Lap entry will be blocked until reset.')) return;
  setRaceStopped();
  if (lapFormOpen) closeLapForm();
  renderLapTimerUI();
}

function resetRace() {
  if (!confirm('Reset race timer? This only resets the clock, not lap data.')) return;
  clearManualStart();
  clearRaceStopped();
  renderLapTimerUI();
}

function renderLapTimerUI() {
  const now      = new Date();
  const start    = getRaceStart();
  const prerace  = now < start;
  const inWindow = (start - now) <= COUNTDOWN_WINDOW;
  const manual   = !!getRawManualStart();
  const stopped  = !!getRaceStopped();

  document.getElementById('prerace-ui').classList.toggle('hidden', !(prerace && inWindow));
  document.getElementById('stop-race-btn').classList.toggle('hidden', prerace || stopped);
  document.getElementById('reset-race-btn').classList.toggle('hidden', !manual && !stopped);
  document.getElementById('log-lap-btn').classList.toggle('hidden', (prerace && inWindow && !manual) || stopped);
}

function tickClock() {
  const now   = new Date();
  const start = getRaceStart();
  const end   = getRaceEnd();
  const elEl  = document.getElementById('elapsed-display');
  const remEl = document.getElementById('remaining-display');
  const lapEl = document.getElementById('lap-display');
  const cdEl  = document.getElementById('countdown-display');

  if (now < start) {
    const toStart     = start - now;
    elEl.textContent  = '-' + formatHMS(toStart);
    elEl.className    = 'clock-value';
    remEl.textContent = '8:00';
    remEl.className   = 'clock-value';
    lapEl.textContent = '—';
    lapEl.className   = 'clock-value cv-green';
    if (cdEl) cdEl.textContent = formatHMS(toStart);
    renderLapTimerUI();
  } else if (now >= end) {
    elEl.textContent  = '8:00:00';
    elEl.className    = 'clock-value';
    remEl.textContent = 'DONE';
    remEl.className   = 'clock-value cv-red';
    lapEl.textContent = '—';
    lapEl.className   = 'clock-value';
  } else {
    elEl.textContent  = formatHMS(now - start);
    elEl.className    = 'clock-value cv-accent';
    const remMs       = end - now;
    remEl.textContent = formatHM(remMs);
    const remH        = remMs / 3600000;
    remEl.className   = 'clock-value ' + (remH > 2 ? 'cv-green' : remH > 1 ? 'cv-accent' : 'cv-red');
    lapEl.textContent = formatMM(now - getLapStartTime());
    lapEl.className   = 'clock-value cv-green';
  }

  if (lapFormOpen) {
    capturedLapMs = new Date() - getLapStartTime();
    updateTimeCaptureDisplay();
  }
}

// ── Lap form ──────────────────────────────────────────────────────────────────

function openLapForm() {
  lapFormOpen   = true;
  capturedLapMs = new Date() - getLapStartTime();
  timeAdjustMin = 0;
  document.querySelectorAll('.signal-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.check-opt').forEach(b => b.classList.remove('checked'));
  document.getElementById('lap-notes').value = '';
  updateTimeCaptureDisplay();
  document.getElementById('log-lap-btn').classList.add('hidden');
  document.getElementById('lap-form-container').classList.remove('hidden');
  document.getElementById('lap-form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeLapForm() {
  lapFormOpen = false;
  document.getElementById('lap-form-container').classList.add('hidden');
  document.getElementById('log-lap-btn').classList.remove('hidden');
}

function updateTimeCaptureDisplay() {
  const finalMs = Math.max(0, capturedLapMs - timeAdjustMin * 60000);
  document.getElementById('time-captured-display').textContent = formatMM(finalMs);
}

function toggleSignal(btn) {
  btn.classList.toggle('selected');
  if (btn.dataset.signal === 'GOOD' && btn.classList.contains('selected')) {
    document.querySelectorAll('#given-grid .check-opt').forEach(el => el.classList.remove('checked'));
    ['large2', 'gel'].forEach(id => {
      const el = document.querySelector(`#given-grid [data-id="${id}"]`);
      if (el) el.classList.add('checked');
    });
  }
}

function toggleCheck(el) { el.classList.toggle('checked'); }

function adjustTime(delta) {
  timeAdjustMin = Math.max(-30, Math.min(30, timeAdjustMin + delta));
  updateTimeCaptureDisplay();
}

function saveLap() {
  const now      = new Date();
  const finalMs  = Math.max(0, capturedLapMs - timeAdjustMin * 60000);
  const signal   = [...document.querySelectorAll('.signal-btn.selected')].map(b => b.dataset.signal);
  const given    = [...document.querySelectorAll('#given-grid .check-opt.checked')].map(el => el.dataset.id);
  const returned = [...document.querySelectorAll('#returned-grid .check-opt.checked')].map(el => el.dataset.id);
  const notes    = document.getElementById('lap-notes').value.trim();

  laps.push({
    num: laps.length + 1,
    timeMs: finalMs,
    timeMin: Math.round(finalMs / 60000),
    signal, given, returned, notes,
    logged: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  });

  saveLaps(laps);
  setLapStartEpoch(now.getTime());
  closeLapForm();
  renderLaps();
}

function deleteLap(num) {
  if (!confirm(`Delete lap ${num}?`)) return;
  laps = laps.filter(l => l.num !== num);
  laps.forEach((l, i) => { l.num = i + 1; });
  saveLaps(laps);
  renderLaps();
}

// ── Lap history ───────────────────────────────────────────────────────────────

function renderLaps() {
  const container = document.getElementById('lap-history');
  const statsEl   = document.getElementById('summary-stats');
  const exportBtn = document.getElementById('export-btn');

  if (!laps.length) {
    container.innerHTML = '<div class="no-laps">No laps logged yet.<br>Race starts 9:00am June 13.</div>';
    statsEl.classList.add('hidden');
    exportBtn.classList.add('hidden');
    return;
  }

  statsEl.classList.remove('hidden');
  exportBtn.classList.remove('hidden');
  const stats = calcLapStats(laps);
  const pad   = n => String(n).padStart(2, '0');
  document.getElementById('stat-laps').textContent = stats.count;
  document.getElementById('stat-avg').textContent  = stats.avg  || '—';
  document.getElementById('stat-best').textContent = stats.best < Infinity ? stats.best : '—';
  document.getElementById('stat-gels').textContent = stats.gels;

  let html = '<div class="lap-history-title">Lap History</div>';
  [...laps].reverse().forEach(lap => {
    const h = Math.floor(lap.timeMin / 60), m = lap.timeMin % 60;
    const timeStr    = h > 0 ? `${h}h${pad(m)}m` : `${m}m`;
    const givenStr   = lap.given.map(id => GIVEN_LABELS[id] || id).join(', ') || '—';
    const retStr     = lap.returned.map(id => RET_LABELS[id] || id).join(', ') || '—';
    const signals    = Array.isArray(lap.signal) ? lap.signal : (lap.signal ? [lap.signal] : []);
    const signalStr  = signals.join(' · ');
    html += `<div class="lap-row">
      <div class="lap-num">${lap.num}</div>
      <div class="lap-details">
        <div class="lap-time-row">
          <div class="lap-time">${timeStr}</div>
          ${signalStr ? `<div class="lap-signal">${signalStr}</div>` : ''}
        </div>
        <div class="lap-meta">Given: ${givenStr}</div>
        <div class="lap-meta">Returned: ${retStr}</div>
        ${lap.notes ? `<div class="lap-notes-text">${lap.notes}</div>` : ''}
        <div class="lap-meta">Logged ${lap.logged}</div>
      </div>
      <button class="lap-delete" onclick="deleteLap(${lap.num})">✕</button>
    </div>`;
  });
  container.innerHTML = html;
}

// ── Export ────────────────────────────────────────────────────────────────────

function exportData() {
  const json = exportRaceData(laps, getRaceNotes());
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = '9to5_jmr_2026_laps.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Markdown render (Plan + Bible tabs) ───────────────────────────────────────

function renderMarkdown(md, el) {
  el.innerHTML = marked.parse(md);
  el.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
}

// ── Expose globals for inline onclick handlers ────────────────────────────────

Object.assign(window, {
  showTab,
  toggleClItem,
  resetChecklist,
  openLapForm,
  closeLapForm,
  saveLap,
  deleteLap,
  toggleSignal,
  toggleCheck,
  adjustTime,
  startRaceNow,
  stopRace,
  resetRace,
  exportData,
});

// ── Init ──────────────────────────────────────────────────────────────────────

initClState();
renderChecklist();
renderLaps();
renderLapTimerUI();
setInterval(tickClock, 1000);
tickClock();

renderMarkdown(racePlanMd,  document.getElementById('plan-content'));
renderMarkdown(raceBibleMd, document.getElementById('bible-content'));

document.getElementById('race-notes').value = getRaceNotes();
document.getElementById('race-notes').addEventListener('input', e => saveRaceNotes(e.target.value));

['checklist', 'plan', 'bible'].forEach(tab => {
  const el = document.getElementById(`notes-${tab}`);
  if (!el) return;
  el.value = getTabNotes(tab);
  el.addEventListener('input', e => saveTabNotes(tab, e.target.value));
});
