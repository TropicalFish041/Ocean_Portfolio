# Minimal Ocean Portfolio

A one-page Next.js / TypeScript website. Its **visible page contains only a continuously transitioning impasto-oil-paint color field and five transparent PNG artworks**. The oil-paint bristle texture is composited over a single CSS gradient; no extra scenic imagery is added. No headers, navigation, captions, footer, extra images, editor, database, or animation library. Click a fish to see its information panel; press Escape, click outside the panel, or use × to close.

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

Back up the working copy first. To ensure removed old code does not remain, **keep its `.git/` folder**, delete the other old files and folders, then copy the **contents** of this ZIP's `Personal_Website_Minimal/` directory into the repository root. Use `git status` to review additions and deletions before committing. Alternatively, use this extracted folder as an entirely new local project without touching GitHub.

On Windows, `OPEN_OFFLINE_PREVIEW_WINDOWS.bat` opens the offline HTML without installing anything. `START_LOCAL_WINDOWS.bat` installs dependencies and starts the Next.js development server (requires Node.js).

## Oil-paint background design

The only visual change from the previous minimal version is the painted background: `app/globals.css` provides a single continuous warm-coral → peach → seafoam → teal → midnight-blue gradient. A grayscale impasto relief texture (`public/textures/impasto-relief.webp`) is blended into this gradient using `mix-blend-mode: overlay`. The result is a colored, palette-knife / brushstroke surface rather than smooth digital gradients. No extra art objects, sections, labels, or architectural layers are introduced. To recolor the ocean, edit the colors in `.ocean-world`; the painted strokes follow automatically.
