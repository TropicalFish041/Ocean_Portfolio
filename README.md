# Ocean Portfolio

An interactive, oil-painted ocean portfolio built with **Next.js, React, and TypeScript**.

Scroll from a nighttime sea with animated fireworks to the deep ocean. Click the five fish illustrations to explore About, Projects, Skills, Experience, and Contact.

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Commands

```bash
npm run typecheck
npm test
npm run build
```

## Customize

- Content: `data/chapters.json`
- Fish images: `public/fish/`
- Background and layout: `app/globals.css`
- Night seascape: `public/ocean/night-seascape.png`
- Fireworks: `view/Hero.tsx` and `public/animations/`

The project separates entities, use cases, interface adapters, data access, and views following Clean Architecture principles.

**Note:** The current `Hero.tsx` references `/animations/firework.gif`, but the repository contains `public/animations/firworks.gif`. Rename the asset or update the reference. The offline-preview generator also references a missing `fireworks.js` and needs updating before `npm run offline` can work.
