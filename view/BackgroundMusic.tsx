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
    let videoPlaying = false;
    let resumeAfterVideo = false;
    audio.volume = 0;

    function start() {
      if (!audio || cancelled || videoPlaying || attempting || !audio.paused) return;
      attempting = true;
      audio.volume = 0;
      // The initial attempt may be blocked; a click on the entry screen unlocks sound.
      void audio.play().then(() => {
        attempting = false;
        if (cancelled || videoPlaying) { audio.pause(); return; }
        const started = performance.now();
        cancelAnimationFrame(fadeFrame);
        const fade = (now: number) => {
          if (cancelled || audio.paused || videoPlaying) return;
          const progress = Math.min(1, (now - started) / FADE_IN_MS);
          audio.volume = TARGET_VOLUME * progress;
          if (progress < 1) fadeFrame = requestAnimationFrame(fade);
        };
        fadeFrame = requestAnimationFrame(fade);
      }).catch(() => { attempting = false; });
    }

    const isArtVideo = (target: EventTarget | null): target is HTMLVideoElement =>
      target instanceof HTMLVideoElement && target.hasAttribute('data-art-video');
    const anyVideoPlaying = () => Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-art-video]'))
      .some(video => !video.paused && !video.ended);

    function onVideoPlay(event: Event) {
      if (!isArtVideo(event.target)) return;
      if (!videoPlaying) resumeAfterVideo = !audio!.paused || attempting;
      videoPlaying = true;
      cancelAnimationFrame(fadeFrame);
      audio!.pause();
    }
    function resumeIfSafe() {
      if (cancelled || anyVideoPlaying()) return;
      videoPlaying = false;
      if (resumeAfterVideo) { resumeAfterVideo = false; start(); }
    }
    function onVideoStop(event: Event) {
      if (!isArtVideo(event.target)) return;
      queueMicrotask(resumeIfSafe); // allows another video to start first
    }

    // Media events don't bubble, so listen in the capture phase.
    document.addEventListener('play', onVideoPlay, true);
    document.addEventListener('pause', onVideoStop, true);
    document.addEventListener('ended', onVideoStop, true);
    window.addEventListener('ocean:gallery-closed', resumeIfSafe);

    // Browsers that block audible autoplay still require a real user gesture.
    start();
    audio.addEventListener('canplay', start);
    window.addEventListener('pageshow', start);
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      cancelled = true;
      cancelAnimationFrame(fadeFrame);
      document.removeEventListener('play', onVideoPlay, true);
      document.removeEventListener('pause', onVideoStop, true);
      document.removeEventListener('ended', onVideoStop, true);
      window.removeEventListener('ocean:gallery-closed', resumeIfSafe);
      audio.removeEventListener('canplay', start);
      window.removeEventListener('pageshow', start);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      audio.pause();
    };
  }, []);

  return <audio ref={audioRef} src="/audio/background.ogg" preload="auto" autoPlay loop aria-hidden="true" />;
}
