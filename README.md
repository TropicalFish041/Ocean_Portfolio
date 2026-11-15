# Beneath the Surface — Ruoshui Deng

A minimal, single-page ocean portfolio. Scroll from a **vector sunset** into increasingly deep water; choose one of five **transparent PNG fish paintings** to read more about the person behind the site.

## Run locally

Requires Node.js 20+ to run the website; **Node.js 22.16+** is needed for the dependency-free TypeScript unit-test command (`npm test`).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. To build the deployable static site:

```bash
npm run typecheck
npm test
npm run build
```

The build produces `out/`. Deploy that folder as a static website. Because `next.config.ts` uses `output: 'export'`, no Node.js server is needed to host the output.

## Edit the site

- **Personal information and chapter titles:** `data_access/StaticChapterRepository.ts`
- **Fish PNGs:** `public/fish/` (five uploaded originals, alpha channel intact)
- **Colors, gradients, layout and motion:** `app/globals.css`
- **Vector sunset and waves:** `view/Hero.tsx`
- **Fish layout / click cue:** `view/ChapterSection.tsx`
- **Modal design:** `view/ChapterDialog.tsx`

The chapter order is Butterflyfish → Lionfish → Peppermint Angelfish → Opah → Shark and pilot fish. The five chapters show About Me, Selected Projects, Technical Toolkit, Experience and Let's Connect.

The site is responsive and respects `prefers-reduced-motion`. Fish are buttons (keyboard-operable). The information panel is a native `<dialog>` that supports Escape, backdrop clicking and an explicit close button.

## What was removed

The former picture composition editor, drag-and-drop/resize tools, JSON import/export, IndexedDB persistence, baked-in collage hotspots, generated SVG fish, unused ocean assets and GSAP dependency are no longer part of this project.

See `docs/ARCHITECTURE.md` for the before/after review, data flow, SOLID trade-offs and test plan.
