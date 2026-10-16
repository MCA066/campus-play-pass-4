// Storage adapter kept independent from view components so an API can replace it later.
export function loadPersistedState(key, fallback, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !Array.isArray(value.users) || !Array.isArray(value.matches) || !Array.isArray(value.teams)) return fallback;
    return value;
  } catch { return fallback; }
}

export function savePersistedState(key, value, storage = globalThis.localStorage) {
  try { storage?.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
