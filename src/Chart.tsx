import {useEffect,useRef,useState} from 'react'
import {Result,ptAt} from '../core/ballistics'
import {Shooter,GROUND,eyeX,figLeft} from '../core/draw/Shooter'
import {gunFor} from '../core/guns'
import {Target,zoneAt} from '../core/targets'
import {TargetFace} from '../core/draw/TargetFace'
import type {S} from './App'
import type {Key} from './i18n'
// Heights always share one scale with the shooter (ky, px per metre). Realistic view: distance uses the same scale (kx = ky).
// Schematic view: distance is compressed so the whole trajectory fills the width; zooming stretches distance back towards 1:1.
// View: zoom factor over the fitted scale and the world point (m) at the centre of the plot.
interface View{z:number;cx:number;cy:number}
const NICE=[.01,.02,.05,.1,.2,.5,1,2,5,10,20,50,100,200]
export interface Tgt{t:Target;d:number;aim:'c'|'h';face:boolean} // face: turned to the viewer instead of side-on
export function Chart({res,s,t,shot,reset,range,wall,target,onTarget,onFace}:{res:Result;s:S;t:(k:Key)=>string;shot:number;reset:number;range:number;wall:number|null;target:Tgt|null;onTarget:(d:number)=>void;onFace:(o:{tfB?:number;tfW?:number;tfR?:number;tfOn?:boolean})=>void}){
 const box=useRef<HTMLDivElement>(null)
 const [sz,setSz]=useState({w:900,h:600}),[view,setView]=useState<View|null>(null),[mx,setMx]=useState<number|null>(null),[my,setMy]=useState(0),[prog,setProg]=useState(0)
 const drag=useRef<{x:number;y:number;v:View}|null>(null),svg=useRef<SVGSVGElement>(null),wheel=useRef<(e:WheelEvent)=>void>(()=>{})
 const ptrs=useRef(new Map<number,[number,number]>()),pinch=useRef<{d:number;mx:number;my:number;v:View}|null>(null)
 // wheel/trackpad-pinch must be caught with a non-passive listener, otherwise the browser zooms the whole page
 useEffect(()=>{const el=svg.current!,h=(e:WheelEvent)=>wheel.current(e);el.addEventListener('wheel',h,{passive:false});return()=>el.removeEventListener('wheel',h)},[])
 useEffect(()=>{const ro=new ResizeObserver(e=>setSz({w:e[0].contentRect.width,h:e[0].contentRect.height}));ro.observe(box.current!);return()=>ro.disconnect()},[])
 useEffect(()=>setView(null),[reset,s.real])
 useEffect(()=>{let r=0,t0=0;const f=(n:number)=>{t0||=n;const u=Math.min((n-t0)/3600,1);setProg(1-Math.pow(1-u,3));if(u<1)r=requestAnimationFrame(f)};r=requestAnimationFrame(f);return()=>cancelAnimationFrame(r)},[shot])
 // keep the top clear for the readout panel so it never covers the trajectory
 const {w,h}=sz,pl=24,pr=w-80,pt=44,pb=h-44,PW=pr-pl,PH=pb-pt
 const kd=s.imp?1.09361:1,kh=s.imp?39.3701:100,uh=s.imp?'in':'cm',ud=s.imp?'yd':'m'
 // world bounds: shooter + trajectory; the view never leaves them
 const hmax=Math.max(...res.pts.map(p=>p.h)),hmin=Math.min(...res.pts.map(p=>p.h))
 const gun=gunFor(s.cal),fw=.2-figLeft(gun,s.barrel),bx1=range*1.02,ext=Math.max(.1-Math.min(GROUND,hmin),.25,hmax+.1),by0=-ext,by1=ext // symmetric around the line of sight, so it always sits at the vertical centre
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
 // with a wall, the readout stays pinned to the impact point unless the cursor points elsewhere
 const hit=wall!==null&&prog>=1?res.pts[res.pts.length-1]:null,rp=hp??hit
 // target: its aim point sits on the line of sight; the impact is the trajectory height (and drift) at its distance
 const tg=target&&(()=>{const {t:tt,d}=target,ay=target.aim==='h'?tt.aim.h!:tt.aim.c,bot=-ay,q=ptAt(res.pts,d)
  return{tt,d,ay,bot,q,zone:q?zoneAt(tt,q.z,ay+q.h):null}})()
 const tgDrag=useRef(false)
 // shooter's-view panel (never wider than the chart, for phones): press anywhere on it and drag to move it, drag the corner grip to resize; kept inside the chart
 const fWid=Math.min(Math.max(s.tfW,180),Math.min(560,w-40),w-16),fBot=Math.min(Math.max(s.tfB,8),Math.max(8,h-fWid*.66-90)),fRt=Math.min(Math.max(s.tfR,8),Math.max(8,w-fWid-8))
 const faceDrag=(kind:'move'|'size')=>(e:React.PointerEvent<HTMLDivElement>)=>{e.stopPropagation();const el=e.currentTarget,x0=e.clientX,y0=e.clientY,b0=fBot,r0=fRt,w0=fWid
  try{el.setPointerCapture(e.pointerId)}catch{}
  const mv=(m:PointerEvent)=>onFace(kind==='move'?{tfB:b0-(m.clientY-y0),tfR:r0-(m.clientX-x0)}:{tfW:w0-(m.clientX-x0)})
  const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)}
  el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
 // the readout floats next to the cursor (or the impact point) and flips to stay inside the chart
 const tw=190,th=s.mode==='pro'?122:100,ax=hp?mx!:hit?X(wall!):0,ay2=hp?my:hit?Y(hit.h):0
 const tl=ax+16+tw>w?ax-16-tw:ax+16,tt=Math.min(Math.max(ay2-th-16<8?ay2+16:ay2-th-16,8),h-th-8)
 // zoom so that the world point under (px,py) in view v0 ends up under (qx,qy)
 const zoomTo=(v0:View,z:number,px:number,py:number,qx=px,qy=py)=>{const k0=sc(v0.z),z1=Math.min(Math.max(z,1),zMax),n=sc(z1)
  const wx=v0.cx+(px-mxp)/k0.kx,wy=v0.cy-(py-myp)/k0.ky;setView(fit({z:z1,cx:wx-(qx-mxp)/n.kx,cy:wy+(qy-myp)/n.ky}))}
 wheel.current=e=>{e.preventDefault();const r=svg.current!.getBoundingClientRect()
  zoomTo(v,v.z*Math.exp(-e.deltaY*(e.ctrlKey?.01:.002)),e.clientX-r.left,e.clientY-r.top)}
 // pointers: one drags the view, two pinch-zoom it (touch screens); the mouse also drives the hover readout
 const pos=(e:React.PointerEvent):[number,number]=>{const r=svg.current!.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
 const mid=()=>{const [a,b]=[...ptrs.current.values()];return{d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,mx:(a[0]+b[0])/2,my:(a[1]+b[1])/2}}
 const onDown=(e:React.PointerEvent<SVGSVGElement>)=>{const [px,py]=pos(e);try{e.currentTarget.setPointerCapture(e.pointerId)}catch{} // keeps the gesture when a finger leaves the chart
  ptrs.current.set(e.pointerId,[px,py])
  if(tg&&ptrs.current.size===1&&Math.abs(px-X(tg.d))<14){tgDrag.current=true;return} // grab the target itself
  if(ptrs.current.size===2){drag.current=null;pinch.current={...mid(),v}}else if(ptrs.current.size===1)drag.current={x:px,y:py,v}}
 const onMove=(e:React.PointerEvent<SVGSVGElement>)=>{const [px,py]=pos(e);setMy(py);setMx(px>=X(0)&&px<=X(range)?px:null)
  if(!ptrs.current.has(e.pointerId))return
  if(tgDrag.current){onTarget(inv(px));return}
  ptrs.current.set(e.pointerId,[px,py])
  const pc=pinch.current;if(pc&&ptrs.current.size===2){const m=mid();zoomTo(pc.v,pc.v.z*m.d/pc.d,pc.mx,pc.my,m.mx,m.my);return}
  const g=drag.current;if(g)setView(fit({z:g.v.z,cx:g.v.cx-(px-g.x)/sc(g.v.z).kx,cy:g.v.cy+(py-g.y)/sc(g.v.z).ky}))}
 const onUp=(e:React.PointerEvent<SVGSVGElement>)=>{ptrs.current.delete(e.pointerId);pinch.current=null;tgDrag.current=false
  const left=[...ptrs.current.values()][0];drag.current=left?{x:left[0],y:left[1],v}:null}
 // point labels (zeros, apex): the name sits above the point (apex: with its height), the distance below the line of sight,
 // all distances on one level. If any of them would cross the trajectory or each other, every label turns upright together.
 const showApex=prog>=1&&res.apex.s<range-.5,CW=6.7 // px per character of the 11px mono font
 type Lab={key:string;x:number;y:number;name:string;sub:string;dist:string;cls:string;top:string}
 const labs:Lab[]=[...res.crossings.filter(c=>c<=range).map((c,i)=>({key:'z'+i,x:X(c),y:Y(0),name:t(i?'z2':'z1'),sub:'',dist:(c*kd).toFixed(0)+' '+ud,cls:'zt',top:''})),
  ...(showApex?[{key:'a',x:X(res.apex.s),y:Y(res.apex.h),name:t('apexL'),sub:`+${(res.apex.h*kh).toFixed(1)} ${uh}`,dist:(res.apex.s*kd).toFixed(0)+' '+ud,cls:'at',top:''}]:[])]
 for(const l of labs)l.top=l.sub?l.name+' '+l.sub:l.name
 const scr=res.pts.map(p=>[X(p.s),Y(p.h)])
 const hitsPath=(b:number[])=>scr.some(([x,y])=>x>=b[0]&&x<=b[2]&&y>=b[1]-2&&y<=b[3]+2)
 const over=(a:number[],b:number[])=>a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3]
 const boxes=labs.flatMap(l=>{const wt=Math.max(l.name.length,l.sub.length)*CW,wd=l.dist.length*CW,n=l.sub?2:1
  return[[l.x-wt/2-3,l.y-8-13*n-3,l.x+wt/2+3,l.y-6],[l.x-wd/2-3,Y(0)+9,l.x+wd/2+3,Y(0)+24]]})
 const vert=boxes.some((b,i)=>hitsPath(b)||boxes.some((o,j)=>j>i&&over(b,o)))
 // upright labels that would touch stack: names upwards from their point, distances downwards from the line of sight
 const up=new Map<string,number>(),dn=new Map<string,number>()
 for(const l of [...labs].sort((a,b)=>a.x-b.x)){let u=l.y-12,d=Y(0)+12
  for(const o of labs)if(up.has(o.key)&&Math.abs(o.x-l.x)<16){u=Math.min(u,up.get(o.key)!-o.top.length*CW-8);d=Math.max(d,dn.get(o.key)!+o.dist.length*CW+8)}
  up.set(l.key,u);dn.set(l.key,d)}
 return <div ref={box} className="chart"><svg ref={svg} width={w} height={h} onPointerMove={onMove} onPointerLeave={e=>{if(e.pointerType==='mouse')setMx(null)}} onDoubleClick={()=>setView(null)}
  onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={onUp} style={{cursor:drag.current?'grabbing':'grab'}}>
  <defs><radialGradient id="gold"><stop offset="0" stopColor="#fff8e1"/><stop offset=".45" stopColor="#ffd54f"/><stop offset="1" stopColor="#c99700"/></radialGradient></defs>
  {ticks.map((m,i)=><line key={'g'+i} x1={X(m)} x2={X(m)} y1={0} y2={h} className="grid"/>)}
  <rect x={0} y={Y(GROUND)} width={w} height={Math.max(0,h-Y(GROUND))} className="soil"/>
  <line x1={0} x2={w} y1={Y(GROUND)} y2={Y(GROUND)} className="gnd"/>
  {/* target sits behind the sight line, trajectory and labels; only its impact dot is drawn on top */}
  {tg&&<g className="tside">{tg.bot>GROUND&&<line x1={X(tg.d)} x2={X(tg.d)} y1={Y(tg.bot)} y2={Y(GROUND)} className="stand"/>}
   {target!.face?<g transform={`translate(${X(tg.d)} ${Y(tg.bot)}) scale(${ky} ${-ky})`}><TargetFace t={tg.tt}/></g> // face-on: true size, centred on its distance
   :<rect x={X(tg.d)-3} y={Y(tg.bot+tg.tt.h)} width={6} height={Math.max(1,(tg.tt.h)*ky)} rx={1.5} className={'board '+tg.tt.look}/>}
   </g>}
  <g transform={`translate(${X(0)} ${Y(0)}) scale(${k} ${-k})`}><Shooter gun={gun} barrelIn={s.barrel} sightM={s.sight/1000}/></g>
  <line x1={X(0)+eyeX(gun,s.barrel)*ky} x2={X(range)} y1={Y(0)} y2={Y(0)} className="los"/>
  <path d={d} pathLength={1} className="traj" strokeDasharray="1" strokeDashoffset={1-prog}/>
  {res.crossings.filter(c=>c<=range).map((c,i)=><circle key={'zc'+i} cx={X(c)} cy={Y(0)} r="5" className="zr"/>)}
  {showApex&&<g><line x1={X(res.apex.s)} x2={X(res.apex.s)} y1={Y(0)} y2={Y(res.apex.h)} className="ap"/><circle cx={X(res.apex.s)} cy={Y(res.apex.h)} r="4" className="apc"/></g>}
  {labs.map(l=>vert?<g key={l.key} className={'lb vl '+l.cls}>
    <text transform={`translate(${l.x+4} ${up.get(l.key)}) rotate(-90)`}>{l.top}</text>
    <text transform={`translate(${l.x+4} ${dn.get(l.key)}) rotate(-90)`} className="ve">{l.dist}</text></g>
   :<g key={l.key} className={'lb '+l.cls}>
    <text>{l.name&&<tspan x={l.x} y={l.y-(l.sub?26:12)}>{l.name}</tspan>}{l.sub&&<tspan x={l.x} y={l.y-12}>{l.sub}</tspan>}</text>
    <text x={l.x} y={Y(0)+20}>{l.dist}</text></g>)}
  {hp&&<g><line x1={X(hp.s)} x2={X(hp.s)} y1={0} y2={ya} className="cur"/><line x1={X(hp.s)} x2={X(hp.s)} y1={Y(0)} y2={Y(hp.h)} className="dh"/><circle cx={X(hp.s)} cy={Y(hp.h)} r="4" className="apc"/></g>}
  {tg&&tg.q&&prog>=1&&<circle cx={X(tg.d)+(target!.face?tg.q.z*ky:0)} cy={Y(tg.q.h)} r="4.5" fill="url(#gold)" className="bul"/>}
  {wall!==null&&<g><rect x={X(wall)} y={pt-20} width={6} height={Math.max(0,Y(GROUND)-pt+20)} className="wall"/>
   {hit&&<><circle cx={X(wall)} cy={Y(hit.h)} r="5" fill="url(#gold)" className="bul"/><text x={X(wall)-10} y={Y(hit.h)+(hit.h>=0?-10:18)} className="lb tr hit">{hit.h>=0?'+':''}{(hit.h*kh).toFixed(1)}{uh} @ {(wall*kd).toFixed(0)}{ud}</text></>}</g>}
  {bp&&prog<1&&<circle cx={X(bp.s)} cy={Y(bp.h)} r="5" fill="url(#gold)" className="bul"/>}
  <g>{ticks.map((m,i)=><g key={'t'+i}><line x1={X(m)} x2={X(m)} y1={ya} y2={ya+(i%every?4:8)} className="axis"/>{i%every===0&&<text x={X(m)} y={ya+22} className="lb tk">{(m*kd).toFixed(0)}</text>}</g>)}
   <text x={Math.min(X(bx1),w-8)} y={ya+38} className="lb tr">{ud}</text></g>
  {ky/kx>1.05&&<text x={s.open?pl:64} y={29} className="lb cmp">{t('squeeze')} ×{(ky/kx).toFixed(ky/kx<10?1:0)}</text>}
 </svg>
 {/* hidden when the chart is too narrow for it (a phone with the menu open) */}
 {tg&&s.tfOn&&w>=200&&(()=>{const {tt,ay,q,zone}=tg,m=Math.max(tt.w,tt.h)*.12,ix=q?q.z:0,iy=q?ay+q.h:0
  const x0=Math.min(-tt.w/2,ix)-m,x1=Math.max(tt.w/2,ix)+m,y0=Math.min(-.03,iy)-m,y1=Math.max(tt.h+.03,iy)+m,u=Math.max(tt.w,tt.h)
  return <div className="tface" style={{bottom:fBot,right:fRt,width:fWid}} onPointerDown={faceDrag('move')} onPointerEnter={()=>setMx(null)}><div className="tfg" onPointerDown={faceDrag('size')}/>
   <div className="tfh">{t('tgView')} · {tt.name}</div>
   <button className="tfx" aria-label={t('close')} title={t('close')} onPointerDown={e=>e.stopPropagation()} onClick={()=>onFace({tfOn:false})}>×</button>
   <svg style={{height:fWid*.66}} viewBox={`${x0} ${-y1} ${x1-x0} ${y1-y0}`} preserveAspectRatio="xMidYMid meet"><g transform="scale(1 -1)">
    <TargetFace t={tt}/>
    <path d={`M${-u*.05},${ay} L${u*.05},${ay} M0,${ay-u*.05} L0,${ay+u*.05}`} className="aimx" strokeWidth={u*.008}/>
    {q&&prog>=1&&<circle cx={ix} cy={iy} r={u*.022} fill="url(#gold)" stroke="#000" strokeWidth={u*.004}/>}
   </g></svg>
   <div className="tfr">{!q?'—':prog<1?'…':zone?<b className="ok">{t('hitL')}{zone==='hit'?'':' '+zone}</b>:<b className="no">{t('miss')}</b>}
    {q&&<span>{q.h>=0?'+':''}{(q.h*kh).toFixed(1)} {uh} · {(tg.d*kd).toFixed(0)} {ud}</span>}</div>
   {/* Pro: sideways wind drift at the target, arrow shows the direction as the shooter sees it */}
   {q&&s.mode==='pro'&&Math.abs(q.z)>=.0005&&<div className="tfr"><span className="lbl">{t('drift')}</span><span>{q.z<0?'← ':''}{(Math.abs(q.z)*kh).toFixed(1)} {uh}{q.z>0?' →':''}</span></div>}</div>})()}
 {rp&&<div className="tip" style={{left:tl,top:tt}}><div><span>{t('dist')}</span>{(rp.s*kd).toFixed(0)} {ud}</div><div><span>{t('h')}</span>{rp.h>=0?'+':''}{(rp.h*kh).toFixed(1)} {uh}</div><div><span>{t('spd')}</span>{(rp.v*(s.imp?3.28084:1)).toFixed(0)} {s.imp?'fps':'m/s'}</div><div><span>{t('time')}</span>{rp.t.toFixed(2)} s</div>{s.mode==='pro'&&<div><span>{t('drift')}</span>{(rp.z*kh).toFixed(1)} {uh}</div>}</div>}
 </div>}
