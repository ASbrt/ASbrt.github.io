/** Sculpture Lab — seeded, curated composition generator.
 * Pure TypeScript. No DOM, Three.js, WebGL, storage, or module-level randomness.
 * Same seed + same family + same version + no locks => the same sanitized SculptureConfig.
 *
 * Version 1: the v4 algorithm (frozen) — reproduces previously shared seed URLs.
 * Version 2 (v4.1): adds visibility-scored framing, seeded fragmentation salt,
 * scattered/edge accent modes, and more prevalent three-axis rotation.
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
  /** Generator version. Old shared links without a version marker replay as v1. */
  version?: number
}
export interface GeneratedComposition {
  seed: number
  family: CompositionFamily
  config: SculptureConfig
}
export const GENERATOR_VERSION = 2
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
/** Unversioned seed URLs are v4 share links; v4.1 links carry gen=2 explicitly. */
export function parseVersion(raw: string | null | undefined): number {
  return raw === '2' ? 2 : 1
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

/** v4 framing: three controlled camera envelopes per family, plus jitter. */
function drawFraming(rng: () => number, family: CompositionFamily): SculptureConfig['framing'] {
  const presets: Record<CompositionFamily, ReadonlyArray<readonly [number,number,number,number,number,number]>> = {
    folded: [[1.8,.69,.73,16,-22,0],[2.05,.68,.77,-12,28,12],[1.95,.65,.70,24,16,-10]],
    interwoven: [[2.0,.67,.74,18,-28,0],[2.22,.69,.71,-18,26,-11],[1.92,.67,.77,24,34,10]],
    macro: [[2.62,.70,.77,28,-28,13],[2.95,.71,.75,-22,32,-13],[2.50,.67,.79,34,19,18]],
  }
  const [zoom,x,y,rx,ry,rz] = pick(rng,presets[family])
  return {
    zoom:zoom * between(rng,.92,1.10),
    x:x+between(rng,-.065,.065),y:y+between(rng,-.055,.045),
    rx:rx+between(rng,-9,9),ry:ry+between(rng,-10,10),rz:rz+between(rng,-8,8),
  }
}

/* ------------------------------------------------------------------ *
 * Visibility scoring (v2). Ports the GPU spline/fold/cross-section math
 * to the CPU so candidate framings can be evaluated analytically —
 * no screenshots, no GPU readbacks, fully deterministic.
 * ------------------------------------------------------------------ */
const WORLD_H = 2.2
const FOV_TAN = Math.tan((40 / 2) * Math.PI / 180)
const CAM_Z = WORLD_H / 2 / FOV_TAN
/** Reference aspect ratios: desktop window and narrow mobile portrait. */
export const SCORE_ASPECTS: readonly number[] = [1.6, 0.462]
const GRID = 10

function catmull1(a: number, b: number, c: number, d: number, t: number): number {
  return .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
}
function spinePoint(spine: Point3[], u: number): Point3 {
  const x = clamp(u, 0, .999999) * 12
  const i = Math.floor(x)
  const t = x - i
  const at = (j: number) => spine[clamp(j, 0, spine.length - 1)]!
  const a = at(i - 1), b = at(i), c = at(i + 1), d = at(i + 2)
  return { x: catmull1(a.x, b.x, c.x, d.x, t), y: catmull1(a.y, b.y, c.y, d.y, t), z: catmull1(a.z, b.z, c.z, d.z, t) }
}
function ease01(a: number, b: number, x: number): number {
  const f = clamp((x - a) / (b - a), 0, 1)
  return f * f * (3 - 2 * f)
}
/** Mirrors the vertex shader's folded ribbon cross-section. */
function surfacePoint(r: Ribbon, u: number, v: number): Point3 {
  const c = spinePoint(r.spine, u)
  const pa = spinePoint(r.spine, Math.min(.999999, u + .003))
  const pb = spinePoint(r.spine, Math.max(0, u - .003))
  const tx = pa.x - pb.x + .00001, ty = pa.y - pb.y + .00001, tz = pa.z - pb.z + .00001
  const tl = Math.hypot(tx, ty, tz)
  const t = { x: tx / tl, y: ty / tl, z: tz / tl }
  const ll = Math.hypot(-t.y, t.x, .00001)
  const l = { x: -t.y / ll, y: t.x / ll, z: .00001 / ll }
  const d = { x: t.y * l.z - t.z * l.y, y: t.z * l.x - t.x * l.z, z: t.x * l.y - t.y * l.x }
  let twist = r.baseTwist * u, pinch = 0, lift = 0, curl = 0
  for (const f of r.folds) {
    const dd = (u - f.u) / Math.max(.008, f.radius)
    const w = Math.exp(-dd * dd)
    twist += f.twist * w
    pinch += f.pinch * w
    lift += f.lift * w
    curl += f.curl * w
  }
  const taper = Math.pow(ease01(0, .13, u) * ease01(0, .14, 1 - u), .72)
  const w = r.width * taper * (.77 + .23 * Math.exp(-(((u - .52) / .35) ** 2))) * clamp(1 - pinch, .09, 2)
  const cs = Math.cos(twist), sn = Math.sin(twist)
  const side = v * w
  const cupped = r.cup * r.width * taper * (v * v - .33333)
  const ripple = curl * r.width * taper * (v * v - .2)
  const la = side * cs - cupped * sn + .10 * ripple * v
  const db = side * sn + cupped * cs + lift + ripple
  return { x: c.x + l.x * la + d.x * db, y: c.y + l.y * la + d.y * db, z: c.z + l.z * la + d.z * db }
}
/** Euler rotation in degrees, three.js 'XYZ' order (m = Rx·Ry·Rz). */
function rotEuler(p: Point3, rx: number, ry: number, rz: number): Point3 {
  const z = rz * Math.PI / 180, y = ry * Math.PI / 180, x = rx * Math.PI / 180
  let px = p.x, py = p.y, pz = p.z
  let c = Math.cos(z), s = Math.sin(z)
  ;[px, py] = [px * c - py * s, px * s + py * c]
  c = Math.cos(y); s = Math.sin(y)
  ;[px, pz] = [px * c + pz * s, -px * s + pz * c]
  c = Math.cos(x); s = Math.sin(x)
  ;[py, pz] = [py * c - pz * s, py * s + pz * c]
  return { x: px, y: py, z: pz }
}
const U_SAMPLES = 24
const V_SAMPLES: readonly number[] = [-1, -.45, 0, .45, 1]
interface VisMetrics { score: number; visibleFrac: number; coverage: number; textFrac: number }
function scoreAt(config: SculptureConfig, aspect: number, drift: Point3): VisMetrics {
  const W = WORLD_H * aspect
  const base = Math.min(W / 3.9, WORLD_H / 2.9)
  const s = base * config.framing.zoom
  const ox = (config.framing.x - .5) * W
  const oy = (config.framing.y - .5) * WORLD_H
  let total = 0, inside = 0, text = 0, spineLen = 0
  const cells = new Set<number>()
  for (const r of config.ribbons) {
    if (!r.enabled) continue
    let prevX = 0, prevY = 0, prevIn = false
    for (let i = 0; i < U_SAMPLES; i++) {
      const u = (i + .5) / U_SAMPLES
      for (const v of V_SAMPLES) {
        const p0 = surfacePoint(r, u, v)
        const p1 = rotEuler(p0, r.rotation.x, r.rotation.y, r.rotation.z)
        const p2 = { x: p1.x + r.offset.x, y: p1.y + r.offset.y, z: p1.z + r.offset.z }
        const q = rotEuler(p2, config.framing.rx + drift.x, config.framing.ry + drift.y, config.framing.rz + drift.z)
        const wx = q.x * s + ox, wy = q.y * s + oy, wz = q.z * s
        const rel = Math.max(.2, CAM_Z - wz)
        const nx = wx / (rel * FOV_TAN * aspect)
        const ny = wy / (rel * FOV_TAN)
        total++
        const inView = Math.abs(nx) <= 1 && Math.abs(ny) <= 1
        if (inView) {
          inside++
          cells.add(clamp(Math.floor((nx + 1) * .5 * GRID), 0, GRID - 1) * GRID + clamp(Math.floor((ny + 1) * .5 * GRID), 0, GRID - 1))
          // Lower-left hero typography zone.
          if (nx < -.05 && ny < -.25) text++
        }
        if (v === 0) {
          if (prevIn && inView) spineLen += Math.hypot(nx - prevX, ny - prevY)
          prevX = nx; prevY = ny; prevIn = inView
        }
      }
    }
  }
  const visibleFrac = total ? inside / total : 0
  const coverage = cells.size / (GRID * GRID)
  const textFrac = inside ? text / inside : 0
  // Not a bounding-box check: coverage counts occupied cells of a fine grid,
  // and spineLen rewards actual contour length inside the frame.
  const score = .5 * Math.min(visibleFrac / .4, 1)
    + .3 * Math.min(coverage / .22, 1)
    + .2 * Math.min(spineLen / 1.0, 1)
    - 1.4 * Math.max(0, textFrac - .16)
  return { score, visibleFrac, coverage, textFrac }
}
/** Drift extremes the composition will animate through (plus the center). */
function driftCorners(config: SculptureConfig): Point3[] {
  const rotates = config.motion.mode === 'rotate' || config.motion.mode === 'both'
  if (!rotates) return [{ x: 0, y: 0, z: 0 }]
  const out: Point3[] = [{ x: 0, y: 0, z: 0 }]
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    out.push({ x: sx * config.motion.rotationX, y: sy * config.motion.rotationY, z: sz * config.motion.rotationZ })
  }
  return out
}
/** Worst-case visibility across reference aspects and rotation extremes. */
export function scoreCompositionVisibility(config: SculptureConfig): VisMetrics {
  let worst: VisMetrics = { score: Infinity, visibleFrac: Infinity, coverage: Infinity, textFrac: 0 }
  for (const aspect of SCORE_ASPECTS) for (const d of driftCorners(config)) {
    const m = scoreAt(config, aspect, d)
    if (m.score < worst.score) worst = m
  }
  return worst
}
/** Acceptance envelope: below this a candidate framing is "nearly empty". */
export const VISIBILITY_ACCEPT = 0.40
export const VISIBILITY_MIN_VISIBLE = 0.17
export const VISIBILITY_MIN_COVERAGE = 0.05
export const MAX_FRAMING_CANDIDATES = 10

/* ------------------------------------------------------------------ */

/** v4 core (frozen): byte-identical output for previously shared seed URLs. */
function generateV1Core(rng: () => number, family: CompositionFamily): SculptureConfig {
  const config = copyConfig(DEFAULT_SCULPTURE)
  const n = family === 'folded' ? (chance(rng,.68) ? 2 : 1)
    : family === 'interwoven' ? (chance(rng,.43) ? 3 : 2)
    : (chance(rng,.52) ? 2 : 1)
  const major = sculptSpine(rng, family)
  config.ribbons = Array.from({length:Math.min(n,MAX_RIBBONS)},(_,i)=>createRibbon(rng,family,i,major))
  config.framing = drawFraming(rng, family)
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
  return config
}

/** v4.1 core: visibility-scored framing, seeded fragmentation, new accents, 3-axis rotation. */
function generateV2Core(rng: () => number, family: CompositionFamily): SculptureConfig {
  const config = copyConfig(DEFAULT_SCULPTURE)
  const n = family === 'folded' ? (chance(rng,.68) ? 2 : 1)
    : family === 'interwoven' ? (chance(rng,.43) ? 3 : 2)
    : (chance(rng,.52) ? 2 : 1)
  const major = sculptSpine(rng, family)
  config.ribbons = Array.from({length:Math.min(n,MAX_RIBBONS)},(_,i)=>createRibbon(rng,family,i,major))

  // Motion first: the visibility check needs the intended rotation range.
  const rotate = chance(rng,.87)
  const shadows = chance(rng,.62)
  config.motion.mode = rotate ? (shadows ? 'both' : 'rotate') : (shadows ? 'shadows' : 'off')
  config.motion.paused = false
  config.motion.speed = between(rng,.065,.14)
  config.motion.shadowStrength = between(rng,.45,.77)
  config.motion.shadowWidth = between(rng,.065,.13)
  config.motion.shadowRepeats = between(rng,1.5,2.8)
  config.motion.shadowSlant = between(rng,-.18,.18)
  config.motion.lineFade = between(rng,.04,.13)
  // Same calm pace, wider expressive range, and a new Z axis.
  config.motion.rotationX = between(rng,4,8)
  config.motion.rotationY = between(rng,6,12)
  config.motion.rotationZ = between(rng,2,6)
  config.motion.phase = between(rng,0,30)

  // Seeded line-break pattern: each composition gets its own stable salt.
  config.look.fragmentSeed = 1 + Math.floor(rng() * 4294967294)
  config.look.depthFade = between(rng,.53,.88)
  config.look.accentIntensity = between(rng,.77,1.16)
  config.look.fragmentation = between(rng,.17,.37)
  config.look.fragmentScale = between(rng,8.5,16)
  config.look.fragmentationSoftness = between(rng,.005,.013)

  // Accent treatment: scattered filaments, edge traces, or a mix of both.
  const modeRoll = rng()
  config.look.accentMode = modeRoll < .45 ? 'scattered' : modeRoll < .70 ? 'edges' : 'mixed'
  config.look.accentDensity = between(rng,.10,.34)
  config.look.accentSegLen = between(rng,.05,.22)
  config.look.edgeProbability = between(rng,.18,.50)
  config.look.edgeLength = between(rng,.25,.80)

  // Framing: evaluate bounded candidates analytically at desktop AND mobile
  // aspects, at the extremes of the intended rotation; accept the first
  // framing with meaningful visible structure, else keep the best attempt.
  // Later candidates widen the search (milder zoom, freer placement) so even
  // awkward geometries find a frame instead of falling back to near-empty.
  let bestFraming: SculptureConfig['framing'] | null = null
  let bestScore = -Infinity
  for (let k = 0; k < MAX_FRAMING_CANDIDATES; k++) {
    const candidate = drawFraming(rng, family)
    if (k >= 4) {
      candidate.zoom *= between(rng, .78, 1.0)
      candidate.x += between(rng, -.10, .10)
      candidate.y += between(rng, -.09, .09)
    }
    config.framing = candidate
    const m = scoreCompositionVisibility(config)
    if (m.score > bestScore) { bestScore = m.score; bestFraming = candidate }
    if (m.score >= VISIBILITY_ACCEPT && m.visibleFrac >= VISIBILITY_MIN_VISIBLE && m.coverage >= VISIBILITY_MIN_COVERAGE) break
  }
  config.framing = bestFraming!
  // Rendering quality is fixed; never randomized.
  config.quality = copyConfig(DEFAULT_SCULPTURE).quality
  return config
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
  const version = options.version ?? GENERATOR_VERSION
  const config = (version === 1 ? generateV1Core : generateV2Core)(rng, family)

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
    config.look.accentMode = previous.look.accentMode
    config.look.accentDensity = previous.look.accentDensity
    config.look.accentSegLen = previous.look.accentSegLen
    config.look.edgeProbability = previous.look.edgeProbability
    config.look.edgeLength = previous.look.edgeLength
    config.ribbons.forEach((r,i) => {r.accents=(previous.ribbons[Math.min(i,previous.ribbons.length-1)]?.accents ?? []).map(a=>({...a}))})
  }
  if (locks.motion) config.motion = copyConfig(previous).motion
  return {seed,family,config:sanitizeConfig(config)}
}
