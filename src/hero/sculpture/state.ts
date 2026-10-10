import { reactive, watch } from 'vue'
import { DEFAULT_SCULPTURE, sanitizeConfig, type SculptureConfig } from './config'
export const tuneMode=new URLSearchParams(window.location.search).get('tune')==='1'
// New version key: old kit configs must not silently override the richer schema.
export const STORAGE_KEY='asbrt-sculpture-config-v2'
function initial():SculptureConfig{
  if(!tuneMode)return sanitizeConfig(DEFAULT_SCULPTURE)
  try {
    const raw=localStorage.getItem(STORAGE_KEY)
    return raw?sanitizeConfig(JSON.parse(raw)):sanitizeConfig(DEFAULT_SCULPTURE)
  }catch{return sanitizeConfig(DEFAULT_SCULPTURE)}
}
export const sculptureSettings=reactive<SculptureConfig>(initial())
if(tuneMode){watch(sculptureSettings,()=>{
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(sculptureSettings))}catch{/* private mode */}
},{deep:true})}
export function setSettings(raw:unknown){
  const next=sanitizeConfig(raw)
  Object.assign(sculptureSettings,next)
}
export function resetSettings(){setSettings(DEFAULT_SCULPTURE)}
