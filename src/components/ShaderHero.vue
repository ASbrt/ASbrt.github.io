<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const canvasEl = ref<HTMLCanvasElement | null>(null)

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

// Flow-field fbm shader — a nod to visuell's live-visuals sampling.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;

  const vec3 BG     = vec3(0.040, 0.040, 0.043);
  const vec3 INK    = vec3(0.949, 0.949, 0.937);
  const vec3 ACCENT = vec3(0.847, 1.000, 0.243);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res.xy;
    vec2 p  = uv;
    p.x *= u_res.x / u_res.y;

    float t = u_time * 0.06;

    // domain-warped flow field
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t * 0.7));
    vec2 r = vec2(
      fbm(p * 1.6 + 2.2 * q + vec2(1.7, 9.2) + t * 0.4),
      fbm(p * 1.6 + 2.2 * q + vec2(8.3, 2.8) - t * 0.3)
    );
    float f = fbm(p * 1.6 + 2.4 * r);

    // mouse warp — subtle lens into the field
    vec2 m = u_mouse;
    m.x *= u_res.x / u_res.y;
    float d = distance(p, m);
    f += 0.12 * exp(-d * 3.5) * sin(u_time * 0.8 - d * 12.0);

    // contour bands — groovebox waveform feel
    float bands = abs(fract(f * 7.0 - u_time * 0.12) - 0.5) * 2.0;
    float line = smoothstep(0.06, 0.0, bands - 0.92);

    vec3 col = BG;
    col = mix(col, INK * 0.16, smoothstep(0.25, 0.85, f));          // ghostly lift
    col = mix(col, ACCENT * 0.85, line * smoothstep(0.45, 0.75, f)); // accent traces
    col = mix(col, ACCENT, line * smoothstep(0.78, 0.95, f) * 0.9);  // hot peaks

    // vignette + dither
    float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));
    col *= mix(0.55, 1.0, vig);
    col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`

let renderer: THREE.WebGLRenderer | null = null
let raf = 0
let cleanup: (() => void) | null = null

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const uniforms = {
    u_res: { value: new THREE.Vector2(1, 1) },
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
  }

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material))

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    renderer!.setSize(w, h, false)
    uniforms.u_res.value.set(w * Math.min(window.devicePixelRatio, 1.5), h * Math.min(window.devicePixelRatio, 1.5))
  }
  resize()
  window.addEventListener('resize', resize)

  // smooth mouse follow
  const target = new THREE.Vector2(0.5, 0.5)
  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    target.set(
      (e.clientX - rect.left) / rect.width,
      1 - (e.clientY - rect.top) / rect.height,
    )
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const clock = new THREE.Clock()
  const tick = () => {
    uniforms.u_time.value = clock.getElapsedTime()
    uniforms.u_mouse.value.lerp(target, 0.045)
    renderer!.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  // reduced motion: render a single static frame instead of animating
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderer.render(scene, camera)
  } else {
    tick()
  }

  cleanup = () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  cleanup?.()
  renderer?.dispose()
})
</script>

<template>
  <canvas ref="canvasEl" class="shader-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.shader-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
