/** CPU sculpture generator: editable 3D spine + independent fold deformers. */
import * as THREE from 'three'
import type { SculptureConfig, FoldControl } from './config'

const clamp = (x:number,a:number,b:number)=>Math.max(a,Math.min(b,x))
const smooth = (a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}
const bell = (u:number, at:number, radius:number)=>Math.exp(-Math.pow((u-at)/Math.max(.01,radius),2))
function hash(n:number):number { const x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x) }

interface Attributes { position:number[]; normal:number[]; alpha:number[]; accent:number[]; u:number[] }
const empty=():Attributes=>({position:[],normal:[],alpha:[],accent:[],u:[]})
function asGeometry(x:Attributes):THREE.BufferGeometry {
  const g=new THREE.BufferGeometry()
  g.setAttribute('position',new THREE.Float32BufferAttribute(x.position,3))
  g.setAttribute('aNormal',new THREE.Float32BufferAttribute(x.normal,3))
  g.setAttribute('aAlpha',new THREE.Float32BufferAttribute(x.alpha,1))
  g.setAttribute('aAccent',new THREE.Float32BufferAttribute(x.accent,1))
  g.setAttribute('aU',new THREE.Float32BufferAttribute(x.u,1))
  return g
}
export interface SculptureGeometry {
  lineGeometry:THREE.BufferGeometry
  occluderGeometry:THREE.BufferGeometry
  center:THREE.Vector2
  size:THREE.Vector2
  dispose():void
}
interface Gap { at:number; radius:number }

export function buildGeometry(config:SculptureConfig,isMobile:boolean,preview=false):SculptureGeometry {
  const open=config.loopOpenness-.55
  const deeper=config.foldDepth-.5
  const openY=[0,0,0,0,0,0,-.05,-.3,-.7,-.3,.24,.35,.3]
  const openX=[0,0,0,0,0,0,.1,.22,.3,.1,0,.08,.2]
  const depthZ=[0,0,0,0,0,0,0,.25,.55,.7,.85,.85,.7]
  const crestY=[0,.1,.45,.85,1,.65,.2,0,0,0,0,0,0]
  const nPts=config.spinePoints.length
  const curve=new THREE.CatmullRomCurve3(config.spinePoints.map((p,i)=>{
    const t=i/Math.max(1,nPts-1)*(openY.length-1)
    const i0=Math.floor(t),i1=Math.min(openY.length-1,i0+1),f=t-i0
    const interp=(a:number[])=>a[i0]*(1-f)+a[i1]*f
    return new THREE.Vector3(p.x+open*interp(openX),p.y+open*interp(openY)+config.crestHeight*interp(crestY),p.z+deeper*interp(depthZ))
  }),false,'centripetal')
  const t=new THREE.Vector3(),sp=new THREE.Vector3(),lateral=new THREE.Vector3(),depth=new THREE.Vector3()
  const p=new THREE.Vector3(),n=new THREE.Vector3(),pa=new THREE.Vector3(),pb=new THREE.Vector3(),pc=new THREE.Vector3(),pd=new THREE.Vector3()
  const du=new THREE.Vector3(),dv=new THREE.Vector3()

  function strengthAt(u:number):number {
    let s=0
    for(const f of config.folds) s+=f.strength*bell(u,f.u,f.width)
    return clamp(s,0,2.8)
  }
  // Continuous evaluation. Fold contributions are smooth, local and independent.
  function surfacePoint(u:number,v:number,out:THREE.Vector3):THREE.Vector3 {
    curve.getPoint(u,sp)
    curve.getTangent(u,t).normalize()
    lateral.set(-t.y,t.x,0)
    if(lateral.lengthSq()<1e-8) lateral.set(0,1,0)
    lateral.normalize()
    depth.crossVectors(t,lateral).normalize()
    const taper=Math.pow(smooth(0,.12,u)*smooth(0,.14,1-u),.75)
    const baseWidth=config.ribbonWidth*taper*(.75+.25*bell(u,.5,.36))
    let twist=.16+config.foldTwist*smooth(.12,.91,u)
    let pinch=0,lift=0,curl=0
    for(const f of config.folds){
      const g=f.strength*bell(u,f.u,f.width)
      twist+=f.twist*g
      pinch+=f.pinch*g
      lift+=f.depthLift*g
      curl+=f.curl*g
    }
    const width=baseWidth*clamp(1-pinch,.10,2)
    const cs=Math.cos(twist),sn=Math.sin(twist)
    const side=v*width
    const cup=config.crossSectionCup*baseWidth*(v*v-1/3)
    const corrugation=curl*baseWidth*(v*v-.20) // depth of the folded cross-section
    return out.copy(sp)
      .addScaledVector(lateral,side*cs-cup*sn + .10*corrugation*v)
      .addScaledVector(depth,side*sn+cup*cs+lift+corrugation)
  }
  function normalAt(u:number,v:number,out:THREE.Vector3):THREE.Vector3 {
    const e=.003
    surfacePoint(Math.min(1,u+e),v,pa)
    surfacePoint(Math.max(0,u-e),v,pb)
    du.subVectors(pa,pb)
    surfacePoint(u,Math.min(1,v+e),pc)
    surfacePoint(u,Math.max(-1,v-e),pd)
    dv.subVectors(pc,pd)
    out.crossVectors(du,dv)
    if(out.lengthSq()<1e-12) out.set(0,0,1)
    return out.normalize()
  }
  const count=isMobile?config.contoursMobile:config.contoursDesktop
  // Preview mode (live dragging): fewer samples per contour and a coarser
  // occluder grid. Contour count stays fixed so accent/break indexing is
  // stable; full quality is restored by the settle rebuild after release.
  const N=preview?Math.max(70,Math.round(config.samplesPerContour*0.45)):config.samplesPerContour
  const target=empty()
  const hidden=empty()
  // Highest-priority fold selects the accent region. Manual/ridge are alternatives.
  const accentFold=config.folds.reduce<FoldControl|null>((best,f)=>!best||f.strength*f.accentBias>best.strength*best.accentBias?f:best,null)
  const highlightU=config.accentMode==='manual'?config.accentU:config.accentMode==='ridge'?.35:(accentFold?.u??.59)
  const highlightV=config.accentMode==='ridge' ? -.7 : config.accentV
  const foldSpan=(config.accentMode==='manual'?config.accentSpan:config.accentMode==='ridge'?.20:(accentFold?.width??.13)*2.4)*(.65+config.accentSpread*2)
  const centerIndex=Math.round((highlightV+1)*.5*(count-1))
  const mirroredIndex=Math.round((-highlightV+1)*.5*(count-1))
  // Fold mode uses two opposing lips so an accent remains legible as the
  // sculpture turns and one side becomes hidden by the depth surface.
  const halfAccent=Math.max(.5,config.accentCount/(config.accentMode==='fold'?4:2))

  function gapsForLine(j:number,v:number):Gap[]{
    const seed=config.breakSeed*11.17+j*97.1
    const result:Gap[]=[]
    const trials=18
    const edgeSafety=Math.max(.07,Math.abs(v)*.06)
    for(let k=0;k<trials;k++){
      const at=.045+hash(seed+k*37.9)*.91
      const probe=surfacePoint(at,v,p).z
      const depthBias=Math.max(0,-probe+.1)
      const fold=strengthAt(at)
      // Deterministic candidate positions and probabilities; no frame-by-frame flicker.
      const chance=config.breakProbability*(.23+.40*config.breakFoldBias*fold+.22*config.breakDepthBias*depthBias)
      if(hash(seed+k*23.31+901)>Math.min(.95,chance)) continue
      if(hash(seed+k*13.13+300)<edgeSafety) continue
      result.push({at,radius:config.breakLength*(.6+hash(seed+k*7.43+1)*.85)*.5})
    }
    return result
  }
  function gapMask(u:number,gaps:Gap[]):number {
    let a=1
    for(const gap of gaps){
      const distance=Math.abs(u-gap.at)
      const feather=Math.max(.00025,config.breakTaper)
      a*=smooth(gap.radius,gap.radius+feather,distance)
      if(a<.002)return 0
    }
    return a
  }
  function vertex(to:Attributes,u:number,v:number,gaps:Gap[]|null=null,contour=-1):void {
    surfacePoint(u,v,p);normalAt(u,v,n)
    const facing=Math.abs(n.z)
    const taper=smooth(0,.055,u)*smooth(0,.075,1-u)
    const fold=strengthAt(u)
    const rim=Math.pow(Math.abs(v),3)
    const depthFade=Math.exp(-Math.max(0,.2-p.z)*.10)
    const gap=gaps?gapMask(u,gaps):1
    const alpha=contour<0?1:(.24+.59*Math.pow(facing,.85)) * taper *
      (0.88+.16*fold+.17*rim) * depthFade * gap
    let accent=0
    if(config.accentEnabled && contour>=0){
      const lineDistance=config.accentMode==='fold' ? Math.min(Math.abs(contour-centerIndex),Math.abs(contour-mirroredIndex)) : Math.abs(contour-centerIndex)
      const lineBand=1-smooth(Math.max(.1,halfAccent-.7),halfAccent+.6,lineDistance)
      const uBand=smooth(highlightU-foldSpan*.7,highlightU-foldSpan*.35,u)*
        (1-smooth(highlightU+foldSpan*.35,highlightU+foldSpan*.7,u))
      const geometricalBias=config.accentMode==='fold' ? .60+.40*clamp(fold,0,1) : 1
      accent=lineBand*uBand*geometricalBias
    }
    to.position.push(p.x,p.y,p.z)
    to.normal.push(n.x,n.y,n.z)
    to.alpha.push(alpha)
    to.accent.push(accent)
    to.u.push(u)
  }
  for(let j=0;j<count;j++){
    const v=-1+2*j/(count-1)
    const gaps=gapsForLine(j,v)
    // Compute each sample once, then emit segment endpoint pairs — identical
    // buffers to evaluating both endpoints independently, at half the cost.
    const line=empty()
    for(let i=0;i<N;i++) vertex(line,i/(N-1),v,gaps,j)
    for(let i=0;i<N-1;i++){
      for(const k of [i,i+1]){
        target.position.push(line.position[k*3],line.position[k*3+1],line.position[k*3+2])
        target.normal.push(line.normal[k*3],line.normal[k*3+1],line.normal[k*3+2])
        target.alpha.push(line.alpha[k])
        target.accent.push(line.accent[k])
        target.u.push(line.u[k])
      }
    }
  }
  const lineGeometry=asGeometry(target)
  // Depth-only mesh never inherits decorative line breaks. The same vertex
  // displacement shader is used for the contour and occluder passes.
  const U=preview?(isMobile?75:105):(isMobile?150:210),V=preview?(isMobile?17:24):(isMobile?34:48)
  const idx:number[]=[]
  for(let i=0;i<=U;i++)for(let j=0;j<=V;j++)vertex(hidden,i/U,-1+2*j/V)
  for(let i=0;i<U;i++)for(let j=0;j<V;j++){
    const a=i*(V+1)+j,b=a+V+1
    idx.push(a,a+1,b,b,a+1,b+1)
  }
  const occluderGeometry=asGeometry(hidden)
  occluderGeometry.setIndex(idx)
  lineGeometry.computeBoundingBox()
  const bb=lineGeometry.boundingBox
  const center=bb?new THREE.Vector2((bb.min.x+bb.max.x)*.5,(bb.min.y+bb.max.y)*.5):new THREE.Vector2()
  const size=bb?new THREE.Vector2(Math.max(.1,bb.max.x-bb.min.x),Math.max(.1,bb.max.y-bb.min.y)):new THREE.Vector2(3,2)
  return {lineGeometry,occluderGeometry,center,size,dispose(){lineGeometry.dispose();occluderGeometry.dispose()}}
}
