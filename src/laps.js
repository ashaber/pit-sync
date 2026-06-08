export const GIVEN_LABELS = {
  large2: 'Large 2sc', large3: 'Large 3sc', small: 'Small',
  water: 'Water', gel: 'Gel', 'gel-caff': 'Gel(caff)',
};
export const RET_LABELS = {
  'empty': 'Empty', '1/4': '1/4 full', '1/2': '1/2 full', '3/4': '3/4 full',
  'kept': 'Kept', 'nothing': 'Nothing',
};

export function calcLapStats(laps) {
  if (!laps.length) return null;
  const avg  = Math.round(laps.reduce((s, l) => s + l.timeMin, 0) / laps.length);
  const best = Math.min(...laps.map(l => l.timeMin));
  const gels = laps.filter(l => l.given.includes('gel') || l.given.includes('gel-caff')).length;
  return { count: laps.length, avg, best, gels };
}

export function exportRaceData(laps, notes) {
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    race: '9 to 5 @ JMR 2026',
    race_date: '2026-06-13',
    overview: calcLapStats(laps),
    notes,
    laps,
  }, null, 2);
}
