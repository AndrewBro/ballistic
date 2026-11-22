// Scope corrections: how far to dial (or hold) so the bullet lands on the aim point at a given distance.
import {Result,ptAt} from './ballistics'
import type {AngleUnit,Optic} from './models'

const MOA_PER_RAD=180/Math.PI*60
/** Angle in radians → MOA or MRAD. */
export const fromRad=(rad:number,unit:AngleUnit)=>unit==='MOA'?rad*MOA_PER_RAD:rad*1000
/** MOA or MRAD → radians. */
export const toRad=(a:number,unit:AngleUnit)=>unit==='MOA'?a/MOA_PER_RAD:a/1000
/** Size (m) one unit covers at a distance (m): 1 MOA ≈ 2.9 cm at 100 m, 1 MRAD = 10 cm at 100 m. */
export const unitSize=(unit:AngleUnit,distM:number)=>Math.tan(toRad(1,unit))*distM

/**
 * Correction for an impact `h` metres above the line of sight (and `z` to the right) at `distM`:
 * positive elevation = dial up, positive windage = dial right. Clicks are rounded to whole clicks, the same way up and down.
 */
const clicks=(a:number,click:number)=>Math.sign(a)*Math.round(Math.abs(a)/click)
export function correction(h:number,z:number,distM:number,unit:AngleUnit,click?:number){
 const elev=fromRad(Math.atan2(-h,distM),unit),wind=fromRad(Math.atan2(-z,distM),unit)
 return{elev,wind,elevClicks:click?clicks(elev,click):undefined,windClicks:click?clicks(wind,click):undefined}
}

export interface DopeRow{d:number;h:number;z:number;v:number;t:number;elev:number;wind:number;elevClicks?:number;windClicks?:number}
/** Dope table for a solved trajectory: one row per distance the trajectory reaches. */
export function dope(res:Result,distances:number[],optic:Pick<Optic,'unit'|'click'|'dial'>):DopeRow[]{
 return distances.flatMap(d=>{const p=ptAt(res.pts,d);if(!p)return[]
  const c=correction(p.h,p.z,d,optic.unit,optic.dial?optic.click:undefined)
  return[{d,h:p.h,z:p.z,v:p.v,t:p.t,...c}]})
}
