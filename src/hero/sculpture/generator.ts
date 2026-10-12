/** Sculpture Lab v3 — seeded, curated composition generator.
 * Pure TypeScript. No DOM, Three.js, WebGL, storage, or module-level randomness.
 * Same seed + same family + no locks => the same sanitized SculptureConfig.
 */
import {
  BASE_SPINE, DEFAULT_SCULPTURE, MAX_ACCENTS, MAX_RIBBONS,
  copyConfig, sanitizeConfig,
  type AccentZone, type Fold, type Point3, type Ribbon, type SculptureConfig,
} from './config'

export type CompositionFamily = 'folded' | 'interwoven' | 'macro'
export type FamilyChoice = CompositionFamily | 'all'
export interface CompositionLocks {
  geometry: boolean
  framing: boolean
  accents: boolean
  motion: boolean
}
export interface GenerateOptions {
  seed: number
  family?: FamilyChoice
  /** Existing composition; needed only if something is locked. */
  base?: SculptureConfig
  locks?: Partial<CompositionLocks>
}
export interface GeneratedComposition {
  seed: number
  family: CompositionFamily
  config: SculptureConfig
}
export const FAMILIES: CompositionFamily[] = ['folded', 'interwoven', 'macro']
export const NO_LOCKS: Readonly<CompositionLocks> = Object.freeze({
  geometry: false, framing: false, accents: false, motion: false,
})

export function parseSeed(raw: string | null | undefined): number | null {
  if (raw == null || !/^(0|[1-9]\d{0,9})$/.test(raw)) return null
  const value = Number(raw)
  return Number.isSafeInteger(value) && value >= 0 && value <= 0xffffffff ? value : null
}
export function parseFamily(raw: string | null | undefined): FamilyChoice {
  return raw === 'folded' || raw === 'interwoven' || raw === 'macro' ? raw : 'all'
}

/** 32-bit Mulberry generator: deterministic across browsers. */
function random32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let x = state
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
function between(rng: () => number, low: number, high: number): number {
  return low + rng() * (high - low)
}
function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!
}
function chance(rng: () => number, probability: number): boolean {
  return rng() < probability
}
/** Smoothly related point offsets keep the recognizable returning-loop topology. */
function sculptSpine(rng: () => number, family: CompositionFamily): Point3[] {
  const sx = between(rng, .91, 1.07)
  const sy = between(rng, family === 'macro' ? .91 : .86, 1.11)
  const sz = between(rng, .89, 1.12)
  const phase = between(rng, -Math.PI, Math.PI)
  const side = between(rng, -.17, .17)
  const crest = between(rng, -.15, .19)
  const depth = between(rng, -.19, .19)
  return BASE_SPINE.map((p, i) => {
    const u = i / (BASE_SPINE.length - 1)
    const f = Math.sin(Math.PI * u)
    return {
      x: p.x * sx + f * (side * Math.sin(2 * Math.PI * u + phase)),
      y: p.y * sy + crest * Math.exp(-(((u - .36) / .25) ** 2)) + f * .07 * Math.cos(2 * Math.PI * u + phase),
      z: p.z * sz + depth * Math.exp(-(((u - .7) / .28) ** 2)) + f * .07 * Math.sin(2 * Math.PI * u + phase),
    }
  })
}

const ARCHETYPES: Record<CompositionFamily, ReadonlyArray<readonly [number, number, number, number, number, number]>> = {
  // [U, radius, twist, pinch, lift, curl]; one dominant fold, with supporting gestures.
  folded: [
    [.27, .17, -1.25, .20, .12, .28],
    [.58, .14, 2.65, .52, .33, .78],
    [.81, .10, -2.00, .36, -.13, -.54],
  ],
  interwoven: [
    [.20, .16, -1.15, .27, .14, .35],
    [.44, .12, 2.20, .46, -.13, -.62],
    [.65, .13, -2.55, .51, .31, .80],
    [.84, .09, 1.70, .30, -.16, -.41],
  ],
  macro: [
    [.19, .14, -1.75, .34, .16, .44],
    [.42, .11, 2.65, .62, -.20, -.67],
    [.64, .12, -3.05, .60, .41, .88],
    [.82, .09, 2.15, .51, -.21, -.55],
  ],
}
function sculptFolds(rng: () => number, family: CompositionFamily, ribbonIndex: number): Fold[] {
  const base = ARCHETYPES[family]
  const phase = ribbonIndex % 2 === 0 ? 1 : -1
  const strength = ribbonIndex === 0 ? 1 : between(rng, .68, .91)
  return base.map(([u, radius, twist, pinch, lift, curl]) => ({
    u: clamp(u + between(rng, -.035, .035) + (ribbonIndex ? .027 : 0), .04, .96),
    radius: clamp(radius * between(rng, .83, 1.19), .055, .25),
    twist: clamp(twist * phase * between(rng, .78, 1.15) * strength, -3.8, 3.8),
    pinch: clamp(pinch * between(rng, .72, 1.13), .08, .78),
    lift: lift * between(rng, .75, 1.16) * strength,
    curl: curl * phase * between(rng, .7, 1.18) * strength,
  })).sort((a, b) => a.u - b.u)
}
function accentZones(rng: () => number, folds: Fold[], ribbonIndex: number): AccentZone[] {
  // Around a fold, but spread across different parts of the ribbon.
  const count = ribbonIndex === 0 ? 2 + (chance(rng, .28) ? 1 : 0) : 1 + (chance(rng, .30) ? 1 : 0)
  const positions = ribbonIndex === 0 ? [.5, .78, .28] : [.33, .69]
  return Array.from({ length: Math.min(count, MAX_ACCENTS) }, (_, i) => {
    const near = folds.reduce((best, f) => Math.abs(f.u - positions[i]!) < Math.abs(best.u - positions[i]!) ? f : best, folds[0]!)
    return {
      u: clamp(near.u + between(rng, -.085, .085), .08, .92),
      v: (i % 2 === 0 ? 1 : -1) * between(rng, .24, .83),
      length: between(rng, .105, .22),
      spread: between(rng, .14, .31),
      strength: between(rng, .56, 1.1),
    }
  })
}
function createRibbon(rng: () => number, family: CompositionFamily, index: number, firstSpine: Point3[]): Ribbon {
  const base = copyConfig(DEFAULT_SCULPTURE).ribbons[Math.min(index, 1)]!
  const r = base
  r.name = index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Filament'
  r.enabled = true
  if (index === 0) r.spine = firstSpine
  else {
    // Children inherit the major sculpture gesture and weave around it,
    // instead of creating chaotic unrelated spines.
    const shift = between(rng, -.26, .26)
    const phase = between(rng, -.9, .9)
    r.spine = firstSpine.map((p, i) => {
      const u = i / (firstSpine.length - 1)
      const f = Math.sin(Math.PI * u)
      return {
        x: p.x * (index === 1 ? .90 : .83) + .15 * index + shift * f,
        y: p.y * (index === 1 ? .88 : .78) - .14 * index + f * .16 * Math.sin(u * Math.PI * 2 + phase),
        z: p.z * (index === 1 ? .92 : .82) - .27 * index + f * .17 * Math.cos(u * Math.PI * 2 + phase),
      }
    })
  }
  r.folds = sculptFolds(rng, family, index)
  r.accents = accentZones(rng, r.folds, index)
  r.width = index === 0 ? between(rng, .39, .58) : index === 1 ? between(rng, .22, .37) : between(rng, .12, .22)
  r.cup = between(rng, .14, index === 0 ? .40 : .30)
  r.baseTwist = between(rng, -.70, .80)
  r.opacity = index === 0 ? between(rng, .77, .92) : index === 1 ? between(rng, .43, .66) : between(rng, .24, .44)
  r.brightness = index === 0 ? between(rng, .93, 1.08) : between(rng, .70, .96)
  r.contours = index === 0 ? pick(rng, [88, 96, 104, 112]) : index === 1 ? pick(rng, [48, 56, 64, 72]) : pick(rng, [30, 38, 44])
  r.offset = index === 0 ? {x:0,y:0,z:0} : {x:between(rng, -.11, .24),y:between(rng, -.22, .05),z:-.18 * index}
  r.rotation = index === 0 ? {x:0,y:0,z:0} : {x:between(rng, -12, 12),y:between(rng, -14, 14),z:between(rng, -14, 14)}
  return r
}
export function generateComposition(options: GenerateOptions): GeneratedComposition {
  if (!Number.isInteger(options.seed) || options.seed < 0 || options.seed > 0xffffffff) {
    throw new RangeError('seed must be an unsigned 32-bit integer')
  }
  const seed = options.seed >>> 0
  const rng = random32(seed)
  const requested = options.family ?? 'all'
  // Always consume the family draw, even when a family is requested explicitly:
  // a fresh load picks the family from the rng, and a shared seed URL (explicit
  // family) must replay the exact same rng stream to reproduce the composition.
  const drawn = pick(rng, FAMILIES)
  const family: CompositionFamily = requested === 'all' ? drawn : requested
  if (!FAMILIES.includes(family)) throw new Error('Unknown family')
  const config = copyConfig(DEFAULT_SCULPTURE)
  const n = family === 'folded' ? (chance(rng,.68) ? 2 : 1)
    : family === 'interwoven' ? (chance(rng,.43) ? 3 : 2)
    : (chance(rng,.52) ? 2 : 1)
  const major = sculptSpine(rng, family)
  config.ribbons = Array.from({length:Math.min(n,MAX_RIBBONS)},(_,i)=>createRibbon(rng,family,i,major))
  // Three controlled families of camera compositions — no arbitrary 360-degree tumbling.
  const presets: Record<CompositionFamily, ReadonlyArray<readonly [number,number,number,number,number,number]>> = {
    folded: [[1.8,.69,.73,16,-22,0],[2.05,.68,.77,-12,28,12],[1.95,.65,.70,24,16,-10]],
    interwoven: [[2.0,.67,.74,18,-28,0],[2.22,.69,.71,-18,26,-11],[1.92,.67,.77,24,34,10]],
    macro: [[2.62,.70,.77,28,-28,13],[2.95,.71,.75,-22,32,-13],[2.50,.67,.79,34,19,18]],
  }
  const [zoom,x,y,rx,ry,rz] = pick(rng,presets[family])
  config.framing = {
    zoom:zoom * between(rng,.92,1.10),
    x:x+between(rng,-.065,.065),y:y+between(rng,-.055,.045),
    rx:rx+between(rng,-9,9),ry:ry+between(rng,-10,10),rz:rz+between(rng,-8,8),
  }
  config.look.depthFade = between(rng,.53,.88)
  config.look.accentIntensity = between(rng,.77,1.16)
  config.look.fragmentation = between(rng,.17,.37)
  config.look.fragmentScale = between(rng,8.5,16)
  config.look.fragmentationSoftness = between(rng,.005,.013)
  config.motion.mode = chance(rng,.5) ? 'both' : 'shadows'
  config.motion.paused = false
  config.motion.speed = between(rng,.065,.14)
  config.motion.shadowStrength = between(rng,.45,.77)
  config.motion.shadowWidth = between(rng,.065,.13)
  config.motion.shadowRepeats = between(rng,1.5,2.8)
  config.motion.shadowSlant = between(rng,-.18,.18)
  config.motion.lineFade = between(rng,.04,.13)
  config.motion.rotationX = between(rng,1.0,3.5)
  config.motion.rotationY = between(rng,1.7,4.8)
  config.motion.phase = between(rng,0,30)
  // Rendering quality is fixed; never randomized.
  config.quality = copyConfig(DEFAULT_SCULPTURE).quality

  const locks = {...NO_LOCKS,...options.locks}
  const previous = options.base ? sanitizeConfig(options.base) : copyConfig(DEFAULT_SCULPTURE)
  if (locks.geometry) {
    const newAccents = config.ribbons.map(r=>r.accents)
    config.ribbons = copyConfig(previous).ribbons
    if (!locks.accents) config.ribbons.forEach((r,i)=>{r.accents = newAccents[Math.min(i,newAccents.length-1)]!.map(a=>({...a}))})
  }
  if (locks.framing) config.framing = copyConfig(previous).framing
  if (locks.accents) {
    config.look.accentIntensity = previous.look.accentIntensity
    config.ribbons.forEach((r,i) => {r.accents=(previous.ribbons[Math.min(i,previous.ribbons.length-1)]?.accents ?? []).map(a=>({...a}))})
  }
  if (locks.motion) config.motion = copyConfig(previous).motion
  return {seed,family,config:sanitizeConfig(config)}
}
