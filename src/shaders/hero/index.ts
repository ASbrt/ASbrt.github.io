// Hero shader variant registry — the single place that lists the
// switchable hero-background directions.

import { flowFieldFragment } from './flowField'
import { networkFragment } from './network'
import { hybridFragment } from './hybrid'

export type HeroVariantId = 'flow' | 'network' | 'hybrid'

export interface HeroVariant {
  id: HeroVariantId
  /** Short label for the temporary switcher UI. */
  label: string
  /** Complete fragment shader source. */
  fragment: string
}

export const HERO_VARIANTS: HeroVariant[] = [
  { id: 'flow', label: 'Flow', fragment: flowFieldFragment },
  { id: 'network', label: 'Network', fragment: networkFragment },
  { id: 'hybrid', label: 'Hybrid', fragment: hybridFragment },
]

export const DEFAULT_VARIANT: HeroVariantId = 'flow'

export function isHeroVariant(value: unknown): value is HeroVariantId {
  return HERO_VARIANTS.some((v) => v.id === value)
}

export function fragmentFor(id: HeroVariantId): string {
  return HERO_VARIANTS.find((v) => v.id === id)?.fragment ?? HERO_VARIANTS[0].fragment
}
