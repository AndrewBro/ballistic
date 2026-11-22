// Native kit for the shared drawings: react-native-svg components with colours from the shared palette.
import type {ReactNode} from 'react'
import {Circle,Ellipse,G,Line,Path,Polygon,Rect} from 'react-native-svg'
import {Kit,KitCtx,PALETTE} from '../core/draw/kit'
export const NATIVE_KIT:Kit={G,Path,Circle,Rect,Ellipse,Polygon,Line,st:key=>PALETTE[key]??{}}
export const NativeKit=({children}:{children:ReactNode})=><KitCtx.Provider value={NATIVE_KIT}>{children}</KitCtx.Provider>
