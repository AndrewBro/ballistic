import {useEffect,useRef,useState} from 'react'
import {Result,ptAt} from './core/ballistics'
import {Shooter,GROUND,eyeX,figLeft} from './Shooter'
import {gunFor} from './Weapons'
import type {S} from './App'
import type {Key} from './i18n'
// Heights always share one scale with the shooter (ky, px per metre). Realistic view: distance uses the same scale (kx = ky).
// Schematic view: distance is compressed so the whole trajectory fills the width; zooming stretches distance back towards 1:1.
// View: zoom factor over the fitted scale and the world point (m) at the centre of the plot.
interface View{z:number;cx:number;cy:number}
const NICE=[.01,.02,.05,.1,.2,.5,1,2,5,10,20,50,100,200]
export function Chart({res,s,t,shot,reset,range}:{res:Result;s:S;t:(k:Key)=>string;shot:number;reset:number;range:number}){
 const box=useRef<HTMLDivElement>(null)
 const [sz,setSz]=useState({w:900,h:600}),[view,setView]=useState<View|null>(null),[mx,setMx]=useState<number|null>(null),[prog,setProg]=useState(0)
 const drag=useRef<{x:number;y:number;v:View}|null>(null)
 useEffect(()=>{const ro=new ResizeObserver(e=>setSz({w:e[0].contentRect.width,h:e[0].contentRect.height}));ro.observe(box.current!);return()=>ro.disconnect()},[])
 useEffect(()=>setView(null),[reset,s.real])
 useEffect(()=>{let r=0,t0=0;const f=(n:number)=>{t0||=n;const u=Math.min((n-t0)/3600,1);setProg(1-Math.pow(1-u,3));if(u<1)r=requestAnimationFrame(f)};r=requestAnimationFrame(f);return()=>cancelAnimationFrame(r)},[shot])
 // keep the top clear for the readout panel so it never covers the trajectory
 const {w,h}=sz,pl=24,pr=w-24,pt=200,pb=h-44,PW=pr-pl,PH=pb-pt
 const kd=s.imp?1.09361:1,kh=s.imp?39.3701:100,uh=s.imp?'in':'cm',ud=s.imp?'yd':'m'
 // world bounds: shooter + trajectory; the view never leaves them
 const hmax=Math.max(...res.pts.map(p=>p.h)),hmin=Math.min(...res.pts.map(p=>p.h))
 const gun=gunFor(s.cal),fw=.2-figLeft(gun,s.barrel),bx1=range*1.02,by0=Math.min(GROUND,hmin)-.1,by1=Math.max(.25,hmax+.1)
 // deepest zoom: everything from the ground to the top of the trajectory still fits, the shooter takes at most a third of the width
 const kFull=Math.min(PH/(by1-by0),PW*.35/fw)
 const kMin=s.real?Math.min(PW/(bx1+fw),kFull):kFull,kxMin=s.real?kMin:(PW-fw*kFull)/bx1
 const zMax=Math.max(1,s.real?kFull/kMin:kFull/kxMin)
 const sc=(z:number)=>s.real?{kx:kMin*z,ky:kMin*z}:{kx:kxMin*z,ky:kFull}
 const fit=(v:View):View=>{const z=Math.min(Math.max(v.z,1),zMax),{kx,ky}=sc(z)
  const cl=(c:number,a:number,b:number,half:number)=>b-a<=2*half?(a+b)/2:Math.min(Math.max(c,a+half),b-half)
  return{z,cx:cl(v.cx,-fw*ky/kx,bx1,PW/2/kx),cy:cl(v.cy,by0,by1,PH/2/ky)}}
 const v=fit(view??{z:1,cx:0,cy:0}),{kx,ky}=sc(v.z),k=ky,mxp=pl+PW/2,myp=pt+PH/2
 const X=(m:number)=>mxp+(m-v.cx)*kx,Y=(m:number)=>myp-(m-v.cy)*ky,inv=(px:number)=>v.cx+(px-mxp)/kx
 const d=(()=>{const st=Math.max(1,Math.floor(res.pts.length/800));return res.pts.filter((_,i)=>i%st===0||i===res.pts.length-1).map((p,i)=>(i?'L':'M')+X(p.s).toFixed(1)+' '+Y(p.h).toFixed(1)).join('')})()
 const bp=res.pts[Math.floor(prog*(res.pts.length-1))]
 // distance axis sits on the ground at the shooter's feet; it sticks to the edge when the ground is off screen
 const ya=Math.min(Math.max(Y(GROUND),pt+10),h-46)
 const stepU=s.step*kx/kd>PW/3?NICE.find(n=>n*kx/kd>=70)??s.step:s.step,stepM=stepU/kd,every=Math.max(1,Math.ceil(44/(stepM*kx)))
 const ticks:number[]=[];for(let n=Math.max(0,Math.ceil(inv(0)/stepM));n*stepM<=Math.min(inv(w),bx1)&&ticks.length<400;n++)ticks.push(n*stepM)
 const hp=mx!==null&&prog>=1&&!drag.current?ptAt(res.pts,Math.min(Math.max(inv(mx),0),range)):null
 const bar=NICE.find(n=>n*k>=40)??200,barPx=bar*k
 const fmtBar=s.imp?(bar<1?(bar*39.3701).toFixed(bar<.05?1:0)+' in':(bar*3.28084).toFixed(bar<5?1:0)+' ft'):bar>=1?bar+' m':(bar*100).toFixed(0)+' cm'
 const onMove=(e:React.MouseEvent<SVGSVGElement>)=>{const px=e.nativeEvent.offsetX,py=e.nativeEvent.offsetY;setMx(px>=X(0)&&px<=X(range)?px:null)
  const g=drag.current;if(g)setView(fit({z:g.v.z,cx:g.v.cx-(px-g.x)/kx,cy:g.v.cy+(py-g.y)/ky}))}
 const onWheel=(e:React.WheelEvent)=>{const px=e.nativeEvent.offsetX,py=e.nativeEvent.offsetY,f=Math.exp(-e.deltaY*.002)
  const z=Math.min(Math.max(v.z*f,1),zMax),n=sc(z),wx=inv(px),wy=v.cy-(py-myp)/ky
  setView(fit({z,cx:wx-(px-mxp)/n.kx,cy:wy+(py-myp)/n.ky}))}
 const zy=(c:number,i:number)=>Y(0)-(i&&(c-res.crossings[0])*kx<130?30:14)
 // the apex label climbs above any zero label it would overlap
 const ay=res.crossings.reduce((y,c,i)=>Math.abs(X(c)-X(res.apex.s))<150?Math.min(y,zy(c,i)-18):y,Y(res.apex.h)-12)
 const zl=(c:number,i:number)=><g key={i}><circle cx={X(c)} cy={Y(0)} r="5" className="zr"/><text x={X(c)} y={zy(c,i)} className="lb zt">{t(i?'z2':'z1')} · {(c*kd).toFixed(0)}{ud}</text></g>
 return <div ref={box} className="chart"><svg width={w} height={h} onMouseMove={onMove} onMouseLeave={()=>{setMx(null);drag.current=null}} onWheel={onWheel} onDoubleClick={()=>setView(null)}
  onMouseDown={e=>{drag.current={x:e.nativeEvent.offsetX,y:e.nativeEvent.offsetY,v}}} onMouseUp={()=>{drag.current=null}} style={{cursor:drag.current?'grabbing':'grab'}}>
  <defs><radialGradient id="gold"><stop offset="0" stopColor="#fff8e1"/><stop offset=".45" stopColor="#ffd54f"/><stop offset="1" stopColor="#c99700"/></radialGradient></defs>
  {ticks.map((m,i)=><line key={'g'+i} x1={X(m)} x2={X(m)} y1={0} y2={h} className="grid"/>)}
  <rect x={0} y={Y(GROUND)} width={w} height={Math.max(0,h-Y(GROUND))} className="soil"/>
  <line x1={0} x2={w} y1={Y(GROUND)} y2={Y(GROUND)} className="gnd"/>
  <g transform={`translate(${X(0)} ${Y(0)}) scale(${k} ${-k})`}><Shooter gun={gun} barrelIn={s.barrel} sightM={s.sight/1000}/></g>
  <line x1={X(0)+eyeX(gun,s.barrel)*ky} x2={X(range)} y1={Y(0)} y2={Y(0)} className="los"/>
  <path d={d} pathLength={1} className="traj" strokeDasharray="1" strokeDashoffset={1-prog}/>
  {res.crossings.filter(c=>c<=range).map(zl)}
  {prog>=1&&<g><line x1={X(res.apex.s)} x2={X(res.apex.s)} y1={Y(0)} y2={Y(res.apex.h)} className="ap"/><circle cx={X(res.apex.s)} cy={Y(res.apex.h)} r="4" className="apc"/><text x={X(res.apex.s)} y={ay} className="lb at">{t('apexL')} +{(res.apex.h*kh).toFixed(1)}{uh} @ {(res.apex.s*kd).toFixed(0)}{ud}</text></g>}
  {hp&&<g><line x1={X(hp.s)} x2={X(hp.s)} y1={0} y2={ya} className="cur"/><line x1={X(hp.s)} x2={X(hp.s)} y1={Y(0)} y2={Y(hp.h)} className="dh"/><circle cx={X(hp.s)} cy={Y(hp.h)} r="4" className="apc"/></g>}
  {bp&&prog<1&&<circle cx={X(bp.s)} cy={Y(bp.h)} r="5" fill="url(#gold)" className="bul"/>}
  <g>{ticks.map((m,i)=><g key={'t'+i}><line x1={X(m)} x2={X(m)} y1={ya} y2={ya+(i%every?4:8)} className="axis"/>{i%every===0&&<text x={X(m)} y={ya+22} className="lb tk">{(m*kd).toFixed(0)}</text>}</g>)}
   <text x={Math.min(X(bx1),w-8)} y={ya+38} className="lb tr">{ud}</text></g>
  <g transform={`translate(${w-30} ${pt+10})`}><line x1={0} x2={0} y1={0} y2={barPx} className="sbar"/><line x1={-5} x2={5} y1={0} y2={0} className="sbar"/><line x1={-5} x2={5} y1={barPx} y2={barPx} className="sbar"/>
   <text x={-10} y={barPx/2+4} className="lb tr">{fmtBar}</text></g>
  {ky/kx>1.05&&<text x={pl} y={22} className="lb cmp">{t('squeeze')} ×{(ky/kx).toFixed(ky/kx<10?1:0)}</text>}
 </svg>
 {hp&&<div className="tip"><div><span>{t('dist')}</span>{(hp.s*kd).toFixed(0)} {ud}</div><div><span>{t('h')}</span>{hp.h>=0?'+':''}{(hp.h*kh).toFixed(1)} {uh}</div><div><span>{t('spd')}</span>{(hp.v*(s.imp?3.28084:1)).toFixed(0)} {s.imp?'fps':'m/s'}</div><div><span>{t('time')}</span>{hp.t.toFixed(2)} s</div><div><span>{t('drift')}</span>{(hp.z*kh).toFixed(1)} {uh}</div></div>}
 </div>}
