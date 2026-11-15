
'use client';

import { useEffect, useState } from 'react';

type Firework = {
  id: number;
  x: number;
  size: number;
};

export default function Hero() {
  const [fireworks, setFireworks] = useState<Firework[]>([
    { id: 0, x: 35, size: 200 },
  ]);

  useEffect(() => {
    const update = () => {
      const count = 1 + Math.floor(Math.random() * 3);

      setFireworks(
        Array.from({ length: count }, (_, id) => ({
          id,
          x: 15 + Math.random() * 70,
          size: 130 + Math.random() * 130,
        }))
      );
    };

    const interval = window.setInterval(update, 4500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="hero" id="surface">
      <img
        className="hero__seascape"
        src="/ocean/night-seascape.png"
        alt=""
      />

      <div className="hero__fade" aria-hidden="true" />

      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="gif-firework"
          style={{
            left: `${firework.x}%`,
            width: `${firework.size}px`,
          }}
          aria-hidden="true"
        >
          <img
            className="gif-firework__sky"
            src="/animations/firework.gif"
            alt=""
          />

          <img
            className="gif-firework__reflection"
            src="/animations/firework.gif"
            alt=""
          />
        </div>
      ))}
    </section>
  );
}
