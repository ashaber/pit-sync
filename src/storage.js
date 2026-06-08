const LS_LAPS    = '9to5_2026_laps';
const LS_CL      = '9to5_2026_checklist';
const LS_LAPST   = '9to5_2026_lapstart';
const LS_MSTART  = '9to5_2026_manual_start';

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
