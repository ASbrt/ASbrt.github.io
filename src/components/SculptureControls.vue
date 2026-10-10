<script setup lang="ts">
import { ref } from 'vue'
import {
  CONTROLS, DEFAULT_SCULPTURE,
  type ControlGroup, type NumericKey,
} from '../hero/sculpture/config'
import { sculptureSettings as settings, setSettings, resetSettings } from '../hero/sculpture/state'

const groups: ControlGroup[] = [
  'Shape', 'Appearance', 'Motion', 'Desktop framing', 'Mobile framing',
]
const open = ref(true)
const showImport = ref(false)
const importText = ref('')
const status = ref('')
const compare = ref(false)
let heldSettings: string | null = null

function onRange(e: Event, key: NumericKey) {
  settings[key] = Number((e.target as HTMLInputElement).value)
  compare.value = false
  heldSettings = null
}
function format(value: number, step: number) {
  return step === 1 ? value.toFixed(0) : step < 0.01 ? value.toFixed(3) : value.toFixed(2)
}
async function copyJSON() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
    status.value = 'Copied JSON'
  } catch {
    status.value = 'Clipboard unavailable; select and copy the JSON below'
    showImport.value = true
    importText.value = JSON.stringify(settings, null, 2)
  }
}
function importJSON() {
  try {
    const parsed: unknown = JSON.parse(importText.value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected a JSON object')
    setSettings(parsed)
    status.value = 'Configuration imported'
    showImport.value = false
  } catch {
    status.value = 'Invalid JSON; expected a parameter object'
  }
}
function compareDefaults() {
  if (!compare.value) {
    heldSettings = JSON.stringify(settings)
    Object.assign(settings, DEFAULT_SCULPTURE)
    compare.value = true
  } else {
    if (heldSettings) setSettings(JSON.parse(heldSettings))
    heldSettings = null
    compare.value = false
  }
}
</script>

<template>
  <aside class="sculpture-panel" aria-label="Sculpture tuning panel">
    <header class="panel-top">
      <strong>SCULPTURE / TUNE</strong>
      <button type="button" @click="open = !open" :aria-expanded="open">
        {{ open ? '−' : '+' }}
      </button>
    </header>
    <div v-if="open" class="panel-body">
      <p class="hint">Shape first, motion last. Changes are saved in this browser.</p>
      <label class="toggle">
        <input type="checkbox" v-model="settings.motionEnabled" />
        <span>Motion enabled</span>
      </label>
      <details v-for="(group, i) in groups" :key="group" :open="i === 0 || undefined">
        <summary>{{ group }}</summary>
        <div class="group-body">
          <label v-for="spec in CONTROLS.filter(c => c.group === group)" :key="spec.key" class="control">
            <span class="control-header"><span>{{ spec.label }}</span><output>{{ format(settings[spec.key], spec.step) }}</output></span>
            <input type="range" :min="spec.min" :max="spec.max" :step="spec.step"
              :value="settings[spec.key]" @input="onRange($event, spec.key)" />
          </label>
        </div>
      </details>
      <div class="actions">
        <button type="button" @click="copyJSON">Copy JSON</button>
        <button type="button" @click="compareDefaults">{{ compare ? 'Restore edits' : 'Compare default' }}</button>
        <button type="button" @click="resetSettings(); compare = false">Reset</button>
        <button type="button" @click="showImport = !showImport">Import</button>
      </div>
      <div v-if="showImport" class="import-box">
        <textarea v-model="importText" rows="5" aria-label="Paste sculpture JSON" placeholder="Paste exported JSON"></textarea>
        <button type="button" @click="importJSON">Apply imported JSON</button>
      </div>
      <p v-if="status" class="status" role="status">{{ status }}</p>
      <p class="hint">Only visible with <code>?tune=1</code>. Export your favorite settings and commit them as defaults.</p>
    </div>
  </aside>
</template>

<style scoped>
.sculpture-panel {
  position: fixed; z-index: 1000; top: 5.5rem; right: 1rem;
  width: min(340px, calc(100vw - 2rem)); max-height: min(78svh, 730px);
  display: flex; flex-direction: column; background: rgba(17,17,19,.97);
  color: #f2f2ef; border: 1px solid #44443e; box-shadow: 0 14px 45px #0009;
  font: 12px/1.45 'JetBrains Mono', monospace; letter-spacing: 0;
}
.panel-top { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid #363631; }
.panel-top strong { font-size: 11px; letter-spacing: .12em; }
.panel-body { overflow: auto; padding: 11px 14px 14px; overscroll-behavior: contain; }
.hint { color: #a8a8a3; line-height: 1.5; margin: 5px 0 12px; }
.panel-top button, .actions button, .import-box button {
  appearance: none; border: 1px solid #56564d; color: #f2f2ef; background: #252525;
  padding: 6px 9px; cursor: pointer; font: inherit;
}
button:hover { border-color: #d8ff3e; }
.toggle { display: flex; align-items: center; gap: 9px; margin: 6px 0 11px; }
input[type=checkbox] { accent-color: #d8ff3e; }
input[type=range] { display: block; width: 100%; accent-color: #d8ff3e; }
details { border-top: 1px solid #30302f; }
summary { cursor: pointer; padding: 11px 0; font-size: 11px; letter-spacing: .07em; text-transform: uppercase; }
.group-body { padding: 0 0 8px; }
.control { display: block; margin: 0 0 13px; }
.control-header { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
output { color: #d8ff3e; font-variant-numeric: tabular-nums; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-top: 12px; }
.import-box textarea { margin: 10px 0 7px; width: 100%; resize: vertical; background: #0a0a0b; color: #eee; border: 1px solid #444; font: 11px monospace; padding: 6px; }
.status { color: #d8ff3e; margin-top: 8px; }
@media (max-width: 720px) { .sculpture-panel { top: 4.5rem; max-height: 60svh; } }
</style>
