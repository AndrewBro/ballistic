import {describe,it,expect} from 'vitest'
import {correction,dope,fromRad,unitSize} from './corrections'
import {solve} from './ballistics'

describe('corrections',()=>{
 it('angle units: 1 MRAD is 10 cm at 100 m, 1 MOA is about 1.047 in at 100 yd',()=>{
  expect(unitSize('MRAD',100)).toBeCloseTo(.1,6)
  expect(unitSize('MOA',91.44)/.0254).toBeCloseTo(1.047,3)
  expect(fromRad(.001,'MRAD')).toBeCloseTo(1,9)
 })
 it('a low impact asks to dial up, a right impact asks to dial left, rounded to whole clicks',()=>{
  const c=correction(-.2,.06,200,'MRAD',.1) // 20 cm low, 6 cm right at 200 m
  expect(c.elev).toBeCloseTo(1,2);expect(c.elevClicks).toBe(10)
  expect(c.wind).toBeCloseTo(-.3,2);expect(c.windClicks).toBe(-3)
 })
 it('dope: no correction at the zero, dial up beyond it',()=>{
  const r=solve({v0:930,bc:.243,model:'G1',sightH:.065,zero:100,tempC:15,pressHpa:1013.25,windMs:0,windDeg:90,angleDeg:0,range:400})!
  const [z,far]=dope(r,[100,300],{unit:'MOA',click:.25,dial:true})
  expect(Math.abs(z.elev)).toBeLessThan(.05)
  expect(far.elev).toBeGreaterThan(2);expect(far.elevClicks).toBe(Math.round(far.elev/.25))
  expect(correction(.2,-.06,200,'MRAD',.1).windClicks).toBe(3) // left impact: dial right, same size as the right one
 })
})
