/** CPU geometry: one looping 3D spine lofted into a cupped, twisted ribbon. */
import * as THREE from 'three'
import type { SculptureConfig } from './config'

const SPINE_BASE: [number, number, number][] = [
  [-1.65, -0.43, -0.80],
  [-1.83,  0.18, -0.76],
  [-1.53,  0.83, -0.65],
  [-0.83,  1.18, -0.53],
  [ 0.06,  1.26, -0.47],
  [ 0.93,  0.95, -0.34],
  [ 1.36,  0.35, -0.13],
  [ 1.19, -0.32,  0.33],
  [ 0.54, -0.58,  0.70],
  [-0.21, -0.31,  0.92],
  [-0.49,  0.15,  1.01],
  [-0.10,  0.51,  1.02],
  [ 0.54,  0.49,  0.78],
]

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
function gaussian(x: number, at: number, spread: number) {
  return Math.exp(-Math.pow((x - at) / spread, 2))
}

function sculptedSpine(config: SculptureConfig): THREE.CatmullRomCurve3 {
  const open = config.loopOpenness - 0.55
  const deeper = config.foldDepth - 0.5
  // Open the central negative space, move the returning fold forward, lift crest.
  const openY = [0, 0, 0, 0, 0, 0, -0.05, -0.3, -0.7, -0.3, 0.24, 0.35, 0.30]
  const openX = [0, 0, 0, 0, 0, 0, 0.1, 0.22, 0.3, 0.1, 0, 0.08, 0.20]
  const depthZ = [0, 0, 0, 0, 0, 0, 0.0, 0.25, 0.55, 0.7, 0.85, 0.85, 0.7]
  const crestY = [0, 0.1, 0.45, 0.85, 1.0, 0.65, 0.20, 0, 0, 0, 0, 0, 0]
  return new THREE.CatmullRomCurve3(
    SPINE_BASE.map(([x, y, z], i) => new THREE.Vector3(
      x + open * openX[i],
      y + open * openY[i] + config.crestHeight * crestY[i],
      z + deeper * depthZ[i],
    )),
    false,
    'centripetal',
  )
}

interface Attributes {
  positions: number[]
  normals: number[]
  alphas: number[]
  accents: number[]
  us: number[]
}
function arrays(): Attributes {
  return { positions: [], normals: [], alphas: [], accents: [], us: [] }
}
function toGeometry(a: Attributes): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(a.positions, 3))
  g.setAttribute('aNormal', new THREE.Float32BufferAttribute(a.normals, 3))
  g.setAttribute('aAlpha', new THREE.Float32BufferAttribute(a.alphas, 1))
  g.setAttribute('aAccent', new THREE.Float32BufferAttribute(a.accents, 1))
  g.setAttribute('aU', new THREE.Float32BufferAttribute(a.us, 1))
  return g
}

export interface SculptureGeometry {
  lineGeometry: THREE.BufferGeometry
  occluderGeometry: THREE.BufferGeometry
  /** Object-space 2D bbox for responsive placement. */
  center: THREE.Vector2
  size: THREE.Vector2
  dispose(): void
}

export function buildGeometry(config: SculptureConfig, isMobile: boolean): SculptureGeometry {
  const curve = sculptedSpine(config)
  const t = new THREE.Vector3()
  const spine = new THREE.Vector3()
  const lateral = new THREE.Vector3()
  const depth = new THREE.Vector3()
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const pa = new THREE.Vector3()
  const pb = new THREE.Vector3()
  const pc = new THREE.Vector3()
  const pd = new THREE.Vector3()
  const du = new THREE.Vector3()
  const dv = new THREE.Vector3()

  function surfacePoint(u: number, v: number, out: THREE.Vector3): THREE.Vector3 {
    curve.getPoint(u, spine)
    curve.getTangent(u, t).normalize()
    lateral.set(-t.y, t.x, 0).normalize()
    // Avoid degeneracy if a future spine revision points almost straight at camera.
    if (lateral.lengthSq() < 0.00001) lateral.set(0, 1, 0)
    depth.crossVectors(t, lateral).normalize()
    const taper = Math.pow(
      smoothstep(0.0, 0.13, u) * smoothstep(0.0, 0.16, 1 - u), 0.75,
    )
    const swell = 0.74 + 0.26 * gaussian(u, 0.55, 0.37)
    const width = config.ribbonWidth * taper * swell
    const fold = smoothstep(0.38, 0.77, u)
    const twist = 0.16 + config.foldTwist * fold
    const cs = Math.cos(twist)
    const sn = Math.sin(twist)
    const side = v * width
    const cup = config.crossSectionCup * width * (v * v - 1 / 3)
    return out.copy(spine)
      .addScaledVector(lateral, side * cs - cup * sn)
      .addScaledVector(depth, side * sn + cup * cs)
  }
  function surfaceNormal(u: number, v: number, out: THREE.Vector3) {
    const e = 0.003
    surfacePoint(Math.min(1, u + e), v, pa)
    surfacePoint(Math.max(0, u - e), v, pb)
    du.subVectors(pa, pb)
    surfacePoint(u, Math.min(1, v + e), pc)
    surfacePoint(u, Math.max(-1, v - e), pd)
    dv.subVectors(pc, pd)
    return out.crossVectors(du, dv).normalize()
  }
  function vertex(to: Attributes, u: number, v: number, contour = -1, count = 1) {
    surfacePoint(u, v, p)
    surfaceNormal(u, v, n)
    const facing = Math.abs(n.z)
    const taper = smoothstep(0, 0.065, u) * smoothstep(0, 0.085, 1 - u)
    const ridge = gaussian(u, 0.59, 0.19)
    const nearEdge = Math.pow(Math.abs(v), 4)
    const alpha = contour < 0 ? 1 :
      (0.22 + 0.53 * Math.pow(facing, 0.85)) * taper *
      (0.86 + ridge * 0.20 + nearEdge * 0.18)
    const ridgeIndex = Math.round((count - 1) * 0.87)
    const accent = contour === ridgeIndex ?
      smoothstep(0.42, 0.54, u) * smoothstep(0.86, 0.74, u) : 0
    to.positions.push(p.x, p.y, p.z)
    to.normals.push(n.x, n.y, n.z)
    to.alphas.push(alpha)
    to.accents.push(accent)
    to.us.push(u)
  }

  const visible = arrays()
  const count = isMobile ? config.contoursMobile : config.contoursDesktop
  const segments = config.samplesPerContour
  for (let j = 0; j < count; j++) {
    const v = -1 + 2 * j / (count - 1)
    for (let i = 0; i < segments - 1; i++) {
      vertex(visible, i / (segments - 1), v, j, count)
      vertex(visible, (i + 1) / (segments - 1), v, j, count)
    }
  }
  const lineGeometry = toGeometry(visible)

  // Depth only: same surface, same vertex shader, updated together on each rebuild.
  const hidden = arrays()
  const indices: number[] = []
  const U = isMobile ? 125 : 175
  const V = isMobile ? 26 : 36
  for (let i = 0; i <= U; i++) {
    for (let j = 0; j <= V; j++) vertex(hidden, i / U, -1 + 2 * j / V)
  }
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      const a = i * (V + 1) + j
      const b = a + V + 1
      indices.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }
  const occluderGeometry = toGeometry(hidden)
  occluderGeometry.setIndex(indices)

  lineGeometry.computeBoundingBox()
  const bbox = lineGeometry.boundingBox
  const center = bbox ? new THREE.Vector2(
    (bbox.min.x + bbox.max.x) / 2,
    (bbox.min.y + bbox.max.y) / 2,
  ) : new THREE.Vector2()
  const size = bbox ? new THREE.Vector2(
    Math.max(0.1, bbox.max.x - bbox.min.x),
    Math.max(0.1, bbox.max.y - bbox.min.y),
  ) : new THREE.Vector2(3, 2)
  return {
    lineGeometry, occluderGeometry, center, size,
    dispose() { lineGeometry.dispose(); occluderGeometry.dispose() },
  }
}
