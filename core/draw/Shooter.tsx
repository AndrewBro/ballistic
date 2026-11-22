// Standing soldier in body armour with a rifle, true size. World units are metres: origin at the muzzle on the line of sight, x towards the target, y up.
import {GUNS,GunId} from '../guns'
import {Weapon} from './Weapons'
import {useKit} from './kit'
export const GROUND=-1.67 // eye on the line of sight, ~1.82 m tall person
const IN=.0254,EYE=6 // eye sits 6 in ahead of the butt plate (cheek weld)
export const buttX=(gun:GunId,barrelIn:number)=>-(GUNS[gun].off+barrelIn)*IN
export const eyeX=(gun:GunId,barrelIn:number)=>buttX(gun,barrelIn)+EYE*IN
export const figLeft=(gun:GunId,barrelIn:number)=>buttX(gun,barrelIn)-.46
type P=[number,number]
/** Tapered capsule between two points: a limb segment. */
function Seg({a,b,wa,wb}:{a:P;b:P;wa:number;wb:number}){
 const k=useKit()
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l
 const q=(p:P,w:number,s:number)=>`${p[0]+nx*w/2*s},${p[1]+ny*w/2*s}`
 return <k.G><k.Path d={`M${q(a,wa,1)} L${q(b,wb,1)} L${q(b,wb,-1)} L${q(a,wa,-1)} Z`}/><k.Circle cx={a[0]} cy={a[1]} r={wa/2}/><k.Circle cx={b[0]} cy={b[1]} r={wb/2}/></k.G>}
/** Closed smooth outline through the points (Catmull-Rom turned into cubic Béziers). */
const blob=(q:P[])=>{const n=q.length,at=(i:number)=>q[(i+n)%n]
 return 'M'+q[0].join(',')+q.map((_,i)=>{const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2)
  return `C${p1[0]+(p2[0]-p0[0])/6},${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6},${p2[1]-(p3[1]-p1[1])/6} ${p2[0]},${p2[1]}`}).join(' ')+'Z'}
const Blob=({q,cls}:{q:P[];cls?:string})=>{const k=useKit();return <k.Path d={blob(q)} {...(cls?k.st('man.'+cls):{})}/>}
/** Leg in combat trousers with a knee pad, cargo pocket and a high boot; x positions are given relative to the hip. */
function Leg({hx,kx,ax,toe,back}:{hx:number;kx:number;ax:number;toe:number;back?:boolean}){
 const k=useKit()
 return <k.G {...(back?k.st('man.far'):{})}>
  <Blob q={[[hx-.1,-.8],[hx+.08,-.82],[kx+.075,-1.18],[kx+.06,-1.3],[ax+.055,-1.5],[ax-.055,-1.5],[kx-.065,-1.3],[kx-.075,-1.15]]}/>
  <k.Rect x={(hx+kx)/2-.02} y={-1.07} width={.08} height={.11} rx={.015} {...k.st('man.pouch')}/>
  <Blob q={[[kx+.045,-1.17],[kx+.095,-1.21],[kx+.09,-1.31],[kx+.045,-1.33],[kx+.03,-1.25]]} cls="gear"/>
  <k.Path d={`M${ax-.065},-1.47 L${ax+.06},-1.47 L${ax+.07},${GROUND+.07} Q${toe-.02},${GROUND+.07} ${toe},${GROUND+.035} L${toe},${GROUND} L${ax-.085},${GROUND} Z`} {...k.st('man.boot')}/>
  <k.Path d={`M${ax-.085},${GROUND+.012} L${toe},${GROUND+.012}`} {...k.st('man.seam')}/>
 </k.G>}
/**
 * Ukrainian flag chevron (7 × 4.4 cm) sewn high on the sleeve, just below the shoulder: level when the arm hangs down, so it turns with the arm.
 * Its long side lies across the sleeve and the blue half faces the shoulder.
 */
function FlagPatch({a,b}:{a:P;b:P}){
 const k=useKit(),deg=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI+90,c:P=[a[0]+(b[0]-a[0])*.14,a[1]+(b[1]-a[1])*.14]
 return <k.G transform={`translate(${c[0]} ${c[1]}) rotate(${deg})`}>
  <k.Rect x={-.035} y={0} width={.07} height={.022} {...k.st('man.flagB')}/>
  <k.Rect x={-.035} y={-.022} width={.07} height={.022} {...k.st('man.flagY')}/>
 </k.G>}
/** Gloved hand closed around a grip. */
const Hand=({c,a}:{c:P;a:number})=>{const k=useKit();return <k.G transform={`translate(${c[0]} ${c[1]}) rotate(${a})`}><k.Rect x={-.045} y={-.03} width={.09} height={.06} rx={.025} {...k.st('man.glove')}/><k.Rect x={-.05} y={-.012} width={.03} height={.035} rx={.012} {...k.st('man.glove')}/></k.G>}
export function Shooter({gun,barrelIn,sightM}:{gun:GunId;barrelIn:number;sightM:number}){
 const k=useKit()
 const g=GUNS[gun],b=buttX(gun,barrelIn),E=eyeX(gun,barrelIn),by=-sightM
 const grip:P=[b+g.grip[0]*IN,by+g.grip[1]*IN]
 const sup:P=[Math.min(b+g.fore*IN,b+.58,-.05),by-.035]
 const hx=E-.075,hy=.035,R=(x:number,y:number):P=>[b+x,y] // points relative to the butt plate
 const DX=.08 // body shifted forward under the head so the neck stays upright
 return <k.G {...k.st('man')}>
  {/* far side: trigger arm, then the body (shifted forward) */}
  <k.G {...k.st('man.far')}><Seg a={R(-.07+DX,-.2)} b={R(.1,-.42)} wa={.11} wb={.085}/>
   <Seg a={R(.1,-.42)} b={grip} wa={.09} wb={.065}/></k.G>
  <k.G transform={`translate(${DX} 0)`}>
  <Leg hx={b-.17} kx={b-.25} ax={b-.35} toe={b-.13} back/>
  {/* body in combat shirt */}
  <Blob q={[R(-.04,-.11),R(.05,-.19),R(.07,-.4),R(.04,-.62),R(.04,-.8),R(.05,-.9),R(-.1,-.96),R(-.28,-.9),R(-.29,-.78),R(-.25,-.62),R(-.27,-.36),R(-.22,-.17),R(-.12,-.1)]}/>
  <Leg hx={b-.08} kx={b+.01} ax={b+.02} toe={b+.25}/>
  {/* plate carrier: back plate with radio, front plate with pouches, cummerbund, shoulder strap */}
  <k.Rect x={b-.32} y={-.56} width={.1} height={.38} rx={.03} {...k.st('man.gear')}/>
  <k.Rect x={b-.385} y={-.5} width={.07} height={.26} rx={.02} {...k.st('man.pouch')}/><k.Path d={`M${b-.36},-.24 L${b-.385},.14`} {...k.st('man.ant')}/>
  <k.Rect x={b-.27} y={-.6} width={.32} height={.1} rx={.02} {...k.st('man.gear')}/>
  <k.Path d={`M${b-.25},-.2 Q${b-.12},-.08 ${b+.03},-.21`} {...k.st('man.strap')}/>
  <k.Rect x={b+.0} y={-.57} width={.11} height={.39} rx={.035} {...k.st('man.gear')}/>
  {[0,1,2].map(i=><k.G key={i}><k.Rect x={b+.1} y={-.555+i*.07} width={.055} height={.065} rx={.01} {...k.st('man.pouch')}/><k.Path d={`M${b+.1},${-.5+i*.07} L${b+.155},${-.5+i*.07}`} {...k.st('man.seam')}/></k.G>)}
  <k.Rect x={b+.1} y={-.33} width={.04} height={.09} rx={.01} {...k.st('man.pouch')}/>
  {/* belt with buckle, dump pouch and drop holster */}
  <k.Rect x={b-.3} y={-.8} width={.36} height={.065} rx={.015} {...k.st('man.gear')}/><k.Rect x={b+.0} y={-.795} width={.04} height={.055} rx={.008} {...k.st('man.pouch')}/>
  <k.Rect x={b-.335} y={-.86} width={.08} height={.13} rx={.03} {...k.st('man.pouch')}/>
  <k.Rect x={b-.13} y={-1.04} width={.07} height={.22} rx={.02} {...k.st('man.gear')}/><k.Path d={`M${b-.12},-.86 L${b-.07},-.86`} {...k.st('man.seam')}/>
  </k.G>
  {/* neck, head, helmet with NVG mount and side rail, headset, glasses */}
  <Blob q={[R(-.03+DX,-.12),[hx+.02,-.07],[hx-.07,-.02],R(-.12+DX,-.1)]}/>
  <k.G transform={`rotate(-15 ${hx} ${hy})`}>
   <Blob q={[[hx-.09,hy+.06],[hx-.02,hy+.115],[hx+.07,hy+.08],[hx+.095,hy+.01],[hx+.09,hy-.05],[hx+.05,hy-.1],[hx-.01,hy-.115],[hx-.07,hy-.08],[hx-.1,hy-.02]]}/>
   <k.Path d={`M${hx-.12},${hy-.02} C${hx-.13},${hy+.15} ${hx+.08},${hy+.18} ${hx+.115},${hy+.065} L${hx+.09},${hy+.05} L${hx+.03},${hy+.055} Q${hx-.01},${hy+.03} ${hx-.03},${hy-.01} L${hx-.06},${hy-.07} L${hx-.118},${hy-.07} Z`} {...k.st('man.gear')}/>
   <k.Path d={`M${hx-.085},${hy+.06} Q${hx+.0},${hy+.1} ${hx+.075},${hy+.075}`} {...k.st('man.seam')}/>
   <k.Rect x={hx+.075} y={hy+.06} width={.04} height={.035} rx={.006} {...k.st('man.pouch')}/>
   <k.Ellipse cx={hx-.015} cy={hy-.02} rx={.04} ry={.05} {...k.st('man.pouch')}/><k.Path d={`M${hx-.015},${hy+.03} Q${hx-.03},${hy+.08} ${hx-.07},${hy+.075}`} {...k.st('man.seam')}/>
   <k.Path d={`M${hx+.04},${hy+.02} L${hx+.1},${hy+.022} L${hx+.098},${hy-.004} L${hx+.05},${hy-.008} Z`} {...k.st('man.glass')}/>
  </k.G>
  <k.Path d={`M${E+.012},.0 L${E+.035},-.032 L${E+.008},-.045 Z`}/>
  {/* sling from the front sling point round the body */}
  <k.Path d={`M${sup[0]-.04},${by-.02} Q${b+.12},-.48 ${b-.24+DX},-.2`} {...k.st('man.strap')}/>
  <k.G transform={`translate(${b} ${by}) scale(${IN})`}><Weapon gun={gun} barrelIn={barrelIn} sightIn={sightM/IN}/></k.G>
  <Hand c={grip} a={-75}/>
  {/* near side: support arm with shoulder and sleeve, gloved hand on the fore-end */}
  <k.Circle cx={b-.03+DX} cy={-.19} r={.07}/><Seg a={R(-.03+DX,-.19)} b={R(.3,-.3)} wa={.11} wb={.085}/>
  <Seg a={R(.3,-.3)} b={sup} wa={.085} wb={.065}/>
  <FlagPatch a={R(-.03+DX,-.19)} b={R(.3,-.3)}/>
  <Hand c={sup} a={-20}/>
 </k.G>}
