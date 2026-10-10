import { reactive,watch } from 'vue'
import { DEFAULT_SCULPTURE,copyConfig,sanitizeConfig,type SculptureConfig } from './config'
export const tuneMode=new URLSearchParams(window.location.search).get('tune')==='1'
export const STORAGE_KEY='asbrt-sculpture-config-v3'
function initial():SculptureConfig{
  if(!tuneMode)return copyConfig(DEFAULT_SCULPTURE)
  try {const stored=localStorage.getItem(STORAGE_KEY);return stored?sanitizeConfig(JSON.parse(stored)):copyConfig(DEFAULT_SCULPTURE)}
  catch{return copyConfig(DEFAULT_SCULPTURE)}
}
export const sculptureSettings=reactive<SculptureConfig>(initial())
let saveTimeout:ReturnType<typeof setTimeout>|null=null
if(tuneMode)watch(sculptureSettings,()=>{
  if(saveTimeout!==null)clearTimeout(saveTimeout)
  saveTimeout=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sculptureSettings))}catch{/* storage optional */}},450)
},{deep:true})
export function setSettings(value:unknown):void{const next=sanitizeConfig(value);Object.assign(sculptureSettings,next)}
export function resetSettings():void{setSettings(DEFAULT_SCULPTURE)}
