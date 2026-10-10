/** v4 presentation behavior on top of the unchanged v3 sculpture / shaders. */
import { reactive, ref, watch } from 'vue'
import { DEFAULT_SCULPTURE, copyConfig, sanitizeConfig, type SculptureConfig } from './config'
import {
  generateComposition, parseFamily, parseSeed, type CompositionFamily,
  type CompositionLocks, type FamilyChoice,
} from './generator'

export const tuneMode = new URLSearchParams(window.location.search).get('tune') === '1'
// Keep the v3 tuner store and do not overwrite it for ordinary visitors.
export const STORAGE_KEY = 'asbrt-sculpture-config-v3'
const query = new URLSearchParams(window.location.search)
const requestedSeed = parseSeed(query.get('seed'))
const requestedFamily = parseFamily(query.get('family'))

export function freshSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint32Array(1))[0]!
  }
  return Math.floor(Math.random() * 4294967296) >>> 0
}
function savedTunerConfig(): SculptureConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeConfig(JSON.parse(raw)) : copyConfig(DEFAULT_SCULPTURE)
  } catch { return copyConfig(DEFAULT_SCULPTURE) }
}
const first = requestedSeed !== null || !tuneMode
  ? generateComposition({seed:requestedSeed ?? freshSeed(),family:requestedFamily}) : null
export const sculptureSettings = reactive<SculptureConfig>(first?.config ?? savedTunerConfig())
export const compositionSeed = ref<number|null>(first?.seed ?? null)
export const compositionFamily = ref<CompositionFamily|null>(first?.family ?? null)
let exactGenerated = first ? JSON.stringify(sculptureSettings) : null

let saveTimeout: ReturnType<typeof setTimeout> | null = null
if (tuneMode) watch(sculptureSettings, () => {
  if (saveTimeout !== null) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sculptureSettings)) } catch { /* storage optional */ }
  },450)
}, {deep:true})

export function setSettings(value: unknown): void {
  Object.assign(sculptureSettings, sanitizeConfig(value))
  // Existing sculpture tuner imports and direct slider changes may invalidate
  // a generated seed. shareableSeedUrl() also checks JSON equality.
}
export function resetSettings(): void {
  setSettings(DEFAULT_SCULPTURE)
  exactGenerated = null
  compositionSeed.value = null
  compositionFamily.value = null
}
function removeSeedFromAddress(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('seed') && !url.searchParams.has('family')) return
  url.searchParams.delete('seed')
  url.searchParams.delete('family')
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
}
export function generateAndApply(options: {
  seed?: number
  family?: FamilyChoice
  locks?: Partial<CompositionLocks>
} = {}): { seed: number; family: CompositionFamily } {
  // No seeded URL mutation here: a plain homepage should remain fresh on reload.
  // An explicit Share action creates a permalink instead.
  const locked = !!options.locks && Object.values(options.locks).some(Boolean)
  const oldSeed = compositionSeed.value
  let seed = options.seed ?? freshSeed()
  if (options.seed == null && seed === oldSeed) seed = (seed + 1) >>> 0
  const output = generateComposition({
    seed,
    family: options.family ?? 'all',
    base: sanitizeConfig(sculptureSettings),
    locks: options.locks,
  })
  setSettings(output.config)
  compositionSeed.value = output.seed
  compositionFamily.value = output.family
  // Locked variations depend on the starting config, so seed alone cannot
  // reproduce them. Those compositions should be shared as full JSON instead.
  exactGenerated = locked ? null : JSON.stringify(sculptureSettings)
  removeSeedFromAddress()
  return {seed:output.seed,family:output.family}
}
/** Null if sliders were edited or locks made the composition non-reproducible. */
export function shareableSeedUrl(): string | null {
  if (compositionSeed.value === null || compositionFamily.value === null ||
      exactGenerated === null || JSON.stringify(sculptureSettings) !== exactGenerated) return null
  const url = new URL(window.location.href)
  url.searchParams.delete('tune')
  url.searchParams.set('seed', String(compositionSeed.value))
  url.searchParams.set('family', compositionFamily.value)
  url.hash = ''
  return url.toString()
}
