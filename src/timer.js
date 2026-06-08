import { getRawLapStart, getRawManualStart } from './storage.js';

export const RACE_START_FIXED = new Date('2026-06-13T09:00:00');
export const RACE_DURATION_MS = 8 * 60 * 60 * 1000;
export const COUNTDOWN_WINDOW = 30 * 60 * 1000;

export function getRaceStart() {
  const m = getRawManualStart();
  return m ? new Date(parseInt(m)) : RACE_START_FIXED;
}

export function getRaceEnd() {
  return new Date(getRaceStart().getTime() + RACE_DURATION_MS);
}

export function getLapStartTime() {
  const stored = getRawLapStart();
  if (stored) return new Date(parseInt(stored));
  const now = new Date();
  return now >= RACE_START_FIXED ? RACE_START_FIXED : now;
}

const pad = n => String(n).padStart(2, '0');

export function formatHMS(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export function formatHM(ms) {
  if (ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}`;
}

export function formatMM(ms) {
  if (ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}
