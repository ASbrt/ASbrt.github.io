// Shared infrastructure for the hero shader variants.
//
// Both variants are Three.js scenes (no fullscreen fragment shaders):
//  - Flow      — CPU-generated streamline polylines, displaced gently on the GPU
//  - Network   — a live node/edge simulation rendered as points + lines
//
// Shared pieces: deterministic JS noise, the GLSL noise lib, a line material
// used by both variants, and a near-flat background layer with vignette.

import * as THREE from 'three'

/* ——————————————————— palette ——————————————————— */

export const BG_COLOR = new THREE.Color(0.04, 0.04, 0.043)
export const INK_COLOR = new THREE.Color(0.949, 0.949, 0.937)
export const ACCENT_COLOR = new THREE.Color(0.847, 1.0, 0.243)

/* ——————————————————— deterministic JS noise ——————————————————— */

export function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x))
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

export class Noise2D {
  private perm: Uint8Array

  constructor(seed = 1) {
    const base = new Uint8Array(256)
    for (let i = 0; i < 256; i++) base[i] = i
    const rnd = makeRng(seed)
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      const t = base[i]
      base[i] = base[j]
      base[j] = t
    }
    this.perm = new Uint8Array(512)
    for (let i = 0; i < 512; i++) this.perm[i] = base[i & 255]
  }

  private val(ix: number, iy: number): number {
    return this.perm[(this.perm[ix & 255] + iy) & 255] / 255
  }

  noise(x: number, y: number): number {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = x - ix
    const fy = y - iy
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
    const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
    const a = this.val(ix, iy)
    const b = this.val(ix + 1, iy)
    const c = this.val(ix, iy + 1)
    const d = this.val(ix + 1, iy + 1)
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
  }

  fbm(x: number, y: number, octaves = 4): number {
    let v = 0
    let a = 0.55
    let f = 1
    let n = 0
    for (let i = 0; i < octaves; i++) {
      v += a * this.noise(x * f, y * f)
      n += a
      a *= 0.5
      f *= 2.03
    }
    return v / n
  }
}

/* ——————————————————— composition ——————————————————— */

// Calm basin behind the hero text (lower-left), in uv space (y up).
// Every variant keeps this region quiet.
export function calmBasin(u: number, v: number): number {
  const d = Math.hypot((u - 0.3) * 1.0, (v - 0.16) * 1.3)
  return smoothstep(0.9, 0.2, d)
}

/* ——————————————————— GLSL noise lib ——————————————————— */

export const GLSL_NOISE = /* glsl */ `
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
      mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.03;
      a *= 0.5;
    }
    return v;
  }
`

/* ——————————————————— shared line material ——————————————————— */
// Thin 1px lines with per-vertex alpha/color, a slow advected-noise
// displacement (the "flow"), a soft mouse wind, and depth fade.

export const LINE_VERT = GLSL_NOISE + /* glsl */ `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_worldSize;
  uniform float u_amp;

  attribute float aAlpha;
  attribute vec3 aColor;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;

    // slow advected displacement — lines undulate as if the field breathes
    float ph = u_time * 0.10;
    vec2 off = vec2(
      fbm(pos.xy * 0.9 + vec2(ph, -ph * 0.7)),
      fbm(pos.xy * 0.9 + vec2(-ph * 0.8, ph) + 5.2)
    );
    pos.xy += (off - 0.5) * 2.0 * u_amp;

    // the field leans gently toward the pointer — no flashy reactivity
    vec2 mw = (u_mouse - 0.5) * u_worldSize;
    vec2 dm = pos.xy - mw;
    float d = length(dm);
    pos.xy += (dm / max(d, 0.001)) * 0.035 * exp(-d * d * 1.2);

    float depthFade = clamp(exp((pos.z - 0.15) * 0.65), 0.35, 1.0);
    vAlpha = aAlpha * depthFade;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const LINE_FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`

export interface LineMaterialOptions {
  additive?: boolean
  amp?: number
}

export function makeLineMaterial(opts: LineMaterialOptions = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    uniforms: {
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_worldSize: { value: new THREE.Vector2(1, 1) },
      u_amp: { value: opts.amp ?? 0.02 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
}

/* ——————————————————— background layer ——————————————————— */
// Near-flat dark backdrop: barely-there large-scale tonal drift, vignette,
// dither. Rendered as a separate ortho pass before the variant scene.

const BG_FRAG = GLSL_NOISE + /* glsl */ `
  uniform vec2 u_res;
  uniform float u_time;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    vec2 p = uv;
    p.x *= u_res.x / u_res.y;

    float t = u_time * 0.02;
    float g = fbm(p * 1.8 + vec2(t, -t * 0.7));
    vec3 col = vec3(0.040, 0.040, 0.043) * (1.0 + (g - 0.5) * 0.10);

    col *= mix(0.72, 1.0, smoothstep(1.2, 0.3, distance(uv, vec2(0.5, 0.45))));
    col += (hash12(gl_FragCoord.xy + fract(u_time) * 61.7) - 0.5) * 0.010;

    gl_FragColor = vec4(col, 1.0);
  }
`

const BG_VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

export interface BackgroundLayer {
  render(renderer: THREE.WebGLRenderer, time: number): void
  resize(w: number, h: number): void
  dispose(): void
}

export function createBackgroundLayer(): BackgroundLayer {
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const uniforms = {
    u_res: { value: new THREE.Vector2(1, 1) },
    u_time: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: BG_VERT,
    fragmentShader: BG_FRAG,
    uniforms,
    depthWrite: false,
    depthTest: false,
  })
  const geometry = new THREE.PlaneGeometry(2, 2)
  scene.add(new THREE.Mesh(geometry, material))

  return {
    render(renderer, time) {
      uniforms.u_time.value = time
      renderer.render(scene, camera)
    },
    resize(w, h) {
      uniforms.u_res.value.set(w, h)
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

/* ——————————————————— variant contract ——————————————————— */

export interface VariantContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  /** Visible world size at z = 0 (live object — updated on resize). */
  worldSize: THREE.Vector2
  /** Smoothed pointer position in uv space (0..1, y up). Live object. */
  mouse: THREE.Vector2
  isMobile: boolean
  reducedMotion: boolean
}

export interface VariantHandle {
  update?(dt: number, t: number): void
  resize?(width: number, height: number): void
  dispose(): void
}

export interface HeroVariantDef {
  id: 'flow' | 'network'
  label: string
  create(ctx: VariantContext): VariantHandle
}
