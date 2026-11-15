'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type Firework = {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
  frame: number | null; // null during the 400 ms pause after a burst
  nextAt: number;
};

// The original GIF has five 220ms frames; frame 0 is fully transparent. Start at frame 1 so at least one burst stays visible.
const FRAME_COUNT = 5;
const FRAME_MS = 250;
const WAIT_MS = 600;
const PAINTING_HORIZON = 0.565;
const framePath = (frame: number) => `/animations/firework-frames/${frame}.png`;

function createFirework(id: number, previous?: Firework, now = performance.now()): Firework {
  let x = 16 + Math.random() * 68;
  if (previous && Math.abs(x - previous.x) < 12) {
    x = 16 + ((x - 16 + 19) % 68);
  }
  let hue = Math.floor(Math.random() * 360);
  if (previous && Math.abs(((hue - previous.hue + 540) % 360) - 180) < 38) {
    hue = (hue + 90) % 360;
  }
  return {
    id,
    x,
    y: 2 + Math.random() * 12,
    size: 260 + Math.random() * 280,
    hue,
    frame: 1,
    nextAt: now + FRAME_MS,
  };
}

interface HeroProps {
  onContact: () => void;
}

export default function Hero({ onContact }: HeroProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const nextId = useRef(0);
  const [seaHorizon, setSeaHorizon] = useState('56%');
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showScrollCue, setShowScrollCue] = useState(true);

  // object-fit: cover crops the painting. Position reflections at the visible waterline.
  useEffect(() => {
    const hero = heroRef.current;
    const image = imageRef.current;
    if (!hero || !image) return;
    const measure = () => {
      const { width, height } = hero.getBoundingClientRect();
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      if (!iw || !ih || !width || !height) return;
      const scale = Math.max(width / iw, height / ih);
      const croppedTop = (ih * scale - height) / 2;
      const waterline = ih * PAINTING_HORIZON * scale - croppedTop;
      setSeaHorizon(`${Math.max(0, Math.min(height, waterline))}px`);
    };
    image.addEventListener('load', measure);
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    measure();
    return () => {
      image.removeEventListener('load', measure);
      observer.disconnect();
    };
  }, []);

  // Keep the hint visible only while the user is at the top of the page.
  useEffect(() => {
    const update = () => setShowScrollCue(window.scrollY < 35);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const initialCount = 1 + Math.floor(Math.random() * 3);
    setFireworks(Array.from({ length: initialCount }, () => createFirework(nextId.current++)));

    // Each burst shows frames 1–4 once, disappears for 400ms, then respawns.
    // We check deadlines instead of rounding 400ms to a 220ms frame interval.
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const now = performance.now();
      setFireworks(current => {
        let changed = false;
        const next = current.map(burst => {
          if (now < burst.nextAt) return burst;
          changed = true;

          if (burst.frame === null) {
            return createFirework(nextId.current++, burst, now);
          }
          if (burst.frame < FRAME_COUNT - 1) {
            return { ...burst, frame: burst.frame + 1, nextAt: now + FRAME_MS };
          }
          return { ...burst, frame: null, nextAt: now + WAIT_MS };
        });

        // Vary the number of independently animated slots (1–3) at burst boundaries.
        const finished = next.some((burst, index) => burst.frame === null && current[index].frame !== null);
        if (finished && next.length < 3 && Math.random() < 0.12) {
          next.push(createFirework(nextId.current++, undefined, now));
        } else if (finished && next.length > 1 && Math.random() < 0.08) {
          const index = next.findIndex((burst, i) => burst.frame === null && current[i]?.frame !== null);
          if (index !== -1) next.splice(index, 1);
        }
        return changed ? next : current;
      });
    }, 25);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section ref={heroRef} className="hero" id="surface"
      aria-label="Oil-painted night sea with fireworks"
      style={{ '--sea-horizon': seaHorizon } as CSSProperties}>
      <img ref={imageRef} className="hero__seascape" src="/ocean/night-seascape.png" alt="" />
      <div className="hero__fade" aria-hidden="true" />

      <h1 className="hero__handwritten-name">Ruoshui Deng</h1>
      <a className={`hero__scroll-cue${showScrollCue ? '' : ' hero__scroll-cue--hidden'}`}
        href="#about" aria-label="Scroll to view my work" aria-hidden={!showScrollCue}
        tabIndex={showScrollCue ? 0 : -1}>
        <span>Scroll to view my work</span>
        <svg viewBox="0 0 32 42" fill="none" aria-hidden="true">
          <path d="M16 2V35M5 25L16 36L27 25" stroke="currentColor" strokeWidth="2.3"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
      <button className="hero__contact-brush" type="button" onClick={onContact}
        aria-label="Contact Ruoshui Deng">
        <svg viewBox="0 0 190 72" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12 20 52 12 98 17 145 10 180 23 169 37 185 50 130 54 76 58 20 50 4 40Z" fill="#07070d" />
          <path d="M15 23Q72 11 168 24M8 35Q98 20 178 36M20 47Q92 57 169 43" stroke="#101019"
            strokeWidth="10" strokeLinecap="round" opacity=".8" />
          <path d="M24 14 70 10M132 59 160 53M5 48 32 53" stroke="#020208" strokeWidth="3"
            strokeLinecap="round" opacity=".8" />
        </svg>
        <span>Contact</span>
      </button>

      {fireworks.filter(burst => burst.frame !== null).map(burst => {
        const style = {
          left: `${burst.x}%`,
          width: `min(${burst.size}px, 88vw)`,
          '--firework-hue': `${burst.hue}deg`,
        } as CSSProperties;
        const src = framePath(burst.frame!);
        return (
          <div className="firework-pair" key={burst.id} aria-hidden="true">
            <div className="gif-firework gif-firework--sky" style={{ ...style, top: `${burst.y}%` }}>
              <img src={src} alt="" />
            </div>
            <div className="gif-firework gif-firework--reflection" style={style}>
              <img src={src} alt="" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
