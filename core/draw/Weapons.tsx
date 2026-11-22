// Side-view rifles, true size, in inches: x from the butt plate, y up from the bore axis.
// c = sight height (centre of the optic, on the line of sight); the muzzle sits at `off + barrel`.
import type {GunId} from '../guns'
import {useKit} from './kit'
type G={barrelIn:number;c:number}
/** Riflescope on rings or a mount block rising from `base`. */
function Scope({x,len,c,obj,base,rings}:{x:number;len:number;c:number;obj:number;base:number;rings:[number,number]}){
 const k=useKit()
 const e=x+len
 return <k.G>
  {rings.map(r=>c-.5>base&&<k.Rect key={r} x={r} y={base} width={.9} height={c-base} {...k.st('ar.pad')}/>)}
  <k.Rect x={x} y={c-.72} width={2.8} height={1.44} rx={.25}/>
  <k.Rect x={x+2.8} y={c-.5} width={len-7} height={1}/>
  <k.Rect x={x+len*.42} y={c+.45} width={1.1} height={.8} rx={.12}/>
  <k.Path d={`M${e-4.2},${c-.5} L${e-2.8},${c-obj} L${e},${c-obj} L${e},${c+obj} L${e-2.8},${c+obj} L${e-4.2},${c+.5} Z`}/>
 </k.G>}
/** EOTech holographic sight (EXPS3-style) sitting on a picatinny rail at `rail`. */
function EOTech({x,c,rail}:{x:number;c:number;rail:number}){
 const k=useKit()
 return <k.G>
  <k.Path d={`M${x},${rail} L${x+3.9},${rail} L${x+3.9},${c-.55} L${x+3.5},${c+.9} L${x+.45},${c+.9} L${x},${c+.45} Z`}/>
  <k.Rect x={x+.5} y={c-.45} width={2.9} height={1.05} rx={.12} {...k.st('ar.det')}/>
  <k.Rect x={x+.2} y={rail} width={3.5} height={Math.max(.2,c-.65-rail)} {...k.st('ar.pad')}/>
  <k.Circle cx={x+1.2} cy={c-.9} r={.18} {...k.st('ar.pad')}/><k.Circle cx={x+2.6} cy={c-.9} r={.18} {...k.st('ar.pad')}/>
 </k.G>}
function AR({barrelIn,c,big}:G&{big:boolean}){
 const k=useKit()
 const off=big?20.5:19.2,mz=off+barrelIn,hg=Math.min(Math.max(barrelIn-3.5,2),15),rx=big?22.6:21.6,he=rx+hg
 const gas=barrelIn<=11?4:barrelIn<=16?7:barrelIn<=18?9:12,gb=off+gas
 return <k.G>
  <k.Path d="M0,1.1 L0.6,1.25 L7,0.95 L7.4,0.7 L7.4,-0.7 L1.2,-4.2 L0.4,-4.4 L0,-4.2 Z"/>
  <k.Rect x={-.45} y={-4.35} width={.5} height={5.6} rx={.2} {...k.st('ar.pad')}/>
  <k.Rect x={7.3} y={-.6} width={3.4} height={1.2}/>
  <k.Path d="M12.3,-1.6 L13.6,-1.7 L12.5,-5.6 Q12.3,-6 11.7,-5.95 L10.8,-5.7 L10.9,-5.2 Z"/>
  {big?<k.Path d="M17,-3 L20.6,-3 L21,-8 L17.4,-8.1 Z"/>
  :<><k.Path d="M16.5,-3 L19.7,-3 Q20.2,-6 21.3,-8.7 L18.6,-9.5 Q17.5,-6.3 16.5,-3 Z"/><k.Path d="M18.5,-9.55 L21.4,-8.75 L21.3,-8.4 L18.4,-9.2 Z" {...k.st('ar.pad')}/></>}
  <k.Path d={`M10.6,-0.55 L${rx-1.8},-0.55 L${rx-1.8},-3 L16.4,-3 L16.2,-1.75 L12.4,-1.75 L11,-1.35 L10.6,-0.9 Z`}/>
  <k.Path d="M13.6,-1.75 L13.7,-2.45 L16.4,-2.45 L16.3,-1.8" {...k.st('ar.ln')}/>
  <k.Path d="M14.6,-1.75 Q14.95,-2.05 14.75,-2.3" {...k.st('ar.ln')}/>
  <k.Rect x={10.6} y={-.55} width={rx-10.6} height={big?1.7:1.5}/>
  <k.Rect x={9.9} y={.55} width={.8} height={.4}/>
  <k.Circle cx={11.7} cy={.05} r={.33} {...k.st('ar.pad')}/>
  <k.Rect x={13} y={-.3} width={3.4} height={.6} {...k.st('ar.det')}/>
  {gb>he&&<k.Rect x={gb-.4} y={-.5} width={.8} height={1.05}/>}
  <k.Rect x={he-.2} y={-.31} width={mz-he+.2} height={.62}/>
  <k.Rect x={mz} y={-.42} width={2} height={.84}/>
  <k.Path d={`M${mz+.5},-.2 L${mz+1.6},-.2 M${mz+.5},.2 L${mz+1.6},.2`} {...k.st('ar.ln')}/>
  <k.Rect x={rx} y={-1} width={hg} height={2} rx={.15}/>
  {Array.from({length:Math.floor((hg-1.5)/1.6)},(_,i)=><k.Rect key={i} x={rx+.8+i*1.6} y={-.35} width={1.1} height={.3} rx={.15} {...k.st('ar.det')}/>)}
  <k.Rect x={10.8} y={.95} width={he-10.8} height={.4}/>
  <k.Path d={`M10.9,1.35 L${he-.1},1.35`} strokeDasharray=".2 .2" {...k.st('ar.ln')}/>
  {big?<Scope x={11.4} len={12.5} c={c} obj={.95} base={1.35} rings={[14.2,19.6]}/>:<EOTech x={14.2} c={c} rail={1.35}/>}
 </k.G>}
function Bolt({barrelIn,c}:G){
 const k=useKit()
 const mz=20.5+barrelIn,fe=Math.min(31,mz-5)
 return <k.G>
  <k.Path d={`M0,1 L0,-4.9 Q0.2,-5.2 0.8,-5 L10.5,-2.1 Q11.6,-1.9 12.3,-2.7 L12.7,-3.9 Q13.1,-4.4 13.9,-4 L14,-1.9 L16.5,-1.8 L${fe},-1.3 Q${fe+1},-1.1 ${fe+1},-0.6 L${fe+1},-0.3 L12,-0.6 L11,-0.25 L9,0.6 Q7,1.1 4,1.1 Z`}/>
  <k.Rect x={-.6} y={-5} width={.65} height={6.1} rx={.2} {...k.st('ar.pad')}/>
  <k.Path d="M14,-1.9 L14.1,-2.6 L16.4,-2.6 L16.5,-1.8" {...k.st('ar.ln')}/>
  <k.Path d={`M21,-.55 L${mz},-.33 L${mz},.33 L21,.55 Z`}/>
  <k.Rect x={12} y={-.62} width={9.2} height={1.24} rx={.3}/>
  <k.Path d="M13.4,.2 Q13,-.6 12.6,-1.2" {...k.st('ar.ln')}/><k.Circle cx={12.5} cy={-1.35} r={.38}/>
  <Scope x={10.6} len={13.5} c={c} obj={1.05} base={.6} rings={[13.6,18.8]}/>
 </k.G>}
/** Red dot (Aimpoint-style) on a side mount. */
function RedDot({x,c,base}:{x:number;c:number;base:number}){
 const k=useKit()
 return <k.G>
  <k.Rect x={x+.8} y={base} width={3.6} height={Math.max(.2,c-.5-base)} {...k.st('ar.pad')}/>
  <k.Rect x={x} y={c-.62} width={5.2} height={1.24} rx={.2}/>
  <k.Rect x={x+.3} y={c-.78} width={.7} height={1.56} rx={.15}/><k.Rect x={x+4.2} y={c-.78} width={.7} height={1.56} rx={.15}/>
  <k.Rect x={x+2.2} y={c+.55} width={.9} height={.5} rx={.1}/>
 </k.G>}
function AK({barrelIn,c}:G){
 const k=useKit()
 const mz=17.7+barrelIn,gb=Math.max(mz-5.5,20.4),he=Math.min(26.5,gb-.7)
 return <k.G>
  <k.Path d="M0,-1.1 L0,-5 Q0.2,-5.3 0.8,-5.15 L9.2,-1.8 L9.2,-0.4 L0.9,-0.85 Z"/>
  <k.Rect x={-.35} y={-5.1} width={.4} height={4.1} rx={.1} {...k.st('ar.pad')}/>
  <k.Path d="M10.3,-1.7 L11.7,-1.7 L11.4,-5.2 Q11.2,-5.5 10.6,-5.4 L9.6,-5.1 Z"/>
  <k.Path d="M12.2,-1.7 L12.3,-2.4 L15.4,-2.4 L15.6,-1.7" {...k.st('ar.ln')}/>
  <k.Path d="M15.6,-1.7 L18.5,-1.7 Q19.6,-6 22.5,-9.6 L19.6,-10.6 Q17,-6.3 15.6,-1.7 Z"/>
  <k.Path d="M9,-1.7 L19.6,-1.7 L19.6,.55 L10.5,.75 Q9.4,.75 9,.2 Z"/>
  <k.Path d="M10.6,-.35 L16.4,-.35" {...k.st('ar.ln')}/>
  <k.Rect x={18.6} y={.4} width={1.3} height={.55} {...k.st('ar.pad')}/>
  <k.Rect x={19.6} y={-.33} width={mz-19.6} height={.66}/>
  <k.Rect x={gb-.6} y={-.45} width={1.2} height={1.55}/>
  {he>20.5&&<k.Rect x={20.5} y={.3} width={Math.min(27.5,gb-.6)-20.5} height={.75} rx={.3} {...k.st('ar.pad')}/>}
  {he>19.6&&<k.Rect x={19.6} y={-1.5} width={he-19.6} height={1.45} rx={.3} {...k.st('ar.pad')}/>}
  <k.Rect x={mz-2.4} y={-.55} width={1.2} height={1.1}/>
  <k.Path d={`M${mz-1.9},.55 L${mz-1.9},1.9 M${mz-2.3},1.2 L${mz-2.3},2 M${mz-1.5},1.2 L${mz-1.5},2`} {...k.st('ar.ln')}/>
  <k.Path d={`M${mz},-.4 L${mz+1.2},-.4 L${mz+1.5},.4 L${mz},.4 Z`}/>
  <RedDot x={12} c={c} base={.6}/>
 </k.G>}
function SVD({barrelIn,c}:G){
 const k=useKit()
 const mz=20.5+barrelIn,he=Math.min(33,mz-3)
 return <k.G>
  <k.Path fillRule="evenodd" d="M0,-.2 L0,-5.4 Q0.3,-5.7 1,-5.5 L9.5,-3.6 L12.6,-5.2 Q13,-5.6 13.8,-5.2 L13.9,-1.6 L9.5,-.5 L.8,-.2 Z M2.2,-1.3 L9.2,-1.3 L11.2,-2.3 L11.6,-3.4 L9.2,-2.9 L2.2,-3.5 Z"/>
  <k.Rect x={-.4} y={-5.5} width={.45} height={5.3} rx={.1} {...k.st('ar.pad')}/>
  <k.Rect x={3} y={-.25} width={5.5} height={.8} rx={.3} {...k.st('ar.pad')}/>
  <k.Path d="M13.6,-1.6 L23,-1.6 L23,.6 L14.6,.75 Q13.8,.7 13.6,.1 Z"/>
  <k.Path d="M14.4,-1.6 L14.5,-2.4 L17,-2.4 L17.1,-1.6" {...k.st('ar.ln')}/>
  <k.Path d="M17.5,-1.6 L20.5,-1.6 L21.3,-6 L18.2,-6.2 Z"/>
  <k.Rect x={23} y={-.35} width={mz-23} height={.7}/>
  <k.Rect x={23} y={-1.3} width={he-23} height={2.3} rx={.5} {...k.st('ar.pad')}/>
  {Array.from({length:Math.floor((he-24)/1.5)},(_,i)=><k.Rect key={i} x={24+i*1.5} y={-.1} width={.8} height={.6} rx={.1} {...k.st('ar.det')}/>)}
  <k.Path d={`M${mz-1},.35 L${mz-1},1.5`} {...k.st('ar.ln')}/>
  <k.Rect x={mz} y={-.45} width={3.3} height={.9}/>
  <k.Path d={`M${mz+.6},0 L${mz+2.8},0`} {...k.st('ar.ln')}/>
  <k.Rect x={15} y={.6} width={6} height={Math.max(.2,c-.45-.6)} {...k.st('ar.pad')}/>
  <k.Rect x={10.4} y={c-.6} width={2.6} height={1.2} rx={.4}/>
  <k.Rect x={13} y={c-.45} width={7.4} height={.9}/>
  <k.Rect x={16.4} y={c+.4} width={1.1} height={.75} rx={.1}/>
  <k.Path d={`M20.4,${c-.45} L21.2,${c-.7} L23.4,${c-.7} L23.4,${c+.7} L21.2,${c+.7} L20.4,${c+.45} Z`}/>
 </k.G>}
export function Weapon({gun,barrelIn,sightIn}:{gun:GunId;barrelIn:number;sightIn:number}){
 const k=useKit()
 const p={barrelIn,c:sightIn}
 return <k.G {...k.st('ar')}>{gun==='ar15'?<AR {...p} big={false}/>:gun==='ar10'?<AR {...p} big/>:gun==='bolt'?<Bolt {...p}/>:gun==='ak'?<AK {...p}/>:<SVD {...p}/>}</k.G>}
