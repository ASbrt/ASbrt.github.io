// Background rendering and scene context for the hero sculpture.

import * as THREE from 'three'

/* ——————————————————— GLSL noise lib ——————————————————— */

const GLSL_NOISE = /* glsl */ `
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
