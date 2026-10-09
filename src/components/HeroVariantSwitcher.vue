<script setup lang="ts">
import { HERO_VARIANTS, type HeroVariantId } from '../shaders/hero'

// Temporary shader-variant switcher for hero background comparison.
// v-model:HeroVariantId — the parent owns the state and persists it.

const model = defineModel<HeroVariantId>({ required: true })
</script>

<template>
  <div class="variant-switch" role="group" aria-label="Hero shader variant">
    <span class="variant-switch__label" aria-hidden="true">Shader</span>
    <template v-for="(v, i) in HERO_VARIANTS" :key="v.id">
      <span v-if="i > 0" class="variant-switch__sep" aria-hidden="true">/</span>
      <button
        type="button"
        class="variant-switch__btn"
        :class="{ 'is-active': model === v.id }"
        :aria-pressed="model === v.id"
        @click="model = v.id"
      >
        {{ v.label }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.variant-switch {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  opacity: 0.65;
  transition: opacity 0.25s var(--ease-out);
}

.variant-switch:hover,
.variant-switch:focus-within {
  opacity: 1;
}

.variant-switch__label {
  color: var(--muted);
}

.variant-switch__sep {
  color: var(--line);
}

.variant-switch__btn {
  appearance: none;
  background: none;
  border: 0;
  padding: 0.15rem 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s var(--ease-out);
}

.variant-switch__btn:hover {
  color: var(--ink);
}

.variant-switch__btn.is-active {
  color: var(--accent);
}

.variant-switch__btn.is-active::before {
  content: '';
  display: inline-block;
  width: 0.4em;
  height: 0.4em;
  margin-right: 0.45em;
  background: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .variant-switch,
  .variant-switch__btn {
    transition: none;
  }
}
</style>
