<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { compositionSeed, generateAndApply, shareableSeedUrl } from '../hero/sculpture/state'
defineProps<{ exploring: boolean; canExplore: boolean; moving: boolean }>()
const emit = defineEmits<{ explore: []; reset: []; move: [moving: boolean] }>()
const exploreButton = ref<HTMLButtonElement | null>(null)
defineExpose({ focusExplore: () => exploreButton.value?.focus({ preventScroll: true }) })
const status = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function toast(message: string) {
  status.value = message
  if (toastTimer !== null) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { status.value = '' }, 2800)
}
function shuffle() {
  generateAndApply()
}
async function share() {
  const url = shareableSeedUrl()
  if (!url) { toast('Edited composition: share it as JSON from the tuning panel'); return }
  try { await navigator.clipboard.writeText(url); toast('Seed link copied to clipboard') }
  catch { toast(`Share link: ${url}`) }
}
onBeforeUnmount(() => { if (toastTimer !== null) clearTimeout(toastTimer) })
</script>
<template>
  <div class="sculpture-actions" :class="{ 'sculpture-actions--dock': exploring }" aria-label="Generative sculpture controls">
    <div class="sculpture-actions__buttons">
      <div v-if="exploring" class="sculpture-actions__modes" role="group" aria-label="Drag behavior">
        <button type="button" :aria-pressed="!moving" @click="emit('move', false)">Rotate</button>
        <button type="button" :aria-pressed="moving" @click="emit('move', true)">Move</button>
      </div>
      <button v-if="canExplore && !exploring" ref="exploreButton" class="primary" type="button" @click="emit('explore')">Explore sculpture</button>
      <div class="sculpture-actions__secondary">
        <button v-if="exploring" type="button" @click="emit('reset')">Reset view</button>
        <button type="button" @click="shuffle" aria-label="↝ New sculpture" title="Generate a new artwork">↝ New</button>
        <button type="button" @click="share" title="Copy a link to this sculpture">↗ Share</button>
      </div>
      <button v-if="exploring" class="primary sculpture-actions__done" type="button" @click="emit('explore')">Done</button>
    </div>
    <p v-if="exploring" id="explore-help" class="sculpture-actions__help">
      Drag to {{ moving ? 'move' : 'rotate' }} · Scroll to zoom<br />
      <span class="touch-help">Two fingers move / pinch to zoom</span>
      <span class="keyboard-help">Shift-drag / Shift + arrows move · Arrows rotate · + / − zoom · Home resets · Esc exits</span>
    </p>
    <span v-if="status" class="toast" role="status">{{status}}</span>
    <span class="screen-reader"><span v-if="compositionSeed !== null">Seed {{compositionSeed}}</span></span>
  </div>
</template>
<style scoped>
.sculpture-actions { position: relative; z-index: 3; margin-left: auto; }
.sculpture-actions__buttons, .sculpture-actions__secondary, .sculpture-actions__modes { display: flex; align-items: center; gap: .4rem; }
button { min-height: 44px; white-space: nowrap; border: 1px solid transparent; background: transparent; color: var(--ink); padding: .6rem .7rem; font: 500 .67rem/1.2 var(--font-mono); letter-spacing: .05em; cursor: pointer; transition: border-color .2s, background .2s; }
button.primary { border-color: rgba(242,242,239,.4); background: rgba(10,10,11,.58); }
button[aria-pressed="true"], button:hover, button:focus-visible { border-color: var(--accent); background: rgba(10,10,11,.85); }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.sculpture-actions--dock { margin: 0; padding: .65rem; border: 1px solid var(--line); background: rgba(10,10,11,.9); backdrop-filter: blur(16px); max-width: 100%; }
.sculpture-actions--dock .sculpture-actions__buttons { justify-content: center; }
.sculpture-actions__modes { border-right: 1px solid var(--line); padding-right: .5rem; margin-right: .1rem; }
.sculpture-actions__done { margin-left: .35rem; }
.sculpture-actions__help { max-width: 42rem; margin-top: .6rem; text-align: center; color: var(--muted); font: 400 .65rem/1.7 var(--font-mono); }
.touch-help { display: none; }
.toast { position: absolute; bottom: calc(100% + .55rem); right: 0; max-width: min(26rem,82vw); padding: .55rem .75rem; border: 1px solid rgba(216,255,62,.45); background: rgba(10,10,11,.95); color: var(--accent); font: 500 .67rem/1.4 var(--font-mono); overflow-wrap: anywhere; animation: toast-in .18s ease-out; pointer-events: none; }
@keyframes toast-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.screen-reader { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
@media(max-width:720px) {
  button { padding-inline: .55rem; }
  .sculpture-actions--dock .sculpture-actions__buttons { display: grid; grid-template-columns: 1fr auto; gap: .4rem; }
  .sculpture-actions__modes { border: 0; margin: 0; padding: 0; }
  .sculpture-actions__done { grid-column: 2; grid-row: 1; }
  .sculpture-actions--dock .sculpture-actions__secondary { grid-column: 1 / -1; justify-content: center; border-top: 1px solid var(--line); padding-top: .35rem; }
  .keyboard-help { display: none; }
  .touch-help { display: inline; }
}
</style>
