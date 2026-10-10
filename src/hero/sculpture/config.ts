/** Sculpture Lab v3: GPU-evaluated splines/folds; serializable artistic configuration. */
export interface Point3 { x:number; y:number; z:number }
export interface Fold { u:number; radius:number; twist:number; pinch:number; lift:number; curl:number }
export interface AccentZone { u:number; v:number; length:number; spread:number; strength:number }
export interface Ribbon {
  enabled:boolean; name:string; spine:Point3[]; folds:Fold[]; accents:AccentZone[];
  width:number; cup:number; baseTwist:number; opacity:number; brightness:number;
  contours:number; offset:Point3; rotation:Point3;
}
export interface SculptureConfig {
  ribbons:Ribbon[];
  framing:{zoom:number; x:number; y:number; rx:number; ry:number; rz:number};
  look:{depthFade:number; accentIntensity:number; fragmentation:number; fragmentationSoftness:number; fragmentScale:number};
  motion:{paused:boolean; mode:'off'|'rotate'|'shadows'|'both'; speed:number; shadowStrength:number; shadowWidth:number; shadowRepeats:number; shadowSlant:number; lineFade:number; rotationX:number; rotationY:number; phase:number};
  quality:{samples:number; occluderU:number; occluderV:number};
}
export const MAX_RIBBONS=3, MAX_FOLDS=4, MAX_ACCENTS=4, POINTS=13
export const BASE_SPINE:Point3[]=[
  {x:-1.65,y:-.43,z:-.80},{x:-1.83,y:.18,z:-.76},{x:-1.53,y:.83,z:-.65},
  {x:-.83,y:1.18,z:-.53},{x:.06,y:1.26,z:-.47},{x:.93,y:.95,z:-.34},
  {x:1.36,y:.35,z:-.13},{x:1.19,y:-.32,z:.33},{x:.54,y:-.58,z:.70},
  {x:-.21,y:-.31,z:.92},{x:-.49,y:.15,z:1.01},{x:-.10,y:.51,z:1.02},
  {x:.54,y:.49,z:.78}
]
export const DEFAULT_SCULPTURE:SculptureConfig={
  ribbons:[
    {name:'Primary',enabled:true,spine:BASE_SPINE.map(p=>({...p})),
      folds:[{u:.27,radius:.17,twist:-1.2,pinch:.21,lift:.12,curl:.30},{u:.59,radius:.13,twist:2.55,pinch:.50,lift:.34,curl:.75},{u:.82,radius:.095,twist:-1.9,pinch:.38,lift:-.14,curl:-.54}],
      accents:[{u:.58,v:.73,length:.13,spread:.20,strength:1},{u:.81,v:-.62,length:.10,spread:.15,strength:.75}],
      width:.47,cup:.28,baseTwist:.55,opacity:.81,brightness:1.0,contours:104,
      offset:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0}},
    {name:'Secondary',enabled:true,spine:BASE_SPINE.map((p,i)=>({x:p.x*.91+.17,y:p.y*.83-.18+Math.sin(i*.7)*.05,z:p.z*.93-.35})),
      folds:[{u:.32,radius:.16,twist:1.6,pinch:.42,lift:.25,curl:-.45},{u:.69,radius:.12,twist:-2.3,pinch:.58,lift:-.20,curl:.62}],
      accents:[{u:.38,v:-.77,length:.14,spread:.14,strength:.75}],
      width:.33,cup:.19,baseTwist:-.6,opacity:.53,brightness:.79,contours:64,
      offset:{x:.16,y:-.13,z:-.08},rotation:{x:0,y:0,z:8}}
  ],
  framing:{zoom:1.95,x:.68,y:.73,rx:13,ry:-20,rz:0},
  look:{depthFade:.65,accentIntensity:1.0,fragmentation:.25,fragmentationSoftness:.008,fragmentScale:11},
  motion:{paused:true,mode:'off',speed:.12,shadowStrength:.88,shadowWidth:.10,shadowRepeats:2.0,shadowSlant:.11,lineFade:.12,rotationX:3.5,rotationY:6.5,phase:0},
  quality:{samples:160,occluderU:170,occluderV:35}
}
const clone=<T>(x:T):T=>JSON.parse(JSON.stringify(x)) as T
export function copyConfig(c:SculptureConfig):SculptureConfig { return clone(c) }
const num=(v:unknown,f:number,lo:number,hi:number)=> typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):f
const point=(v:unknown,f:Point3):Point3=>{const p=v&&typeof v==='object'?v as Partial<Point3>:{};return {x:num(p.x,f.x,-5,5),y:num(p.y,f.y,-5,5),z:num(p.z,f.z,-5,5)}}
export function sanitizeConfig(raw:unknown):SculptureConfig {
  const d=copyConfig(DEFAULT_SCULPTURE)
  if(!raw||typeof raw!=='object')return d
  const input=raw as Partial<SculptureConfig>
  if(input.framing){for(const k of Object.keys(d.framing) as (keyof typeof d.framing)[])d.framing[k]=num(input.framing[k],d.framing[k],k==='zoom'?.2:k==='x'||k==='y'?-1:-180,k==='zoom'?5:k==='x'||k==='y'?2:180)}
  if(input.look){d.look.depthFade=num(input.look.depthFade,d.look.depthFade,0,3);d.look.accentIntensity=num(input.look.accentIntensity,d.look.accentIntensity,0,2);d.look.fragmentation=num(input.look.fragmentation,d.look.fragmentation,0,1);d.look.fragmentationSoftness=num(input.look.fragmentationSoftness,d.look.fragmentationSoftness,.0005,.07);d.look.fragmentScale=num(input.look.fragmentScale,d.look.fragmentScale,1,40)}
  if(input.motion){const m=input.motion; d.motion.mode=['off','rotate','shadows','both'].includes(m.mode??'')?m.mode!:d.motion.mode;d.motion.paused=typeof m.paused==='boolean'?m.paused:d.motion.paused;for(const k of ['speed','shadowStrength','shadowWidth','shadowRepeats','shadowSlant','lineFade','rotationX','rotationY','phase'] as const)d.motion[k]=num(m[k],d.motion[k],k==='shadowSlant'?-2:0,k==='speed'?2:k==='shadowWidth'?.45:k==='shadowRepeats'?8:k==='shadowSlant'?2:k==='rotationX'||k==='rotationY'?40:k==='phase'?100:1)}
  if(input.quality){d.quality.samples=Math.round(num(input.quality.samples,d.quality.samples,32,350));d.quality.occluderU=Math.round(num(input.quality.occluderU,d.quality.occluderU,30,350));d.quality.occluderV=Math.round(num(input.quality.occluderV,d.quality.occluderV,12,80))}
  if(Array.isArray(input.ribbons)&&input.ribbons.length>0){
    d.ribbons=input.ribbons.slice(0,MAX_RIBBONS).map((r,i)=>{
      const base=copyConfig(DEFAULT_SCULPTURE).ribbons[Math.min(i,1)]
      const p=(r && typeof r==='object' ? r : {}) as Partial<Ribbon>
      if(typeof p.name==='string')base.name=p.name.slice(0,32)
      if(typeof p.enabled==='boolean')base.enabled=p.enabled
      for(const k of ['width','cup','baseTwist','opacity','brightness','contours'] as const){const bounds:Record<typeof k,[number,number]>={width:[.05,1.5],cup:[-1.5,1.5],baseTwist:[-4,4],opacity:[0,1],brightness:[0,3],contours:[12,220]};base[k]=num(p[k],base[k],...bounds[k])}
      base.contours=Math.round(base.contours)
      if(p.offset)base.offset=point(p.offset,base.offset)
      if(p.rotation)base.rotation=point(p.rotation,base.rotation)
      if(Array.isArray(p.spine))base.spine=Array.from({length:POINTS},(_,j)=>point(p.spine![j],base.spine[j]))
      if(Array.isArray(p.folds))base.folds=p.folds.slice(0,MAX_FOLDS).map((f)=>({u:num(f?.u,.5,0,1),radius:num(f?.radius,.12,.025,.45),twist:num(f?.twist,0,-5,5),pinch:num(f?.pinch,0,-.9,.95),lift:num(f?.lift,0,-2,2),curl:num(f?.curl,0,-2,2)}))
      if(Array.isArray(p.accents))base.accents=p.accents.slice(0,MAX_ACCENTS).map(a=>({u:num(a?.u,.5,0,1),v:num(a?.v,0,-1,1),length:num(a?.length,.15,.01,.5),spread:num(a?.spread,.2,.01,1),strength:num(a?.strength,1,0,2)}))
      return base
    })
  }
  return d
}
/** Changes to these three keys alone rebuild fixed UV topology. Everything else updates GPU uniforms. */
export function topologySignature(c:SculptureConfig):string{return JSON.stringify([c.quality,c.ribbons.map(r=>r.contours)])}
