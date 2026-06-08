import {
  getLaps, saveLaps,
  getClState, saveClState, clearClState,
  setLapStartEpoch,
  setManualStartEpoch, clearManualStart, getRawManualStart,
  getRaceStopped, setRaceStopped, clearRaceStopped,
  getRaceNotes, saveRaceNotes,
  getTabNotes, saveTabNotes,
  getTimelineState, saveTimelineState, clearTimelineState,
} from './storage.js';
import {
  RACE_START_FIXED, RACE_DURATION_MS, COUNTDOWN_WINDOW,
  getRaceStart, getRaceEnd, getLapStartTime,
  formatHMS, formatHM, formatMM,
} from './timer.js';
import { CHECKLIST, buildDefaultClState, countChecklist } from './checklist.js';
import { GIVEN_LABELS, RET_LABELS, calcLapStats, exportRaceData } from './laps.js';
import { TIMELINE, buildDefaultTlState, findNextEvent } from './timeline.js';
import { marked } from 'marked';
import racePlanMd  from '../race-plan.md?raw';
import raceBibleMd from '../race-bible.md?raw';

let laps         = getLaps();
let clState      = getClState();
let tlState      = getTimelineState();
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

// ── Timeline ──────────────────────────────────────────────────────────────────

function initTlState() {
  if (tlState) return;
  tlState = buildDefaultTlState();
  saveTimelineState(tlState);
}

function toggleTlItem(id) {
  tlState[id] = !tlState[id];
  saveTimelineState(tlState);
  renderTimeline();
}

function renderTimeline() {
  const body = document.getElementById('timeline-body');
  let html = '';
  TIMELINE.forEach(section => {
    html += `<div class="tl-section"><div class="tl-section-title">${section.title}</div>`;
    section.events.forEach(event => {
      const done = !!tlState[event.id];
      const cls = ['tl-item', done ? 'done' : '', event.isStart ? 'race-start' : ''].filter(Boolean).join(' ');
      html += `<div class="${cls}" id="tl-${event.id}" onclick="toggleTlItem('${event.id}')">
        <div class="tl-check">${done ? '✓' : ''}</div>
        <div class="tl-content">
          <div class="tl-label">${event.label}</div>
          <div class="tl-time">${event.display}</div>
        </div>
      </div>`;
    });
    html += `</div>`;
  });
  body.innerHTML = html;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  if (name === 'timeline') {
    const nextId = findNextEvent(new Date());
    if (nextId) {
      const el = document.getElementById(`tl-${nextId}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  }
}

// ── Race timer / pre-race UI ──────────────────────────────────────────────────

function startRaceNow() {
  setManualStartEpoch(Date.now());
  setLapStartEpoch(Date.now());
  renderLapTimerUI();
}

function stopRace() {
  if (!confirm('Stop the race? Lap entry will be blocked until resumed.')) return;
  setRaceStopped();
  renderLapTimerUI();
}

function resumeRace() {
  clearRaceStopped();
  renderLapTimerUI();
}

function resetRace() {
  if (!confirm('Reset timer to pre-race? Lap data is kept.')) return;
  clearManualStart();
  clearRaceStopped();
  renderLapTimerUI();
}

function clearRaceData() {
  if (!confirm('Clear ALL race data? This removes all laps, notes, and resets the timer.')) return;
  laps = [];
  saveLaps(laps);
  clearManualStart();
  clearRaceStopped();
  renderLaps();
  renderLapTimerUI();
  resetLapForm();
}

function renderLapTimerUI() {
  const now     = new Date();
  const start   = getRaceStart();
  const prerace = now < start;
  const manual  = !!getRawManualStart();
  const stopped = !!getRaceStopped();
  const racing  = (manual || !prerace) && !stopped;

  document.getElementById('prerace-ui').classList.toggle('hidden', !prerace || manual);
  document.getElementById('stopped-ui').classList.toggle('hidden', !stopped);
  document.getElementById('stop-race-btn').classList.toggle('hidden', !racing);
  document.getElementById('lap-form-container').classList.toggle('hidden', !racing);
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

  const formEl = document.getElementById('lap-form-container');
  if (formEl && !formEl.classList.contains('hidden')) {
    capturedLapMs = new Date() - getLapStartTime();
    updateTimeCaptureDisplay();
  }
}

// ── Lap form ──────────────────────────────────────────────────────────────────

function resetLapForm() {
  capturedLapMs = new Date() - getLapStartTime();
  timeAdjustMin = 0;
  document.querySelectorAll('.signal-mode').forEach(b => b.classList.remove('selected'));
  document.getElementById('adjust-options').classList.add('hidden');
  document.querySelectorAll('.check-opt').forEach(b => b.classList.remove('checked'));
  document.querySelectorAll('.ret-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('lap-notes').value = '';
  selectSignalMode('STANDARD');
  updateTimeCaptureDisplay();
}

function updateTimeCaptureDisplay() {
  const finalMs = Math.max(0, capturedLapMs - timeAdjustMin * 60000);
  document.getElementById('time-captured-display').textContent = formatMM(finalMs);
}

function selectSignalMode(mode) {
  const btn = document.querySelector(`.signal-mode[data-mode="${mode}"]`);
  const isSelected = btn.classList.contains('selected');
  document.querySelectorAll('.signal-mode').forEach(b => b.classList.remove('selected'));
  document.getElementById('adjust-options').classList.add('hidden');
  document.querySelectorAll('#adjust-options .check-opt').forEach(el => el.classList.remove('checked'));
  if (!isSelected) {
    btn.classList.add('selected');
    document.querySelectorAll('#given-grid .check-opt').forEach(el => el.classList.remove('checked'));
    ['large2', 'gel'].forEach(id => {
      const el = document.querySelector(`#given-grid [data-id="${id}"]`);
      if (el) el.classList.add('checked');
    });
    if (mode === 'ADJUST') document.getElementById('adjust-options').classList.remove('hidden');
  }
}

function selectReturn(btn) {
  const isSelected = btn.classList.contains('selected');
  document.querySelectorAll('#returned-grid .ret-btn').forEach(b => b.classList.remove('selected'));
  if (!isSelected) btn.classList.add('selected');
}

function selectCondition(btn) {
  const isSelected = btn.classList.contains('selected');
  document.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('selected'));
  if (!isSelected) btn.classList.add('selected');
}

function toggleCheck(el) { el.classList.toggle('checked'); }

function adjustTime(delta) {
  timeAdjustMin = Math.max(-30, Math.min(30, timeAdjustMin + delta));
  updateTimeCaptureDisplay();
}

const COND_EMOJI = ['', '😞', '😕', '😐', '🙂', '😊'];

function saveLap() {
  const now     = new Date();
  const finalMs = Math.max(0, capturedLapMs - timeAdjustMin * 60000);

  const modeBtn = document.querySelector('.signal-mode.selected');
  const mode    = modeBtn ? modeBtn.dataset.mode : null;
  let signal    = [];
  if (mode === 'STANDARD') {
    signal = ['STANDARD'];
  } else if (mode === 'ADJUST') {
    const adjustments = [...document.querySelectorAll('#adjust-options .check-opt.checked')].map(el => el.dataset.id);
    signal = ['ADJUST', ...adjustments];
  }

  const given     = [...document.querySelectorAll('#given-grid .check-opt.checked')].map(el => el.dataset.id);
  const returned  = [...document.querySelectorAll('#returned-grid .ret-btn.selected')].map(el => el.dataset.id);
  const condBtn   = document.querySelector('.cond-btn.selected');
  const condition = condBtn ? Number(condBtn.dataset.val) : null;
  const notes     = document.getElementById('lap-notes').value.trim();

  laps.push({
    num: laps.length + 1,
    timeMs: finalMs,
    timeMin: Math.round(finalMs / 60000),
    signal, given, returned, condition, notes,
    logged: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  });

  saveLaps(laps);
  setLapStartEpoch(now.getTime());
  resetLapForm();
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
    const condStr    = lap.condition ? COND_EMOJI[lap.condition] : '';
    html += `<div class="lap-row">
      <div class="lap-num">${lap.num}</div>
      <div class="lap-details">
        <div class="lap-time-row">
          <div class="lap-time">${timeStr}</div>
          ${signalStr ? `<div class="lap-signal">${signalStr}</div>` : ''}
          ${condStr ? `<div class="lap-cond">${condStr}</div>` : ''}
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
  toggleTlItem,
  saveLap,
  deleteLap,
  selectSignalMode,
  toggleCheck,
  selectReturn,
  selectCondition,
  adjustTime,
  startRaceNow,
  stopRace,
  resumeRace,
  resetRace,
  clearRaceData,
  exportData,
});

// ── Init ──────────────────────────────────────────────────────────────────────

initClState();
renderChecklist();
initTlState();
renderTimeline();
renderLaps();
renderLapTimerUI();
resetLapForm();
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
