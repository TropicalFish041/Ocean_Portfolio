'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type Firework = {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
};

const GIF_PATH = '/animations/firworks.gif'; // Filename in the current repository.
const PAINTING_HORIZON = 0.565; // Shoreline in the supplied painting, as a fraction of image height.

export default function Hero() {
  const imageRef = useRef<HTMLImageElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const nextId = useRef(0);
  const [seaHorizon, setSeaHorizon] = useState('56%');
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  // object-fit: cover can crop the original painting. Track the visible horizon
  // so reflections always begin at the WATERLINE, at every viewport size.
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

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const spawn = () => {
      const count = 1 + Math.floor(Math.random() * 3);
      setFireworks(Array.from({ length: count }, () => ({
        id: nextId.current++,
        x: 16 + Math.random() * 68,
        y: 2 + Math.random() * 12,
        // Former size: roughly 200px. Average size is now 400px (2x).
        size: 260 + Math.random() * 280,
        hue: Math.floor(Math.random() * 360),
      })));
    };
    spawn();
    const interval = window.setInterval(spawn, 4500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="surface"
      aria-label="Oil-painted night sea with fireworks"
      style={{ '--sea-horizon': seaHorizon } as CSSProperties}
    >
      <img ref={imageRef} className="hero__seascape" src="/ocean/night-seascape.png" alt="" />
      <div className="hero__fade" aria-hidden="true" />

      {fireworks.map((firework) => {
        const style = {
          left: `${firework.x}%`,
          width: `min(${firework.size}px, 88vw)`,
          '--firework-hue': `${firework.hue}deg`,
        } as CSSProperties;
        return (
          <div className="firework-pair" key={firework.id} aria-hidden="true">
            <div className="gif-firework gif-firework--sky" style={{ ...style, top: `${firework.y}%` }}>
              <img src={GIF_PATH} alt="" />
            </div>
            <div className="gif-firework gif-firework--reflection" style={style}>
              <img src={GIF_PATH} alt="" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
