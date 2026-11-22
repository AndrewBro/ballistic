// Web kit for the shared drawings: plain SVG tags, styled by the stylesheet's class names.
import type {ReactNode} from 'react'
import {Kit,KitCtx,WEB_CLASS} from '../core/draw/kit'
export const WEB_KIT:Kit={G:'g',Path:'path',Circle:'circle',Rect:'rect',Ellipse:'ellipse',Polygon:'polygon',Line:'line',st:key=>({className:WEB_CLASS(key)})}
export const WebKit=({children}:{children:ReactNode})=><KitCtx.Provider value={WEB_KIT}>{children}</KitCtx.Provider>
