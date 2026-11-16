'use client';

import { useEffect, useRef, useState } from 'react';

const TARGET_VOLUME = 0.28;
const FADE_IN_MS = 3000;

/** One site-wide audio player. Browsers may require a first user gesture to start sound. */
export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startRef = useRef<() => void>(() => {});
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;
    let attempting = false;
    let fadeFrame = 0;
    audio.volume = 0;

    const start = () => {
      if (cancelled || userPausedRef.current || attempting || !audio.paused) return;
      attempting = true;
      audio.volume = 0;
      void audio.play().then(() => {
        attempting = false;
        if (cancelled || userPausedRef.current) { audio.pause(); return; }
        setIsPlaying(true);
        const begun = performance.now();
        const fade = (now: number) => {
          if (cancelled || audio.paused) return;
          const progress = Math.min(1, (now - begun) / FADE_IN_MS);
          audio.volume = TARGET_VOLUME * progress;
          if (progress < 1) fadeFrame = requestAnimationFrame(fade);
        };
        cancelAnimationFrame(fadeFrame);
        fadeFrame = requestAnimationFrame(fade);
      }).catch(() => {
        attempting = false;
        if (!cancelled) setIsPlaying(false);
      });
    };
    startRef.current = start;

    // Try on entry; if sound autoplay is blocked, try again on the first interaction.
    start();
    const onGesture = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-music-toggle]')) return;
      start();
    };
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    return () => {
      cancelled = true;
      cancelAnimationFrame(fadeFrame);
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      userPausedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      userPausedRef.current = false;
      startRef.current();
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/background.ogg" preload="metadata" loop
        onPause={() => setIsPlaying(false)} />
      <button className="music-toggle" data-music-toggle type="button" onClick={toggle}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        aria-pressed={isPlaying} title={isPlaying ? 'Pause music' : 'Play music'}>
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4Z" />
          {isPlaying ? (
            <><path d="M16 9a4 4 0 0 1 0 6" /><path d="M18.5 6a8 8 0 0 1 0 12" /></>
          ) : (
            <path d="m16 9 5 6m0-6-5 6" />
          )}
        </svg>
      </button>
    </>
  );
}
