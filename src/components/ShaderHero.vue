<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { variantDef, type HeroVariantId } from '../hero/registry'
import { createBackgroundLayer, type VariantHandle } from '../hero/shared'

const props = defineProps<{ variant: HeroVariantId }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const fading = ref(false)
const webglFailed = ref(false)

// World mapping: fixed visible height at z = 0, width follows aspect.
const WORLD_H = 2.2
const FOV = 40
const CAM_Z = WORLD_H / 2 / Math.tan((FOV / 2) * (Math.PI / 180))

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let bg: ReturnType<typeof createBackgroundLayer> | null = null
let handle: VariantHandle | null = null
let mountedId: HeroVariantId | null = null
let raf = 0
let fadeTimer = 0
let resizeTimer = 0
let cleanup: (() => void) | null = null

const worldSize = new THREE.Vector2(1, 1)
const mouse = new THREE.Vector2(0.5, 0.5)
const mouseTarget = new THREE.Vector2(0.5, 0.5)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function mountVariant(id: HeroVariantId) {
  if (!scene || !camera) return
  if (mountedId === id && handle) return
  handle?.dispose()
  handle = null
  scene.clear()
  handle = variantDef(id).create({
    scene,
    camera,
    worldSize,
    mouse,
    isMobile: window.innerWidth < 720,
    reducedMotion,
  })
  mountedId = id
}

function renderFrame(time: number) {
  if (!renderer || !scene || !camera || !bg) return
  renderer.autoClear = false
  renderer.clear()
  bg.render(renderer, time)
  renderer.render(scene, camera)
}

// reduced motion: one composed static frame. Called inside a rAF (twice) so
// the canvas is actually presented — a synchronous pre-present draw can
// leave the buffer blank.
function renderStill() {
  handle?.update?.(0, 14)
  renderFrame(14)
}

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  } catch {
    // WebGL unavailable — fall back to a static composed gradient backdrop
    webglFailed.value = true
    return
  }

  // lower pixel ratio on small screens — fewer fragments, calmer image
  const dpr = () => Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.25 : 1.5)
  renderer.setPixelRatio(dpr())

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 30)
  camera.position.z = CAM_Z

  bg = createBackgroundLayer()

  const resize = () => {
    if (!renderer || !camera || !bg) return
    const { clientWidth: w, clientHeight: h } = canvas
    renderer.setPixelRatio(dpr())
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    worldSize.set(WORLD_H * camera.aspect, WORLD_H)
    bg.resize(w * dpr(), h * dpr())
    handle?.resize?.(w, h)
    // resizing clears the drawing buffer — re-present the still frame
    if (reducedMotion) renderStill()
  }
  resize()
  window.addEventListener('resize', resize)

  // smooth mouse follow
  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    mouseTarget.set(
      (e.clientX - rect.left) / rect.width,
      1 - (e.clientY - rect.top) / rect.height,
    )
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  mountVariant(props.variant)

  const clock = new THREE.Clock()
  let elapsed = 0
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt
    mouse.lerp(mouseTarget, 0.045)
    handle?.update?.(dt, elapsed)
    renderFrame(elapsed)
    raf = requestAnimationFrame(tick)
  }

  if (reducedMotion) {
    raf = requestAnimationFrame(() => {
      renderStill()
      raf = requestAnimationFrame(renderStill)
    })
  } else {
    tick()
  }

  cleanup = () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
  }
})

watch(() => props.variant, (id) => {
  if (!scene) return
  if (reducedMotion) {
    mountVariant(id)
    renderStill()
    return
  }
  // brief crossfade: dim out, swap variant, fade back in
  window.clearTimeout(fadeTimer)
  fading.value = true
  fadeTimer = window.setTimeout(() => {
    mountVariant(id)
    fading.value = false
  }, 220)
})

onBeforeUnmount(() => {
  window.clearTimeout(fadeTimer)
  window.clearTimeout(resizeTimer)
  cancelAnimationFrame(raf)
  cleanup?.()
  handle?.dispose()
  bg?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <canvas
    ref="canvasEl"
    class="shader-canvas"
    :class="{ 'shader-canvas--fading': fading, 'shader-canvas--fallback': webglFailed }"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.shader-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 1;
  transition: opacity 0.22s ease;
}

/* static fallback when WebGL is unavailable: a quiet tonal mass in the
   upper-right, echoing the artwork's composition */
.shader-canvas--fallback {
  background:
    radial-gradient(58% 42% at 62% 30%, rgba(242, 242, 239, 0.075), rgba(242, 242, 239, 0) 70%),
    radial-gradient(30% 22% at 68% 26%, rgba(216, 255, 62, 0.035), rgba(216, 255, 62, 0) 70%),
    #0a0a0b;
}

.shader-canvas--fading {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .shader-canvas {
    transition: none;
  }
}
</style>
