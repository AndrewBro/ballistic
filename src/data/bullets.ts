// !! Library values are approximate and MUST be verified against manufacturer data (field "ok": false).
// d = bullet diameter, inch; ref = test barrel length the bullet velocities are quoted for, inch; kv = velocity change per inch of barrel, m/s
// barrel = typical barrel length when it differs from the rifle's default, inch; tw = realistic twist range and typical twist [min,max,default], inch per turn
export interface Caliber{id:string;name:string;d:number;ref:number;kv:number;barrel?:number;tw:[number,number,number]}
export interface Bullet{id:string;cal:string;name:string;gr:number;bc:number;m:'G1'|'G7';len:number;v:number;ok:boolean} // len inch, v m/s at Caliber.ref
export const CALIBERS:Caliber[]=[
{id:'22lr',name:'.22 LR',d:.223,ref:18,kv:1.5,barrel:18,tw:[14,18,16]},{id:'223',name:'.223 Rem',d:.224,ref:24,kv:7.5,tw:[6,10,7]},{id:'556',name:'5.56x45 NATO',d:.224,ref:20,kv:7.5,tw:[6,10,7]},
{id:'243',name:'.243 Win',d:.243,ref:24,kv:7.6,tw:[7,10,9]},{id:'65cm',name:'6.5 Creedmoor',d:.264,ref:24,kv:7,tw:[7,9,8]},
{id:'270',name:'.270 Win',d:.277,ref:24,kv:7.6,tw:[8,11,10]},{id:'7x64',name:'7x64',d:.284,ref:24,kv:7.6,tw:[8,11,10]},{id:'300blk',name:'.300 Blackout',d:.308,ref:16,kv:8,tw:[6,10,8]},{id:'308',name:'.308 Win',d:.308,ref:24,kv:6.5,tw:[8,12,10]},{id:'762x51',name:'7.62x51 NATO',d:.308,ref:22,kv:6.5,tw:[8,12,10]},
{id:'762x39',name:'7.62x39',d:.311,ref:20,kv:4.5,tw:[9,10,9.5]},{id:'762x54',name:'7.62x54R',d:.311,ref:28,kv:5,tw:[8,12,10]},{id:'3006',name:'.30-06 Spr',d:.308,ref:24,kv:7,tw:[8,12,10]},{id:'300wm',name:'.300 Win Mag',d:.308,ref:24,kv:9,tw:[8,12,10]}]
// ok = ballistic coefficient checked against the manufacturer's published data (or the military/lab measurement), Nov 2026.
// Velocities are typical factory loads at the caliber's test barrel and are not part of that check.
const B=(id:string,cal:string,name:string,gr:number,bc:number,m:'G1'|'G7',len:number,v:number,ok=false):Bullet=>({id,cal,name,gr,bc,m,len,v,ok})
const Y=true
export const BULLETS:Bullet[]=[
B('22lr-sv40','22lr','CCI Standard Velocity 40 gr LRN',40,.123,'G1',.43,326),B('22lr-mm40','22lr','CCI Mini-Mag 40 gr',40,.13,'G1',.43,376,Y),
B('22lr-stg32','22lr','CCI Stinger 32 gr HP',32,.084,'G1',.4,500),
B('300blk-vmax110','300blk','Hornady V-MAX 110 gr',110,.29,'G1',1.08,724,Y),B('300blk-smk125','300blk','Sierra MatchKing 125 gr',125,.349,'G1',1.05,675,Y),
B('300blk-subx190','300blk','Hornady Sub-X 190 gr (subsonic)',190,.437,'G1',1.26,320,Y),B('300blk-smk220','300blk','Sierra MatchKing 220 gr (subsonic)',220,.629,'G1',1.47,305,Y),
B('762x51-m80','762x51','M80 147 gr FMJ-BT',147,.2,'G7',1.13,838),B('762x51-m118','762x51','M118LR 175 gr SMK',175,.243,'G7',1.24,786,Y),
B('223-fmj55','223','Hornady FMJ-BT 55 gr',55,.243,'G1',.74,990,Y),B('223-vmax55','223','Hornady V-MAX 55 gr',55,.255,'G1',.76,988,Y),
B('223-fmj62','223','Hornady FMJ 62 gr',62,.274,'G1',.91,930,Y),B('223-smk69','223','Sierra MatchKing 69 gr',69,.301,'G1',.9,900,Y),
B('223-eldm73','223','Hornady ELD Match 73 gr',73,.2,'G7',1.0,850,Y),B('223-bthp75','223','Hornady BTHP Match 75 gr',75,.395,'G1',.99,850,Y),
B('223-smk77','223','Sierra MatchKing 77 gr',77,.372,'G1',.99,830,Y),
B('556-m193','556','M193 55 gr FMJ-BT',55,.243,'G1',.74,990),B('556-m855','556','M855 / SS109 62 gr',62,.151,'G7',.91,945,Y),
B('556-m855a1','556','M855A1 62 gr EPR',62,.149,'G7',.97,955),B('556-mk262','556','Mk 262 Mod 1 77 gr OTM',77,.372,'G1',.99,840,Y),
B('243-sst95','243','Hornady SST 95 gr',95,.355,'G1',1.0,940,Y),B('243-sbt100','243','Sierra GameKing 100 gr',100,.43,'G1',1.07,900,Y),
B('65-eldm140','65cm','Hornady ELD-M 140 gr',140,.326,'G7',1.37,825,Y),B('65-eldx143','65cm','Hornady ELD-X 143 gr',143,.315,'G7',1.4,815,Y),
B('270-sst130','270','Hornady SST 130 gr',130,.46,'G1',1.2,930,Y),B('270-pt150','270','Nosler Partition 150 gr',150,.465,'G1',1.3,860,Y),
B('7x64-sst139','7x64','Hornady SST 139 gr',139,.486,'G1',1.2,880,Y),B('7x64-sst154','7x64','Hornady SST 154 gr',154,.525,'G1',1.3,820,Y),
B('308-sst150','308','Hornady SST 150 gr',150,.415,'G1',1.1,850,Y),B('308-smk168','308','Sierra MatchKing 168 gr',168,.218,'G7',1.22,790,Y),B('308-smk175','308','Sierra MatchKing 175 gr',175,.243,'G7',1.24,790,Y),
B('762x39-sp124','762x39','S&B SP 124 gr',124,.238,'G1',.95,743,Y),
B('54r-7n1','762x54','7N1 sniper 152 gr',152,.411,'G1',1.3,850),
B('3006-sst150','3006','Hornady SST 150 gr',150,.415,'G1',1.1,890,Y),B('3006-pt180','3006','Nosler Partition 180 gr',180,.474,'G1',1.3,790,Y),
B('300wm-eldx200','300wm','Hornady ELD-X 200 gr',200,.301,'G7',1.5,880,Y)]
/** Muzzle velocity (m/s) for a given barrel length (inch), scaled from the caliber's test barrel. */
export const vFor=(b:Bullet,barrelIn:number)=>{const c=CALIBERS.find(x=>x.id===b.cal)!;return Math.round(b.v+(barrelIn-c.ref)*c.kv)}
