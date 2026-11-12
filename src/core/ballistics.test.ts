import {describe,it,expect} from 'vitest'
import {solve,stability} from './ballistics'
import {CALIBERS,BULLETS,vFor} from '../data/bullets'
const base={v0:790,bc:.243,model:'G7' as const,sightH:.045,zero:100,tempC:15,pressHpa:1013.25,windMs:0,windDeg:90,angleDeg:0,range:600}
describe('ballistics',()=>{
 it('crosses line of sight at the zero distance',()=>{const r=solve(base)!;expect(r.crossings.some(c=>Math.abs(c-100)<1)).toBe(true)})
 it('slows down and drops',()=>{const r=solve(base)!,e=r.pts[r.pts.length-1];expect(e.v).toBeLessThan(base.v0);expect(e.h).toBeLessThan(0)})
 it('finds both zeros for a short zero with a .223',()=>{const r=solve({...base,v0:930,bc:.243,model:'G1',zero:25,range:1500})!;expect(r.crossings.length).toBe(2);expect(r.crossings[1]).toBeGreaterThan(150)})
 it('Miller stability: 55 gr .224 in 1:7 is stable, 77 gr in 1:12 is not',()=>{expect(stability(55,.224,.74,7,3050,59,1013.25)).toBeGreaterThan(3);expect(stability(77,.224,.99,12,2750,59,1013.25)).toBeLessThan(1.3)})
 it('every bullet in the library zeroes at 100 m from its typical barrel',()=>{for(const b of BULLETS){const c=CALIBERS.find(x=>x.id===b.cal)!,r=solve({...base,v0:vFor(b,c.barrel??c.ref),bc:b.bc,model:b.m,range:400});expect(r,b.id).not.toBeNull();expect(r!.crossings.some(x=>Math.abs(x-100)<1),b.id).toBe(true)}})
 it('every bullet is stable in its caliber\'s typical twist',()=>{for(const b of BULLETS){const c=CALIBERS.find(x=>x.id===b.cal)!;expect(stability(b.gr,c.d,b.len,c.tw[2],vFor(b,c.barrel??c.ref)*3.28084,59,1013.25),b.id).toBeGreaterThan(1)}})
 it('crosswind from the right drifts left',()=>{const r=solve({...base,windMs:5})!;expect(r.pts[r.pts.length-1].z).toBeLessThan(0)})
})
