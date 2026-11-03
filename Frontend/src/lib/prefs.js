// Client side persistence for the things the API does not own yet:
// template choice, resume font and the optional profile photo.
// Everything is stored in localStorage so it survives refreshes.

const RESUME_KEY = 'resumbee:resume-prefs';
const DEFAULT_KEY = 'resumbee:default-prefs';

export const defaultPreferences = {
  templateId: 'honeycomb',
  fontId: 'inter',
  photo: '',
};

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – preferences just won't persist */
  }
}

export function getDefaultPreferences() {
  return { ...defaultPreferences, ...readJson(DEFAULT_KEY, {}) };
}

export function setDefaultPreferences(patch) {
  const next = { ...getDefaultPreferences(), ...patch };
  writeJson(DEFAULT_KEY, next);
  return next;
}

export function getResumePreferences(resumeId) {
  if (!resumeId) return getDefaultPreferences();
  const all = readJson(RESUME_KEY, {});
  return { ...getDefaultPreferences(), ...(all[resumeId] || {}) };
}

export function setResumePreferences(resumeId, patch) {
  if (!resumeId) return getDefaultPreferences();
  const all = readJson(RESUME_KEY, {});
  const next = { ...getDefaultPreferences(), ...(all[resumeId] || {}), ...patch };
  writeJson(RESUME_KEY, { ...all, [resumeId]: next });
  return next;
}
