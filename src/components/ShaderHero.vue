<script setup lang="ts">
import { onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'
import * as THREE from 'three'
import { createBackgroundLayer } from '../hero/shared'
import { createSculpture, type SculptureHandle } from '../hero/sculpture'
import { sculptureSettings } from '../hero/sculpture/state'

const props = defineProps<{ exploring: boolean; moving: boolean }>()
const emit = defineEmits<{ ready: [] }>()
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

// Visitor view offsets never mutate the seeded composition or its share URL.
let zoom = 1
let rotationX = 0
let rotationY = 0
let positionX = 0
let positionY = 0
const pointers = new Map<number, { x: number; y: number }>()
function applyView() {
  sculpture?.setView(zoom, rotationX, rotationY, positionX, positionY)
  if (reducedMotion) renderStill()
}
function resetView() {
  zoom = 1
  rotationX = rotationY = positionX = positionY = 0
  applyView()
}
function zoomBy(factor: number) {
  zoom = Math.min(2.5, Math.max(0.5, zoom * factor))
  applyView()
}
function rotateBy(x: number, y: number) {
  rotationX = Math.min(85, Math.max(-85, rotationX + x))
  rotationY = (rotationY + y) % 360
  applyView()
}
function panBy(x: number, y: number) {
  positionX = Math.min(0.75, Math.max(-0.75, positionX + x))
  positionY = Math.min(0.75, Math.max(-0.75, positionY + y))
  applyView()
}
function panPixels(x: number, y: number) {
  const canvas = canvasEl.value
  if (canvas) panBy(x / canvas.clientWidth, -y / canvas.clientHeight)
}
function pointerDown(e: PointerEvent) {
  if (!props.exploring || e.button !== 0) return
  canvasEl.value?.focus({ preventScroll: true })
  canvasEl.value?.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
}
function pointerMove(e: PointerEvent) {
  const previous = pointers.get(e.pointerId)
  if (!props.exploring || !previous) return
  const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)?.[1]
  if (other) {
    const before = Math.hypot(previous.x - other.x, previous.y - other.y)
    const after = Math.hypot(e.clientX - other.x, e.clientY - other.y)
    if (before > 0 && after > 0) zoomBy(after / before)
    panPixels((e.clientX - previous.x) / 2, (e.clientY - previous.y) / 2)
  } else if (props.moving || e.shiftKey) {
    panPixels(e.clientX - previous.x, e.clientY - previous.y)
  } else {
    rotateBy((e.clientY - previous.y) * 0.3, (e.clientX - previous.x) * 0.3)
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
}
function pointerEnd(e: PointerEvent) {
  pointers.delete(e.pointerId)
}
function wheel(e: WheelEvent) {
  if (!props.exploring || e.metaKey) return
  // Trackpad pinch arrives as a Ctrl+wheel event.
  e.preventDefault()
  const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? canvasEl.value!.clientHeight : 1)
  zoomBy(Math.exp(-Math.max(-200, Math.min(200, pixels)) * 0.002))
}
function keydown(e: KeyboardEvent) {
  if (!props.exploring || e.altKey || e.ctrlKey || e.metaKey) return
  switch (e.key) {
    case 'ArrowUp': e.shiftKey ? panBy(0, 0.025) : rotateBy(-5, 0); break
    case 'ArrowDown': e.shiftKey ? panBy(0, -0.025) : rotateBy(5, 0); break
    case 'ArrowLeft': e.shiftKey ? panBy(-0.025, 0) : rotateBy(0, -5); break
    case 'ArrowRight': e.shiftKey ? panBy(0.025, 0) : rotateBy(0, 5); break
    case '+': case '=': zoomBy(1.1); break
    case '-': zoomBy(1 / 1.1); break
    case 'Home': resetView(); break
    default: return
  }
  e.preventDefault()
}
watch(() => props.exploring, async (active) => {
  for (const id of pointers.keys()) {
    if (canvasEl.value?.hasPointerCapture(id)) canvasEl.value.releasePointerCapture(id)
  }
  pointers.clear()
  if (active) {
    await nextTick()
    canvasEl.value?.focus({ preventScroll: true })
  }
})
defineExpose({ resetView })

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
  }, { ...sculptureSettings }, () => { if (reducedMotion) requestAnimationFrame(renderStill) })
  emit('ready')
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
  <canvas
    ref="canvasEl"
    class="shader-canvas"
    :class="{ 'shader-canvas--fallback': webglFailed, 'shader-canvas--exploring': exploring }"
    :aria-hidden="!exploring"
    :tabindex="exploring ? 0 : -1"
    :role="exploring ? 'application' : undefined"
    aria-label="Interactive sculpture"
    :aria-describedby="exploring ? 'explore-help' : undefined"
    :data-lenis-prevent="exploring ? '' : undefined"
    @pointerdown="pointerDown" @pointermove="pointerMove"
    @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd"
    @wheel="wheel" @keydown="keydown"
  ></canvas>
</template>

<style scoped>
.shader-canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.shader-canvas--exploring { z-index: 2; touch-action: none; cursor: grab; }
.shader-canvas--exploring:active { cursor: grabbing; }
.shader-canvas--exploring:focus-visible { outline: 2px solid var(--accent); outline-offset: -3px; }
.shader-canvas--fallback {
  background: radial-gradient(58% 42% at 62% 30%, rgba(242,242,239,.075), transparent 70%),
    radial-gradient(30% 22% at 68% 26%, rgba(216,255,62,.035), transparent 70%), #0a0a0b;
}
</style>
