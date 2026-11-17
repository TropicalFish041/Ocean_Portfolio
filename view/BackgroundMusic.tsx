'use client';

import { useEffect, useRef } from 'react';

const TARGET_VOLUME = 0.28;
const FADE_IN_MS = 3000;

/** One invisible site-wide player. Audible autoplay is browser-permission dependent. */
export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    let attempting = false;
    let fadeFrame = 0;
    audio.volume = 0;

    function start() {
      if (!audio || cancelled || attempting || !audio.paused) return;
      attempting = true;
      audio.volume = 0;
      // The initial attempt may be blocked; a click on the entry screen unlocks sound.
      void audio.play().then(() => {
        attempting = false;
        if (cancelled) { audio.pause(); return; }
        const started = performance.now();
        cancelAnimationFrame(fadeFrame);
        const fade = (now: number) => {
          if (cancelled || audio.paused) return;
          const progress = Math.min(1, (now - started) / FADE_IN_MS);
          audio.volume = TARGET_VOLUME * progress;
          if (progress < 1) fadeFrame = requestAnimationFrame(fade);
        };
        fadeFrame = requestAnimationFrame(fade);
      }).catch(() => { attempting = false; });
    }
    start();
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      cancelled = true;
      cancelAnimationFrame(fadeFrame);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      audio.pause();
    };
  }, []);

  return <audio ref={audioRef} src="/audio/background.ogg" preload="auto" autoPlay loop aria-hidden="true" />;
}
