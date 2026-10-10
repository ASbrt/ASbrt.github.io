import * as THREE from 'three'
import type { VariantContext } from '../shared'
import { DEFAULT_SCULPTURE, GEOMETRY_KEYS, type SculptureConfig } from './config'
import { buildGeometry } from './geometry'
import { createSculptureMaterials } from './material'

export interface SculptureHandle {
  update(dt: number, elapsed: number): void
  resize(): void
  setConfig(next: SculptureConfig): void
  dispose(): void
}

/** Owns GPU buffers/materials for one sculpture, without touching the renderer. */
export function createSculpture(ctx: VariantContext, first: SculptureConfig = DEFAULT_SCULPTURE): SculptureHandle {
  const group = new THREE.Group()
  ctx.scene.add(group)
  let config: SculptureConfig = { ...first }
  let geometry = buildGeometry(config, ctx.isMobile)
  const materials = createSculptureMaterials(config, ctx.reducedMotion)
  const lines = new THREE.LineSegments(geometry.lineGeometry, materials.lines)
  const occluder = new THREE.Mesh(geometry.occluderGeometry, materials.occluder)
  lines.frustumCulled = false
  occluder.frustumCulled = false
  occluder.renderOrder = 1
  lines.renderOrder = 2
  group.add(occluder, lines)
  let disposed = false
  let rebuildTimer: ReturnType<typeof setTimeout> | null = null
  let simulationSeconds = 0

  function applyUniforms() {
    materials.uniforms.u_motion.value = ctx.reducedMotion ? 0 : config.motionAmplitude
    materials.uniforms.u_cycle.value = config.motionCycleSeconds
    materials.uniforms.u_lineOpacity.value = config.lineOpacity
    materials.uniforms.u_lineBrightness.value = config.lineBrightness
    materials.uniforms.u_limeAmount.value = config.limeAmount
    materials.uniforms.u_depthFade.value = config.depthFadeStrength
  }
  function frame() {
    const W = ctx.worldSize.x
    const H = ctx.worldSize.y
    const portrait = W / H < 0.85
    const fitW = (portrait ? config.mobileWidth : config.desktopWidth) * W
    const fitH = (portrait ? config.mobileHeight : config.desktopHeight) * H
    const scale = Math.min(fitW / geometry.size.x, fitH / geometry.size.y)
    const cx = portrait ? config.mobileCenterX : config.desktopCenterX
    const cy = portrait ? config.mobileCenterY : config.desktopCenterY
    group.scale.setScalar(scale)
    group.position.set(
      (cx - 0.5) * W - geometry.center.x * scale,
      (cy - 0.5) * H - geometry.center.y * scale,
      0,
    )
  }
  function rebuild() {
    if (disposed) return
    const next = buildGeometry(config, ctx.isMobile)
    lines.geometry = next.lineGeometry
    occluder.geometry = next.occluderGeometry
    geometry.dispose()
    geometry = next
    frame()
  }
  frame()
  applyUniforms()

  return {
    setConfig(next) {
      if (disposed) return
      const geometryChanged = [...GEOMETRY_KEYS].some(k => config[k] !== next[k])
      config = { ...next }
      applyUniforms()
      frame()
      if (geometryChanged) {
        if (rebuildTimer !== null) clearTimeout(rebuildTimer)
        rebuildTimer = setTimeout(() => { rebuildTimer = null; rebuild() }, 100)
      }
    },
    update(dt) {
      if (disposed) return
      if (!ctx.reducedMotion && config.motionEnabled) simulationSeconds += Math.max(0, dt)
      materials.uniforms.u_time.value = simulationSeconds
      const rad = THREE.MathUtils.degToRad
      const sway = ctx.reducedMotion ? 0 : config.pointerParallax
      const rx = rad(config.rotationX) - (ctx.mouse.y - 0.5) * sway * 0.7
      const ry = rad(config.rotationY) + (ctx.mouse.x - 0.5) * sway
      group.rotation.x += (rx - group.rotation.x) * 0.065
      group.rotation.y += (ry - group.rotation.y) * 0.065
      group.rotation.z = rad(config.rotationZ)
    },
    resize() { frame() },
    dispose() {
      disposed = true
      if (rebuildTimer !== null) clearTimeout(rebuildTimer)
      group.remove(occluder, lines)
      ctx.scene.remove(group)
      geometry.dispose()
      materials.lines.dispose()
      materials.occluder.dispose()
    },
  }
}
