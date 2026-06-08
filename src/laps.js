export const GIVEN_LABELS = {
  large2: 'Large 2sc', large3: 'Large 3sc', small: 'Small',
  water: 'Water', gel: 'Gel', 'gel-caff': 'Gel(caff)',
};
export const RET_LABELS = {
  'lg-empty': 'Lg empty', 'lg-partial': 'Lg partial',
  'sm-empty': 'Sm empty', 'sm-partial': 'Sm partial',
  kept: 'Kept', nothing: 'Nothing',
};

export function calcLapStats(laps) {
  if (!laps.length) return null;
  const avg  = Math.round(laps.reduce((s, l) => s + l.timeMin, 0) / laps.length);
  const best = Math.min(...laps.map(l => l.timeMin));
  const gels = laps.filter(l => l.given.includes('gel') || l.given.includes('gel-caff')).length;
  return { count: laps.length, avg, best, gels };
}
