import * as THREE from 'three'
import type { VariantContext } from '../shared'
import { DEFAULT_SCULPTURE, geometrySignature, type SculptureConfig } from './config'
import { buildGeometry } from './geometry'
import { createSculptureMaterials } from './material'
export interface SculptureHandle {
  update(dt:number,elapsed:number):void
  resize():void
  setConfig(next:SculptureConfig):void
  dispose():void
}
/** Owns exactly one GPU scene. Geometry is regenerated only for structural edits. */
export function createSculpture(ctx:VariantContext,first:SculptureConfig=DEFAULT_SCULPTURE,onRebuilt?:()=>void):SculptureHandle {
  const group=new THREE.Group()
  ctx.scene.add(group)
  let config:SculptureConfig={...first}
  let signature=geometrySignature(config,ctx.isMobile)
  let geometry=buildGeometry(config,ctx.isMobile)
  const mats=createSculptureMaterials(config)
  const lines=new THREE.LineSegments(geometry.lineGeometry,mats.lines)
  const occluder=new THREE.Mesh(geometry.occluderGeometry,mats.occluder)
  lines.frustumCulled=false
  occluder.frustumCulled=false
  occluder.renderOrder=1; lines.renderOrder=2
  group.add(occluder,lines)
  let disposed=false
  let rebuildTimer:ReturnType<typeof setTimeout>|null=null
  let seconds=0
  function uniforms(){
    mats.uniforms.u_lineOpacity.value=config.lineOpacity
    mats.uniforms.u_lineBrightness.value=config.lineBrightness
    mats.uniforms.u_accentIntensity.value=config.accentEnabled?config.accentIntensity:0
    mats.uniforms.u_depthFade.value=config.depthFadeStrength
  }
  function frame(){
    const W=ctx.worldSize.x,H=ctx.worldSize.y
    const mobile=W/H<.85
    const fitWidth=(mobile?config.mobileWidth:config.desktopWidth)*W
    const fitHeight=(mobile?config.mobileHeight:config.desktopHeight)*H
    const zoom=mobile?config.mobileZoom:config.desktopZoom
    const scale=Math.min(fitWidth/geometry.size.x,fitHeight/geometry.size.y)*zoom
    const cx=mobile?config.mobileCenterX:config.desktopCenterX
    const cy=mobile?config.mobileCenterY:config.desktopCenterY
    group.scale.setScalar(scale)
    group.position.set((cx-.5)*W-geometry.center.x*scale,(cy-.5)*H-geometry.center.y*scale,0)
  }
  function rebuild(){
    rebuildTimer=null
    if(disposed)return
    const next=buildGeometry(config,ctx.isMobile)
    lines.geometry=next.lineGeometry
    occluder.geometry=next.occluderGeometry
    geometry.dispose(); geometry=next
    frame()
    onRebuilt?.()
  }
  frame();uniforms()
  return {
    setConfig(next){
      if(disposed)return
      const nextSignature=geometrySignature(next,ctx.isMobile)
      const changed=nextSignature!==signature
      config={...next}
      signature=nextSignature
      uniforms();frame()
      if(changed){
        if(rebuildTimer!==null)clearTimeout(rebuildTimer)
        rebuildTimer=setTimeout(rebuild,85)
      }
    },
    update(dt,_elapsed){
      if(disposed)return
      const rotate=config.motionMode==='rotate'||config.motionMode==='both'
      const breathe=config.motionMode==='breathe'||config.motionMode==='both'
      if(!ctx.reducedMotion&&!config.motionPaused&&config.motionMode!=='off') seconds+=Math.max(0,dt)
      const phase=ctx.reducedMotion||config.motionPaused?config.motionPhase:seconds/Math.max(1,config.motionCycleSeconds)+config.motionPhase
      mats.uniforms.u_phase.value=phase
      mats.uniforms.u_motion.value=breathe?config.motionAmplitude:0
      const rad=THREE.MathUtils.degToRad
      const drift=rotate&&!ctx.reducedMotion?(config.motionPaused?Math.sin(config.motionPhase*Math.PI*2):Math.sin(phase*Math.PI*2)):0
      const sway=ctx.reducedMotion?0:config.pointerParallax
      const rx=rad(config.rotationX+config.rotationDriftX*drift)-(ctx.mouse.y-.5)*sway*.7
      const ry=rad(config.rotationY+config.rotationDriftY*drift)+(ctx.mouse.x-.5)*sway
      const interpolation=ctx.reducedMotion?1:Math.min(1,Math.max(.05,dt*6))
      group.rotation.x+= (rx-group.rotation.x)*interpolation
      group.rotation.y+= (ry-group.rotation.y)*interpolation
      group.rotation.z=rad(config.rotationZ)
    },
    resize(){frame();},
    dispose(){
      disposed=true
      if(rebuildTimer!==null)clearTimeout(rebuildTimer)
      group.remove(occluder,lines);ctx.scene.remove(group)
      geometry.dispose();mats.lines.dispose();mats.occluder.dispose()
    },
  }
}
