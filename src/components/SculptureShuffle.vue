<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { compositionSeed, generateAndApply, shareableSeedUrl } from '../hero/sculpture/state'
defineProps<{ exploring: boolean; canExplore: boolean }>()
const emit = defineEmits<{ explore: []; reset: [] }>()
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
  <div class="sculpture-actions" aria-label="Generative sculpture controls">
    <button v-if="canExplore" ref="exploreButton" type="button" :aria-pressed="exploring" @click="emit('explore')">{{ exploring ? 'Done' : 'Explore sculpture' }}</button>
    <button v-if="exploring" type="button" @click="emit('reset')">Reset view</button>
    <button type="button" @click="shuffle" title="Generate a new artwork">↝ New sculpture</button>
    <button type="button" @click="share" title="Copy a link to this sculpture">↗ Share</button>
    <span v-if="status" class="toast" role="status">{{status}}</span>
    <span class="screen-reader"><span v-if="compositionSeed !== null">Seed {{compositionSeed}}</span></span>
  </div>
</template>
<style scoped>
.sculpture-actions{position:absolute;right:var(--gutter,2rem);top:clamp(5rem,9vh,7rem);z-index:3;display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end}
button{border:1px solid rgba(242,242,239,.25);background:rgba(10,10,11,.58);backdrop-filter:blur(12px);color:#f2f2ef;padding:.6rem .8rem;font:500 .67rem/1.2 'JetBrains Mono',monospace;letter-spacing:.05em;cursor:pointer;transition:border-color .2s,background .2s}
button:hover,button:focus-visible{border-color:#d8ff3e;background:rgba(10,10,11,.85)}
.toast{position:absolute;top:calc(100% + .55rem);right:0;max-width:min(26rem,82vw);padding:.55rem .75rem;border:1px solid rgba(216,255,62,.45);background:rgba(10,10,11,.88);backdrop-filter:blur(12px);color:#d8ff3e;font:500 .67rem/1.4 'JetBrains Mono',monospace;letter-spacing:.04em;overflow-wrap:anywhere;animation:toast-in .18s ease-out;pointer-events:none}
@keyframes toast-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.screen-reader{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
@media(max-width:720px){.sculpture-actions{top:4.6rem;right:1rem;left:1rem;gap:.35rem}button{padding:.53rem .6rem}.toast{left:0;right:auto;max-width:100%}}
</style>
