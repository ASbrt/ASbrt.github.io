// Variant: Sculptural Surface
//
// A folded topographic sheet — one coherent parametric surface rendered as
// hundreds of fine contour lines. Not streamlines, not particles: a lofted
// ribbon whose silhouette comes from a small set of authored controls.
//
// Construction:
//  - A Catmull–Rom spine sweeps from mid-left up to a crest, then bends
//    down-right. Parallel-transport frames give a twist-free local frame.
//  - The cross-section is a cupped arc (width, cup and twist envelopes vary
//    along the spine). Near FOLD_U the twist peaks — the sheet turns edge-on
//    and the contours converge into a compressed fold — while a depth step
//    (kink) drops the far side away behind it.
//  - Contours are iso-u curves of the surface. Where the sheet faces the
//    camera they open up; where it turns, they bunch. Density variation is
//    geometric, not painted on.
//  - An invisible copy of the same surface writes depth only, so the contour
//    lines are genuinely occluded where the sheet folds over itself.
//
// Motion: a single slow breathing cycle (~34s) displaces vertices along the
// baked surface normals, amplitude peaking at the fold — the sculpture
// changes tension, never its silhouette. Reduced motion renders it static.
//
// Color: soft off-white ink, brightness/alpha driven by how much the surface
// faces the camera (baked at build, motion is tiny). Exactly two contours
// carry the acid-lime accent: the crest lip and the fold lip.

import * as THREE from 'three'
import {
  ACCENT_COLOR,
  INK_COLOR,
  clamp01,
  makeRng,
  smoothstep,
  type HeroVariantDef,
  type VariantHandle,
} from './shared'

/* ——————————————————— authored controls ——————————————————— */

// Where the fold happens along the spine (0..1) — the composition's focal point.
const FOLD_U = 0.62
// Depth step across the fold: the sheet drops away behind its own lip.
const FOLD_DEPTH = 0.5

// Spine control points (design space: x ∈ [-1.76, 1.76], y ∈ [-1.1, 1.1],
// z toward the camera). One sweeping gesture: tail low-left, crest near the
// fold, right side reopening as it recedes.
const SPINE_POINTS = [
  new THREE.Vector3(-1.50, 0.12, -0.62),
  new THREE.Vector3(-0.95, 0.32, -0.30),
  new THREE.Vector3(-0.30, 0.58, 0.12),
  new THREE.Vector3(0.30, 0.74, 0.32),
  new THREE.Vector3(0.78, 0.56, 0.00),
  new THREE.Vector3(1.18, 0.74, -0.40),
  new THREE.Vector3(1.62, 0.44, -0.68),
]

// Fixed view tilt baked into the geometry — a slightly oblique angle so the
// fold reads as depth, not as a flat line pattern.
const DESIGN_TILT = new THREE.Euler(-0.10, -0.20, 0.03)

// Width envelope: tapered tails, swelling toward the open fan left of the fold.
function widthAt(u: number): number {
  const ends = smoothstep(0, 0.2, u) * smoothstep(0, 0.15, 1 - u)
  const swell = 0.5 + 0.5 * Math.exp(-Math.pow((u - 0.44) / 0.34, 2))
  return 0.68 * Math.pow(ends, 0.75) * swell
}

// Cupping of the cross-section: gentle at the left tail, strongly cupped
// approaching the fold, releasing again to the right.
function cupAt(u: number): number {
  const rise = smoothstep(0.10, 0.58, u)
  const fall = smoothstep(0.72, 0.98, u)
  return 0.08 + 0.85 * rise - 0.5 * fall
}

// Twist of the cross-section around the spine (radians). Peaks at the fold —
// there the sheet turns edge-on and the contours converge on screen.
function twistAt(u: number): number {
  const base = 0.2 + 0.18 * u
  const foldPeak = 1.3 * Math.exp(-Math.pow((u - FOLD_U) / 0.13, 2))
  return base + foldPeak
}

// Depth step: after the fold the sheet sits further back.
function kinkAt(u: number): number {
  return FOLD_DEPTH * smoothstep(FOLD_U - 0.08, FOLD_U + 0.10, u)
}

/* ——————————————————— spine + frames ——————————————————— */

const SPINE_SAMPLES = 480

interface Frame {
  s: THREE.Vector3
  l: THREE.Vector3
  d: THREE.Vector3
}

function buildSpineFrames(): Frame[] {
  const curve = new THREE.CatmullRomCurve3(SPINE_POINTS, false, 'centripetal')
  const frames: Frame[] = []
  const ref = new THREE.Vector3(0, 0, 1)
  const q = new THREE.Quaternion()

  let prevT = curve.getTangent(0).normalize()
  let l = new THREE.Vector3().crossVectors(ref, prevT)
  if (l.lengthSq() < 1e-6) l.set(0, 1, 0)
  l.normalize()
  frames.push({ s: curve.getPoint(0), l: l.clone(), d: new THREE.Vector3().crossVectors(prevT, l).normalize() })

  for (let i = 1; i <= SPINE_SAMPLES; i++) {
    const u = i / SPINE_SAMPLES
    const t = curve.getTangent(u).normalize()
    // parallel transport: rotate the previous frame by tangent_{i-1} → tangent_i
    q.setFromUnitVectors(prevT, t)
    const li = frames[i - 1].l.clone().applyQuaternion(q)
    li.sub(t.clone().multiplyScalar(li.dot(t))).normalize()
    frames.push({
      s: curve.getPoint(u),
      l: li,
      d: new THREE.Vector3().crossVectors(t, li).normalize(),
    })
    prevT = t
  }
  return frames
}

/* ——————————————————— shaders ——————————————————— */

const SURFACE_VERT = /* glsl */ `
  uniform float u_time;
  uniform float u_motion;

  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aU;
  attribute vec3 aNormal;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;

    // one slow breathing cycle (~34s): the fold opens and closes its tension.
    // amplitude peaks at the fold, tails stay nearly still.
    float phase = u_time * 0.185;
    float breathe = sin(phase + aU * 2.4);
    float amp = 0.034 * (0.22 + 0.78 * exp(-pow((aU - ${FOLD_U.toFixed(3)}) * 3.4, 2.0)));
    pos += aNormal * breathe * amp * u_motion;

    vAlpha = aAlpha;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const LINE_FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`

// Writes depth only — the contour lines test against it, so the folded sheet
// genuinely occludes its own far side.
const OCCLUDER_FRAG = /* glsl */ `
  void main() {
    gl_FragColor = vec4(0.0);
  }
`

/* ——————————————————— variant ——————————————————— */

export const sculpturalSurface: HeroVariantDef = {
  id: 'surface',
  label: 'Surface',
  create(ctx): VariantHandle {
    const group = new THREE.Group()
    ctx.scene.add(group)

    const frames = buildSpineFrames()
    const rng = makeRng(20260214)
    const tilt = new THREE.Matrix4().makeRotationFromEuler(DESIGN_TILT)

    /* ——— continuous surface evaluation ——— */

    const _s = new THREE.Vector3()
    const _l = new THREE.Vector3()
    const _d = new THREE.Vector3()

    function frameAt(u: number) {
      const f = clamp01(u) * SPINE_SAMPLES
      const i = Math.min(SPINE_SAMPLES - 1, Math.floor(f))
      const k = f - i
      const a = frames[i]
      const b = frames[i + 1]
      _s.lerpVectors(a.s, b.s, k)
      _l.lerpVectors(a.l, b.l, k).normalize()
      _d.lerpVectors(a.d, b.d, k).normalize()
      return { s: _s, l: _l, d: _d }
    }

    function surfacePoint(u: number, v: number, out: THREE.Vector3): THREE.Vector3 {
      const { s, l, d } = frameAt(u)
      const w = widthAt(u)
      const lateral = v * w
      const cup = cupAt(u) * w * (v * v - 1 / 3)
      const phi = twistAt(u)
      const cs = Math.cos(phi)
      const sn = Math.sin(phi)
      out
        .copy(s)
        .addScaledVector(l, lateral * cs - cup * sn)
        .addScaledVector(d, lateral * sn + cup * cs)
      out.z -= kinkAt(u)
      return out.applyMatrix4(tilt)
    }

    const _pa = new THREE.Vector3()
    const _pb = new THREE.Vector3()
    const _pc = new THREE.Vector3()
    const _pd = new THREE.Vector3()
    const _du = new THREE.Vector3()
    const _dv = new THREE.Vector3()

    function surfaceNormal(u: number, v: number, out: THREE.Vector3): THREE.Vector3 {
      const e = 0.004
      surfacePoint(Math.min(1, u + e), v, _pa)
      surfacePoint(Math.max(0, u - e), v, _pb)
      _du.subVectors(_pa, _pb)
      surfacePoint(u, Math.min(1, v + e), _pc)
      surfacePoint(u, Math.max(0, v - e), _pd)
      _dv.subVectors(_pc, _pd)
      out.crossVectors(_du, _dv).normalize()
      if (out.z < 0) out.negate() // consistently camera-facing
      return out
    }

    /* ——— contour geometry ——— */
    // Contours are iso-v curves: each line follows the full sweeping gesture
    // of the spine at a fixed offset across the sheet. Where the sheet faces
    // the camera the family opens up; at the fold (twist ≈ edge-on) the whole
    // family converges into a compressed bundle.

    const mobile = ctx.isMobile
    const N_LINES = mobile ? 140 : 190
    const N_U = mobile ? 120 : 160

    // Two accents only, each a short segment hugging its feature — never a
    // full-length line: the fold lip (outer edge, right of the crest) and an
    // inner ridge that outlines the crest.
    const ACCENTS: { v: number; u0: number; u1: number }[] = [
      { v: 1.0, u0: 0.44, u1: 0.92 }, // fold lip
      { v: -0.38, u0: 0.26, u1: 0.58 }, // crest ridge
    ]
    const accentIdx = new Map<number, (typeof ACCENTS)[number]>()
    for (const spec of ACCENTS) {
      let best = 0
      let bestD = Infinity
      for (let j = 0; j < N_LINES; j++) {
        const v = (j / (N_LINES - 1)) * 2 - 1
        const d = Math.abs(v - spec.v)
        if (d < bestD) {
          bestD = d
          best = j
        }
      }
      accentIdx.set(best, spec)
    }

    const p = new THREE.Vector3()
    const n = new THREE.Vector3()

    interface LineData {
      pos: number[]
      col: number[]
      a: number[]
      u: number[]
      nrm: number[]
    }

    const ink: LineData = { pos: [], col: [], a: [], u: [], nrm: [] }
    const accent: LineData = { pos: [], col: [], a: [], u: [], nrm: [] }

    function pushVertex(
      target: LineData,
      u: number,
      v: number,
      accentSpec: (typeof ACCENTS)[number] | null,
      lineJitter: number,
    ) {
      surfacePoint(u, v, p)
      surfaceNormal(u, v, n)
      const facing = clamp01(n.z)
      const foldProx = Math.exp(-Math.pow((u - FOLD_U) / 0.1, 2))

      let r: number
      let g: number
      let b: number
      let alpha: number

      if (accentSpec) {
        const bright = 0.66 + 0.36 * facing
        r = ACCENT_COLOR.r * bright
        g = ACCENT_COLOR.g * bright
        b = ACCENT_COLOR.b * bright
        // a segment, not a full line: soft in/out around the feature
        const seg =
          smoothstep(accentSpec.u0 - 0.07, accentSpec.u0, u) *
          smoothstep(accentSpec.u1 + 0.07, accentSpec.u1, u)
        alpha = 0.7 * seg
      } else {
        const bright = (0.24 + 0.62 * Math.pow(facing, 1.4)) * (0.8 + 0.45 * foldProx)
        r = INK_COLOR.r * bright
        g = INK_COLOR.g * bright
        b = INK_COLOR.b * bright
        alpha = 0.07 + 0.46 * Math.pow(facing, 1.5)
        alpha *= 0.62 + 0.55 * foldProx
        // rim lines read slightly stronger, like the edge of a folded sheet
        alpha *= 0.85 + 0.3 * Math.pow(Math.abs(v), 3)
      }

      // dissolve at the spine tails
      alpha *= smoothstep(0, 0.055, u) * smoothstep(0, 0.055, 1 - u)
      // depth fade (camera sits on +z)
      alpha *= THREE.MathUtils.clamp(Math.exp((p.z - 0.15) * 0.6), 0.3, 1.0)
      alpha *= lineJitter

      target.pos.push(p.x, p.y, p.z)
      target.col.push(r, g, b)
      target.a.push(alpha)
      target.u.push(u)
      target.nrm.push(n.x, n.y, n.z)
    }

    for (let j = 0; j < N_LINES; j++) {
      const v = (j / (N_LINES - 1)) * 2 - 1
      const accentSpec = accentIdx.get(j) ?? null
      const target = accentSpec ? accent : ink
      const jitter = 0.85 + 0.3 * rng()
      for (let i = 0; i < N_U - 1; i++) {
        const u0 = i / (N_U - 1)
        const u1 = (i + 1) / (N_U - 1)
        pushVertex(target, u0, v, accentSpec, jitter)
        pushVertex(target, u1, v, accentSpec, jitter)
      }
    }

    /* ——— occluder grid (same surface, depth only) ——— */

    const OC_U = mobile ? 90 : 140
    const OC_V = mobile ? 30 : 44
    const ocPos: number[] = []
    const ocU: number[] = []
    const ocNrm: number[] = []
    const ocA: number[] = []
    const ocCol: number[] = []
    const ocIdx: number[] = []

    for (let i = 0; i <= OC_U; i++) {
      const u = i / OC_U
      for (let j = 0; j <= OC_V; j++) {
        const v = (j / OC_V) * 2 - 1
        surfacePoint(u, v, p)
        surfaceNormal(u, v, n)
        ocPos.push(p.x, p.y, p.z)
        ocNrm.push(n.x, n.y, n.z)
        ocU.push(u)
        ocA.push(1)
        ocCol.push(0, 0, 0)
      }
    }
    for (let i = 0; i < OC_U; i++) {
      for (let j = 0; j < OC_V; j++) {
        const a0 = i * (OC_V + 1) + j
        const b0 = a0 + OC_V + 1
        ocIdx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1)
      }
    }

    /* ——— materials + meshes ——— */

    const uniforms = {
      u_time: { value: 0 },
      u_motion: { value: ctx.reducedMotion ? 0 : 1 },
    }

    const occluderGeo = new THREE.BufferGeometry()
    occluderGeo.setAttribute('position', new THREE.Float32BufferAttribute(ocPos, 3))
    occluderGeo.setAttribute('aNormal', new THREE.Float32BufferAttribute(ocNrm, 3))
    occluderGeo.setAttribute('aU', new THREE.Float32BufferAttribute(ocU, 1))
    occluderGeo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(ocA, 1))
    occluderGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(ocCol, 3))
    occluderGeo.setIndex(ocIdx)

    const occluderMat = new THREE.ShaderMaterial({
      vertexShader: SURFACE_VERT,
      fragmentShader: OCCLUDER_FRAG,
      uniforms,
      side: THREE.DoubleSide,
      colorWrite: false,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    })
    const occluder = new THREE.Mesh(occluderGeo, occluderMat)
    occluder.frustumCulled = false
    occluder.renderOrder = 1
    group.add(occluder)

    function makeLines(data: LineData, order: number) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(data.pos, 3))
      geo.setAttribute('aColor', new THREE.Float32BufferAttribute(data.col, 3))
      geo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(data.a, 1))
      geo.setAttribute('aU', new THREE.Float32BufferAttribute(data.u, 1))
      geo.setAttribute('aNormal', new THREE.Float32BufferAttribute(data.nrm, 3))
      const mat = new THREE.ShaderMaterial({
        vertexShader: SURFACE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NormalBlending,
      })
      const mesh = new THREE.LineSegments(geo, mat)
      mesh.frustumCulled = false
      mesh.renderOrder = order
      group.add(mesh)
      return { mesh, geo, mat }
    }

    const inkMesh = makeLines(ink, 2)
    const accentMesh = makeLines(accent, 3)

    /* ——— responsive framing ——— */
    // Geometry lives in a fixed design space; the group transform maps the
    // mass centroid to a target uv per breakpoint. No rebuild on resize.

    const MASS_ANCHOR = new THREE.Vector2(0.18, 0.38) // design-space centroid of the visual mass

    const baseRotX = 0
    const baseRotY = 0

    function frame() {
      const W = ctx.worldSize.x
      const H = ctx.worldSize.y
      const aspect = W / H

      let s: number
      let targetU: number
      let targetV: number
      if (aspect < 0.85) {
        // portrait: fit width (tails may bleed off), centered upper region
        s = W / 3.2
        targetU = 0.52
        targetV = 0.72
      } else {
        // landscape: scaled to leave breathing room, upper-middle to upper-right
        s = 0.85
        targetU = 0.6
        targetV = 0.65
      }
      group.scale.setScalar(s)
      group.position.set(
        (targetU - 0.5) * W - MASS_ANCHOR.x * s,
        (targetV - 0.5) * H - MASS_ANCHOR.y * s,
        0,
      )
      group.rotation.x = baseRotX
      group.rotation.y = baseRotY
    }

    frame()

    return {
      update(_dt: number, t: number) {
        uniforms.u_time.value = t
        if (!ctx.reducedMotion) {
          // barely-there parallax — the sculpture never depends on it
          const ry = baseRotY + (ctx.mouse.x - 0.5) * 0.05
          const rx = baseRotX - (ctx.mouse.y - 0.5) * 0.03
          group.rotation.y += (ry - group.rotation.y) * 0.03
          group.rotation.x += (rx - group.rotation.x) * 0.03
        }
      },
      resize() {
        frame()
      },
      dispose() {
        for (const { mesh, geo, mat } of [inkMesh, accentMesh]) {
          group.remove(mesh)
          geo.dispose()
          mat.dispose()
        }
        group.remove(occluder)
        occluderGeo.dispose()
        occluderMat.dispose()
        ctx.scene.remove(group)
      },
    }
  },
}
