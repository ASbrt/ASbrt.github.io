import * as THREE from 'three'
import type { SculptureConfig } from './config'
import vertexShader from './sculpture.vert?raw'
import fragmentShader from './sculpture.frag?raw'
import occluderFragment from './occluder.frag?raw'
export function createSculptureMaterials(config:SculptureConfig){
  const uniforms={
    u_phase:{value:config.motionPhase},u_motion:{value:config.motionAmplitude},
    u_lineOpacity:{value:config.lineOpacity},u_lineBrightness:{value:config.lineBrightness},
    u_accentIntensity:{value:config.accentIntensity},u_depthFade:{value:config.depthFadeStrength},
  }
  const lines=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms,
    transparent:true,depthWrite:false,depthTest:true,blending:THREE.NormalBlending})
  const occluder=new THREE.ShaderMaterial({vertexShader,fragmentShader:occluderFragment,uniforms,
    side:THREE.DoubleSide,colorWrite:false,depthWrite:true,depthTest:true,
    polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2})
  return {lines,occluder,uniforms}
}
