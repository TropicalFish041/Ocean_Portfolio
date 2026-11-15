# Minimal Ocean Portfolio

A one-page Next.js / TypeScript website. Its **visible page contains a hand-painted nighttime ocean with animated fireworks, followed by a continuously darkening impasto-oil-paint gradient and five transparent PNG artworks**. The original oil-paint bristle texture remains in place throughout the undersea journey; the top surface now shows the user-supplied nighttime seascape. No headers, navigation, captions, footer, extra images, editor, database, or animation library. Click a fish to see its information panel; press Escape, click outside the panel, or use × to close.

## Option A — open immediately without installing anything

**Double-click `offline-preview.html`**, included in the ZIP. This standalone HTML bundles the same artwork, painted background, and information text; it runs offline in a modern browser without Node.js or a server.

## Option B — run the editable Next.js website locally

1. Install [Node.js](https://nodejs.org/) (Node 22 recommended).
2. Open a terminal in this extracted project folder.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open **http://localhost:3000** in a browser.

To stop: `Ctrl+C`. To validate and build:

```bash
npm run typecheck
npm test
npm run build
```

`npm run build` produces `out/` for static hosting. `npm test` requires Node.js 22.16 or newer.

## What to edit

- **Content shown on fish click:** `data/chapters.json`
- **Five transparent fish artwork files:** `public/fish/`
- **Night sea painting:** `public/ocean/night-seascape.png`
- **Canvas fireworks and their synchronized water reflections:** `public/animations/fireworks.js`
- **Oil-paint relief texture:** `public/textures/impasto-relief.webp` (a grayscale painting-texture layer, tinted by the CSS palette)
- **Ocean color palette, oil-paint texture and fish positioning:** `app/globals.css`
- **Clicked-fish interaction:** `view/ChapterSection.tsx`
- **Panel:** `view/ChapterDialog.tsx`

To regenerate the double-click preview after changing content, CSS, or fish art:

```bash
npm run offline
```

The offline preview is a convenience artifact, not the source of truth for the application. It uses the same chapter JSON, CSS, and PNGs. No changes are made to your GitHub repository by this ZIP.

## Replacing the existing GitHub working copy

Back up the working copy first. To ensure removed old code does not remain, **keep its `.git/` folder**, delete the other old files and folders, then copy the **contents** of this ZIP's `Personal_Website_Night_Fireworks/` directory into the repository root. Use `git status` to review additions and deletions before committing. Alternatively, use this extracted folder as an entirely new local project without touching GitHub.

On Windows, `OPEN_OFFLINE_PREVIEW_WINDOWS.bat` opens the offline HTML without installing anything. `START_LOCAL_WINDOWS.bat` installs dependencies and starts the Next.js development server (requires Node.js).

## November 2026 — Night sea and fireworks revision

The top surface scene now uses the supplied impasto nighttime seascape, with distant shoreline lights. The original continuous oil-paint relief texture is unchanged and continues throughout the fish scenes. The shared CSS gradient starts at `--surface-blue` (`#0b205b`) directly beneath the image's lower fade, then gradually darkens to `#020612` in the deepest scene; no additional text or page controls were introduced.

A small canvas overlay (`public/animations/fireworks.js`) paints **1–3 concurrent fireworks** with irregular, short palette-knife marks in randomly chosen sizes and color palettes. Each active burst produces a synchronized, rippling color reflection below the waterline. Animation pauses when the surface is offscreen or hidden and stays off when Reduced Motion is enabled. The engine is view-only; all five fish, content, data, interactors and dialog remain unchanged.

To change fireworks colors, timing or density, edit `public/animations/fireworks.js`. To change the top artwork, replace `public/ocean/night-seascape.png` with an image of the same filename. After any changes, run `npm run offline` to regenerate the single-file preview.
