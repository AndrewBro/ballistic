// Standard targets, face-on, in metres: origin at the bottom centre of the target, x to the shooter's right, y up.
// !! Zone sizes are approximate (prototype) and must be checked against the official drawings.
type Shape={t:'c';cx:number;cy:number;r:number}|{t:'e';cx:number;cy:number;rx:number;ry:number}|{t:'r';x:number;y:number;w:number;h:number}|{t:'p';q:[number,number][]}
interface Zone{name:string;s:Shape[]} // a point is in the zone if it is in any of its shapes
export interface Target{id:string;name:string;w:number;h:number;look:'card'|'army'|'steel';outline:Shape[];zones:Zone[];aim:{c:number;h?:number}} // zones: innermost first; aim: heights of the centre / head aim points
const P=(...q:number[]):Shape=>({t:'p',q:q.reduce<[number,number][]>((a,v,i)=>(i%2?a[a.length-1].push(v):a.push([v] as any),a),[])})
const IDPA_BODY=P(-.2286,0,.2286,0,.2286,.52,.1143,.6096,.0762,.6096,.0762,.762,-.0762,.762,-.0762,.6096,-.1143,.6096,-.2286,.52)
export const TARGETS:Target[]=[
 {id:'idpa',name:'IDPA',w:.457,h:.762,look:'card',outline:[IDPA_BODY],aim:{c:.4572,h:.686},zones:[
  {name:'−0',s:[{t:'c',cx:0,cy:.4572,r:.1016},{t:'c',cx:0,cy:.686,r:.0508}]},
  {name:'−1',s:[{t:'r',x:-.1524,y:.2032,w:.3048,h:.4064},{t:'r',x:-.0762,y:.6096,w:.1524,h:.1524}]},
  {name:'−3',s:[IDPA_BODY]}]},
 {id:'ipsc',name:'IPSC / USPSA',w:.46,h:.6,look:'card',aim:{c:.23,h:.56},
  outline:[P(-.15,0,.15,0,.23,.08,.23,.38,.15,.46,.075,.46,.075,.6,-.075,.6,-.075,.46,-.15,.46,-.23,.38,-.23,.08)],zones:[
  {name:'A',s:[{t:'r',x:-.075,y:.09,w:.15,h:.28},{t:'r',x:-.075,y:.53,w:.15,h:.05}]},
  {name:'C',s:[{t:'r',x:-.15,y:.02,w:.3,h:.42},{t:'r',x:-.075,y:.46,w:.15,h:.14}]},
  {name:'D',s:[P(-.15,0,.15,0,.23,.08,.23,.38,.15,.46,-.15,.46,-.23,.38,-.23,.08)]}]},
 {id:'n4',name:'Грудна мішень №4',w:.5,h:.5,look:'army',aim:{c:.18},
  outline:[P(-.25,0,.25,0,.25,.2,.2,.27,.1,.3,-.1,.3,-.2,.27,-.25,.2),{t:'e',cx:0,cy:.38,rx:.085,ry:.11}],zones:[]},
 {id:'n6',name:'Ростова фігура №6',w:.5,h:1.5,look:'army',aim:{c:.9,h:1.38},
  outline:[P(-.17,0,-.04,0,0,.6,.04,.6,.17,0,.2,.7,.25,1.1,.22,1.22,.1,1.27,-.1,1.27,-.22,1.22,-.25,1.1,-.2,.7),{t:'e',cx:0,cy:1.38,rx:.085,ry:.11}],zones:[]},
 {id:'steel',name:'Сталева пластина 25 см',w:.25,h:.25,look:'steel',aim:{c:.125},outline:[{t:'c',cx:0,cy:.125,r:.125}],zones:[]},
 {id:'head',name:'Голова 15 × 20 см',w:.15,h:.2,look:'card',aim:{c:.1},outline:[{t:'e',cx:0,cy:.1,rx:.075,ry:.1}],zones:[]}]
const inShape=(s:Shape,x:number,y:number)=>{
 if(s.t==='c')return Math.hypot(x-s.cx,y-s.cy)<=s.r
 if(s.t==='e')return((x-s.cx)/s.rx)**2+((y-s.cy)/s.ry)**2<=1
 if(s.t==='r')return x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h
 let c=false;for(let i=0,j=s.q.length-1;i<s.q.length;j=i++){const [xi,yi]=s.q[i],[xj,yj]=s.q[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
/** Zone hit at (x,y) on the target: a zone name, 'hit' for targets without zones, or null for a miss. */
export const zoneAt=(t:Target,x:number,y:number)=>{if(!t.outline.some(s=>inShape(s,x,y)))return null;return t.zones.find(z=>z.s.some(s=>inShape(s,x,y)))?.name??'hit'}
const draw=(s:Shape,cls:string,k:number)=>s.t==='c'?<circle key={k} cx={s.cx} cy={s.cy} r={s.r} className={cls}/>:s.t==='e'?<ellipse key={k} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} className={cls}/>
 :s.t==='r'?<rect key={k} x={s.x} y={s.y} width={s.w} height={s.h} className={cls}/>:<polygon key={k} points={s.q.map(p=>p.join(',')).join(' ')} className={cls}/>
/** Target face (y up, metres). Army silhouettes sit on a white sheet. */
export function TargetFace({t}:{t:Target}){
 return <g className={'tgt '+t.look}>
  {t.look==='army'&&<rect x={-t.w/2-.03} y={-.03} width={t.w+.06} height={t.h+.06} className="sheet"/>}
  {t.outline.map((s,i)=>draw(s,'body',i))}
  {[...t.zones].reverse().map((z,i)=>z.s.map((s,j)=>draw(s,'zone',i*10+j)))}
 </g>}
