'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters, type Chapter } from '../data/portfolio';
import Composition from './Composition';
function ContentPanel({chapter,onClose}:{chapter:Chapter|null;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(chapter){dialog.current?.showModal();document.body.style.overflow='hidden';}else{dialog.current?.close();document.body.style.overflow='';}return()=>{document.body.style.overflow='';};},[chapter]);
 return <dialog ref={dialog} className="content-panel" aria-labelledby="panel-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="panel-inner"><button className="close" onClick={onClose} aria-label="Close panel">×</button>{chapter&&<><h2 id="panel-title">{chapter.title}</h2><div className="panel-items">{chapter.items.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>{chapter.id==='contact'?<a href="mailto:ruoshui.deng@mail.utoronto.ca">Email ↗</a>:<a href="/ruoshui-deng-cv.pdf" target="_blank" rel="noreferrer">CV ↗</a>}</>}</div></dialog>
}
const fishNames = ['Butterflyfish', 'Lionfish', 'Peppermint Angelfish', 'Opah', 'Shark and pilot fish'];
export default function Journey(){
 const root=useRef<HTMLElement>(null);const [active,setActive]=useState<Chapter|null>(null);const [paused,setPaused]=useState(false);const [editing,setEditing]=useState(false);
 useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const media=gsap.matchMedia();const ctx=gsap.context(()=>{media.add('(prefers-reduced-motion: no-preference)',()=>{
 gsap.to('.sun-glow',{opacity:0,scrollTrigger:{trigger:'.opening-painting',start:'top top',end:'bottom top',scrub:true}});
 });},root);return()=>{media.revert();ctx.revert();};},[]);
 return <main ref={root} className={'ocean-world'+(paused?' paused':'')} id="surface" aria-label="Ruoshui Deng underwater portfolio">
 <section className="opening-painting" aria-label="Sunset ocean"><div className="wave-frame"><img className="sunset-original" src="/paintings/sunset.png" alt="Impasto sunset over a turquoise ocean wave" fetchPriority="high"/><div className="moving-water" aria-hidden="true"/><div className="sun-glow" aria-hidden="true"/><div className="water-light" aria-hidden="true"/></div><a href="#about" className="descend" aria-label="Dive underwater">↓</a></section>
 {chapters.map((chapter,i)=><section className={'painting-scene scene-'+chapter.fish} id={chapter.id} key={chapter.id} aria-label={fishNames[i]}><Composition chapter={chapter} editing={editing} onOpen={()=>setActive(chapter)}/></section>)}
 <div className="quiet-controls"><button onClick={()=>setEditing(!editing)} aria-label={editing?'Finish composition':'Edit composition'} aria-pressed={editing}>{editing?'✓':'✎'}</button><button onClick={()=>setPaused(!paused)} aria-label={paused?'Resume ambient motion':'Pause ambient motion'} aria-pressed={paused}>{paused?'▷':'Ⅱ'}</button><a href="#surface" aria-label="Return to surface">↑</a></div>
 <ContentPanel chapter={active} onClose={()=>setActive(null)}/></main>
}
