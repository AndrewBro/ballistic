import {G1,G7} from '../data/drag'
export interface Inputs{v0:number;bc:number;model:'G1'|'G7';sightH:number;zero:number;tempC:number;pressHpa:number;windMs:number;windDeg:number;angleDeg:number;range:number}
export interface Pt{s:number;h:number;z:number;v:number;t:number} // s: distance along line of sight (m), h: height above LoS (m), z: lateral drift (+right)
export interface Result{pts:Pt[];crossings:number[];apex:Pt;elev:number}
const g=9.80665,R=287.058,D2R=Math.PI/180
const cd=(m:number,T:[number,number][])=>{if(m<=T[0][0])return T[0][1];for(let i=1;i<T.length;i++)if(m<=T[i][0]){const a=T[i-1],b=T[i];return a[1]+(b[1]-a[1])*(m-a[0])/(b[0]-a[0])}return T[T.length-1][1]}
export const pressureFromAlt=(h:number)=>1013.25*Math.pow(1-2.25577e-5*h,5.25588)
/** Miller stability factor. gr, d/len/twist in inches, v in fps, T in F, p in hPa */
export const stability=(gr:number,d:number,len:number,twistIn:number,vFps:number,tF:number,p:number)=>{const t=twistIn/d,l=len/d;return 30*gr/(t**2*d**3*l*(1+l*l))*Math.cbrt(vFps/2800)*((tF+460)/519)*(1013.25/p)}
function sim(i:Inputs,alpha:number,dt=0.003):Pt[]{
 const th=i.angleDeg*D2R,T=i.tempC+273.15,rho=i.pressHpa*100/(R*T),c=Math.sqrt(1.4*R*T)
 const tab=i.model==='G1'?G1:G7,k=Math.PI*rho/(8*i.bc*703.0696) // BC in lb/in2 -> kg/m2
 const ph=i.windDeg*D2R,wx=-i.windMs*Math.cos(ph),wz=-i.windMs*Math.sin(ph) // 0 = headwind, 90 = from the right
 const a0=th+alpha,ct=Math.cos(th),st=Math.sin(th)
 let q=[i.sightH*st,-i.sightH*ct,0,i.v0*Math.cos(a0),i.v0*Math.sin(a0),0]
 const f=(q:number[])=>{const rx=q[3]-wx,ry=q[4],rz=q[5]-wz,r=Math.hypot(rx,ry,rz),kd=k*r*cd(r/c,tab);return[q[3],q[4],q[5],-kd*rx,-g-kd*ry,-kd*rz]}
 const add=(a:number[],b:number[],s:number)=>a.map((x,n)=>x+b[n]*s)
 const out:Pt[]=[];let t=0
 for(;;){
  const v=Math.hypot(q[3],q[4],q[5]),s=q[0]*ct+q[1]*st
  out.push({s,h:-q[0]*st+q[1]*ct,z:q[2],v,t})
  if(s>=i.range||t>8||v<40)break
  const k1=f(q),k2=f(add(q,k1,dt/2)),k3=f(add(q,k2,dt/2)),k4=f(add(q,k3,dt))
  q=q.map((x,n)=>x+dt/6*(k1[n]+2*k2[n]+2*k3[n]+k4[n]));t+=dt
 }
 return out
}
export function ptAt(p:Pt[],s:number):Pt|null{for(let i=1;i<p.length;i++)if(p[i].s>=s){const a=p[i-1],b=p[i],u=(s-a.s)/(b.s-a.s||1),l=(k:keyof Pt)=>a[k]+(b[k]-a[k])*u;return{s,h:l('h'),z:l('z'),v:l('v'),t:l('t')}}return null}
/** Solves the bore elevation so that the trajectory crosses the line of sight at `zero` metres. */
export function solve(i:Inputs):Result|null{
 const I={...i,range:Math.max(i.range,i.zero+5)},Iz={...i,range:i.zero+5}
 const hz=(a:number)=>ptAt(sim(Iz,a),i.zero)?.h??NaN
 let lo=-0.05,hi=0.35
 if(!(hz(hi)>0))return null
 for(let n=0;n<40;n++){const m=(lo+hi)/2,h=hz(m);if(isNaN(h)||h<0)lo=m;else hi=m}
 const pts=sim(I,hi),crossings:number[]=[]
 for(let n=1;n<pts.length;n++){const a=pts[n-1],b=pts[n];if(a.h*b.h<0)crossings.push(a.s+(b.s-a.s)*a.h/(a.h-b.h))}
 return{pts,crossings,apex:pts.reduce((m,p)=>p.h>m.h?p:m,pts[0]),elev:hi}
}
