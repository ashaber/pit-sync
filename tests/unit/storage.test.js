import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLaps, saveLaps,
  getClState, saveClState, clearClState,
  getRawLapStart, setLapStartEpoch,
  getRawManualStart, setManualStartEpoch, clearManualStart,
} from '../../src/storage.js';

beforeEach(() => { localStorage.clear(); });

describe('laps', () => {
  it('getLaps returns empty array with no data', () => {
    expect(getLaps()).toEqual([]);
  });

  it('saveLaps / getLaps round-trips an array', () => {
    const laps = [{ num: 1, timeMin: 58, signal: 'GOOD', given: ['large2'], returned: [], notes: '', logged: '9:58' }];
    saveLaps(laps);
    expect(getLaps()).toEqual(laps);
  });

  it('saveLaps overwrites prior data', () => {
    saveLaps([{ num: 1, timeMin: 55 }]);
    saveLaps([{ num: 1, timeMin: 60 }]);
    expect(getLaps()[0].timeMin).toBe(60);
  });
});

describe('checklist state', () => {
  it('getClState returns null with no data', () => {
    expect(getClState()).toBeNull();
  });

  it('saveClState / getClState round-trips an object', () => {
    const state = { tr1: true, tr2: false };
    saveClState(state);
    expect(getClState()).toEqual(state);
  });

  it('clearClState makes getClState return null', () => {
    saveClState({ tr1: true });
    clearClState();
    expect(getClState()).toBeNull();
  });
});

describe('lap start time', () => {
  it('getRawLapStart returns null before any set', () => {
    expect(getRawLapStart()).toBeNull();
  });

  it('setLapStartEpoch / getRawLapStart stores and retrieves epoch string', () => {
    const now = Date.now();
    setLapStartEpoch(now);
    expect(parseInt(getRawLapStart())).toBe(now);
  });
});

describe('manual start', () => {
  it('getRawManualStart returns null before any set', () => {
    expect(getRawManualStart()).toBeNull();
  });

  it('setManualStartEpoch / getRawManualStart stores epoch string', () => {
    const ts = 1749812400000;
    setManualStartEpoch(ts);
    expect(parseInt(getRawManualStart())).toBe(ts);
  });

  it('clearManualStart removes the value', () => {
    setManualStartEpoch(Date.now());
    clearManualStart();
    expect(getRawManualStart()).toBeNull();
  });
});
