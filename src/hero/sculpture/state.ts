import { reactive, watch } from 'vue'
import { DEFAULT_SCULPTURE, sanitizeConfig, type SculptureConfig } from './config'

/** Tune mode is opt-in; ordinary visitors always see committed defaults. */
export const tuneMode = new URLSearchParams(window.location.search).get('tune') === '1'
export const STORAGE_KEY = 'asbrt-sculpture-config-v1'
function initial(): SculptureConfig {
  if (!tuneMode) return { ...DEFAULT_SCULPTURE }
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? sanitizeConfig(JSON.parse(s)) : { ...DEFAULT_SCULPTURE }
  } catch { return { ...DEFAULT_SCULPTURE } }
}

export const sculptureSettings = reactive<SculptureConfig>(initial())
if (tuneMode) {
  watch(sculptureSettings, () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sculptureSettings)) } catch { /* private mode */ }
  }, { deep: true })
}

export function setSettings(input: unknown) {
  Object.assign(sculptureSettings, sanitizeConfig(input))
}
export function resetSettings() {
  Object.assign(sculptureSettings, DEFAULT_SCULPTURE)
}
