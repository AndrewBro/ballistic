// Data model shared by the web app and the mobile app: what a user saves, syncs and picks from the catalogue.
// A setup ties a weapon, an optic and a load together with how the rifle is zeroed.
import type {GunId} from './guns'

export type AngleUnit='MOA'|'MRAD'

/** A riflescope (or red dot / holographic sight, which has no turrets to dial). */
export interface Optic{
 id:string
 name:string
 unit:AngleUnit // turret and reticle unit
 click:number // one click, in `unit` (e.g. 0.25 MOA, 0.1 MRAD)
 elevTravel?:number // total elevation travel, in `unit`
 windTravel?:number // total windage travel, in `unit`
 focal?:'FFP'|'SFP' // first focal plane: reticle holds are valid at any magnification
 sfpMag?:number // SFP only: the magnification at which reticle holds are true
 upCCW?:boolean // elevation turret turns counter-clockwise for "up" (the common convention)
 dial:boolean // false for red dots / holographic sights: holds only, no clicks
}

/** A rifle: a catalogue model or the user's own. */
export interface Weapon{
 id:string
 name:string
 caliber:string // Caliber.id
 gun:GunId // how it is drawn
 barrelIn:number
 twistIn:number
 civilian?:boolean // available to civilians (catalogue filter)
}

/** Ammunition: a library bullet or a custom one, with the velocity it actually leaves this barrel at. */
export type Load=
 |{kind:'library';bulletId:string;v0:number}
 |{kind:'custom';name?:string;gr:number;bc:number;model:'G1'|'G7';lenIn:number;v0:number}

/** What the user saves: one rifle + optic + load, and how it is zeroed. */
export interface Setup{
 id:string
 name:string
 weapon:Weapon
 opticId?:string // Optic.id from the catalogue, or none (iron sights)
 load:Load
 sightHeightMm:number
 zeroM:number
 notes?:string
 updatedAt:number // ms since epoch, for sync conflict resolution (last write wins)
}
