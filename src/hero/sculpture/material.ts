import * as THREE from 'three'
import type { SculptureConfig } from './config'
import vertexShader from './sculpture.vert?raw'
import fragmentShader from './sculpture.frag?raw'
import occluderFragment from './occluder.frag?raw'

export function createSculptureMaterials(config: SculptureConfig, reducedMotion: boolean) {
  // Both passes intentionally share one uniforms object for identical deformation.
  const uniforms = {
    u_time: { value: 0 },
    u_motion: { value: reducedMotion ? 0 : config.motionAmplitude },
    u_cycle: { value: config.motionCycleSeconds },
    u_lineOpacity: { value: config.lineOpacity },
    u_lineBrightness: { value: config.lineBrightness },
    u_limeAmount: { value: config.limeAmount },
    u_depthFade: { value: config.depthFadeStrength },
  }
  const lines = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, uniforms,
    transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.NormalBlending,
  })
  const occluder = new THREE.ShaderMaterial({
    vertexShader, fragmentShader: occluderFragment, uniforms,
    side: THREE.DoubleSide, colorWrite: false,
    depthWrite: true, depthTest: true,
    polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2,
  })
  return { uniforms, lines, occluder }
}
