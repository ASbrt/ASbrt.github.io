<script setup lang="ts">
import { computed,ref } from 'vue'
import { DEFAULT_SCULPTURE, copyConfig, MAX_RIBBONS, MAX_FOLDS, MAX_ACCENTS, POINTS } from '../hero/sculpture/config'
import { sculptureSettings as settings, setSettings, resetSettings } from '../hero/sculpture/state'
const open=ref(true),active=ref(0),advanced=ref(false),importOpen=ref(false),importText=ref(''),status=ref('')
const ribbon=computed(()=>settings.ribbons[Math.min(active.value,settings.ribbons.length-1)])
const num=(e:Event,obj:object,key:string)=>{(obj as Record<string,number>)[key]=Number((e.target as HTMLInputElement).value)}
const format=(n:number)=>Number(n).toFixed(2)
const shapeControls=[{key:'width',label:'Width',min:.05,max:1.5,step:.005},{key:'cup',label:'Cross-section cup',min:-1.5,max:1.5,step:.01},{key:'baseTwist',label:'Global twist',min:-4,max:4,step:.01},{key:'contours',label:'Contours (rebuilds topology)',min:12,max:220,step:1},{key:'opacity',label:'Opacity',min:0,max:1,step:.01},{key:'brightness',label:'Brightness',min:0,max:3,step:.01}] as const
const foldControls=[{key:'u',label:'Along spine',min:0,max:1,step:.005},{key:'radius',label:'Influence radius',min:.025,max:.45,step:.005},{key:'twist',label:'Twist',min:-5,max:5,step:.01},{key:'pinch',label:'Pinch',min:-.9,max:.95,step:.01},{key:'lift',label:'Depth lift',min:-2,max:2,step:.01},{key:'curl',label:'Cross-section curl',min:-2,max:2,step:.01}] as const
const accentControls=[{key:'u',label:'Along contour',min:0,max:1,step:.005},{key:'v',label:'Across ribbon',min:-1,max:1,step:.005},{key:'length',label:'Length / U spread',min:.01,max:.5,step:.005},{key:'spread',label:'Spread / V',min:.01,max:1,step:.005},{key:'strength',label:'Strength',min:0,max:2,step:.01}] as const
const frameControls=[{key:'zoom',label:'Macro zoom',min:.2,max:5,step:.01},{key:'x',label:'Horizontal position',min:-1,max:2,step:.01},{key:'y',label:'Vertical position',min:-1,max:2,step:.01},{key:'rx',label:'Rotation X',min:-180,max:180,step:.5},{key:'ry',label:'Rotation Y',min:-180,max:180,step:.5},{key:'rz',label:'Rotation Z',min:-180,max:180,step:.5}] as const
const lookControls=[{key:'depthFade',label:'Depth fading',min:0,max:3,step:.01},{key:'accentIntensity',label:'Global lime intensity',min:0,max:2,step:.01},{key:'fragmentation',label:'Line break frequency',min:0,max:1,step:.01},{key:'fragmentScale',label:'Break density along line',min:1,max:40,step:.25},{key:'fragmentationSoftness',label:'Break edge softness',min:.0005,max:.07,step:.0005}] as const
const motionControls=[{key:'speed',label:'Shadow travel speed',min:0,max:2,step:.005},{key:'shadowStrength',label:'Shadow darkness',min:0,max:1,step:.01},{key:'shadowWidth',label:'Shadow patch size',min:.005,max:.45,step:.005},{key:'shadowRepeats',label:'Patches per line',min:0,max:8,step:.05},{key:'shadowSlant',label:'Phase across lines',min:-2,max:2,step:.01},{key:'lineFade',label:'Slow whole-line fading',min:0,max:1,step:.01},{key:'rotationX',label:'Rotation drift X °',min:0,max:40,step:.1},{key:'rotationY',label:'Rotation drift Y °',min:0,max:40,step:.1},{key:'phase',label:'Frozen phase / seconds',min:0,max:100,step:.1}] as const
function addRibbon(){
  if(settings.ribbons.length>=MAX_RIBBONS)return
  const r=copyConfig({ ...DEFAULT_SCULPTURE,ribbons:[ribbon.value]}).ribbons[0]
  r.name=`Ribbon ${settings.ribbons.length+1}`;r.offset.z-=.3;r.offset.x+=.15;r.opacity=.55
  settings.ribbons.push(r);active.value=settings.ribbons.length-1
}
function removeRibbon(){if(settings.ribbons.length<2)return;settings.ribbons.splice(active.value,1);active.value=Math.min(active.value,settings.ribbons.length-1)}
function addFold(){if(ribbon.value.folds.length<MAX_FOLDS)ribbon.value.folds.push({u:.5,radius:.13,twist:1.2,pinch:.3,lift:.1,curl:.25})}
function addAccent(){if(ribbon.value.accents.length<MAX_ACCENTS)ribbon.value.accents.push({u:.5,v:.4,length:.15,spread:.2,strength:1})}
function reset(){resetSettings();active.value=0;status.value='Reset to published defaults'}
async function exportJSON(){const value=JSON.stringify(settings,null,2);try{await navigator.clipboard.writeText(value);status.value='Configuration copied'}catch{importText.value=value;importOpen.value=true;status.value='Copy JSON below'}}
function importJSON(){try{setSettings(JSON.parse(importText.value));active.value=0;importOpen.value=false;status.value='Imported and validated'}catch{status.value='Invalid JSON'}}
const PRESET_KEY='asbrt-v3-presets'
const presetName=ref('Untitled composition')
const presets=ref<{name:string;json:string}[]>(readPresets())
function readPresets(){try{const v=JSON.parse(localStorage.getItem(PRESET_KEY)||'[]');return Array.isArray(v)?v.slice(0,12):[]}catch{return []}}
function savePreset(){const name=presetName.value.trim()||'Untitled';presets.value=[...presets.value.filter(p=>p.name!==name),{name,json:JSON.stringify(settings)}].slice(-12);try{localStorage.setItem(PRESET_KEY,JSON.stringify(presets.value));status.value=`Saved ${name}`}catch{status.value='Preset storage unavailable: use Copy JSON'}}
function loadPreset(i:number){const x=presets.value[i];if(x){setSettings(JSON.parse(x.json));active.value=0}}
</script>
<template>
  <aside class="panel" aria-label="Sculpture Lab v3 live tuning">
    <header><strong>SCULPTURE / GPU LAB V3</strong><button @click="open=!open">{{open?'Hide':'Show'}}</button></header>
    <div v-if="open" class="body" data-lenis-prevent>
      <p class="hint">GPU-driven spline, folds, accent and motion. Only contour count and grid quality regenerate geometry.</p>
      <div class="buttons"><button @click="exportJSON">Copy JSON</button><button @click="importOpen=!importOpen">Import</button><button @click="reset">Reset</button></div>
      <div v-if="importOpen"><textarea v-model="importText" rows="6" placeholder="Paste exported JSON"></textarea><button @click="importJSON">Apply JSON</button></div>
      <details><summary>Saved compositions</summary><div class="stack"><div class="buttons"><input v-model="presetName" aria-label="Preset name"/><button @click="savePreset">Save</button></div><div v-for="(p,i) in presets" :key="p.name" class="buttons"><span class="hint">{{p.name}}</span><button @click="loadPreset(i)">Load</button></div></div></details>
      <details open><summary>Composition / camera</summary><div class="stack">
        <label v-for="c in frameControls" :key="c.key" class="control"><span>{{c.label}} <output>{{format(settings.framing[c.key])}}</output></span><input type="range" :min="c.min" :max="c.max" :step="c.step" :value="settings.framing[c.key]" @input="num($event,settings.framing,c.key)"/></label>
        <p class="hint">Framing is fixed while sculpting: fold changes will not auto-rescale the artwork.</p>
      </div></details>
      <details open><summary>Ribbons ({{settings.ribbons.length}} / {{MAX_RIBBONS}})</summary><div class="stack">
        <select v-model.number="active" aria-label="Selected ribbon"><option v-for="(r,i) in settings.ribbons" :key="i" :value="i">{{i+1}} — {{r.name}}</option></select>
        <div class="buttons"><button :disabled="settings.ribbons.length>=MAX_RIBBONS" @click="addRibbon">+ Duplicate</button><button :disabled="settings.ribbons.length<=1" @click="removeRibbon">Remove</button></div>
        <template v-if="ribbon">
          <label class="check"><input type="checkbox" v-model="ribbon.enabled"/> Show ribbon</label>
          <label v-for="c in shapeControls" :key="c.key" class="control"><span>{{c.label}} <output>{{format(ribbon[c.key])}}</output></span><input type="range" :min="c.min" :max="c.max" :step="c.step" :value="ribbon[c.key]" @input="num($event,ribbon,c.key)"/></label>
          <details><summary>Ribbon positioning</summary><div v-for="key in (['x','y','z'] as const)" :key="key" class="stack">
            <label class="control">Offset {{key.toUpperCase()}} <output>{{format(ribbon.offset[key])}}</output><input type="range" min="-2" max="2" step=".01" :value="ribbon.offset[key]" @input="num($event,ribbon.offset,key)"/></label>
            <label class="control">Rotation {{key.toUpperCase()}} <output>{{format(ribbon.rotation[key])}}</output><input type="range" min="-180" max="180" step=".5" :value="ribbon.rotation[key]" @input="num($event,ribbon.rotation,key)"/></label>
          </div></details>
        </template>
      </div></details>
      <details open v-if="ribbon"><summary>Fold sculpting ({{ribbon.folds.length}})</summary><div class="stack"><p class="hint">Independent folds; all parameters update as GPU uniforms while dragging.</p>
        <details v-for="(f,i) in ribbon.folds" :key="i" :open="i===0||undefined"><summary>Fold {{i+1}} · U {{format(f.u)}}</summary><div class="stack nested">
          <label v-for="c in foldControls" :key="c.key" class="control"><span>{{c.label}} <output>{{format(f[c.key])}}</output></span><input type="range" :min="c.min" :max="c.max" :step="c.step" :value="f[c.key]" @input="num($event,f,c.key)"/></label>
          <button @click="ribbon.folds.splice(i,1)">Remove fold</button>
        </div></details><button :disabled="ribbon.folds.length>=MAX_FOLDS" @click="addFold">+ Add fold</button>
      </div></details>
      <details open v-if="ribbon"><summary>Accent painting ({{ribbon.accents.length}})</summary><div class="stack"><p class="hint">Each lime patch covers a region along AND across the ribbon. Multiple patches may overlap.</p>
        <details v-for="(z,i) in ribbon.accents" :key="i" :open="i===0||undefined"><summary>Accent region {{i+1}}</summary><div class="stack nested">
          <label v-for="c in accentControls" :key="c.key" class="control"><span>{{c.label}} <output>{{format(z[c.key])}}</output></span><input type="range" :min="c.min" :max="c.max" :step="c.step" :value="z[c.key]" @input="num($event,z,c.key)"/></label>
          <button @click="ribbon.accents.splice(i,1)">Remove region</button>
        </div></details><button :disabled="ribbon.accents.length>=MAX_ACCENTS" @click="addAccent">+ Add accent</button>
      </div></details>
      <details><summary>Rendering / contour breaks</summary><div class="stack"><label v-for="c in lookControls" :key="c.key" class="control"><span>{{c.label}} <output>{{format(settings.look[c.key])}}</output></span><input type="range" :min="c.min" :max="c.max" :step="c.step" :value="settings.look[c.key]" @input="num($event,settings.look,c.key)"/></label></div></details>
      <details open><summary>Motion / traveling shadows</summary><div class="stack"><select v-model="settings.motion.mode" aria-label="Motion mode"><option value="off">Off</option><option value="rotate">Rotation only</option><option value="shadows">Traveling shadows + line fade</option><option value="both">Rotation + shadows</option></select>
        <label class="check"><input type="checkbox" v-model="settings.motion.paused"/> Pause all movement</label>
        <label v-for="c in motionControls" :key="c.key" class="control"><span>{{c.label}} <output>{{format(settings.motion[c.key])}}</output></span><input type="range" :min="c.min" :max="c.max" :step="c.step" :value="settings.motion[c.key]" @input="num($event,settings.motion,c.key)"/></label>
      </div></details>
      <details v-if="ribbon"><summary>Advanced / spline points ({{POINTS}})</summary><div class="stack"><button @click="advanced=!advanced">{{advanced?'Hide':'Edit'}} XYZ spline points</button><template v-if="advanced"><details v-for="(p,i) in ribbon.spine" :key="i"><summary>Point {{i+1}}</summary><div class="stack nested"><label v-for="key in (['x','y','z'] as const)" :key="key" class="control"><span>{{key.toUpperCase()}} <output>{{format(p[key])}}</output></span><input type="range" min="-5" max="5" step=".01" :value="p[key]" @input="num($event,p,key)"/></label></div></details></template></div></details>
      <p class="hint" role="status">{{status || 'Copy JSON to share your favorite composition.'}}</p>
    </div>
  </aside>
</template>
<style scoped>
.panel{position:fixed;top:5rem;right:1rem;z-index:1000;width:min(368px,calc(100vw - 2rem));max-height:84svh;color:#f2f2ef;background:#111114f5;border:1px solid #46463f;box-shadow:0 12px 40px #000a;font:12px/1.45 'JetBrains Mono',monospace;display:flex;flex-direction:column}.panel header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #333}.panel strong{letter-spacing:.11em;font-size:11px}.body{overflow-y:auto;overscroll-behavior:contain;padding:12px 14px}.hint{font-size:11px;color:#a7a7a0;margin:5px 0 9px}.stack{padding:7px 0 12px;display:grid;gap:8px}details{border-top:1px solid #373731}summary{padding:11px 0;cursor:pointer;letter-spacing:.035em;text-transform:uppercase}.nested{padding-left:12px;border-left:2px solid #3a3a35}.control{display:grid;gap:4px}.control span{display:flex;justify-content:space-between;gap:12px}output{color:#d8ff3e;font-variant-numeric:tabular-nums}.buttons{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.check{display:flex;gap:7px;align-items:center}input[type=range],input[type=checkbox]{accent-color:#d8ff3e}input[type=range]{width:100%}button,select,input:not([type=range]):not([type=checkbox]),textarea{font:inherit;color:#f2f2ef;background:#242426;border:1px solid #555;padding:6px 8px}button{cursor:pointer}button:disabled{opacity:.35;cursor:default}button:hover:not(:disabled){border-color:#d8ff3e}select{width:100%}textarea{width:100%}@media(max-width:720px){.panel{max-height:72svh;top:4.5rem}}
</style>
