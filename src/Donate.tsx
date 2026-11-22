// "Support the project": a monobank Jar link with a QR code, so a desktop visitor can donate from their phone.
import {useMemo} from 'react'
import qrcode from 'qrcode-generator'
import type {Key} from './i18n'

export const JAR_URL='https://send.monobank.ua/jar/9qfGQEgSzp'

/** QR code as one SVG path of dark modules (crisp at any size, follows the page colours). */
function QR({text,size}:{text:string;size:number}){
 const {n,d}=useMemo(()=>{const q=qrcode(0,'M');q.addData(text);q.make();const n=q.getModuleCount();let d=''
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c} ${r}h1v1h-1z`
  return{n,d}},[text])
 return <svg className="qr" width={size} height={size} viewBox={`-2 -2 ${n+4} ${n+4}`} role="img" aria-label="QR"><rect x={-2} y={-2} width={n+4} height={n+4} fill="#fff"/><path d={d} fill="#0b0f14"/></svg>}

export function Donate({t,onClose}:{t:(k:Key)=>string;onClose:()=>void}){
 return <div className="modal" role="dialog" aria-modal="true" aria-label={t('support')} onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div className="mbox">
   <button className="tfx" aria-label={t('close')} onClick={onClose}>×</button>
   <h3>♥ {t('support')}</h3>
   <p>{t('supportText')}</p>
   <QR text={JAR_URL} size={200}/>
   <p className="note">{t('supportQr')}</p>
   <a className="btn fire" href={JAR_URL} target="_blank" rel="noopener noreferrer">{t('supportOpen')}</a>
  </div>
 </div>}
