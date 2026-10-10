<script setup lang="ts">
import { reactive, ref } from 'vue'
import { compositionSeed, compositionFamily, generateAndApply, shareableSeedUrl } from '../hero/sculpture/state'
import { parseSeed, type CompositionLocks, type FamilyChoice } from '../hero/sculpture/generator'
const family = ref<FamilyChoice>('all')
const locks = reactive<CompositionLocks>({geometry:false,framing:false,accents:false,motion:false})
const seedInput = ref('')
const status = ref('')
function apply(seed?: number) {
  const result = generateAndApply({seed,family:family.value,locks:{...locks}})
  status.value = `Generated ${result.family} · ${result.seed}${Object.values(locks).some(Boolean) ? ' · locked changes require JSON export to share' : ''}`
}
function replay() {
  const seed = parseSeed(seedInput.value.trim())
  if (seed === null) { status.value = 'Enter an unsigned integer from 0 to 4294967295'; return }
  apply(seed)
}
async function copyLink() {
  const link = shareableSeedUrl()
  if (!link) { status.value = 'Seed link unavailable after manual edits or locked randomization. Use Copy JSON to share the full config.'; return }
  try { await navigator.clipboard.writeText(link); status.value = 'Reproducible composition link copied' }
  catch { status.value = link }
}
</script>
<template>
  <section class="generator" aria-label="Curated composition generator">
    <h3>GENERATE / CURATED CHAOS</h3>
    <label class="field">Composition family
      <select v-model="family">
        <option value="all">Surprise me</option>
        <option value="folded">Folded sculpture</option>
        <option value="interwoven">Interwoven structure</option>
        <option value="macro">Macro abstraction</option>
      </select>
    </label>
    <div class="locks">
      <label><input v-model="locks.geometry" type="checkbox">Lock geometry</label>
      <label><input v-model="locks.framing" type="checkbox">Lock framing</label>
      <label><input v-model="locks.accents" type="checkbox">Lock accents</label>
      <label><input v-model="locks.motion" type="checkbox">Lock motion</label>
    </div>
    <button type="button" class="primary" @click="apply()">↝ Generate new composition</button>
    <div class="seed-entry">
      <input v-model="seedInput" type="text" inputmode="numeric" placeholder="Seed · 0–4294967295" aria-label="Composition seed">
      <button type="button" @click="replay">Use seed</button>
    </div>
    <div class="seed-entry"><span>Current: {{compositionSeed ?? 'edited'}} / {{compositionFamily ?? 'custom'}}</span><button type="button" @click="copyLink">Copy link</button></div>
    <p v-if="status" role="status">{{status}}</p>
    <p class="muted">Unlocked generations are shareable by seed. Locked or manually edited results should be saved with the existing JSON export.</p>
  </section>
</template>
<style scoped>
.generator{border:1px solid rgba(216,255,62,.32);padding:10px;margin:0 0 12px;color:#f2f2ef;font:11px/1.5 'JetBrains Mono',monospace;background:rgba(10,10,11,.64)}
h3{font-size:11px;letter-spacing:.08em;margin:0 0 8px}select,input[type=text],button{background:#252525;color:#f2f2ef;border:1px solid #555;padding:6px;font:inherit}button{cursor:pointer}button:hover,button:focus-visible{border-color:#d8ff3e}
.field{display:flex;flex-direction:column;gap:5px}.locks{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:11px 0}.locks label{display:flex;gap:5px;align-items:center}.locks input{accent-color:#d8ff3e}.primary{width:100%;padding:9px;background:#333}.seed-entry{display:flex;gap:5px;align-items:center;justify-content:space-between;margin-top:8px}.seed-entry input{flex:1;min-width:0;width:55%}.seed-entry span{font-size:10px;color:#bbb;overflow:hidden;text-overflow:ellipsis}.muted{font-size:10px;color:#aaa;margin:10px 0 0;line-height:1.5}p[role=status]{color:#d8ff3e;overflow-wrap:anywhere}
</style>
