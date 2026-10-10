/** Folded sculpture: one serializable source of truth for art-direction controls. */
export interface SculptureConfig {
  loopOpenness: number
  foldDepth: number
  ribbonWidth: number
  crossSectionCup: number
  foldTwist: number
  crestHeight: number
  contoursDesktop: number
  contoursMobile: number
  samplesPerContour: number
  lineOpacity: number
  lineBrightness: number
  limeAmount: number
  depthFadeStrength: number
  motionEnabled: boolean
  motionAmplitude: number
  motionCycleSeconds: number
  pointerParallax: number
  desktopCenterX: number
  desktopCenterY: number
  desktopWidth: number
  desktopHeight: number
  mobileCenterX: number
  mobileCenterY: number
  mobileWidth: number
  mobileHeight: number
  rotationX: number
  rotationY: number
  rotationZ: number
}

export type NumericKey = Exclude<keyof SculptureConfig, 'motionEnabled'>
export type ControlGroup = 'Shape' | 'Appearance' | 'Motion' | 'Desktop framing' | 'Mobile framing'
export interface ControlSpec {
  key: NumericKey
  group: ControlGroup
  label: string
  min: number
  max: number
  step: number
}

export const DEFAULT_SCULPTURE: SculptureConfig = {
  loopOpenness: 0.55,
  foldDepth: 0.5,
  ribbonWidth: 0.47,
  crossSectionCup: 0.28,
  foldTwist: 2.35,
  crestHeight: 0,
  contoursDesktop: 104,
  contoursMobile: 68,
  samplesPerContour: 170,
  lineOpacity: 0.75,
  lineBrightness: 1,
  limeAmount: 0.7,
  depthFadeStrength: 0.6,
  motionEnabled: true,
  motionAmplitude: 0.022,
  motionCycleSeconds: 36,
  pointerParallax: 0.025,
  desktopCenterX: 0.68,
  desktopCenterY: 0.72,
  desktopWidth: 0.64,
  desktopHeight: 0.57,
  mobileCenterX: 0.53,
  mobileCenterY: 0.77,
  mobileWidth: 0.96,
  mobileHeight: 0.43,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
}

/** All numerical controls and safe ranges live here; import is validated against these. */
export const CONTROLS: ControlSpec[] = [
  { key: 'loopOpenness', group: 'Shape', label: 'Loop openness', min: 0, max: 1, step: 0.01 },
  { key: 'foldDepth', group: 'Shape', label: 'Fold depth', min: 0, max: 1.4, step: 0.01 },
  { key: 'ribbonWidth', group: 'Shape', label: 'Ribbon width', min: 0.15, max: 0.85, step: 0.01 },
  { key: 'crossSectionCup', group: 'Shape', label: 'Section cup', min: 0, max: 0.6, step: 0.01 },
  { key: 'foldTwist', group: 'Shape', label: 'Fold twist', min: 0, max: 4, step: 0.01 },
  { key: 'crestHeight', group: 'Shape', label: 'Crest height', min: -0.6, max: 0.6, step: 0.01 },
  { key: 'contoursDesktop', group: 'Appearance', label: 'Desktop lines', min: 32, max: 180, step: 1 },
  { key: 'contoursMobile', group: 'Appearance', label: 'Mobile lines', min: 24, max: 130, step: 1 },
  { key: 'samplesPerContour', group: 'Appearance', label: 'Line smoothness', min: 80, max: 240, step: 1 },
  { key: 'lineOpacity', group: 'Appearance', label: 'Line opacity', min: 0.05, max: 1, step: 0.01 },
  { key: 'lineBrightness', group: 'Appearance', label: 'Line brightness', min: 0.2, max: 2, step: 0.01 },
  { key: 'limeAmount', group: 'Appearance', label: 'Lime accent', min: 0, max: 1, step: 0.01 },
  { key: 'depthFadeStrength', group: 'Appearance', label: 'Depth fade', min: 0, max: 1, step: 0.01 },
  { key: 'motionAmplitude', group: 'Motion', label: 'Breathing', min: 0, max: 0.1, step: 0.001 },
  { key: 'motionCycleSeconds', group: 'Motion', label: 'Cycle seconds', min: 12, max: 90, step: 1 },
  { key: 'pointerParallax', group: 'Motion', label: 'Pointer parallax', min: 0, max: 0.12, step: 0.001 },
  { key: 'desktopCenterX', group: 'Desktop framing', label: 'Center X', min: 0, max: 1, step: 0.01 },
  { key: 'desktopCenterY', group: 'Desktop framing', label: 'Center Y', min: 0, max: 1, step: 0.01 },
  { key: 'desktopWidth', group: 'Desktop framing', label: 'Fit width', min: 0.2, max: 1.3, step: 0.01 },
  { key: 'desktopHeight', group: 'Desktop framing', label: 'Fit height', min: 0.2, max: 1.3, step: 0.01 },
  { key: 'mobileCenterX', group: 'Mobile framing', label: 'Center X', min: 0, max: 1, step: 0.01 },
  { key: 'mobileCenterY', group: 'Mobile framing', label: 'Center Y', min: 0, max: 1, step: 0.01 },
  { key: 'mobileWidth', group: 'Mobile framing', label: 'Fit width', min: 0.2, max: 1.3, step: 0.01 },
  { key: 'mobileHeight', group: 'Mobile framing', label: 'Fit height', min: 0.2, max: 1.3, step: 0.01 },
  { key: 'rotationX', group: 'Desktop framing', label: 'Rotate X (degrees)', min: -60, max: 60, step: 1 },
  { key: 'rotationY', group: 'Desktop framing', label: 'Rotate Y (degrees)', min: -60, max: 60, step: 1 },
  { key: 'rotationZ', group: 'Desktop framing', label: 'Rotate Z (degrees)', min: -60, max: 60, step: 1 },
]

export const GEOMETRY_KEYS: ReadonlySet<keyof SculptureConfig> = new Set([
  'loopOpenness', 'foldDepth', 'ribbonWidth', 'crossSectionCup',
  'foldTwist', 'crestHeight', 'contoursDesktop', 'contoursMobile', 'samplesPerContour',
])

/** Strict allowlist. JSON imports cannot smuggle arbitrary properties into application state. */
export function sanitizeConfig(input: unknown): SculptureConfig {
  const result: SculptureConfig = { ...DEFAULT_SCULPTURE }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result
  const source = input as Record<string, unknown>
  for (const field of CONTROLS) {
    const value = source[field.key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    let clamped = Math.max(field.min, Math.min(field.max, value))
    if (field.step === 1) clamped = Math.round(clamped)
    // TypeScript knows every ControlSpec.key selects a number field.
    result[field.key] = clamped
  }
  if (typeof source.motionEnabled === 'boolean') result.motionEnabled = source.motionEnabled
  return result
}
