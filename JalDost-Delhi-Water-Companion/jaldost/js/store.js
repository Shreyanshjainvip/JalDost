const STORAGE_KEY = 'jaldost.prototype.v1';

const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultState = {
  profile: { name: 'Shreyansh', xp: 280, streak: 4, estimatedLitresSaved: 48, totalActions: 3 },
  dailyRecords: {},
  metadata: { mode: 'prototype', savingsType: 'estimated', recordType: 'self-reported' }
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !saved.profile || !saved.dailyRecords) return structuredClone(defaultState);
    return saved;
  } catch {
    return structuredClone(defaultState);
  }
}

let state = load();
const listeners = new Set();

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* app remains usable */ }
}

function emit() { listeners.forEach((listener) => listener(getState())); }

export function getState() { return structuredClone(state); }

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function completeAction(action) {
  const date = todayKey();
  const record = state.dailyRecords[date] || { completedActionIds: [], estimatedLitresSaved: 0, xpEarned: 0 };
  if (record.completedActionIds.includes(action.id)) return { ok: false, reason: 'already-completed' };

  const firstActionToday = record.completedActionIds.length === 0;
  record.completedActionIds.push(action.id);
  record.estimatedLitresSaved += action.estimatedLitres;
  record.xpEarned += action.xpReward;
  state.dailyRecords[date] = record;
  state.profile.xp += action.xpReward;
  state.profile.estimatedLitresSaved += action.estimatedLitres;
  state.profile.totalActions += 1;
  if (firstActionToday) state.profile.streak += 1;
  persist();
  emit();
  return { ok: true, firstActionToday };
}

export function getTodayRecord() {
  return getState().dailyRecords[todayKey()] || { completedActionIds: [], estimatedLitresSaved: 0, xpEarned: 0 };
}

export function resetPrototype() {
  state = structuredClone(defaultState);
  persist();
  emit();
}
