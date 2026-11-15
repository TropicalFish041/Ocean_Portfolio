'use client';
import { useEffect, useRef, useState } from 'react';
import type { Chapter } from '../data/portfolio';

// Normalized outlines: only the fish silhouettes receive pointer events.
const outlines: Record<string,string[]> = {
 butterfly:[
 '4,30 7,18 10,15 13,23 14,36 12,44 9,46 6,42',
 '39,24 41,17 43,10 48,5 56,6 61,12 62,21 64,30 61,32 60,36 52,39 44,36 40,32',
 '9,59 11,51 17,44 23,43 26,49 28,61 29,67 26,70 25,75 19,77 13,74 10,68',
 '30,63 34,55 40,49 45,48 48,54 48,58 50,61 48,64 46,73 39,78 30,79 29,74',
 '64,45 68,39 75,35 80,37 84,46 86,59 87,62 82,65 74,64 66,60',
 '50,69 56,62 63,59 69,63 73,69 76,82 75,85 70,88 67,92 58,91 52,86 49,78'
 ],
 lion:['4,66 6,56 9,40 7,34 13,33 19,30 24,25 30,31 24,20 27,17 39,28 47,38 42,18 47,23 50,36 48,13 48,3 52,5 57,29 57,4 61,1 64,30 67,35 69,16 72,7 76,8 73,34 76,33 82,15 85,16 83,37 78,48 84,48 89,55 91,58 91,64 86,71 79,73 73,70 65,81 61,94 49,97 36,91 32,84 28,82 22,75 15,75 11,71'],
 angel:['12,29 19,24 31,15 40,10 48,4 47,9 55,5 53,11 61,8 58,14 68,10 66,17 73,16 70,23 77,26 81,33 85,44 82,55 76,59 91,59 94,65 91,75 84,82 77,86 73,81 72,74 67,85 62,91 53,93 44,86 36,77 30,65 29,84 26,81 22,68 24,53 17,45 13,37'],
 opah:['4,54 8,45 20,34 35,24 47,7 53,3 58,3 52,17 49,23 63,25 73,31 80,39 88,22 95,16 94,27 92,41 98,53 91,54 85,48 83,65 76,75 65,84 58,87 64,92 69,95 57,97 45,92 40,89 28,88 18,81 10,71 4,63'],
 shark:[
 '2,47 4,33 12,20 14,21 12,29 20,30 29,28 30,14 34,9 39,11 43,19 44,28 54,33 68,39 84,48 97,58 98,61 91,64 77,62 65,64 67,73 62,79 61,68 55,66 40,71 22,77 20,72 30,59 24,57 12,51 4,51',
 '40,23 44,16 52,14 67,15 74,17 77,21 74,24 65,27 56,28 43,26',
 '7,39 18,35 35,38 43,42 43,44 36,46 19,45 8,42',
 '8,45 13,42 22,43 31,47 31,49 26,51 15,49',
 '17,47 26,46 34,50 36,53 31,55 21,52',
 '7,56 9,60 20,59 28,62 29,65 23,67 14,64 9,63',
 '2,64 5,69 15,68 23,72 23,75 17,77 8,74 4,71',
 '1,72 10,69 19,72 24,77 24,79 20,81 9,78 3,77',
 '26,73 33,72 44,74 51,79 53,81 49,84 38,83 30,79',
 '4,81 9,78 18,80 26,84 30,89 27,92 19,91 9,86 4,85'
 ]
};
type Layer = {id:string; src:string; x:number; y:number; width:number};
type Scene = {background:string; custom:boolean; layers:Layer[]};
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('ocean-compositions',1);r.onupgradeneeded=()=>r.result.createObjectStore('scenes');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function persist(key:string,value:Scene){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('scenes','readwrite');tx.objectStore('scenes').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();}
const fileData=(file:File)=>new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);});

function FishLayer({layer,editing,selected,onSelect,onMove,onOpen}:{layer:Layer;editing:boolean;selected:boolean;onSelect:()=>void;onMove:(x:number,y:number)=>void;onOpen:()=>void}){
 const img=useRef<HTMLImageElement>(null);const pixels=useRef<ImageData|null>(null);const drag=useRef<{x:number;y:number;left:number;top:number;width:number;height:number}|null>(null);
 return <button className={'placed-fish'+(selected&&editing?' selected':'')} style={{left:layer.x+'%',top:layer.y+'%',width:layer.width+'%'}} aria-label="Fish information" onClick={e=>{if(editing){onSelect();return;}if(e.detail===0){onOpen();return;}const bounds=img.current?.getBoundingClientRect(),p=pixels.current;if(!bounds||!p)return;const x=Math.floor((e.clientX-bounds.left)/bounds.width*p.width),y=Math.floor((e.clientY-bounds.top)/bounds.height*p.height);if(x>=0&&y>=0&&x<p.width&&y<p.height&&p.data[(y*p.width+x)*4+3]>40)onOpen();}}
 onPointerDown={e=>{if(!editing)return;e.preventDefault();onSelect();const parent=e.currentTarget.parentElement!.getBoundingClientRect();drag.current={x:e.clientX,y:e.clientY,left:layer.x,top:layer.y,width:parent.width,height:parent.height};e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{const d=drag.current;if(!d)return;onMove(Math.max(0,Math.min(100-layer.width,d.left+(e.clientX-d.x)/d.width*100)),Math.max(0,Math.min(90,d.top+(e.clientY-d.y)/d.height*100)));}}
 onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
 onKeyDown={e=>{if(editing&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();onMove(Math.max(0,Math.min(100-layer.width,layer.x+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0))),Math.max(0,Math.min(90,layer.y+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0))));}}}>
 <img ref={img} src={layer.src} alt="" draggable={false} onLoad={()=>{const image=img.current;if(!image)return;const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(ctx){ctx.drawImage(image,0,0);pixels.current=ctx.getImageData(0,0,canvas.width,canvas.height);}}}/></button>;
}

export default function Composition({chapter,editing,onOpen}:{chapter:Chapter;editing:boolean;onOpen:()=>void}){
 const [scene,setScene]=useState<Scene>({background:'/paintings/'+chapter.fish+'.png',custom:false,layers:[]});const [ready,setReady]=useState(false);const [saved,setSaved]=useState(true);const [selected,setSelected]=useState<string|null>(null);const bgInput=useRef<HTMLInputElement>(null);const fishInput=useRef<HTMLInputElement>(null);const importInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{let live=true;database().then(db=>{const r=db.transaction('scenes').objectStore('scenes').get(chapter.id);r.onsuccess=()=>{if(live){if(r.result)setScene(r.result);setReady(true);}db.close();};r.onerror=()=>{if(live)setReady(true);db.close();};}).catch(()=>{if(live){setReady(true);setSaved(false);}});return()=>{live=false;};},[chapter.id]);
 useEffect(()=>{if(!ready)return;setSaved(false);const timer=setTimeout(()=>{persist(chapter.id,scene).then(()=>setSaved(true)).catch(()=>setSaved(false));},300);return()=>clearTimeout(timer);},[scene,ready,chapter.id]);
 function update(id:string,patch:Partial<Layer>){setScene(s=>({...s,layers:s.layers.map(l=>l.id===id?{...l,...patch}:l)}));}
 const current=scene.layers.find(l=>l.id===selected);
 return <div className={'composition'+(editing?' editing':'')}>
 <div className="composition-canvas"><img className="original-art" src={scene.background} alt="" draggable={false}/>
 {!scene.custom&&<svg className="fish-hotspots" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={chapter.name}>{outlines[chapter.fish].map((points,i)=><polygon key={i} points={points} role="button" tabIndex={editing?-1:0} aria-label={chapter.title+' — fish '+(i+1)} onClick={()=>{if(!editing)onOpen();}} onKeyDown={e=>{if(!editing&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onOpen();}}}/>)}</svg>}
 {scene.layers.map(layer=><FishLayer key={layer.id} layer={layer} editing={editing} selected={selected===layer.id} onSelect={()=>setSelected(layer.id)} onMove={(x,y)=>update(layer.id,{x,y})} onOpen={onOpen}/>)}</div>
 {editing&&<div className="composition-tools" aria-label="Scene editor">
 <button aria-label="Upload background" onClick={()=>bgInput.current?.click()}>▧</button><button aria-label="Add fish image" onClick={()=>fishInput.current?.click()}>＋</button>
 {current&&<><input type="range" aria-label="Fish size" min="5" max="100" value={current.width} onChange={e=>update(current.id,{width:Number(e.target.value),x:Math.min(current.x,100-Number(e.target.value))})}/><button aria-label="Remove selected fish" onClick={()=>{setScene(s=>({...s,layers:s.layers.filter(l=>l.id!==selected)}));setSelected(null);}}>×</button></>}
 <button aria-label="Export composition" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(scene)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=chapter.id+'-composition.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>↓</button><button aria-label="Import composition" onClick={()=>importInput.current?.click()}>↑</button><span role="status" aria-label={saved?'Saved locally':'Not yet saved; export to keep a copy'}>{saved?'✓':'○'}</span>
 <input hidden ref={bgInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(f){const src=await fileData(f);setScene(s=>({...s,background:src,custom:true}));}e.target.value='';}}/>
 <input hidden ref={fishInput} type="file" accept="image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(f){const src=await fileData(f),id=crypto.randomUUID();setScene(s=>({...s,layers:[...s.layers,{id,src,x:25,y:25,width:35}]}));setSelected(id);}e.target.value='';}}/>
 <input hidden ref={importInput} type="file" accept="application/json,.json" onChange={async e=>{try{const f=e.target.files?.[0];if(!f)return;const s=JSON.parse(await f.text());const validSrc=(v:unknown)=>typeof v==='string'&&(/^data:image\/(png|jpeg|webp);base64,/.test(v)||/^\/paintings\/(butterfly|lion|angel|opah|shark)\.png$/.test(v));if(!validSrc(s.background)||typeof s.custom!=='boolean'||!Array.isArray(s.layers)||!s.layers.every((l:Layer)=>typeof l.id==='string'&&validSrc(l.src)&&[l.x,l.y,l.width].every(Number.isFinite)&&l.x>=0&&l.x<=100&&l.y>=0&&l.y<=100&&l.width>=5&&l.width<=100))throw Error();setScene(s);setSelected(null);}catch{setSaved(false);}e.target.value='';}}/>
 </div>}</div>;
}
