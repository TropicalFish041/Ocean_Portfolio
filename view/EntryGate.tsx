'use client';

import { useEffect, useState } from 'react';

const SKY_FRAMES = 3;
const SKY_FRAME_MS = 1100; // preserve the existing three-frame cadence
const EXIT_MS = 4400; // three descents: about 1.0s, 1.35s, then 2.05s

/** Three successive cloud sheets reveal the ocean, without changing page navigation. */
export default function EntryGate() {
  const [frame, setFrame] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('ocean-entry-active');
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('ocean-entry-active');
    };
  }, [finished]);

  useEffect(() => {
    if (finished) return;
    for (let i = 0; i < SKY_FRAMES; i++) {
      const image = new Image();
      image.src = `/intro/sky-${i}.png`;
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

  if (finished) return null;
  return (
    <button type="button"
      className={`entry-gate${leaving ? ' entry-gate--leaving' : ''}`}
      onClick={() => setLeaving(true)}
      disabled={leaving}
      aria-label="Click to explore the ocean portfolio">
      <div className="entry-gate__cloud-stack" aria-hidden="true">
        {[0, 1, 2].map(layer => (
          <div className="entry-gate__cloud-layer" key={layer}>
            <img src={`/intro/sky-${frame}.png`} alt="" draggable={false} />
          </div>
        ))}
      </div>
      <span className="entry-gate__prompt">click to explore</span>
    </button>
  );
}
