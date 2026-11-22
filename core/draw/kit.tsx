// Platform-neutral SVG drawing. The shooter, rifles and targets are drawn once with the primitives of a Kit:
// the web passes plain SVG tags and CSS class names, the mobile app passes react-native-svg components and
// explicit colours from PALETTE. Style keys are "<group>.<part>", e.g. "man.gear", "ar.pad", "tgt.body.card".
import {createContext,useContext} from 'react'

export interface Kit{
 G:any;Path:any;Circle:any;Rect:any;Ellipse:any;Polygon:any;Line:any
 st:(key:string)=>Record<string,unknown> // style props for a style key
}

/** Colours and strokes per style key, for renderers without CSS (react-native-svg). Lengths are in drawing units. */
export const PALETTE:Record<string,Record<string,unknown>>={
 'man':{fill:'#5f7286',stroke:'none'},
 'man.far':{fill:'#4e5d6e'},
 'man.gear':{fill:'#4a5a6b'},'man.pouch':{fill:'#55677a'},'man.boot':{fill:'#3f4d5c'},'man.glove':{fill:'#3f4d5c'},
 'man.seam':{fill:'none',stroke:'#3b4856',strokeWidth:.006},
 'man.strap':{fill:'none',stroke:'#3f4d5c',strokeWidth:.03,strokeLinecap:'round'},
 'man.ant':{fill:'none',stroke:'#3f4d5c',strokeWidth:.008,strokeLinecap:'round'},
 'man.glass':{fill:'#1c242d'},
 'man.flagB':{fill:'#0057b7'},'man.flagY':{fill:'#ffd700'},
 'ar':{fill:'#1c242d',stroke:'#93a4b8',strokeWidth:.06,strokeLinejoin:'round'},
 'ar.pad':{fill:'#2b3540'},'ar.det':{fill:'#11171d',strokeWidth:.04},'ar.ln':{fill:'none',strokeWidth:.12,strokeLinecap:'round'},
 'tgt.card':{},'tgt.army':{},'tgt.steel':{},
 'tgt.sheet':{fill:'#d8d6cc'},
 'tgt.body.card':{fill:'#8b7a5a'},'tgt.body.army':{fill:'#2f3a2c'},'tgt.body.steel':{fill:'#9aa6b2',stroke:'#5d6773',strokeWidth:.006},
 'tgt.zone':{fill:'none',stroke:'#2b2418',strokeWidth:.004},
}
/** Web: the CSS class names the stylesheet expects for each style key. */
export const WEB_CLASS=(key:string)=>{const [g,part]=key.split('.')
 if(g==='tgt')return part==='body'||part==='zone'||part==='sheet'?part:'tgt '+part // group: "tgt card"; parts: "body", "zone", "sheet"
 return part??g} // "man", "ar" for groups, the part name inside them

export const KitCtx=createContext<Kit|null>(null)
export const useKit=()=>{const k=useContext(KitCtx);if(!k)throw new Error('Drawing used outside a KitCtx provider');return k}
