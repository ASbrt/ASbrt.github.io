<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { fragmentFor, type HeroVariantId } from '../shaders/hero'

const props = defineProps<{ variant: HeroVariantId }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const fading = ref(false)

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

let renderer: THREE.WebGLRenderer | null = null
let raf = 0
let fadeTimer = 0
let cleanup: (() => void) | null = null
let applyVariant: ((id: HeroVariantId) => void) | null = null

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })

  // lower pixel ratio on small screens — fewer fragments, larger features
  const dpr = () => Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.25 : 1.5)
  renderer.setPixelRatio(dpr())

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const uniforms = {
    u_res: { value: new THREE.Vector2(1, 1) },
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: fragmentFor(props.variant),
    uniforms,
  })
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material))

  const resize = () => {
    renderer!.setPixelRatio(dpr())
    const { clientWidth: w, clientHeight: h } = canvas
    renderer!.setSize(w, h, false)
    uniforms.u_res.value.set(w * dpr(), h * dpr())
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

  applyVariant = (id: HeroVariantId) => {
    material.fragmentShader = fragmentFor(id)
    material.needsUpdate = true
    // reduced motion renders a single static frame — re-render on swap
    if (reducedMotion) renderer!.render(scene, camera)
  }

  // reduced motion: render one considered static frame instead of animating
  if (reducedMotion) {
    uniforms.u_time.value = 14.0
    renderer.render(scene, camera)
  } else {
    tick()
  }

  cleanup = () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
  }
})

watch(() => props.variant, (id) => {
  if (!applyVariant) return
  if (reducedMotion) {
    applyVariant(id)
    return
  }
  // brief crossfade: dim out, swap shader, fade back in
  window.clearTimeout(fadeTimer)
  fading.value = true
  fadeTimer = window.setTimeout(() => {
    applyVariant!(id)
    fading.value = false
  }, 220)
})

onBeforeUnmount(() => {
  window.clearTimeout(fadeTimer)
  cancelAnimationFrame(raf)
  cleanup?.()
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
