// Standing soldier in body armour with a rifle, true size. World units are metres: origin at the muzzle on the line of sight, x towards the target, y up.
import {GUNS,GunId,Weapon} from './Weapons'
export const GROUND=-1.67 // eye on the line of sight, ~1.82 m tall person
const IN=.0254,EYE=8 // eye sits 8 in ahead of the butt plate (cheek weld)
export const buttX=(gun:GunId,barrelIn:number)=>-(GUNS[gun].off+barrelIn)*IN
export const eyeX=(gun:GunId,barrelIn:number)=>buttX(gun,barrelIn)+EYE*IN
export const figLeft=(gun:GunId,barrelIn:number)=>buttX(gun,barrelIn)-.42
type P=[number,number]
/** Tapered capsule between two points: a limb segment. */
function Seg({a,b,wa,wb,cls}:{a:P;b:P;wa:number;wb:number;cls?:string}){
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l
 const q=(p:P,w:number,s:number)=>`${p[0]+nx*w/2*s},${p[1]+ny*w/2*s}`
 return <g className={cls}><path d={`M${q(a,wa,1)} L${q(b,wb,1)} L${q(b,wb,-1)} L${q(a,wa,-1)} Z`}/><circle cx={a[0]} cy={a[1]} r={wa/2}/><circle cx={b[0]} cy={b[1]} r={wb/2}/></g>}
function Leg({hip,knee,ankle,toe}:{hip:P;knee:P;ankle:P;toe:number}){
 return <g>
  <Seg a={hip} b={knee} wa={.18} wb={.13}/><Seg a={knee} b={ankle} wa={.13} wb={.1}/>
  <ellipse cx={knee[0]+.045} cy={knee[1]} rx={.05} ry={.075} className="gear"/>
  <path d={`M${ankle[0]-.07},${ankle[1]+.12} L${ankle[0]+.06},${ankle[1]+.12} L${ankle[0]+.07},${GROUND+.06} L${toe},${GROUND+.05} Q${toe+.03},${GROUND} ${toe-.02},${GROUND} L${ankle[0]-.09},${GROUND} Z`} className="boot"/>
 </g>}
export function Shooter({gun,barrelIn,sightM}:{gun:GunId;barrelIn:number;sightM:number}){
 const g=GUNS[gun],b=buttX(gun,barrelIn),E=eyeX(gun,barrelIn),by=-sightM
 const grip:P=[b+g.grip[0]*IN,by+g.grip[1]*IN]
 const sup:P=[Math.min(b+g.fore*IN,b+.58,-.05),by-.035]
 const hip:P=[b-.13,-.8],hx=E-.075,hy=.035
 return <g className="man">
  <Leg hip={hip} knee={[b-.22,-1.21]} ankle={[b-.32,-1.55]} toe={b-.1}/>
  <Seg a={[b-.06,-.2]} b={[b+.08,-.38]} wa={.11} wb={.095}/>
  <rect x={b-.37} y={-.5} width={.1} height={.26} rx={.03} className="gear"/>
  <Seg a={[b-.09,-.24]} b={[b-.13,-.74]} wa={.27} wb={.26}/>
  <Leg hip={hip} knee={[b-.03,-1.22]} ankle={[b,-1.55]} toe={b+.22}/>
  <path d={`M${b-.27},-.15 L${b+.07},-.17 L${b+.06},-.62 L${b-.3},-.62 Z`} className="gear"/>
  <path d={`M${b-.2},-.13 L${b-.02},-.13 L${b-.04},-.2 L${b-.2},-.2 Z`} className="gear"/>
  <rect x={b+.04} y={-.6} width={.08} height={.17} rx={.015} className="pouch"/>
  <path d={`M${b+.04},-.47 L${b+.12},-.47 M${b+.04},-.53 L${b+.12},-.53`} className="seam"/>
  <rect x={b+.04} y={-.38} width={.06} height={.1} rx={.015} className="pouch"/>
  <rect x={b-.29} y={-.73} width={.33} height={.07} rx={.015} className="gear"/>
  <rect x={b-.12} y={-.86} width={.09} height={.14} rx={.02} className="pouch"/>
  <Seg a={[E-.1,-.06]} b={[b-.08,-.17]} wa={.11} wb={.12}/>
  <g transform={`rotate(-15 ${hx} ${hy})`}>
   <ellipse cx={hx} cy={hy} rx={.095} ry={.115}/>
   <path d={`M${hx-.115},${hy-.01} C${hx-.12},${hy+.15} ${hx+.08},${hy+.17} ${hx+.11},${hy+.06} L${hx+.088},${hy+.048} L${hx+.02},${hy+.05} L${hx-.03},${hy} L${hx-.06},${hy-.065} L${hx-.112},${hy-.065} Z`} className="gear"/>
   <rect x={hx+.075} y={hy+.06} width={.035} height={.03} className="pouch"/>
   <path d={`M${hx-.09},${hy+.05} L${hx+.05},${hy+.08}`} className="seam"/>
   <ellipse cx={hx-.015} cy={hy-.025} rx={.038} ry={.048} className="pouch"/>
  </g>
  <path d={`M${E+.01},.0 L${E+.035},-.03 L${E+.005},-.045 Z`}/>
  <Seg a={[b+.08,-.38]} b={grip} wa={.095} wb={.07}/>
  <g transform={`translate(${b} ${by}) scale(${IN})`}><Weapon gun={gun} barrelIn={barrelIn} sightIn={sightM/IN}/></g>
  <circle cx={grip[0]} cy={grip[1]} r={.038} className="glove"/>
  <Seg a={[b-.02,-.18]} b={[b+.3,-.3]} wa={.11} wb={.095}/><Seg a={[b+.3,-.3]} b={sup} wa={.095} wb={.07}/>
  <circle cx={sup[0]} cy={sup[1]} r={.038} className="glove"/>
 </g>}
