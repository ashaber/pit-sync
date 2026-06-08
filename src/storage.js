const LS_LAPS    = '9to5_2026_laps';
const LS_CL      = '9to5_2026_checklist';
const LS_LAPST   = '9to5_2026_lapstart';
const LS_MSTART  = '9to5_2026_manual_start';
const LS_STOPPED = '9to5_2026_race_stopped';
const LS_RNOTES  = '9to5_2026_race_notes';

export const getLaps             = () => JSON.parse(localStorage.getItem(LS_LAPS) || '[]');
export const saveLaps            = laps => localStorage.setItem(LS_LAPS, JSON.stringify(laps));
export const getClState          = () => JSON.parse(localStorage.getItem(LS_CL) || 'null');
export const saveClState         = s => localStorage.setItem(LS_CL, JSON.stringify(s));
export const clearClState        = () => localStorage.removeItem(LS_CL);
export const getRawLapStart      = () => localStorage.getItem(LS_LAPST);
export const setLapStartEpoch    = ms => localStorage.setItem(LS_LAPST, ms.toString());
export const getRawManualStart   = () => localStorage.getItem(LS_MSTART);
export const setManualStartEpoch = ms => localStorage.setItem(LS_MSTART, ms.toString());
export const clearManualStart    = () => localStorage.removeItem(LS_MSTART);
export const getRaceStopped      = () => localStorage.getItem(LS_STOPPED);
export const setRaceStopped      = () => localStorage.setItem(LS_STOPPED, Date.now().toString());
export const clearRaceStopped    = () => localStorage.removeItem(LS_STOPPED);
export const getRaceNotes        = () => localStorage.getItem(LS_RNOTES) || '';
export const saveRaceNotes       = s => localStorage.setItem(LS_RNOTES, s);
export const getTabNotes         = tab => localStorage.getItem(`9to5_2026_notes_${tab}`) || '';
export const saveTabNotes        = (tab, s) => localStorage.setItem(`9to5_2026_notes_${tab}`, s);

const LS_TIMELINE = '9to5_2026_timeline';
export const getTimelineState  = () => JSON.parse(localStorage.getItem(LS_TIMELINE) || 'null');
export const saveTimelineState = s => localStorage.setItem(LS_TIMELINE, JSON.stringify(s));
export const clearTimelineState = () => localStorage.removeItem(LS_TIMELINE);
