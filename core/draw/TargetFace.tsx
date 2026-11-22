// Target face drawing; the target data and hit test live in core/targets.
import type {Shape,Target} from '../targets'
import {Kit,useKit} from './kit'
const draw=(k:Kit,s:Shape,key:string,i:number)=>{const st=k.st(key)
 return s.t==='c'?<k.Circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...st}/>:s.t==='e'?<k.Ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...st}/>
 :s.t==='r'?<k.Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} {...st}/>:<k.Polygon key={i} points={s.q.map(p=>p.join(',')).join(' ')} {...st}/>}
/** Target face (y up, metres). Army silhouettes sit on a white sheet. */
export function TargetFace({t}:{t:Target}){
 const k=useKit()
 return <k.G {...k.st('tgt.'+t.look)}>
  {t.look==='army'&&<k.Rect x={-t.w/2-.03} y={-.03} width={t.w+.06} height={t.h+.06} {...k.st('tgt.sheet')}/>}
  {t.outline.map((s,i)=>draw(k,s,'tgt.body.'+t.look,i))}
  {[...t.zones].reverse().map((z,i)=>z.s.map((s,j)=>draw(k,s,'tgt.zone',i*10+j)))}
 </k.G>}
