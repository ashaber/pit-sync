import { describe, it, expect } from 'vitest';
import { CHECKLIST, buildDefaultClState, countChecklist } from '../../src/checklist.js';

describe('CHECKLIST data', () => {
  it('has multiple sections', () => {
    expect(CHECKLIST.length).toBeGreaterThan(0);
  });

  it('every section has an id, title, and non-empty items array', () => {
    for (const section of CHECKLIST) {
      expect(typeof section.id).toBe('string');
      expect(typeof section.title).toBe('string');
      expect(Array.isArray(section.items)).toBe(true);
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it('every item has a unique id and a text string', () => {
    const ids = new Set();
    for (const section of CHECKLIST) {
      for (const item of section.items) {
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.text).toBe('string');
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
      }
    }
  });

  it('bd9 item has a valid JS string (smoke test for smart-quote regression)', () => {
    const bd9 = CHECKLIST.flatMap(s => s.items).find(i => i.id === 'bd9');
    expect(bd9).toBeDefined();
    expect(bd9.text).toContain("it's");
  });
});

describe('buildDefaultClState', () => {
  it('returns an object with all item ids as keys', () => {
    const state = buildDefaultClState(CHECKLIST);
    for (const section of CHECKLIST) {
      for (const item of section.items) {
        expect(state).toHaveProperty(item.id);
      }
    }
  });

  it('items with def: true are checked by default', () => {
    const state = buildDefaultClState(CHECKLIST);
    const bd1 = CHECKLIST.flatMap(s => s.items).find(i => i.id === 'bd1');
    expect(bd1.def).toBe(true);
    expect(state['bd1']).toBe(true);
  });

  it('items without def are unchecked by default', () => {
    const state = buildDefaultClState(CHECKLIST);
    const tr6 = CHECKLIST.flatMap(s => s.items).find(i => i.id === 'tr6');
    expect(tr6.def).toBeUndefined();
    expect(state['tr6']).toBe(false);
  });
});

describe('countChecklist', () => {
  it('returns total count equal to all items across all sections', () => {
    const state = buildDefaultClState(CHECKLIST);
    const { total } = countChecklist(CHECKLIST, state);
    const expected = CHECKLIST.reduce((n, s) => n + s.items.length, 0);
    expect(total).toBe(expected);
  });

  it('done count matches number of truthy values in state', () => {
    const state = buildDefaultClState(CHECKLIST);
    const { done } = countChecklist(CHECKLIST, state);
    const expectedDone = CHECKLIST.flatMap(s => s.items).filter(i => i.def === true).length;
    expect(done).toBe(expectedDone);
  });

  it('done is 0 when all items are false', () => {
    const state = {};
    CHECKLIST.forEach(s => s.items.forEach(i => { state[i.id] = false; }));
    expect(countChecklist(CHECKLIST, state).done).toBe(0);
  });

  it('done equals total when all items are true', () => {
    const state = {};
    CHECKLIST.forEach(s => s.items.forEach(i => { state[i.id] = true; }));
    const { total, done } = countChecklist(CHECKLIST, state);
    expect(done).toBe(total);
  });
});
