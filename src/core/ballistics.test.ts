import {describe,it,expect} from 'vitest'
import {solve,stability} from './ballistics'
const base={v0:790,bc:.243,model:'G7' as const,sightH:.045,zero:100,tempC:15,pressHpa:1013.25,windMs:0,windDeg:90,angleDeg:0,range:600}
describe('ballistics',()=>{
 it('crosses line of sight at the zero distance',()=>{const r=solve(base)!;expect(r.crossings.some(c=>Math.abs(c-100)<1)).toBe(true)})
 it('slows down and drops',()=>{const r=solve(base)!,e=r.pts[r.pts.length-1];expect(e.v).toBeLessThan(base.v0);expect(e.h).toBeLessThan(0)})
 it('finds both zeros for a short zero with a .223',()=>{const r=solve({...base,v0:930,bc:.243,model:'G1',zero:25,range:1500})!;expect(r.crossings.length).toBe(2);expect(r.crossings[1]).toBeGreaterThan(150)})
 it('Miller stability: 55 gr .224 in 1:7 is stable, 77 gr in 1:12 is not',()=>{expect(stability(55,.224,.74,7,3050,59,1013.25)).toBeGreaterThan(3);expect(stability(77,.224,.99,12,2750,59,1013.25)).toBeLessThan(1.3)})
 it('crosswind from the right drifts left',()=>{const r=solve({...base,windMs:5})!;expect(r.pts[r.pts.length-1].z).toBeLessThan(0)})
})
