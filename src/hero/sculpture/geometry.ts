/** Immutable parametric topology: NO spline or fold evaluation on CPU. */
import * as THREE from 'three'
import type { SculptureConfig } from './config'
export interface Topology { lines:THREE.BufferGeometry; surface:THREE.BufferGeometry; dispose():void }
export function makeTopology(config:SculptureConfig,contours:number):Topology{
  const steps=config.quality.samples
  const pos:number[]=[], ids:number[]=[]
  for(let j=0;j<contours;j++){
    const v=-1+2*j/Math.max(1,contours-1)
    for(let i=0;i<steps-1;i++){
      const a=i/(steps-1),b=(i+1)/(steps-1)
      pos.push(a,v,0,b,v,0);ids.push(j,j)
    }
  }
  const lines=new THREE.BufferGeometry()
  lines.setAttribute('position',new THREE.Float32BufferAttribute(pos,3))
  lines.setAttribute('aLine',new THREE.Float32BufferAttribute(ids,1))
  const surface=new THREE.BufferGeometry()
  const verts:number[]=[], surfIds:number[]=[], ix:number[]=[]
  const U=config.quality.occluderU,V=config.quality.occluderV
  for(let i=0;i<=U;i++)for(let j=0;j<=V;j++){verts.push(i/U,-1+2*j/V,0);surfIds.push(0)}
  for(let i=0;i<U;i++)for(let j=0;j<V;j++){
    const a=i*(V+1)+j,b=a+V+1
    ix.push(a,a+1,b,b,a+1,b+1)
  }
  surface.setAttribute('position',new THREE.Float32BufferAttribute(verts,3))
  surface.setAttribute('aLine',new THREE.Float32BufferAttribute(surfIds,1))
  surface.setIndex(ix)
  return {lines,surface,dispose(){lines.dispose();surface.dispose()}}
}
