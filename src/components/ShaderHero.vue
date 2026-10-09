<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { variantDef, type HeroVariantId } from '../hero/registry'
import { createBackgroundLayer, type VariantHandle } from '../hero/shared'

const props = defineProps<{ variant: HeroVariantId }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const fading = ref(false)

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

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })

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

  // reduced motion: render a single composed static frame
  if (reducedMotion) {
    handle?.update?.(0, 14)
    renderFrame(14)
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
    handle?.update?.(0, 14)
    renderFrame(14)
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
    :class="{ 'shader-canvas--fading': fading }"
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

.shader-canvas--fading {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .shader-canvas {
    transition: none;
  }
}
</style>
