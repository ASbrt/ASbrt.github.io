// Hero variant registry — the single place that lists the switchable
// hero-background experiments.

import { sculpturalSurface } from './sculpturalSurface'
import { sculpturalFlow } from './sculpturalFlow'
import { emergentNetwork } from './emergentNetwork'
import type { HeroVariantDef, HeroVariantId } from './shared'

export type { HeroVariantId }

export const HERO_VARIANTS: HeroVariantDef[] = [sculpturalSurface, sculpturalFlow, emergentNetwork]

export const DEFAULT_VARIANT: HeroVariantId = 'surface'

export function isHeroVariant(value: unknown): value is HeroVariantId {
  return HERO_VARIANTS.some((v) => v.id === value)
}

export function variantDef(id: HeroVariantId): HeroVariantDef {
  return HERO_VARIANTS.find((v) => v.id === id) ?? HERO_VARIANTS[0]
}
