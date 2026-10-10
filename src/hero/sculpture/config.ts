/** Folded sculpture v2 — parameter schema. Everything here is safe to export as JSON. */
export interface Vec3Control { x: number; y: number; z: number }
export interface FoldControl {
  u: number
  width: number
  strength: number
  twist: number
  pinch: number
  depthLift: number
  curl: number
  accentBias: number
}
export type AccentMode = 'fold' | 'ridge' | 'manual'
export type MotionMode = 'off' | 'breathe' | 'rotate' | 'both'
export interface SculptureConfig {
  loopOpenness: number
  foldDepth: number
  ribbonWidth: number
  crossSectionCup: number
  foldTwist: number
  crestHeight: number
  spinePoints: Vec3Control[]
  folds: FoldControl[]
  contoursDesktop: number
  contoursMobile: number
  samplesPerContour: number
  lineOpacity: number
  lineBrightness: number
  depthFadeStrength: number
  breakProbability: number
  breakLength: number
  breakFoldBias: number
  breakDepthBias: number
  breakTaper: number
  breakSeed: number
  accentMode: AccentMode
  accentEnabled: boolean
  accentCount: number
  accentIntensity: number
  accentSpread: number
  accentU: number
  accentV: number
  accentSpan: number
  motionMode: MotionMode
  motionPaused: boolean
  motionAmplitude: number
  motionCycleSeconds: number
  motionPhase: number
  rotationDriftX: number
  rotationDriftY: number
  pointerParallax: number
  desktopCenterX: number
  desktopCenterY: number
  desktopWidth: number
  desktopHeight: number
  desktopZoom: number
  mobileCenterX: number
  mobileCenterY: number
  mobileWidth: number
  mobileHeight: number
  mobileZoom: number
  rotationX: number
  rotationY: number
  rotationZ: number
}

export type NumericKey = { [K in keyof SculptureConfig]: SculptureConfig[K] extends number ? K : never }[keyof SculptureConfig]
export type ControlGroup = 'Shape' | 'Lines' | 'Fragmentation' | 'Accent' | 'Motion' | 'Desktop framing' | 'Mobile framing'
export type NumericSpec<K extends string = string> = { key: K; label: string; min: number; max: number; step: number }
export type ControlSpec = NumericSpec<NumericKey> & { group: ControlGroup }
export const SPINE_BASE: Vec3Control[] = [
  {x:-1.65,y:-0.43,z:-0.80}, {x:-1.83,y:0.18,z:-0.76},
  {x:-1.53,y:0.83,z:-0.65}, {x:-0.83,y:1.18,z:-0.53},
  {x:0.06,y:1.26,z:-0.47}, {x:0.93,y:0.95,z:-0.34},
  {x:1.36,y:0.35,z:-0.13}, {x:1.19,y:-0.32,z:0.33},
  {x:0.54,y:-0.58,z:0.70}, {x:-0.21,y:-0.31,z:0.92},
  {x:-0.49,y:0.15,z:1.01}, {x:-0.10,y:0.51,z:1.02},
  {x:0.54,y:0.49,z:0.78},
]

export const DEFAULT_SCULPTURE: SculptureConfig = {
  loopOpenness: 0.55, foldDepth: 0.5, ribbonWidth: 0.47,
  crossSectionCup: 0.28, foldTwist: 0.60, crestHeight: 0,
  spinePoints: SPINE_BASE.map(p => ({...p})),
  folds: [
    {u:0.28,width:0.16,strength:0.65,twist:-1.20,pinch:0.25,depthLift:0.12,curl:0.36,accentBias:0.15},
    {u:0.59,width:0.13,strength:1.00,twist:2.75,pinch:0.62,depthLift:0.36,curl:0.86,accentBias:1},
    {u:0.81,width:0.095,strength:0.85,twist:-2.10,pinch:0.48,depthLift:-0.18,curl:-0.70,accentBias:0.45},
  ],
  contoursDesktop: 112, contoursMobile: 75, samplesPerContour: 190,
  lineOpacity: 0.82, lineBrightness: 1.05, depthFadeStrength: 0.70,
  breakProbability: 0.35, breakLength: 0.027, breakFoldBias: 1.25,
  breakDepthBias: 0.55, breakTaper: 0.008, breakSeed: 42,
  accentMode: 'fold', accentEnabled: true, accentCount: 4,
  accentIntensity: 0.95, accentSpread: 0.18,
  accentU: 0.59, accentV: 0.67, accentSpan: 0.27,
  motionMode: 'off', motionPaused: true, motionAmplitude: 0.020,
  motionCycleSeconds: 54, motionPhase: 0.0,
  rotationDriftX: 4, rotationDriftY: 7, pointerParallax: 0.008,
  desktopCenterX: 0.68, desktopCenterY: 0.73,
  desktopWidth: 0.64, desktopHeight: 0.60, desktopZoom: 1.38,
  mobileCenterX: 0.53, mobileCenterY: 0.79,
  mobileWidth: 0.96, mobileHeight: 0.46, mobileZoom: 1.1,
  rotationX: 13, rotationY: -20, rotationZ: 0,
}
export const CONTROLS: ControlSpec[] = [
  {key:'loopOpenness',group:'Shape',label:'Loop openness',min:0,max:1.4,step:.01},
  {key:'foldDepth',group:'Shape',label:'Return depth',min:-.5,max:1.8,step:.01},
  {key:'ribbonWidth',group:'Shape',label:'Ribbon width',min:.1,max:.95,step:.01},
  {key:'crossSectionCup',group:'Shape',label:'Cross-section cup',min:0,max:1,step:.01},
  {key:'foldTwist',group:'Shape',label:'Global twist',min:-3,max:3,step:.01},
  {key:'crestHeight',group:'Shape',label:'Crest height',min:-.8,max:.8,step:.01},
  {key:'contoursDesktop',group:'Lines',label:'Desktop contours',min:24,max:210,step:1},
  {key:'contoursMobile',group:'Lines',label:'Mobile contours',min:20,max:130,step:1},
  {key:'samplesPerContour',group:'Lines',label:'Contour samples',min:90,max:270,step:1},
  {key:'lineOpacity',group:'Lines',label:'Line opacity',min:.1,max:1,step:.01},
  {key:'lineBrightness',group:'Lines',label:'Brightness',min:.2,max:2,step:.01},
  {key:'depthFadeStrength',group:'Lines',label:'Depth fading',min:0,max:1.8,step:.01},
  {key:'breakProbability',group:'Fragmentation',label:'Break frequency',min:0,max:1,step:.01},
  {key:'breakLength',group:'Fragmentation',label:'Break length',min:.005,max:.12,step:.001},
  {key:'breakFoldBias',group:'Fragmentation',label:'Bias toward folds',min:0,max:3,step:.01},
  {key:'breakDepthBias',group:'Fragmentation',label:'Bias toward depth',min:0,max:2,step:.01},
  {key:'breakTaper',group:'Fragmentation',label:'Break feather',min:0,max:.03,step:.001},
  {key:'breakSeed',group:'Fragmentation',label:'Break seed',min:0,max:9999,step:1},
  {key:'accentCount',group:'Accent',label:'Highlighted lines',min:1,max:14,step:1},
  {key:'accentIntensity',group:'Accent',label:'Accent strength',min:0,max:1.5,step:.01},
  {key:'accentSpread',group:'Accent',label:'Band spread',min:.01,max:.7,step:.01},
  {key:'accentU',group:'Accent',label:'Manual U center',min:0,max:1,step:.01},
  {key:'accentV',group:'Accent',label:'Line V center',min:-1,max:1,step:.01},
  {key:'accentSpan',group:'Accent',label:'Segment length',min:.04,max:.7,step:.01},
  {key:'motionAmplitude',group:'Motion',label:'Breathing amplitude',min:0,max:.12,step:.001},
  {key:'motionCycleSeconds',group:'Motion',label:'Cycle seconds',min:12,max:120,step:1},
  {key:'motionPhase',group:'Motion',label:'Frozen phase',min:0,max:1,step:.01},
  {key:'rotationDriftX',group:'Motion',label:'Drift X degrees',min:0,max:25,step:.5},
  {key:'rotationDriftY',group:'Motion',label:'Drift Y degrees',min:0,max:25,step:.5},
  {key:'pointerParallax',group:'Motion',label:'Pointer response',min:0,max:.12,step:.001},
  {key:'desktopCenterX',group:'Desktop framing',label:'Position X',min:-.3,max:1.3,step:.01},
  {key:'desktopCenterY',group:'Desktop framing',label:'Position Y',min:-.3,max:1.3,step:.01},
  {key:'desktopWidth',group:'Desktop framing',label:'Fit width',min:.2,max:1.5,step:.01},
  {key:'desktopHeight',group:'Desktop framing',label:'Fit height',min:.2,max:1.5,step:.01},
  {key:'desktopZoom',group:'Desktop framing',label:'Macro zoom',min:.4,max:4.5,step:.01},
  {key:'mobileCenterX',group:'Mobile framing',label:'Position X',min:-.3,max:1.3,step:.01},
  {key:'mobileCenterY',group:'Mobile framing',label:'Position Y',min:-.3,max:1.3,step:.01},
  {key:'mobileWidth',group:'Mobile framing',label:'Fit width',min:.2,max:1.5,step:.01},
  {key:'mobileHeight',group:'Mobile framing',label:'Fit height',min:.2,max:1.5,step:.01},
  {key:'mobileZoom',group:'Mobile framing',label:'Macro zoom',min:.4,max:4.5,step:.01},
  {key:'rotationX',group:'Desktop framing',label:'Rotation X °',min:-180,max:180,step:1},
  {key:'rotationY',group:'Desktop framing',label:'Rotation Y °',min:-180,max:180,step:1},
  {key:'rotationZ',group:'Desktop framing',label:'Rotation Z °',min:-180,max:180,step:1},
]
export const FOLD_CONTROLS: NumericSpec<keyof FoldControl>[] = [
  {key:'u',label:'Along spine U',min:.03,max:.97,step:.005},
  {key:'width',label:'Influence radius',min:.035,max:.4,step:.005},
  {key:'strength',label:'Fold strength',min:0,max:2,step:.01},
  {key:'twist',label:'Local twist',min:-4,max:4,step:.01},
  {key:'pinch',label:'Contour pinch',min:-.75,max:.95,step:.01},
  {key:'depthLift',label:'Depth offset',min:-1.2,max:1.2,step:.01},
  {key:'curl',label:'Section curl',min:-2,max:2,step:.01},
  {key:'accentBias',label:'Accent priority',min:0,max:1.5,step:.01},
]
export const SPINE_CONTROLS: NumericSpec<keyof Vec3Control>[] = [
  {key:'x',label:'X',min:-4,max:4,step:.01},
  {key:'y',label:'Y',min:-4,max:4,step:.01},
  {key:'z',label:'Z',min:-2.5,max:2.5,step:.01},
]
export const MAX_FOLDS = 6
function limited(raw: unknown, spec: NumericSpec, fallback: number) {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback
  const clamped = Math.min(spec.max, Math.max(spec.min, raw))
  return spec.step === 1 ? Math.round(clamped) : clamped
}
/** Applies allowlisted, clamped values. Full configs may be pasted back into the tuner. */
export function sanitizeConfig(input: unknown): SculptureConfig {
  const d = DEFAULT_SCULPTURE
  const out: SculptureConfig = {
    ...d, spinePoints: d.spinePoints.map(x=>({...x})), folds:d.folds.map(x=>({...x})),
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out
  const src = input as Record<string, unknown>
  for (const spec of CONTROLS) out[spec.key] = limited(src[spec.key], spec, d[spec.key])
  if (typeof src.accentEnabled === 'boolean') out.accentEnabled = src.accentEnabled
  if (src.accentMode === 'fold' || src.accentMode === 'ridge' || src.accentMode === 'manual') out.accentMode = src.accentMode
  if (src.motionMode === 'off' || src.motionMode === 'breathe' || src.motionMode === 'rotate' || src.motionMode === 'both') out.motionMode = src.motionMode
  if (typeof src.motionPaused === 'boolean') out.motionPaused = src.motionPaused
  if (Array.isArray(src.spinePoints) && src.spinePoints.length >= 4 && src.spinePoints.length <= 30) {
    out.spinePoints = src.spinePoints.map((raw, i) => {
      const p = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
      const base = d.spinePoints[Math.min(i, d.spinePoints.length-1)]
      return {
        x: limited(p.x, SPINE_CONTROLS[0], base.x),
        y: limited(p.y, SPINE_CONTROLS[1], base.y),
        z: limited(p.z, SPINE_CONTROLS[2], base.z),
      }
    })
  }
  if (Array.isArray(src.folds)) {
    out.folds = src.folds.slice(0,MAX_FOLDS).map((raw, i)=>{
      const fold = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
      const base = d.folds[i % d.folds.length]
      const next: FoldControl = {...base}
      for (const spec of FOLD_CONTROLS) next[spec.key] = limited(fold[spec.key],spec,base[spec.key])
      return next
    })
  }
  return out
}
/** Geometry changes; appearance/motion/framing are cheap uniform/transform updates. */
export function geometrySignature(c: SculptureConfig, mobile: boolean): string {
  return JSON.stringify([
    c.loopOpenness,c.foldDepth,c.ribbonWidth,c.crossSectionCup,c.foldTwist,c.crestHeight,
    c.spinePoints,c.folds,c.samplesPerContour,mobile?c.contoursMobile:c.contoursDesktop,
    c.breakProbability,c.breakLength,c.breakFoldBias,c.breakDepthBias,c.breakTaper,c.breakSeed,
    c.accentEnabled,c.accentMode,c.accentCount,c.accentSpread,c.accentU,c.accentV,c.accentSpan,
  ])
}
