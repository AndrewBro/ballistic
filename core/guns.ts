// Rifle types the app draws, with the defaults a caliber brings (barrel, sight height, zero).
export type GunId='ar15'|'ar10'|'bolt'|'ak'|'svd'
export interface Gun{off:number;grip:[number,number];fore:number;barrel:number;sight:number;zero:number} // sight: default sight height, mm; zero: default zero distance, m (carbines 25, precision rifles 100)
export const GUNS:Record<GunId,Gun>={
 ar15:{off:19.2,grip:[12,-3.5],fore:25,barrel:16,sight:65,zero:25},
 ar10:{off:20.5,grip:[12.4,-3.6],fore:26,barrel:18,sight:65,zero:100},
 bolt:{off:20.5,grip:[13.2,-3.4],fore:25,barrel:24,sight:40,zero:100},
 ak:{off:17.7,grip:[10.9,-3.6],fore:22.5,barrel:16,sight:75,zero:25},
 svd:{off:20.5,grip:[13.2,-3.9],fore:27,barrel:24,sight:70,zero:100}}
export const gunFor=(cal:string):GunId=>cal==='223'||cal==='556'||cal==='300blk'?'ar15':cal==='308'||cal==='762x51'?'ar10':cal==='762x39'||cal==='545'?'ak':cal==='762x54'?'svd':'bolt'
