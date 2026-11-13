import {useEffect,useMemo,useState} from 'react'
import {solve,pressureFromAlt,stability,ptAt} from './core/ballistics'
import {CALIBERS,BULLETS,vFor,Bullet} from './data/bullets'
import {dict,Key,Lang} from './i18n'
import {Chart} from './Chart'
import {GUNS,gunFor} from './Weapons'
// barrel and twist are stored in inches, sight in mm, distances in m
// custom bullet: what the user types in from the box or the maker's site
type CB={gr:number;bc:number;m:'G1'|'G7';len:number}
export interface S{mode:'lite'|'pro';cal:string;bullet:string;v0:number;barrel:number;twist:number;sight:number;zero:number;temp:number;atm:'alt'|'press';alt:number;press:number;wind:number;windDir:number;angle:number;step:number;real:boolean;fixOn:boolean;fixD:number;cb:CB|null;lang:Lang;imp:boolean;open:boolean}
const DEF:S={mode:'lite',cal:'223',bullet:'223-fmj55',v0:vFor(BULLETS.find(b=>b.id==='223-fmj55')!,16),barrel:16,twist:7,sight:65,zero:100,temp:15,atm:'alt',alt:0,press:1013,wind:0,windDir:90,angle:0,step:50,real:true,fixOn:false,fixD:100,cb:null,lang:'uk',imp:false,open:true}
const KEY='ballistic3'
const load=():S=>{try{const v={...DEF,...JSON.parse(localStorage.getItem(KEY)||'{}')};return STEPS.includes(v.step)?v:{...v,step:DEF.step}}catch{return DEF}}
// Lite mode: standard atmosphere, still air, level shot — conditions that barely affect the result
const STD={temp:15,press:1013.25,wind:0,windDir:90,angle:0}
const MAXZERO=300,RANGE=1500,STEPS=[10,25,50,100]
interface SP{label:string;value:number;min:number;max:number;step:number;k?:number;off?:number;dmin?:number;dmax?:number;unit:string;dec?:number;fmt?:(d:number)=>string;alt?:string;on:(v:number)=>void}
/** Number field that ignores empty or out-of-range input instead of storing it. */
function Num({label,value,min,max,step,on}:{label:string;value:number;min:number;max:number;step:number;on:(v:number)=>void}){
 const [txt,setTxt]=useState(String(value))
 useEffect(()=>{if(+txt!==value)setTxt(String(value))},[value]) // eslint-disable-line
 return <label className="num"><span>{label}</span><input type="number" inputMode="decimal" min={min} max={max} step={step} value={txt} onChange={e=>{setTxt(e.target.value);const v=parseFloat(e.target.value.replace(',','.'));if(v>=min&&v<=max)on(v)}}/></label>}
function Slider({label,value,min,max,step,k=1,off=0,dmin,dmax,unit,dec=0,fmt,alt,on}:SP){
 const d=value*k+off
 return <label className="f"><span>{label}<b>{fmt?fmt(d):d.toFixed(dec)+' '+unit}{alt&&<small> ({alt})</small>}</b></span><input type="range" min={dmin??min*k+off} max={dmax??max*k+off} step={step} value={d} onChange={e=>on((+e.target.value-off)/k)}/></label>}
export function App(){
 const [s,set]=useState<S>(load),[shot,setShot]=useState(0),[reset,setReset]=useState(0)
 const p=(o:Partial<S>)=>set(x=>({...x,...o}))
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(s))},[s])
 const t=(k:Key)=>dict[s.lang][k],I=s.imp,pro=s.mode==='pro'
 const cal=CALIBERS.find(c=>c.id===s.cal)??CALIBERS[0],list=BULLETS.filter(b=>b.cal===cal.id),custom=s.bullet==='custom'&&s.cb!==null
 const b:Bullet=custom?{id:'custom',cal:cal.id,name:'',...s.cb!,v:0,ok:false}:BULLETS.find(x=>x.id===s.bullet&&x.cal===cal.id)??list[0]
 const env=pro?{temp:s.temp,press:s.atm==='alt'?pressureFromAlt(s.alt):s.press,wind:s.wind,windDir:s.windDir,angle:s.angle}:STD
 const zero=Math.min(s.zero,MAXZERO)
 const res=useMemo(()=>{
  const r=solve({v0:s.v0,bc:b.bc,model:b.m,sightH:s.sight/1000,zero,tempC:env.temp,pressHpa:env.press,windMs:env.wind,windDeg:env.windDir,angleDeg:env.angle,range:RANGE})
  if(!r)return null
  // show the whole trajectory up to a bit past the far zero, so both zeros are always on screen
  const far=Math.max(zero,...r.crossings),range=Math.max(100,Math.ceil(far*1.15/25)*25)
  return{...r,pts:r.pts.filter(q=>q.s<=range),range}
 },[s.v0,b,s.sight,zero,env.temp,env.press,env.wind,env.windDir,env.angle])
 // fixed distance: a wall somewhere between the first zero and the end of the view; the trajectory stops on it
 const fixMin=res&&res.crossings.length?Math.ceil(res.crossings[0]/5)*5:10,fixMax=res?.range??100
 const fix=Math.min(Math.max(s.fixD,fixMin),fixMax)
 const shown=useMemo(()=>{
  if(!res||!s.fixOn)return res
  const end=ptAt(res.pts,fix),pts=[...res.pts.filter(q=>q.s<fix),...(end?[end]:[])]
  return{...res,pts,crossings:res.crossings.filter(c=>c<=fix),apex:pts.reduce((m,q)=>q.h>m.h?q:m,pts[0]),range:fix}
 },[res,s.fixOn,fix])
 const twist=Math.min(Math.max(s.twist,cal.tw[0]),cal.tw[1])
 const sg=stability(b.gr,cal.d,b.len,twist,s.v0*3.28084,env.temp*1.8+32,env.press)
 // a caliber brings its typical rifle: barrel length and sight height follow it
 const pick=(cid:string)=>{const f=BULLETS.find(x=>x.cal===cid)!,g=GUNS[gunFor(cid)],bl=CALIBERS.find(c=>c.id===cid)!.barrel??g.barrel;p({cal:cid,bullet:f.id,barrel:bl,twist:CALIBERS.find(c=>c.id===cid)!.tw[2],sight:g.sight,v0:vFor(f,bl)});setShot(n=>n+1)}
 // the custom bullet starts from the bullet that was selected and keeps the current velocity
 const pickB=(id:string)=>{p(id==='custom'?{bullet:id,cb:s.cb??{gr:b.gr,bc:b.bc,m:b.m,len:b.len}}:{bullet:id,v0:vFor(BULLETS.find(x=>x.id===id)!,s.barrel)});setShot(n=>n+1)}
 const setCb=(o:Partial<CB>)=>p({cb:{...s.cb!,...o}})
 const dist=I?'yd':'m',mm=(v:number)=>v.toFixed(0)+' mm',inch=(v:number,d=2)=>v.toFixed(d)+'″'
 return <div className="app">
  <aside className={s.open?'side':'side shut'}>
   <div className="mode"><button role="switch" aria-checked={pro} className={pro?'sw pro':'sw'} onClick={()=>p({mode:pro?'lite':'pro'})}><span className={pro?'':'on'}>LITE</span><i/><span className={pro?'on':''}>PRO</span></button></div>
   <h1>BALLISTIC<i>TRAJECTORY</i></h1>
   <h2>{t('ammo')}</h2>
   <label className="f"><span>{t('caliber')}</span><select value={cal.id} onChange={e=>pick(e.target.value)}>{CALIBERS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
   <label className="f"><span>{t('bullet')}</span><select value={b.id} onChange={e=>pickB(e.target.value)}><option value="custom">{t('custom')}</option>{list.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
   {custom?<>
    <div className="cb">
     <Num label={t('bcL')} value={b.bc} min={.01} max={1.5} step={.001} on={v=>setCb({bc:v})}/>
     <label className="num"><span>{t('model')}</span><select value={b.m} onChange={e=>setCb({m:e.target.value as CB['m']})}><option>G1</option><option>G7</option></select></label>
     <Num label={t('weight')} value={b.gr} min={10} max={800} step={1} on={v=>setCb({gr:v})}/>
     <Num label={t('blen')} value={b.len} min={.2} max={2.5} step={.01} on={v=>setCb({len:v})}/>
    </div>
    <p className="note">{t('customNote')}</p>
   </>:<p className="note">{b.gr} gr · {b.m} BC {b.bc} · Ø {cal.d}″<br/>{b.ok?'✓ '+t('okNote'):'⚠ '+t('verify')}</p>}
   <Slider label={t('velocity')} value={s.v0} min={200} max={1200} step={I?5:1} k={I?3.28084:1} unit={I?'fps':'m/s'} alt={I?s.v0.toFixed(0)+' m/s':(s.v0*3.28084).toFixed(0)+' fps'} on={v=>p({v0:v})}/>
   <p className="note">{t('vNote')}</p>
   <h2>{t('weapon')}</h2>
   <Slider label={t('barrel')} value={s.barrel} min={6} max={30} step={.25} unit="" fmt={d=>inch(d)} alt={mm(s.barrel*25.4)} on={v=>p({barrel:v,v0:custom?Math.round(s.v0+(v-s.barrel)*cal.kv):vFor(b,v)})}/>
   <Slider label={t('twist')} value={twist} min={cal.tw[0]} max={cal.tw[1]} step={.5} unit="" fmt={d=>'1:'+d+'″'} alt={'1:'+mm(twist*25.4)} on={v=>p({twist:v})}/>
   <p className={'note '+(sg<1?'bad':sg<1.3?'warn':'ok')}>{t('stable')} Sg {sg.toFixed(2)}{sg<1?' — '+t('unstable'):sg<1.3?' — '+t('marginal'):''}</p>
   {I?<Slider label={t('sight')} value={s.sight} min={20} max={120} step={.05} k={1/25.4} dmin={.8} dmax={4.7} unit="" fmt={d=>inch(d)} alt={mm(s.sight)} on={v=>p({sight:v})}/>
   :<Slider label={t('sight')} value={s.sight} min={20} max={120} step={1} unit="mm" alt={inch(s.sight/25.4)} on={v=>p({sight:v})}/>}
   {I?<Slider label={t('zero')} value={zero} min={10} max={MAXZERO} step={5} k={1.09361} dmin={10} dmax={325} unit="yd" alt={zero.toFixed(0)+' m'} on={v=>p({zero:v})}/>
   :<Slider label={t('zero')} value={zero} min={10} max={MAXZERO} step={5} unit="m" alt={(zero*1.09361).toFixed(0)+' yd'} on={v=>p({zero:v})}/>}
   {pro?<>
    <h2>{t('cond')}</h2>
    <Slider label={t('temp')} value={s.temp} min={-30} max={45} step={1} k={I?1.8:1} off={I?32:0} unit={I?'°F':'°C'} on={v=>p({temp:v})}/>
    <label className="f"><span>{t('atm')}</span><select value={s.atm} onChange={e=>p({atm:e.target.value as S['atm']})}><option value="alt">{t('alt')}</option><option value="press">{t('press')}</option></select></label>
    {s.atm==='alt'?<Slider label={t('alt')} value={s.alt} min={0} max={3000} step={I?50:10} k={I?3.28084:1} unit={I?'ft':'m'} on={v=>p({alt:v})}/>
    :<Slider label={t('press')} value={s.press} min={700} max={1060} step={I?.05:1} k={I?.02953:1} unit={I?'inHg':'hPa'} dec={I?2:0} on={v=>p({press:v})}/>}
    <Slider label={t('wind')} value={s.wind} min={0} max={20} step={.5} k={I?2.23694:1} unit={I?'mph':'m/s'} dec={1} on={v=>p({wind:v})}/>
    <Slider label={t('windDir')} value={s.windDir} min={0} max={359} step={5} unit="°" on={v=>p({windDir:v})}/>
    <Slider label={t('angle')} value={s.angle} min={-60} max={60} step={1} unit="°" on={v=>p({angle:v})}/>
   </>:<p className="note">{t('lite')}</p>}
   <h2>{t('view')}</h2>
   <div className="mode vis"><button role="switch" aria-checked={s.real} className={s.real?'sw pro':'sw'} onClick={()=>p({real:!s.real})}><span className={s.real?'':'on'}>{t('schem')}</span><i/><span className={s.real?'on':''}>{t('real')}</span></button></div>
   <Slider label={t('step')} value={Math.max(0,STEPS.indexOf(s.step))} min={0} max={STEPS.length-1} step={1} unit="" fmt={i=>STEPS[i]+' '+dist} on={i=>p({step:STEPS[i]})}/>
   <div className="f row"><span>{t('fixed')}</span><button role="switch" aria-checked={s.fixOn} aria-label={t('fixed')} className={s.fixOn?'sw pro':'sw'} onClick={()=>p({fixOn:!s.fixOn,fixD:fix})}><i/></button></div>
   {s.fixOn&&(I?<Slider label={t('wall')} value={fix} min={fixMin} max={fixMax} step={5} k={1.09361} dmin={Math.ceil(fixMin*1.09361/5)*5} dmax={Math.floor(fixMax*1.09361/5)*5} unit="yd" alt={fix.toFixed(0)+' m'} on={v=>p({fixD:v})}/>
   :<Slider label={t('wall')} value={fix} min={fixMin} max={fixMax} step={5} unit="m" alt={(fix*1.09361).toFixed(0)+' yd'} on={v=>p({fixD:v})}/>)}
   <p className="note">{t('hint')}</p>
   <button className="btn" onClick={()=>setShot(n=>n+1)}>{t('replay')}</button>
   <button className="btn" onClick={()=>setReset(n=>n+1)}>{t('reset')}</button>
  </aside>
  <button className="burger" onClick={()=>p({open:!s.open})} aria-label={t('menu')}>☰</button>
  <div className="top">
   <button className={I?'':'on'} onClick={()=>p({imp:false})}>SI</button><button className={I?'on':''} onClick={()=>p({imp:true})}>IMP</button><span/>
   <button className={s.lang==='uk'?'on':''} onClick={()=>p({lang:'uk'})}>UA</button><button className={s.lang==='en'?'on':''} onClick={()=>p({lang:'en'})}>EN</button>
  </div>
  <main>{shown?<Chart res={shown} s={s} t={t} shot={shot} reset={reset} range={shown.range} wall={s.fixOn?fix:null}/>:<p className="err">{t('cant')}</p>}</main>
 </div>}
