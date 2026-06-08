import { describe, it, expect } from 'vitest';
import { calcLapStats, GIVEN_LABELS, RET_LABELS } from '../../src/laps.js';

const lap = (num, timeMin, given = [], returned = []) => ({ num, timeMin, timeMs: timeMin * 60000, signal: '', given, returned, notes: '', logged: '' });

describe('calcLapStats', () => {
  it('returns null for empty array', () => {
    expect(calcLapStats([])).toBeNull();
  });

  it('single lap: count 1, avg equals that lap, best equals that lap', () => {
    const stats = calcLapStats([lap(1, 60)]);
    expect(stats.count).toBe(1);
    expect(stats.avg).toBe(60);
    expect(stats.best).toBe(60);
    expect(stats.gels).toBe(0);
  });

  it('avg is rounded to nearest integer', () => {
    const stats = calcLapStats([lap(1, 58), lap(2, 59)]);
    expect(stats.avg).toBe(59); // (58+59)/2 = 58.5 → rounds to 59
  });

  it('best is the minimum timeMin', () => {
    const stats = calcLapStats([lap(1, 65), lap(2, 58), lap(3, 62)]);
    expect(stats.best).toBe(58);
  });

  it('counts gel given laps', () => {
    const stats = calcLapStats([
      lap(1, 60, ['large2', 'gel']),
      lap(2, 58, ['large2']),
      lap(3, 61, ['gel-caff']),
    ]);
    expect(stats.gels).toBe(2);
  });

  it('gel count ignores returned-only gel markers', () => {
    const stats = calcLapStats([lap(1, 60, [], ['lg-empty'])]);
    expect(stats.gels).toBe(0);
  });
});

describe('GIVEN_LABELS', () => {
  it('has entries for expected bottle types and gels', () => {
    expect(GIVEN_LABELS['large2']).toBe('Large 2sc');
    expect(GIVEN_LABELS['gel']).toBe('Gel');
    expect(GIVEN_LABELS['gel-caff']).toBe('Gel(caff)');
    expect(GIVEN_LABELS['water']).toBe('Water');
  });
});

describe('RET_LABELS', () => {
  it('has entries for expected return states', () => {
    expect(RET_LABELS['empty']).toBe('Empty');
    expect(RET_LABELS['kept']).toBe('Kept');
    expect(RET_LABELS['nothing']).toBe('Nothing');
  });
});
