'use client';

import { useEffect, useState } from 'react';

const SKY_FRAMES = 3;
const SKY_FRAME_MS = 1100;
const EXIT_MS = 1150;

/** A visual entry curtain. The downward-camera effect reveals the unchanged page. */
export default function EntryGate() {
  const [frame, setFrame] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = previousOverflow; };
  }, [finished]);

  useEffect(() => {
    if (leaving || finished || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Prefetch all frames, so playback does not flash during the first cycle.
    for (let i = 0; i < SKY_FRAMES; i++) {
      const image = new Image();
      image.src = `/intro/sky-${i}.png`;
    }
    const timer = window.setInterval(() => {
      if (!document.hidden) setFrame(previous => (previous + 1) % SKY_FRAMES);
    }, SKY_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [leaving, finished]);

  useEffect(() => {
    if (!leaving) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setFinished(true), reduced ? 0 : EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (finished) return null;
  return (
    <button type="button"
      className={`entry-gate${leaving ? ' entry-gate--leaving' : ''}`}
      onClick={() => setLeaving(true)}
      disabled={leaving}
      aria-label="Click to explore the ocean portfolio">
      <img src={`/intro/sky-${frame}.png`} alt="" aria-hidden="true" draggable={false}/>
      <span>click to explore</span>
    </button>
  );
}
