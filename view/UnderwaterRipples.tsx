'use client';

import { useEffect, useState } from 'react';

type Ripple = {
  id: number;
  d: string;
  strokeWidth: number;
  duration: number;
  delay: number;
};

const COUNT = 72;
const random = (a: number, b: number) => a + Math.random() * (b - a);

function makeRipple(id: number, initial: boolean): Ripple {
  const length = random(65, 235);
  const x = random(10, 1190 - length);
  const y = random(35, 4665);
  const bend = random(-12, 12);
  const duration = random(12, 23);
  return {
    id,
    d: `M ${x} ${y} c ${length * .32} ${bend} ${length * .68} ${-bend} ${length} ${random(-8, 8)}`,
    // One quarter of the previous width (8x -> 2x original).
    strokeWidth: random(1.56, 2.35) * 2,
    duration,
    delay: initial ? random(-duration, 0) : 0,
  };
}

/** Sparse, freely moving lines below the nighttime painting. */
export default function UnderwaterRipples() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    setRipples(Array.from({ length: COUNT }, (_, i) => makeRipple(i, true)));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id = COUNT;
    // Randomly retire and respawn a few lines instead of looping a static texture.
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setRipples(previous => {
        const next = [...previous];
        for (let i = 0; i < 3; i++) {
          next[Math.floor(Math.random() * COUNT)] = makeRipple(id++, false);
        }
        return next;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <svg className="underwater-ripples" viewBox="0 0 1200 4700"
      preserveAspectRatio="none" aria-hidden="true">
      {ripples.map(ripple => (
        <path key={ripple.id} d={ripple.d} strokeWidth={ripple.strokeWidth}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ animationDuration: `${ripple.duration}s`, animationDelay: `${ripple.delay}s` }} />
      ))}
    </svg>
  );
}
