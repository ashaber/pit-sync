import { describe, it, expect, beforeEach } from 'vitest';
import {
  RACE_START_FIXED, RACE_DURATION_MS, COUNTDOWN_WINDOW,
  getRaceStart, getRaceEnd,
  formatHMS, formatHM, formatMM,
} from '../../src/timer.js';
import { setManualStartEpoch, clearManualStart } from '../../src/storage.js';

beforeEach(() => { localStorage.clear(); });

describe('constants', () => {
  it('RACE_START_FIXED is 2026-06-13 09:00 local', () => {
    expect(RACE_START_FIXED.getFullYear()).toBe(2026);
    expect(RACE_START_FIXED.getMonth()).toBe(5); // June = 5
    expect(RACE_START_FIXED.getDate()).toBe(13);
    expect(RACE_START_FIXED.getHours()).toBe(9);
  });

  it('RACE_DURATION_MS is 8 hours', () => {
    expect(RACE_DURATION_MS).toBe(8 * 60 * 60 * 1000);
  });

  it('COUNTDOWN_WINDOW is 30 minutes', () => {
    expect(COUNTDOWN_WINDOW).toBe(30 * 60 * 1000);
  });
});

describe('getRaceStart', () => {
  it('returns RACE_START_FIXED when no manual start is set', () => {
    expect(getRaceStart().getTime()).toBe(RACE_START_FIXED.getTime());
  });

  it('returns the manual start time when set', () => {
    const ts = Date.now();
    setManualStartEpoch(ts);
    expect(getRaceStart().getTime()).toBe(ts);
  });
});

describe('getRaceEnd', () => {
  it('returns fixed start + 8h when no manual start', () => {
    const expected = RACE_START_FIXED.getTime() + RACE_DURATION_MS;
    expect(getRaceEnd().getTime()).toBe(expected);
  });

  it('returns manual start + 8h when manual start is set', () => {
    const ts = Date.now();
    setManualStartEpoch(ts);
    expect(getRaceEnd().getTime()).toBe(ts + RACE_DURATION_MS);
  });
});

describe('formatHMS', () => {
  it('formats 0ms as 0:00:00', () => {
    expect(formatHMS(0)).toBe('0:00:00');
  });

  it('formats negative ms as 0:00:00', () => {
    expect(formatHMS(-5000)).toBe('0:00:00');
  });

  it('formats 1 hour exactly', () => {
    expect(formatHMS(3600000)).toBe('1:00:00');
  });

  it('formats 1h 23m 45s', () => {
    expect(formatHMS((1 * 3600 + 23 * 60 + 45) * 1000)).toBe('1:23:45');
  });

  it('pads minutes and seconds with leading zero', () => {
    expect(formatHMS(65000)).toBe('0:01:05');
  });

  it('formats 8 hours (full race)', () => {
    expect(formatHMS(8 * 3600000)).toBe('8:00:00');
  });
});

describe('formatHM', () => {
  it('formats 0ms as 0:00', () => {
    expect(formatHM(0)).toBe('0:00');
  });

  it('formats negative ms as 0:00', () => {
    expect(formatHM(-1000)).toBe('0:00');
  });

  it('formats 2h 30m', () => {
    expect(formatHM((2 * 60 + 30) * 60000)).toBe('2:30');
  });

  it('pads minutes', () => {
    expect(formatHM(60000 * 5)).toBe('0:05');
  });
});

describe('formatMM', () => {
  it('formats 0ms as 0:00', () => {
    expect(formatMM(0)).toBe('0:00');
  });

  it('formats negative ms as 0:00', () => {
    expect(formatMM(-500)).toBe('0:00');
  });

  it('formats 58m 30s', () => {
    expect(formatMM((58 * 60 + 30) * 1000)).toBe('58:30');
  });

  it('pads seconds with leading zero', () => {
    expect(formatMM(65000)).toBe('1:05');
  });
});
