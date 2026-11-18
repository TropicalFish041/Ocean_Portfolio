'use client';

import { useEffect, useRef, useState } from 'react';

const SKY_FRAMES = 3;
const SKY_FRAME_MS = 1100; // unchanged cadence
const EXIT_MS = 4650; // slightly longer than the slowest cloud layer

/** Three overlapping transparent SVG sheets; each exits upward at its own speed. */
export default function EntryGate() {
  const [frame, setFrame] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const nightReady = useRef<Promise<void>>(Promise.resolve());
  const entering = useRef(false);
  const mounted = useRef(true);

  // Predecode the FIRST visible sea frame during the opening animation.
  // The moving clouds must never reveal an unloaded image underneath.
  useEffect(() => {
    mounted.current = true;
    const painting = new Image();
    painting.src = '/ocean/night-frame-0.svg';
    nightReady.current = painting.decode().catch(() => undefined);
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (finished) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('ocean-entry-active');
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('ocean-entry-active', 'ocean-entry-leaving');
    };
  }, [finished]);

  useEffect(() => {
    if (finished) return;
    for (let i = 0; i < SKY_FRAMES; i++) {
      const image = new Image();
      image.src = `/intro/sky-front-${i}.svg`;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFrame(previous => (previous + 1) % SKY_FRAMES);
    }, SKY_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (!leaving) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setFinished(true), reduced ? 150 : EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  const enter = () => {
    if (leaving || entering.current) return;
    entering.current = true;
    // Await the cached first sea image BEFORE any clouds begin to rise.
    // Normally it is already decoded by the time the user clicks.
    void nightReady.current.then(() => {
      if (!mounted.current) return;
      document.body.classList.add('ocean-entry-leaving');
      setLeaving(true);
    });
  };

  if (finished) return null;
  return (
    <button type="button"
      className={`entry-gate${leaving ? ' entry-gate--leaving' : ''}`}
      onClick={enter}
      disabled={leaving}
      aria-label="Click to explore the ocean portfolio">
      <div className="entry-gate__cloud-stack" aria-hidden="true">
        {[0, 1, 2].map(layer => (
          <div className={`entry-gate__cloud-layer entry-gate__cloud-layer--${layer + 1}`} key={layer}>
            <img src={`/intro/sky-front-${frame}.svg`} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <span className="entry-gate__prompt">click to explore</span>
    </button>
  );
}
