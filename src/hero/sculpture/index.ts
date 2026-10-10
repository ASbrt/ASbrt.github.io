import * as THREE from 'three'
import type { VariantContext } from '../shared'
import { DEFAULT_SCULPTURE, sanitizeConfig, topologySignature, type SculptureConfig, type Ribbon } from './config'
import { makeTopology, type Topology } from './geometry'
import { createMaterials, updateMaterial, type MaterialSet } from './material'
export interface SculptureHandle { update(dt:number,elapsed:number):void;resize():void;setConfig(next:SculptureConfig):void;dispose():void }
interface Layer { group:THREE.Group; topology:Topology; mats:MaterialSet; lines:THREE.LineSegments; occluder:THREE.Mesh }
/** Geometry stays fixed during folds, control-point edits, accent edits, and motion. */
export function createSculpture(ctx:VariantContext,initial:SculptureConfig=DEFAULT_SCULPTURE,_onRebuilt?:()=>void):SculptureHandle{
  const root=new THREE.Group();ctx.scene.add(root)
  let cfg=sanitizeConfig(initial),topologyKey=topologySignature(cfg)
  const layers:Layer[]=[]
  let stopped=false,time=0
  function createLayer(r:Ribbon):Layer{
    const group=new THREE.Group();root.add(group)
    const topology=makeTopology(cfg,r.contours),mats=createMaterials()
    const occluder=new THREE.Mesh(topology.surface,mats.occluder)
    const lines=new THREE.LineSegments(topology.lines,mats.lines)
    // Opaque, depth-only prepasses (all ribbons) draw before transparent lines.
    occluder.renderOrder=0;lines.renderOrder=1
    occluder.frustumCulled=false;lines.frustumCulled=false
    group.add(occluder,lines)
    return {group,topology,mats,lines,occluder}
  }
  function sync(){
    while(layers.length>cfg.ribbons.length){const x=layers.pop()!;root.remove(x.group);x.topology.dispose();x.mats.dispose()}
    while(layers.length<cfg.ribbons.length)layers.push(createLayer(cfg.ribbons[layers.length]))
    cfg.ribbons.forEach((r,i)=>{
      const l=layers[i]
      l.group.visible=r.enabled
      l.group.position.set(r.offset.x,r.offset.y,r.offset.z)
      l.group.rotation.set(THREE.MathUtils.degToRad(r.rotation.x),THREE.MathUtils.degToRad(r.rotation.y),THREE.MathUtils.degToRad(r.rotation.z))
      updateMaterial(l.mats,r,cfg)
    })
    frame()
  }
  function rebuildTopology(){
    cfg.ribbons.forEach((r,i)=>{
      const l=layers[i],next=makeTopology(cfg,r.contours)
      l.lines.geometry=next.lines;l.occluder.geometry=next.surface
      l.topology.dispose();l.topology=next
    })
  }
  function frame(){
    const W=ctx.worldSize.x,H=ctx.worldSize.y
    // Fixed canonical artboard bounds; sculpting will never auto-reframe itself.
    const base=Math.min(W/3.9,H/2.9)
    root.scale.setScalar(base*cfg.framing.zoom)
    root.position.set((cfg.framing.x-.5)*W,(cfg.framing.y-.5)*H,0)
  }
  sync()
  return {
    setConfig(next){
      if(stopped)return
      cfg=sanitizeConfig(next)
      const key=topologySignature(cfg)
      // Changing contour count or topology quality is the ONLY geometry rebuild.
      if(key!==topologyKey){topologyKey=key;while(layers.length>cfg.ribbons.length){const l=layers.pop()!;root.remove(l.group);l.topology.dispose();l.mats.dispose()};while(layers.length<cfg.ribbons.length)layers.push(createLayer(cfg.ribbons[layers.length]));rebuildTopology();_onRebuilt?.()}
      sync()
    },
    update(dt,_elapsed){
      if(stopped)return
      if(!ctx.reducedMotion&&!cfg.motion.paused&&cfg.motion.mode!=='off')time+=Math.max(0,dt)
      const t=cfg.motion.phase+time
      const rotate=cfg.motion.mode==='rotate'||cfg.motion.mode==='both'
      const drift=rotate&&!ctx.reducedMotion?Math.sin(t*.13):0
      root.rotation.set(THREE.MathUtils.degToRad(cfg.framing.rx+drift*cfg.motion.rotationX),THREE.MathUtils.degToRad(cfg.framing.ry+drift*cfg.motion.rotationY),THREE.MathUtils.degToRad(cfg.framing.rz))
      for(const l of layers)l.mats.uniforms.u_time.value=t
    },
    resize:frame,
    dispose(){stopped=true;for(const l of layers){root.remove(l.group);l.topology.dispose();l.mats.dispose()}layers.length=0;ctx.scene.remove(root)}
  }
}
