import { RACE_START_FIXED } from './timer.js';

const rs = RACE_START_FIXED.getTime();

export const TIMELINE = [
  {
    id: 'friday',
    title: 'Friday June 12 — Travel Day',
    events: [
      { id: 'fri-depart',   label: 'Depart for Donnelly',                               display: 'Fri 2:00pm',  time: rs - 19 * 3600000 },
      { id: 'fri-hookup',   label: 'Arrive Donnelly RV Park — hook up',                  display: 'Fri 2:30pm',  time: rs - 18.5 * 3600000 },
      { id: 'fri-pickup',   label: 'JMR packet pickup (opens 5:00pm)',                   display: 'Fri 5:00pm',  time: rs - 16 * 3600000 },
      { id: 'fri-pit',      label: 'Claim pit spot at start/finish',                     display: 'Fri ~5:30pm', time: rs - 15.5 * 3600000 },
      { id: 'fri-setup',    label: 'Set up shade cloth + stage spare wheelset',          display: 'Fri ~5:45pm', time: rs - 15.25 * 3600000 },
      { id: 'fri-preview',  label: 'Preview lap — Vandelay entry + line choices',         display: 'Fri ~6:00pm', time: rs - 15 * 3600000 },
      { id: 'fri-dinner',   label: 'Dinner + early bed',                                 display: 'Fri ~8:00pm', time: rs - 13 * 3600000 },
    ],
  },
  {
    id: 'friday-prep',
    title: 'Friday Night — Donnelly Prep (Renee)',
    events: [
      { id: 'prep-bottles', label: 'Pre-mix all Formula 369 bottles — label Large-2sc / Water', display: 'Fri evening', time: rs - 14 * 3600000 },
      { id: 'prep-gels',    label: 'Separate + label caffeine gels (max 3, laps 5–7)',           display: 'Fri evening', time: rs - 14 * 3600000 + 60000 },
      { id: 'prep-layers',  label: 'Inventory layer kit — confirm all items present',            display: 'Fri evening', time: rs - 14 * 3600000 + 120000 },
      { id: 'prep-pitbag',  label: 'Confirm pit bag vs mechanical list',                         display: 'Fri evening', time: rs - 14 * 3600000 + 180000 },
      { id: 'prep-wheels',  label: 'Confirm spare wheelset loaded + tubeless tires mounted',     display: 'Fri evening', time: rs - 14 * 3600000 + 240000 },
      { id: 'prep-garmin',  label: 'Charge Garmin 540 fully',                                   display: 'Fri evening', time: rs - 14 * 3600000 + 300000 },
      { id: 'prep-axs',     label: 'Charge AXS spare battery fully',                            display: 'Fri evening', time: rs - 14 * 3600000 + 360000 },
      { id: 'prep-review',  label: 'Review PitSync + signal vocab with Andrew',                  display: 'Fri evening', time: rs - 13.5 * 3600000 },
    ],
  },
  {
    id: 'saturday',
    title: 'Saturday — Race Morning',
    events: [
      { id: 'sat-wake',     label: 'Wake up 6:00am',                                             display: 'Sat 6:00am',  time: rs - 3 * 3600000 },
      { id: 'sat-bfast',    label: 'Breakfast burrito + coffee',                                  display: 'Sat 6:15am',  time: rs - 2.75 * 3600000 },
      { id: 'sat-cream',    label: 'Chamois cream + sunscreen applied',                           display: 'Sat 6:45am',  time: rs - 2.25 * 3600000 },
      { id: 'sat-check',    label: 'Confirm tire pressure: Barzo 16psi / Mezcal 18psi',          display: 'Sat 7:00am',  time: rs - 2 * 3600000 },
      { id: 'sat-devices',  label: 'Garmin 540 charged + AXS battery confirmed full',            display: 'Sat 7:00am',  time: rs - 2 * 3600000 + 60000 },
      { id: 'sat-depart',   label: 'Depart Donnelly 7:15am',                                     display: 'Sat 7:15am',  time: rs - 1.75 * 3600000 },
      { id: 'sat-arrive',   label: 'Arrive JMR 7:45am — final pit setup with Renee',             display: 'Sat 7:45am',  time: rs - 1.25 * 3600000 },
      { id: 'sat-warmup',   label: 'Warmup 8:00am — easy spin + 2–3×30sec openers ~220W',        display: 'Sat 8:00am',  time: rs - 3600000 },
      { id: 'sat-stage',    label: 'Stage at start line 8:50am',                                 display: 'Sat 8:50am',  time: rs - 600000 },
      { id: 'sat-race',     label: '🏁 Race Start — 9:00am',                                     display: 'Sat 9:00am',  time: rs, isStart: true },
    ],
  },
  {
    id: 'postrace',
    title: 'Post-Race',
    events: [
      { id: 'post-podium',  label: 'Podium + raffle at start/finish (~5:30pm)',                  display: '~5:30pm',     time: rs + 8.5 * 3600000 },
      { id: 'post-dinner',  label: 'Dinner on site — Renee included (~6:00pm)',                  display: '~6:00pm',     time: rs + 9 * 3600000 },
      { id: 'post-garmin',  label: 'Download Garmin activity',                                   display: 'Post-race',   time: rs + 9.5 * 3600000 },
      { id: 'post-export',  label: 'Export PitSync race data (JSON)',                            display: 'Post-race',   time: rs + 9.5 * 3600000 + 60000 },
    ],
  },
];

export function buildDefaultTlState() {
  const state = {};
  TIMELINE.forEach(section => section.events.forEach(e => { state[e.id] = false; }));
  return state;
}

export function findNextEvent(now) {
  const ms = now.getTime();
  for (const section of TIMELINE) {
    for (const event of section.events) {
      if (event.time > ms) return event.id;
    }
  }
  return null;
}
