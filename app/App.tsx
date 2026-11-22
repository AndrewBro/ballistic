// First screen of the mobile app: the shooter and trajectory from the shared core, drawn with react-native-svg,
// with steppers for zero distance and muzzle velocity. The drawings are the same code the website uses.
import {useMemo,useState} from 'react'
import {StatusBar} from 'expo-status-bar'
import {Pressable,SafeAreaView,StyleSheet,Text,useWindowDimensions,View} from 'react-native'
import Svg,{Circle,G,Line,Path,Text as SvgText} from 'react-native-svg'
import {BULLETS,CALIBERS,GUNS,dope,gunFor,solve,vFor} from '../core'
import {GROUND,Shooter,figLeft} from '../core/draw/Shooter'
import {NativeKit} from './kit'

const C={bg:'#0b0f14',panel:'#10161d',line:'#1e2833',tx:'#c9d4df',mut:'#7a8a9a',acc:'#4fc3f7',amb:'#ffb74d',red:'#ef9a9a',grn:'#81c784'}

function Stepper({label,value,unit,onMinus,onPlus}:{label:string;value:string;unit:string;onMinus:()=>void;onPlus:()=>void}){
 return <View style={s.row}>
  <Text style={s.lbl}>{label}</Text>
  <Pressable onPress={onMinus} style={s.btn} hitSlop={8}><Text style={s.btnT}>−</Text></Pressable>
  <Text style={s.val}>{value} <Text style={s.unit}>{unit}</Text></Text>
  <Pressable onPress={onPlus} style={s.btn} hitSlop={8}><Text style={s.btnT}>+</Text></Pressable>
 </View>}

export default function App(){
 const {width}=useWindowDimensions()
 const cal=CALIBERS.find(c=>c.id==='223')!,bullet=BULLETS.find(b=>b.id==='223-fmj55')!,gun=GUNS[gunFor(cal.id)]
 const [zero,setZero]=useState(gun.zero),[v0,setV0]=useState(vFor(bullet,gun.barrel))
 const res=useMemo(()=>{const r=solve({v0,bc:bullet.bc,model:bullet.m,sightH:gun.sight/1000,zero,tempC:15,pressHpa:1013.25,windMs:0,windDeg:90,angleDeg:0,range:1500})
  if(!r)return null
  // as on the website: show a bit past the far zero, so both zeros are on screen
  const range=Math.max(100,Math.ceil(Math.max(zero,...r.crossings)*1.15/25)*25)
  return{...r,pts:r.pts.filter(q=>q.s<=range),range}},[v0,zero])
 const range=res?.range??100
 // schematic view, as on the website: heights true to the shooter (one vertical scale for both), distance compressed;
 // the line of sight sits at the vertical centre
 const W=width-58,H=260,pad=12,barrel=gun.barrel,gid=gunFor(cal.id)
 const hs=res?res.pts.map(p=>p.h):[0],ext=Math.max(.1-GROUND,.25,Math.max(...hs)+.1,.1-Math.min(...hs))
 const fw=.2-figLeft(gid,barrel),ky=Math.min((H/2-pad)/ext,(W*.35)/fw),kx=(W-pad-fw*ky)/range
 const X=(m:number)=>fw*ky+m*kx,Y=(h:number)=>H/2-h*ky
 const ticks=Array.from({length:Math.floor(range/50)+1},(_,i)=>i*50)
 const d=res?res.pts.filter((_,i)=>i%3===0).map((p,i)=>(i?'L':'M')+X(p.s).toFixed(1)+' '+Y(p.h).toFixed(1)).join(''):''
 const table=res?dope(res,[100,200,300],{unit:'MRAD',click:.1,dial:true}):[]
 return <NativeKit><SafeAreaView style={s.root}><View style={s.wrap}>
  <StatusBar style="light"/>
  <Text style={s.h1}>BALLISTIC <Text style={{color:C.mut}}>· {cal.name} · {bullet.name}</Text></Text>
  <View style={s.card}>
   {res?<Svg width={W} height={H}>
    <Line x1={0} x2={W} y1={Y(GROUND)} y2={Y(GROUND)} stroke="#3a4857" strokeWidth={1.5}/>
    <G transform={`translate(${X(0)} ${Y(0)}) scale(${ky} ${-ky})`}><Shooter gun={gid} barrelIn={barrel} sightM={gun.sight/1000}/></G>
    <Line x1={X(0)} x2={X(range)} y1={Y(0)} y2={Y(0)} stroke={C.amb} strokeDasharray="6 5" strokeWidth={1}/>
    <Path d={d} stroke={C.acc} strokeWidth={2.2} fill="none"/>
    {res.crossings.filter(c=>c<=range).map((c,i)=><Circle key={i} cx={X(c)} cy={Y(0)} r={5} fill={C.bg} stroke={C.red} strokeWidth={2}/>)}
    {res.crossings.filter(c=>c<=range).map((c,i)=><SvgText key={'t'+i} x={X(c)} y={Y(0)-10} fill={C.red} fontSize={10} textAnchor="middle">{c.toFixed(0)} m</SvgText>)}
    {ticks.map(m=><SvgText key={m} x={X(m)} y={Y(GROUND)+14} fill={C.mut} fontSize={10} textAnchor="middle">{m}</SvgText>)}
   </Svg>:<Text style={{color:C.red}}>Куля не досягає дистанції пристрілки</Text>}
  </View>
  <View style={s.card}>
   <Stepper label="Пристрілка" value={String(zero)} unit="m" onMinus={()=>setZero(z=>Math.max(10,z-1))} onPlus={()=>setZero(z=>Math.min(300,z+1))}/>
   <Stepper label="Швидкість" value={String(v0)} unit="m/s" onMinus={()=>setV0(v=>Math.max(200,v-5))} onPlus={()=>setV0(v=>Math.min(1200,v+5))}/>
  </View>
  <View style={s.card}>
   <Text style={s.lbl}>Поправки, приціл 0.1 MRAD</Text>
   {table.map(r=><Text key={r.d} style={s.dope}>{r.d} m   {r.h>=0?'+':''}{(r.h*100).toFixed(1)} cm   {r.elev>=0?'↑':'↓'} {Math.abs(r.elev).toFixed(1)} MRAD · {Math.abs(r.elevClicks!)} кл.</Text>)}
  </View>
 </View></SafeAreaView></NativeKit>}

const s=StyleSheet.create({
 root:{flex:1,backgroundColor:C.bg},
 wrap:{flex:1,paddingHorizontal:16,paddingTop:12}, // padding inside: SafeAreaView drops it on web
 h1:{color:C.tx,fontSize:14,fontWeight:'600',letterSpacing:1.5,marginVertical:12},
 card:{backgroundColor:C.panel,borderColor:C.line,borderWidth:1,borderRadius:8,padding:12,marginBottom:12},
 row:{flexDirection:'row',alignItems:'center',marginVertical:6},
 lbl:{color:C.mut,fontSize:13,flex:1},
 btn:{width:34,height:34,borderRadius:6,alignItems:'center',justifyContent:'center',backgroundColor:'#4fc3f71a'},
 btnT:{color:C.acc,fontSize:20,fontWeight:'600'},
 val:{color:C.tx,fontSize:15,minWidth:90,textAlign:'center',fontVariant:['tabular-nums']},
 unit:{color:C.mut,fontSize:12},
 dope:{color:C.tx,fontSize:13,marginTop:6,fontVariant:['tabular-nums']},
})
