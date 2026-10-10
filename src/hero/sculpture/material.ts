import * as THREE from 'three'
import type { Ribbon, SculptureConfig } from './config'
import { POINTS, MAX_FOLDS, MAX_ACCENTS } from './config'
import vertexShader from './sculpture.vert?raw'
import fragmentShader from './sculpture.frag?raw'
import occluderFragment from './occluder.frag?raw'

export function createMaterials(){
  const uniforms={
    u_spine:{value:Array.from({length:POINTS},()=>new THREE.Vector3())},
    u_foldA:{value:Array.from({length:MAX_FOLDS},()=>new THREE.Vector4())},
    u_foldB:{value:Array.from({length:MAX_FOLDS},()=>new THREE.Vector4())},
    u_accentA:{value:Array.from({length:MAX_ACCENTS},()=>new THREE.Vector4())},
    u_accentB:{value:Array.from({length:MAX_ACCENTS},()=>new THREE.Vector4())},
    u_width:{value:.45},u_cup:{value:.25},u_baseTwist:{value:0},u_contours:{value:100},
    u_time:{value:0},u_phase:{value:0},u_opacity:{value:1},u_brightness:{value:1},
    u_depthFade:{value:.65},u_accentIntensity:{value:1},
    u_fragmentation:{value:0},u_fragScale:{value:10},u_fragmentSoftness:{value:.01},
    u_shadowEnabled:{value:0},u_shadowStrength:{value:.8},u_shadowWidth:{value:.1},
    u_shadowRepeats:{value:2},u_shadowSlant:{value:.12},u_lineFade:{value:0},
  }
  const lines=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms,
    transparent:true,depthWrite:false,depthTest:true,blending:THREE.NormalBlending})
  // Occluder: same GPU spline/fold shader; rendered before any contour passes.
  const occluder=new THREE.ShaderMaterial({vertexShader,fragmentShader:occluderFragment,uniforms,
    side:THREE.DoubleSide,depthWrite:true,depthTest:true,colorWrite:false,
    polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2})
  return {uniforms,lines,occluder,dispose(){lines.dispose();occluder.dispose()}}
}
export type MaterialSet=ReturnType<typeof createMaterials>
export function updateMaterial(m:MaterialSet,r:Ribbon,c:SculptureConfig){
  const u=m.uniforms
  r.spine.forEach((p,i)=>u.u_spine.value[i].set(p.x,p.y,p.z))
  for(let i=0;i<MAX_FOLDS;i++){
    const f=r.folds[i]
    u.u_foldA.value[i].set(f?.u??-10,f?.radius??.1,f?.twist??0,f?.pinch??0)
    u.u_foldB.value[i].set(f?.lift??0,f?.curl??0,0,0)
  }
  for(let i=0;i<MAX_ACCENTS;i++){
    const z=r.accents[i]
    u.u_accentA.value[i].set(z?.u??-10,z?.v??10,z?.length??.1,z?.spread??.1)
    u.u_accentB.value[i].set(z?.strength??0,0,0,0)
  }
  u.u_width.value=r.width;u.u_cup.value=r.cup;u.u_baseTwist.value=r.baseTwist
  u.u_contours.value=r.contours
  u.u_opacity.value=r.opacity;u.u_brightness.value=r.brightness
  u.u_depthFade.value=c.look.depthFade;u.u_accentIntensity.value=c.look.accentIntensity
  u.u_fragmentation.value=c.look.fragmentation
  u.u_fragScale.value=c.look.fragmentScale
  u.u_fragmentSoftness.value=c.look.fragmentationSoftness
  u.u_shadowStrength.value=c.motion.shadowStrength
  u.u_shadowWidth.value=c.motion.shadowWidth
  u.u_shadowRepeats.value=c.motion.shadowRepeats
  u.u_shadowSlant.value=c.motion.shadowSlant
  u.u_lineFade.value=c.motion.lineFade
  u.u_shadowEnabled.value=(c.motion.mode==='shadows'||c.motion.mode==='both')?1:0
  u.u_phase.value=c.motion.speed
}
