<script setup lang="ts">
// VisuellShader — live ports of three generators from the visuell engine's
// ISF shader catalog (FeatureBranchVE / Frontend/src/features/engine/shaders).
// ISF built-ins are mapped: isf_FragNormCoord → vUv, TIME → u_time,
// RENDERSIZE → u_res, FRAMEINDEX → u_frame, audioFFT → silent (no mic).

import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const commonPrelude = /* glsl */ `
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_res;
  uniform float u_frame;
  #define isf_FragNormCoord vUv
  #define TIME u_time
  #define RENDERSIZE u_res
  #define FRAMEINDEX u_frame
  #define IMG_NORM_PIXEL(img, pos) vec4(0.0)
`

/* ———————————————— Plasma ———————————————— */

const plasmaFrag = commonPrelude + /* glsl */ `
  uniform float timeScale;
  uniform float complexity;
  uniform float colorSpeed;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  float plasma(vec2 uv, float time) {
    float c1 = sin(uv.x * 5.0 + time);
    float c2 = sin(uv.y * 3.0 + time * 1.3);
    float c3 = sin((uv.x + uv.y) * 4.0 + time * 0.8);
    float c4 = sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 8.0 + time * 1.7);
    return (c1 + c2 + c3 + c4) * 0.25;
  }

  void main() {
    vec2 uv = (isf_FragNormCoord - 0.5) * 2.0;
    float time = TIME * timeScale;

    float p = plasma(uv * complexity, time);
    float p2 = plasma(uv * complexity * 0.7 + vec2(0.3, 0.7), time * 1.4);
    p = (p + p2 * 0.6) / 1.6;

    float hue = fract(p * 0.3 + TIME * colorSpeed * 0.1);
    float saturation = 0.8 + sin(p * 3.14159) * 0.2;
    float dist = length(uv);
    float value = 0.85 * (0.6 + abs(p) * 0.4) + exp(-dist * 2.0) * 0.3;

    gl_FragColor = vec4(hsv2rgb(vec3(hue, saturation, value)), 1.0);
  }
`

/* ———————————————— Gradient Field ———————————————— */

const gradientFieldFrag = commonPrelude + /* glsl */ `
  const float PI = 3.14159265358979323846;

  uniform vec4 color1;
  uniform vec4 color2;
  uniform vec4 color3;
  uniform vec4 color4;
  uniform float blendMode;
  uniform float rotation;
  uniform float scale;
  uniform float softness;
  uniform float animate;
  uniform float speed;
  uniform float warp;
  uniform float warpScale;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float result = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; ++i) {
      result += valueNoise(p) * amplitude;
      p = mat2(1.62, 1.18, -1.18, 1.62) * p + 7.3;
      amplitude *= 0.5;
    }
    return result;
  }

  vec2 rotatePoint(vec2 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c) * p;
  }

  vec4 normalizeWeights(vec4 weights) {
    float total = max(dot(weights, vec4(1.0)), 0.00001);
    return weights / total;
  }

  vec4 shapeWeights(vec4 weights, float softnessValue) {
    float exponentValue = mix(4.0, 0.38, softnessValue);
    weights = pow(max(weights, vec4(0.00001)), vec4(exponentValue));
    return normalizeWeights(weights);
  }

  vec4 bilinearWeights(vec2 uv) {
    vec2 p = clamp(uv, 0.0, 1.0);
    return vec4(
      (1.0 - p.x) * (1.0 - p.y),
      p.x * (1.0 - p.y),
      (1.0 - p.x) * p.y,
      p.x * p.y
    );
  }

  vec4 radialWeights(vec2 uv) {
    float d1 = length(uv - vec2(0.0, 0.0));
    float d2 = length(uv - vec2(1.0, 0.0));
    float d3 = length(uv - vec2(0.0, 1.0));
    float d4 = length(uv - vec2(1.0, 1.0));
    return vec4(
      1.0 / (0.06 + d1 * d1),
      1.0 / (0.06 + d2 * d2),
      1.0 / (0.06 + d3 * d3),
      1.0 / (0.06 + d4 * d4)
    );
  }

  vec4 diamondWeights(vec2 uv) {
    float d1 = abs(uv.x) + abs(uv.y);
    float d2 = abs(1.0 - uv.x) + abs(uv.y);
    float d3 = abs(uv.x) + abs(1.0 - uv.y);
    float d4 = abs(1.0 - uv.x) + abs(1.0 - uv.y);
    return vec4(
      1.0 / (0.08 + d1 * d1),
      1.0 / (0.08 + d2 * d2),
      1.0 / (0.08 + d3 * d3),
      1.0 / (0.08 + d4 * d4)
    );
  }

  vec4 angularWeights(vec2 uv) {
    vec2 p = uv - 0.5;
    float angle = fract(atan(p.y, p.x) / (2.0 * PI) + 1.0);
    float sector = angle * 4.0;
    float base = floor(sector);
    float fractionValue = smoothstep(0.0, 1.0, fract(sector));

    vec4 weights = vec4(0.0);
    if (base < 1.0) {
      weights.r = 1.0 - fractionValue;
      weights.g = fractionValue;
    } else if (base < 2.0) {
      weights.g = 1.0 - fractionValue;
      weights.a = fractionValue;
    } else if (base < 3.0) {
      weights.a = 1.0 - fractionValue;
      weights.b = fractionValue;
    } else {
      weights.b = 1.0 - fractionValue;
      weights.r = fractionValue;
    }

    float centerBlend = smoothstep(0.28, 0.0, length(p));
    return mix(weights, vec4(0.25), centerBlend);
  }

  void main() {
    vec2 uv = isf_FragNormCoord;
    vec2 center = vec2(0.5);

    float aspect = RENDERSIZE.x / max(RENDERSIZE.y, 1.0);
    vec2 p = uv - center;
    p.x *= aspect;

    float timeValue = TIME * speed;
    float animatedRotation = rotation * 2.0 * PI + animate * sin(timeValue * 0.73) * 0.36;

    p = rotatePoint(p, animatedRotation);
    p /= max(scale, 0.001);

    vec2 drift = animate * vec2(sin(timeValue * 0.91), cos(timeValue * 0.67)) * 0.12;
    p += drift;

    vec2 warpPosition = p * warpScale;
    float warpX = fbm(warpPosition + vec2(timeValue * 0.13, 3.7));
    float warpY = fbm(warpPosition.yx + vec2(-2.1, timeValue * -0.11));
    p += (vec2(warpX, warpY) - 0.5) * warp * 0.48;

    p.x /= aspect;
    vec2 fieldUV = p + 0.5;

    vec4 weights;
    if (blendMode == 0.0) {
      weights = bilinearWeights(fieldUV);
    } else if (blendMode == 1.0) {
      weights = radialWeights(fieldUV);
    } else if (blendMode == 2.0) {
      weights = angularWeights(fieldUV);
    } else {
      weights = diamondWeights(fieldUV);
    }

    weights = shapeWeights(weights, softness);

    vec3 result = color1.rgb * weights.r
                + color2.rgb * weights.g
                + color3.rgb * weights.b
                + color4.rgb * weights.a;

    gl_FragColor = vec4(result, 1.0);
  }
`

/* ———————————————— Broadcast Signal ———————————————— */

const broadcastSignalFrag = commonPrelude + /* glsl */ `
  const float PI = 3.14159265358979323846;

  uniform float patternMode;
  uniform float barCount;
  uniform float shift;
  uniform float scrollSpeed;
  uniform float saturation;
  uniform float scanlines;
  uniform float noiseAmount;
  uniform float chromaShift;
  uniform float distortion;
  uniform float distortionSpeed;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  vec2 rotateAroundCenter(vec2 uv, float turns) {
    float angle = turns * 2.0 * PI;
    float c = cos(angle);
    float s = sin(angle);
    vec2 p = uv - 0.5;
    p.x *= RENDERSIZE.x / max(RENDERSIZE.y, 1.0);
    p = mat2(c, -s, s, c) * p;
    p.x /= RENDERSIZE.x / max(RENDERSIZE.y, 1.0);
    return p + 0.5;
  }

  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    vec3 rgb = clamp(p - 1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  vec3 broadcastPalette(float t) {
    float index = floor(fract(t) * 8.0);
    if (index < 1.0) return vec3(0.78);
    if (index < 2.0) return vec3(0.78, 0.78, 0.04);
    if (index < 3.0) return vec3(0.04, 0.78, 0.78);
    if (index < 4.0) return vec3(0.04, 0.78, 0.08);
    if (index < 5.0) return vec3(0.78, 0.04, 0.78);
    if (index < 6.0) return vec3(0.78, 0.05, 0.04);
    if (index < 7.0) return vec3(0.04, 0.08, 0.78);
    return vec3(0.08);
  }

  vec3 palette(float t) {
    return broadcastPalette(fract(t));
  }

  vec3 patternColor(vec2 uv, float phase) {
    float count = max(2.0, floor(barCount + 0.5));

    if (patternMode == 0.0) {
      float column = floor(fract(uv.x + shift + phase) * count);
      return palette(column / count);
    }

    if (patternMode == 1.0) {
      float stripe = fract((uv.x + uv.y * 0.42) * count + shift + phase);
      float stepped = floor(stripe * 6.0) / 6.0;
      return palette(stepped);
    }

    if (patternMode == 2.0) {
      vec2 cell = floor(fract(uv + vec2(shift + phase, phase * 0.37)) * count);
      float cellValue = hash12(cell + floor(TIME * max(abs(scrollSpeed), 0.001)));
      vec3 c = palette(cellValue + 0.08 * cell.x / count);
      float lineX = smoothstep(0.04, 0.0, abs(fract(uv.x * count) - 0.5) - 0.46);
      float lineY = smoothstep(0.04, 0.0, abs(fract(uv.y * count) - 0.5) - 0.46);
      return mix(c, vec3(0.0), clamp(lineX + lineY, 0.0, 1.0) * 0.45);
    }

    if (uv.y > 0.28) {
      float column = floor(fract(uv.x + shift + phase) * count);
      vec3 c = palette(column / count);
      float pulse = 0.86 + 0.14 * sin((uv.y + phase) * 18.0);
      return c * pulse;
    }

    if (uv.y > 0.14) {
      float ramp = fract(uv.x + shift + phase * 0.25);
      return vec3(ramp);
    }

    float block = floor(fract(uv.x + shift) * count);
    float alternating = mod(block, 2.0);
    return mix(vec3(0.015), palette(block / count), alternating);
  }

  void main() {
    vec2 uv = rotateAroundCenter(isf_FragNormCoord, 0.0);

    float phase = TIME * scrollSpeed;
    float line = floor(uv.y * mix(36.0, 180.0, distortion));
    float lineNoise = hash12(vec2(line, floor(TIME * max(distortionSpeed, 0.001) * 12.0)));
    float analogWave = sin(uv.y * 24.0 + TIME * distortionSpeed * 3.0);

    uv.x += distortion * (lineNoise - 0.5) * 0.035;
    uv.x += distortion * analogWave * 0.006;
    uv.x += valueNoise(vec2(uv.y * 5.0, TIME * distortionSpeed * 0.25)) * distortion * 0.01;

    float chroma = chromaShift;
    vec3 leftSample = patternColor(uv - vec2(chroma, 0.0), phase);
    vec3 centerSample = patternColor(uv, phase);
    vec3 rightSample = patternColor(uv + vec2(chroma, 0.0), phase);

    vec3 color = vec3(leftSample.r, centerSample.g, rightSample.b);

    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, saturation);

    float scanPhase = isf_FragNormCoord.y * RENDERSIZE.y * PI;
    float scan = 1.0 - scanlines * (0.35 + 0.65 * (0.5 + 0.5 * sin(scanPhase)));
    color *= scan;

    float grain = hash12(isf_FragNormCoord * RENDERSIZE + vec2(float(FRAMEINDEX), TIME * 71.0)) - 0.5;
    color += grain * noiseAmount * 0.28;

    float dropout = step(0.992 - distortion * 0.025,
                         hash12(vec2(floor(uv.y * 120.0), floor(TIME * 9.0))));
    color *= 1.0 - dropout * distortion * 0.7;

    color *= 1.0;
    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`

/* ———————————————— config ———————————————— */

interface Slider {
  key: string
  label: string
  min: number
  max: number
  step: number
}

interface Cycle {
  key: string
  label: string
  options: string[]
}

interface ShaderDef {
  id: string
  name: string
  file: string
  frag: string
  defaults: Record<string, number>
  sliders: Slider[]
  cycles?: Cycle[]
}

const SHADERS: ShaderDef[] = [
  {
    id: 'gradient-field',
    name: 'Gradient Field',
    file: 'GradientField.fs',
    frag: gradientFieldFrag,
    defaults: {
      blendMode: 1,
      rotation: 0,
      scale: 1,
      softness: 0.62,
      animate: 0.22,
      speed: 0.12,
      warp: 0.16,
      warpScale: 3,
    },
    sliders: [
      { key: 'speed', label: 'Speed', min: -2, max: 2, step: 0.01 },
      { key: 'warp', label: 'Warp', min: 0, max: 1, step: 0.01 },
      { key: 'softness', label: 'Softness', min: 0, max: 1, step: 0.01 },
    ],
    cycles: [
      { key: 'blendMode', label: 'Blend', options: ['Bilinear', 'Radial', 'Angular', 'Diamond'] },
    ],
  },
  {
    id: 'plasma',
    name: 'Plasma',
    file: 'Plasma.fs',
    frag: plasmaFrag,
    defaults: { timeScale: 1, complexity: 1, colorSpeed: 1 },
    sliders: [
      { key: 'timeScale', label: 'Time Scale', min: 0, max: 5, step: 0.01 },
      { key: 'complexity', label: 'Complexity', min: 0.1, max: 4, step: 0.01 },
      { key: 'colorSpeed', label: 'Color Speed', min: 0, max: 3, step: 0.01 },
    ],
  },
  {
    id: 'broadcast-signal',
    name: 'Broadcast Signal',
    file: 'BroadcastSignal.fs',
    frag: broadcastSignalFrag,
    defaults: {
      patternMode: 3,
      barCount: 8,
      shift: 0,
      scrollSpeed: 0.08,
      saturation: 1,
      scanlines: 0.18,
      noiseAmount: 0.06,
      chromaShift: 0.003,
      distortion: 0.12,
      distortionSpeed: 0.35,
    },
    sliders: [
      { key: 'scrollSpeed', label: 'Scroll Speed', min: -2, max: 2, step: 0.01 },
      { key: 'distortion', label: 'Distortion', min: 0, max: 1, step: 0.01 },
      { key: 'noiseAmount', label: 'Noise', min: 0, max: 1, step: 0.01 },
    ],
    cycles: [
      { key: 'patternMode', label: 'Pattern', options: ['Bars', 'Stripes', 'Grid', 'Broadcast'] },
    ],
  },
]

/* ———————————————— component ———————————————— */

const canvasEl = ref<HTMLCanvasElement | null>(null)
const active = ref(0)
const params = reactive<Record<string, number>>({ ...SHADERS[0].defaults })

let renderer: THREE.WebGLRenderer | null = null
let mesh: THREE.Mesh | null = null
let materials: THREE.ShaderMaterial[] = []
let raf = 0
let visible = true
let observer: IntersectionObserver | null = null

function applyParams() {
  const mat = materials[active.value]
  if (!mat) return
  for (const [k, v] of Object.entries(params)) {
    if (mat.uniforms[k]) mat.uniforms[k].value = v
  }
}

function selectShader(i: number) {
  active.value = (i + SHADERS.length) % SHADERS.length
  Object.assign(params, SHADERS[active.value].defaults)
  if (mesh) mesh.material = materials[active.value]
  applyParams()
}

function cycleParam(c: Cycle) {
  const cur = Math.round(params[c.key] ?? 0)
  params[c.key] = (cur + 1) % c.options.length
  applyParams()
}

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  materials = SHADERS.map((s) => {
    const uniforms: Record<string, THREE.IUniform> = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_frame: { value: 0 },
    }
    for (const [k, v] of Object.entries(s.defaults)) uniforms[k] = { value: v }
    if (s.id === 'gradient-field') {
      uniforms.color1 = { value: new THREE.Vector4(0.18, 0.02, 0.45, 1) }
      uniforms.color2 = { value: new THREE.Vector4(1.0, 0.22, 0.04, 1) }
      uniforms.color3 = { value: new THREE.Vector4(0.0, 0.72, 0.92, 1) }
      uniforms.color4 = { value: new THREE.Vector4(0.02, 0.05, 0.22, 1) }
    }
    return new THREE.ShaderMaterial({ vertexShader, fragmentShader: s.frag, uniforms })
  })

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), materials[0])
  scene.add(mesh)

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer!.setSize(w, h, false)
    const pr = Math.min(window.devicePixelRatio, 1.25)
    materials.forEach((m) => m.uniforms.u_res.value.set(w * pr, h * pr))
  }
  resize()
  window.addEventListener('resize', resize)

  // only render while on screen
  observer = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 })
  observer.observe(canvas)

  const clock = new THREE.Clock()
  let frame = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!visible) return
    const t = clock.getElapsedTime()
    frame += 1
    const mat = materials[active.value]
    mat.uniforms.u_time.value = t
    mat.uniforms.u_frame.value = frame
    renderer!.render(scene, camera)
  }
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
  materials.forEach((m) => m.dispose())
  renderer?.dispose()
})
</script>

<template>
  <div class="shader-demo">
    <canvas ref="canvasEl" class="shader-demo__canvas" aria-label="Live shader demo from the visuell engine"></canvas>

    <div class="shader-demo__top mono">
      <span class="shader-demo__name">{{ SHADERS[active].name }}<span class="shader-demo__dot">.</span>fs</span>
      <span class="shader-demo__src">visuell shader catalog</span>
    </div>

    <div class="shader-demo__controls">
      <button class="shader-demo__arrow" aria-label="Previous shader" @click="selectShader(active - 1)">←</button>

      <div class="shader-demo__params">
        <div v-for="c in SHADERS[active].cycles ?? []" :key="c.key" class="param param--cycle">
          <span class="param__label mono">{{ c.label }}</span>
          <button class="param__cycle mono" @click="cycleParam(c)">
            {{ c.options[Math.round(params[c.key] ?? 0)] }}
          </button>
        </div>
        <div v-for="s in SHADERS[active].sliders" :key="s.key" class="param">
          <span class="param__label mono">{{ s.label }}</span>
          <input
            v-model.number="params[s.key]"
            class="param__slider"
            type="range"
            :min="s.min"
            :max="s.max"
            :step="s.step"
            @input="applyParams"
          />
        </div>
      </div>

      <button class="shader-demo__arrow" aria-label="Next shader" @click="selectShader(active + 1)">→</button>
    </div>
  </div>
</template>

<style scoped>
.shader-demo {
  position: relative;
  border: 1px solid var(--line);
  background: var(--bg);
  aspect-ratio: 4 / 3.4;
  overflow: hidden;
}

.shader-demo__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.shader-demo__top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(to bottom, rgba(10, 10, 11, 0.6), transparent);
  pointer-events: none;
}

.shader-demo__name {
  color: var(--ink);
  font-weight: 700;
}

.shader-demo__dot {
  color: var(--accent);
}

.shader-demo__src {
  color: var(--muted);
}

.shader-demo__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: rgba(10, 10, 11, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid var(--line);
}

.shader-demo__arrow {
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink);
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.shader-demo__arrow:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.shader-demo__params {
  flex: 1;
  display: grid;
  gap: 0.55rem;
}

.param {
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  align-items: center;
  gap: 0.75rem;
}

.param__label {
  color: var(--muted);
  font-size: 0.65rem;
}

.param--cycle {
  grid-template-columns: 6.5rem auto;
  justify-content: start;
}

.param__cycle {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--accent);
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-out);
}

.param__cycle:hover {
  border-color: var(--accent);
}

/* brutalist range slider */
.param__slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 1px;
  background: var(--line);
  outline: none;
  cursor: ew-resize;
}

.param__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.85rem;
  height: 0.85rem;
  background: var(--accent);
  border: none;
  border-radius: 0;
}

.param__slider::-moz-range-thumb {
  width: 0.85rem;
  height: 0.85rem;
  background: var(--accent);
  border: none;
  border-radius: 0;
}
</style>
