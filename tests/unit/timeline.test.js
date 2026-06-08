import { describe, it, expect } from 'vitest';
import { TIMELINE, buildDefaultTlState, findNextEvent } from '../../src/timeline.js';

describe('TIMELINE', () => {
  it('has four sections', () => {
    expect(TIMELINE).toHaveLength(4);
  });

  it('every event has required fields', () => {
    TIMELINE.forEach(section => {
      section.events.forEach(event => {
        expect(typeof event.id).toBe('string');
        expect(typeof event.label).toBe('string');
        expect(typeof event.display).toBe('string');
        expect(typeof event.time).toBe('number');
      });
    });
  });

  it('events within each section are in ascending time order', () => {
    TIMELINE.forEach(section => {
      for (let i = 1; i < section.events.length; i++) {
        expect(section.events[i].time).toBeGreaterThanOrEqual(section.events[i - 1].time);
      }
    });
  });

  it('sections are in ascending time order by first event', () => {
    for (let i = 1; i < TIMELINE.length; i++) {
      expect(TIMELINE[i].events[0].time).toBeGreaterThanOrEqual(TIMELINE[i - 1].events[0].time);
    }
  });

  it('race start event has isStart flag', () => {
    const allEvents = TIMELINE.flatMap(s => s.events);
    const startEvent = allEvents.find(e => e.isStart);
    expect(startEvent).toBeDefined();
    expect(startEvent.id).toBe('sat-race');
  });
});

describe('buildDefaultTlState', () => {
  it('returns an object with all event IDs set to false', () => {
    const state = buildDefaultTlState();
    TIMELINE.forEach(section => {
      section.events.forEach(event => {
        expect(state[event.id]).toBe(false);
      });
    });
  });

  it('total count matches sum of all events', () => {
    const state = buildDefaultTlState();
    const total = TIMELINE.reduce((sum, s) => sum + s.events.length, 0);
    expect(Object.keys(state)).toHaveLength(total);
  });
});

describe('findNextEvent', () => {
  const allEvents = TIMELINE.flatMap(s => s.events);
  const firstTime = allEvents[0].time;
  const lastTime  = allEvents[allEvents.length - 1].time;

  it('returns first event id when now is before all events', () => {
    const past = new Date(firstTime - 1000);
    expect(findNextEvent(past)).toBe(allEvents[0].id);
  });

  it('returns null when now is after all events', () => {
    const future = new Date(lastTime + 1000);
    expect(findNextEvent(future)).toBeNull();
  });

  it('returns the correct next event between two events', () => {
    const second = allEvents[1];
    const justBefore = new Date(second.time - 1);
    expect(findNextEvent(justBefore)).toBe(second.id);
  });

  it('returns next event immediately after an event time', () => {
    const second = allEvents[1];
    const atSecond = new Date(second.time);
    expect(findNextEvent(atSecond)).toBe(allEvents[2].id);
  });
});
