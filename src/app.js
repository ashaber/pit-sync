import {
  getLaps, saveLaps,
  getClState, saveClState, clearClState,
  setLapStartEpoch,
  setManualStartEpoch, clearManualStart, getRawManualStart,
} from './storage.js';
import {
  RACE_START_FIXED, RACE_DURATION_MS, COUNTDOWN_WINDOW,
  getRaceStart, getRaceEnd, getLapStartTime,
  formatHMS, formatHM, formatMM,
} from './timer.js';
import { CHECKLIST, buildDefaultClState, countChecklist } from './checklist.js';
import { GIVEN_LABELS, RET_LABELS, calcLapStats } from './laps.js';

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
    html += `<div class="checklist-section"><div class="section-header">${section.title}</div>`;
    section.items.forEach(item => {
      const checked = clState[item.id];
      html += `<div class="checklist-item${checked ? ' done' : ''}" onclick="toggleClItem('${item.id}')">`;
      html += `<div class="cl-check"></div><div class="cl-text">${item.text}</div></div>`;
    });
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

function resetRace() {
  if (!confirm('Reset race timer? This only resets the clock, not lap data.')) return;
  clearManualStart();
  renderLapTimerUI();
}

function renderLapTimerUI() {
  const now      = new Date();
  const start    = getRaceStart();
  const prerace  = now < start;
  const inWindow = (start - now) <= COUNTDOWN_WINDOW;
  const manual   = !!getRawManualStart();
  document.getElementById('prerace-ui').classList.toggle('hidden', !(prerace && inWindow));
  document.getElementById('reset-race-btn').classList.toggle('hidden', !manual);
  document.getElementById('log-lap-btn').classList.toggle('hidden', prerace && inWindow && !manual);
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

function selectSignal(btn) {
  document.querySelectorAll('.signal-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.querySelectorAll('#given-grid .check-opt').forEach(el => el.classList.remove('checked'));
  const auto = { GOOD: ['large2', 'gel'], ADJUST: ['large2'], WATER: ['water'], LAYERS: [], BATTERY: [], MECH: [] };
  (auto[btn.dataset.signal] || []).forEach(id => {
    const el = document.querySelector(`#given-grid [data-id="${id}"]`);
    if (el) el.classList.add('checked');
  });
}

function toggleCheck(el) { el.classList.toggle('checked'); }

function adjustTime(delta) {
  timeAdjustMin = Math.max(-30, Math.min(30, timeAdjustMin + delta));
  updateTimeCaptureDisplay();
}

function saveLap() {
  const now      = new Date();
  const finalMs  = Math.max(0, capturedLapMs - timeAdjustMin * 60000);
  const signal   = document.querySelector('.signal-btn.selected')?.dataset.signal || '';
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

  if (!laps.length) {
    container.innerHTML = '<div class="no-laps">No laps logged yet.<br>Race starts 9:00am June 13.</div>';
    statsEl.classList.add('hidden');
    return;
  }

  statsEl.classList.remove('hidden');
  const stats = calcLapStats(laps);
  const pad   = n => String(n).padStart(2, '0');
  document.getElementById('stat-laps').textContent = stats.count;
  document.getElementById('stat-avg').textContent  = stats.avg  || '—';
  document.getElementById('stat-best').textContent = stats.best < Infinity ? stats.best : '—';
  document.getElementById('stat-gels').textContent = stats.gels;

  let html = '<div class="lap-history-title">Lap History</div>';
  [...laps].reverse().forEach(lap => {
    const h = Math.floor(lap.timeMin / 60), m = lap.timeMin % 60;
    const timeStr  = h > 0 ? `${h}h${pad(m)}m` : `${m}m`;
    const givenStr = lap.given.map(id => GIVEN_LABELS[id] || id).join(', ') || '—';
    const retStr   = lap.returned.map(id => RET_LABELS[id] || id).join(', ') || '—';
    html += `<div class="lap-row">
      <div class="lap-num">${lap.num}</div>
      <div class="lap-details">
        <div class="lap-time-row">
          <div class="lap-time">${timeStr}</div>
          ${lap.signal ? `<div class="lap-signal">${lap.signal}</div>` : ''}
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

// ── Expose globals for inline onclick handlers ────────────────────────────────

Object.assign(window, {
  showTab,
  toggleClItem,
  resetChecklist,
  openLapForm,
  closeLapForm,
  saveLap,
  deleteLap,
  selectSignal,
  toggleCheck,
  adjustTime,
  startRaceNow,
  resetRace,
});

// ── Init ──────────────────────────────────────────────────────────────────────

initClState();
renderChecklist();
renderLaps();
renderLapTimerUI();
setInterval(tickClock, 1000);
tickClock();
