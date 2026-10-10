<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { createBackgroundLayer } from '../hero/shared'
import { createSculpture, type SculptureHandle } from '../hero/sculpture'
import { sculptureSettings } from '../hero/sculpture/state'

const canvasEl = ref<HTMLCanvasElement | null>(null)
const webglFailed = ref(false)
const WORLD_H = 2.2
const FOV = 40
const CAM_Z = WORLD_H / 2 / Math.tan((FOV / 2) * Math.PI / 180)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const worldSize = new THREE.Vector2(1, 1)
const mouse = new THREE.Vector2(0.5, 0.5)
const targetMouse = new THREE.Vector2(0.5, 0.5)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let bg: ReturnType<typeof createBackgroundLayer> | null = null
let sculpture: SculptureHandle | null = null
let raf = 0
let stillTimer: ReturnType<typeof setTimeout> | null = null
let cleanup = () => {}

function paint(elapsed: number) {
  if (!renderer || !scene || !camera || !bg) return
  renderer.autoClear = false
  renderer.clear()
  bg.render(renderer, reducedMotion ? 0 : elapsed)
  renderer.render(scene, camera)
}
function renderStill() {
  sculpture?.update(0, 0)
  paint(0)
}
watch(sculptureSettings, () => {
  sculpture?.setConfig({ ...sculptureSettings })
  if (reducedMotion) {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(renderStill)
    if (stillTimer !== null) clearTimeout(stillTimer)
    stillTimer = setTimeout(() => { raf = requestAnimationFrame(renderStill) }, 180)
  }
}, { deep: true })

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  } catch {
    webglFailed.value = true
    return
  }
  const dpr = () => Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.25 : 1.5)
  renderer.setPixelRatio(dpr())
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 30)
  camera.position.z = CAM_Z
  bg = createBackgroundLayer()
  const resize = () => {
    if (!renderer || !camera || !bg) return
    const w = Math.max(1, canvas.clientWidth)
    const h = Math.max(1, canvas.clientHeight)
    renderer.setPixelRatio(dpr())
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    worldSize.set(WORLD_H * camera.aspect, WORLD_H)
    bg.resize(w * dpr(), h * dpr())
    sculpture?.resize()
    if (reducedMotion) { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderStill) }
  }
  resize()
  sculpture = createSculpture({
    scene, camera, worldSize, mouse,
    isMobile: window.innerWidth < 720, reducedMotion,
  }, { ...sculptureSettings })
  window.addEventListener('resize', resize)
  const move = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    targetMouse.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height)
  }
  window.addEventListener('pointermove', move, { passive: true })
  cleanup = () => { window.removeEventListener('resize', resize); window.removeEventListener('pointermove', move) }
  let last = performance.now()
  let elapsed = 0
  const tick = () => {
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    elapsed += dt
    mouse.lerp(targetMouse, 0.045)
    sculpture?.update(dt, elapsed)
    paint(elapsed)
    raf = requestAnimationFrame(tick)
  }
  if (reducedMotion) raf = requestAnimationFrame(renderStill)
  else tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (stillTimer !== null) clearTimeout(stillTimer)
  cleanup()
  sculpture?.dispose()
  bg?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <canvas ref="canvasEl" class="shader-canvas" :class="{ 'shader-canvas--fallback': webglFailed }" aria-hidden="true"></canvas>
</template>

<style scoped>
.shader-canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.shader-canvas--fallback {
  background: radial-gradient(58% 42% at 62% 30%, rgba(242,242,239,.075), transparent 70%),
    radial-gradient(30% 22% at 68% 26%, rgba(216,255,62,.035), transparent 70%), #0a0a0b;
}
</style>
