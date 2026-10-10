<script setup lang="ts">
import { ref } from 'vue'
import {
  CONTROLS, DEFAULT_SCULPTURE, FOLD_CONTROLS, SPINE_CONTROLS, MAX_FOLDS,
  type ControlGroup, type NumericKey, type FoldControl, type Vec3Control, type SculptureConfig,
} from '../hero/sculpture/config'
import { sculptureSettings as settings, setSettings, resetSettings } from '../hero/sculpture/state'

const groups: ControlGroup[] = ['Shape','Lines','Fragmentation','Accent','Motion','Desktop framing','Mobile framing']
const open = ref(true)
const importOpen = ref(false)
const importText = ref('')
const status = ref('')
const comparison = ref(false)
let held: SculptureConfig | null = null
const PRESETS_KEY='asbrt-sculpture-presets-v2'
interface Preset { name: string; config:SculptureConfig }
const presets=ref<Preset[]>(readPresets())
const presetName=ref('Macro fold 01')
function readPresets():Preset[]{
  try{
    const raw=localStorage.getItem(PRESETS_KEY)
    const data:unknown=raw?JSON.parse(raw):[]
    if(!Array.isArray(data))return []
    return data.slice(0,12).filter((x):x is Preset=>!!x&&typeof x==='object'&&typeof x.name==='string'&&'config' in x)
  }catch{return []}
}
function storePresets(){try{localStorage.setItem(PRESETS_KEY,JSON.stringify(presets.value))}catch{status.value='Preset storage unavailable'}}
function savePreset(){
  const name=presetName.value.trim().slice(0,48)||`Preset ${presets.value.length+1}`
  const copy=JSON.parse(JSON.stringify(settings)) as SculptureConfig
  presets.value=[...presets.value.filter(x=>x.name!==name),{name,config:copy}].slice(-12)
  storePresets();status.value=`Saved ${name}`
}
function loadPreset(i:number){if(presets.value[i]){setSettings(presets.value[i].config);comparison.value=false;status.value=`Loaded ${presets.value[i].name}`}}
function deletePreset(i:number){presets.value.splice(i,1);storePresets()}
function changed(){comparison.value=false;held=null}
function onValue(e:Event,key:NumericKey){settings[key]=Number((e.target as HTMLInputElement).value);changed()}
function onFold(e:Event,i:number,key:keyof FoldControl){
  const f=settings.folds[i];if(f)f[key]=Number((e.target as HTMLInputElement).value)
  changed()
}
function onSpine(e:Event,i:number,key:keyof Vec3Control){
  const p=settings.spinePoints[i];if(p)p[key]=Number((e.target as HTMLInputElement).value)
  changed()
}
function addFold(){if(settings.folds.length>=MAX_FOLDS)return
  settings.folds.push({u:.48,width:.12,strength:1,twist:1.4,pinch:.35,depthLift:.16,curl:.45,accentBias:.3})
  changed()
}
function removeFold(i:number){settings.folds.splice(i,1);changed()}
function format(value:number,step:number){return step===1?value.toFixed(0):step<.01?value.toFixed(3):value.toFixed(2)}
async function copyJSON(){
  const json=JSON.stringify(settings,null,2)
  try{await navigator.clipboard.writeText(json);status.value='Configuration copied as JSON'}
  catch{importOpen.value=true;importText.value=json;status.value='Select and copy the JSON below'}
}
function importJSON(){
  try{
    const parsed:unknown=JSON.parse(importText.value)
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Expected object')
    setSettings(parsed);comparison.value=false;importOpen.value=false;status.value='Configuration imported (validated)'
  }catch{status.value='Invalid JSON: expected a settings object'}
}
function compare(){
  if(!comparison.value){held=JSON.parse(JSON.stringify(settings)) as SculptureConfig;setSettings(DEFAULT_SCULPTURE);comparison.value=true}
  else{if(held)setSettings(held);held=null;comparison.value=false}
}
function reset(){resetSettings();comparison.value=false;held=null;status.value='Reset to defaults'}
</script>

<template>
  <aside class="sculpture-panel" aria-label="Live sculpture tuning panel">
    <header class="panel-top">
      <strong>SCULPTURE / LAB V2</strong>
      <button type="button" @click="open = !open" :aria-expanded="open">{{ open?'Collapse −':'Open +' }}</button>
    </header>
    <div v-if="open" class="panel-body" data-lenis-prevent>
      <p class="hint">The sculpture is editable. Zoom into folds, then sculpt the fold fields and spine. Only your browser is affected.</p>
      <div class="actions">
        <button type="button" @click="copyJSON">Copy JSON</button>
        <button type="button" @click="compare">{{ comparison?'Restore edits':'Compare default' }}</button>
        <button type="button" @click="reset">Reset</button>
        <button type="button" @click="importOpen = !importOpen">Import JSON</button>
      </div>
      <div v-if="importOpen" class="import-box">
        <textarea v-model="importText" rows="5" aria-label="Paste sculpture configuration JSON" placeholder="Paste exported JSON"></textarea>
        <button type="button" @click="importJSON">Apply imported settings</button>
      </div>
      <details open><summary>Saved local presets</summary>
        <div class="group-body">
          <div class="preset-entry"><input v-model="presetName" aria-label="Preset name" maxlength="48" /><button type="button" @click="savePreset">Save view</button></div>
          <div class="preset-entry" v-for="(preset,i) in presets" :key="preset.name">
            <span class="preset-name">{{ preset.name }}</span>
            <button type="button" @click="loadPreset(i)">Load</button>
            <button type="button" @click="deletePreset(i)" :aria-label="`Delete ${preset.name}`">×</button>
          </div>
          <p class="hint">Presets are saved to this browser. Copy JSON to share or publish one.</p>
        </div>
      </details>
      <details v-for="(group,i) in groups" :key="group" :open="i===0||undefined">
        <summary>{{ group }}</summary>
        <div class="group-body">
          <template v-if="group==='Accent'">
            <label class="toggle"><input type="checkbox" v-model="settings.accentEnabled" /> Accent enabled</label>
            <label class="select-label">Placement mode
              <select v-model="settings.accentMode"><option value="fold">Strongest fold</option><option value="ridge">Crest ridge</option><option value="manual">Manual placement</option></select>
            </label>
          </template>
          <template v-if="group==='Motion'">
            <label class="select-label">Movement mode
              <select v-model="settings.motionMode"><option value="off">Off</option><option value="breathe">Breathe</option><option value="rotate">Rotate</option><option value="both">Both</option></select>
            </label>
            <label class="toggle"><input type="checkbox" v-model="settings.motionPaused" /> Freeze animation / preview phase</label>
          </template>
          <label v-for="spec in CONTROLS.filter(c=>c.group===group)" :key="spec.key" class="control">
            <span class="control-header"><span>{{ spec.label }}</span><output>{{ format(settings[spec.key],spec.step) }}</output></span>
            <input type="range" :min="spec.min" :max="spec.max" :step="spec.step" :value="settings[spec.key]" @input="onValue($event,spec.key)" />
          </label>
        </div>
      </details>
      <details open>
        <summary>Fold sculpting ({{ settings.folds.length }})</summary>
        <div class="group-body">
          <p class="hint">Each fold deforms a local region. Twist, pinch, lift, curl, and width combine smoothly.</p>
          <details v-for="(fold,i) in settings.folds" :key="i" :open="i===1||undefined" class="nested">
            <summary>Fold {{ i+1 }} — U {{ fold.u.toFixed(2) }}</summary>
            <div class="nested-body">
              <label v-for="spec in FOLD_CONTROLS" :key="spec.key" class="control">
                <span class="control-header"><span>{{ spec.label }}</span><output>{{ format(fold[spec.key],spec.step) }}</output></span>
                <input type="range" :min="spec.min" :max="spec.max" :step="spec.step" :value="fold[spec.key]" @input="onFold($event,i,spec.key)" />
              </label>
              <button type="button" @click="removeFold(i)">Remove fold</button>
            </div>
          </details>
          <button type="button" :disabled="settings.folds.length>=MAX_FOLDS" @click="addFold">+ Add fold (max {{ MAX_FOLDS }})</button>
        </div>
      </details>
      <details><summary>Advanced · 3D spine vertices ({{ settings.spinePoints.length }})</summary>
        <div class="group-body">
          <p class="hint">Edit the underlying XYZ control points. Small moves make big changes. Save a preset first.</p>
          <details v-for="(p,i) in settings.spinePoints" :key="i" class="nested">
            <summary>Control point {{ i+1 }} — {{ p.x.toFixed(2) }}, {{ p.y.toFixed(2) }}, {{ p.z.toFixed(2) }}</summary>
            <div class="nested-body">
              <label v-for="spec in SPINE_CONTROLS" :key="spec.key" class="control">
                <span class="control-header"><span>{{ spec.label }}</span><output>{{ format(p[spec.key],spec.step) }}</output></span>
                <input type="range" :min="spec.min" :max="spec.max" :step="spec.step" :value="p[spec.key]" @input="onSpine($event,i,spec.key)" />
              </label>
            </div>
          </details>
        </div>
      </details>
      <p v-if="status" class="status" role="status">{{ status }}</p>
      <p class="hint">Export the chosen view, edit DEFAULT_SCULPTURE in config.ts, commit, and redeploy. Live edits are not public.</p>
    </div>
  </aside>
</template>

<style scoped>
.sculpture-panel{position:fixed;z-index:1000;top:5.5rem;right:1rem;width:min(360px,calc(100vw - 2rem));max-height:min(84svh,850px);display:flex;flex-direction:column;background:rgba(17,17,19,.98);color:#f2f2ef;border:1px solid #484842;box-shadow:0 14px 45px #000a;font:12px/1.45 'JetBrains Mono',monospace;letter-spacing:0}
.panel-top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #363631;gap:8px}
.panel-top strong{font-size:11px;letter-spacing:.12em}
.panel-body{overflow:auto;padding:11px 14px 14px;overscroll-behavior:contain}
.hint{color:#a8a8a3;line-height:1.5;margin:5px 0 12px}
button{appearance:none;border:1px solid #56564d;color:#f2f2ef;background:#252525;padding:6px 9px;cursor:pointer;font:inherit}
button:hover{border-color:#d8ff3e}button:disabled{opacity:.45;cursor:not-allowed}
.toggle{display:flex;align-items:center;gap:9px;margin:6px 0 11px}
input[type=checkbox],input[type=range]{accent-color:#d8ff3e}
input[type=range]{display:block;width:100%}
details{border-top:1px solid #30302f}
summary{cursor:pointer;padding:10px 0;font-size:11px;letter-spacing:.07em;text-transform:uppercase}
.group-body{padding:0 0 9px}
.control{display:block;margin:0 0 13px}
.control-header{display:flex;justify-content:space-between;gap:10px;margin-bottom:4px}
output{color:#d8ff3e;font-variant-numeric:tabular-nums}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}
.import-box textarea{margin:10px 0 7px;width:100%;resize:vertical;background:#0a0a0b;color:#eee;border:1px solid #444;font:11px monospace;padding:6px}
.status{color:#d8ff3e;margin-top:9px}
.select-label{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:8px 0 12px}
select,.preset-entry input{font:inherit;color:#f2f2ef;background:#202021;border:1px solid #56564d;padding:5px;max-width:170px}
.nested{padding-left:9px;border-left:2px solid #343432}.nested-body{padding:0 2px 8px 7px}
.preset-entry{display:flex;gap:6px;margin:7px 0;align-items:center}.preset-entry input,.preset-name{flex:1;min-width:0}.preset-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(max-width:720px){.sculpture-panel{top:4.5rem;max-height:70svh}}
</style>
