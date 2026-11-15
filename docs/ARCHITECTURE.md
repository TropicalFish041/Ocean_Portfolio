# Architecture review and refactor notes

## Source inspected

GitHub repository `TropicalFish041/Personal_Website`, default `main`, inspected on 2026-11-14. Key source files: `components/Composition.tsx`, `components/Journey.tsx`, `components/OceanArt.tsx`, `data/portfolio.ts`, `app/globals.css`, `app/page.tsx`, `app/layout.tsx`, `package.json`, `next.config.ts`. The starting project used **Next.js / React / TypeScript**, not Java/Swing.

## Before editing: identified risks

| Existing code | Concern | Principle | Action |
| --- | --- | --- | --- |
| `Composition.tsx` | Rendering, editing, pointer-alpha detection, pointer drag, image uploads, JSON import/export and IndexedDB persistence coexist | SRP; mixed view/infrastructure responsibilities | Remove the entire editor as out of scope; replace with a small declarative fish button |
| `Journey.tsx` | Scroll-trigger setup, media motion, chapter selection, panel state, dialog markup and scene composition coupled together | SRP; UI/use-case coupling | Split hero, scene and dialog; connect them through a selection use case |
| `data/portfolio.ts` | Static content is simultaneously presentation config | DIP / testability risk | Define a domain `Chapter` model and a narrow query gateway with a static implementation |
| `OceanArt.tsx` | An unused programmatic SVG fish renderer, duplicating user-supplied illustrations | Unneeded complexity | Delete instead of adding abstraction |
| `app/globals.css` | Overlapping painting, editing and panel rules, with appended overrides | Maintainability / SRP | Rewrite from scratch for the five new scenes |
| `package.json` | GSAP remains despite the simplified interaction | Unnecessary dependency | Remove GSAP |

**LSP:** No unsupported inheritance hierarchy or meaningful substitution issue was found. **ISP:** The old code had no broad shared service interface forcing irrelevant methods, so no existing ISP violation is claimed. **OCP:** Previously, interaction behavior and painting composition were coupled; the refactor makes new chapters content-driven. OCP is improved for new chapters, but new interaction types may still require view changes, which is reasonable for this small site.

## Changes, in dependency-safe order

1. **Scope reduction (SRP):** Removed editor and persistence functionality, previous painted-collage assets, baked-in SVG hotspot outlines and GSAP. Only the five uploaded transparent PNG assets are included. The original information content is retained.
2. **Domain and application boundaries (DIP):** Added `entity/Chapter.ts` and `use_case/showChapter.ts`. The interactor depends exclusively on `ChapterReadGateway` and `ShowChapterOutputBoundary`, both defined in the use-case layer. It has no React, Next.js, browser or database import.
3. **Adapters (SRP, ISP):** Introduced a minimal controller translating a clicked ID to input data, and a presenter mapping output data to `ChapterViewModel`. `StaticChapterRepository` implements the single-method read gateway.
4. **Composition and UI (SRP):** `app/ClientApp.tsx` wires the concrete repository, presenter, interactor and controller. `view/*` only renders and raises interactions. `Hero.tsx` draws the vector background; `ChapterSection.tsx` displays clickable PNG paintings; `ChapterDialog.tsx` hosts the native modal.
5. **Validation:** Added Node-based unit tests for ordering, asset references, gateway behavior, unknown selections and controller → interactor → presenter flow.

No classes were moved for cosmetic reasons. Since the app has one small use case, related input/output ports and DTOs share one module rather than creating a file per interface.

## Final dependency structure

```text
app/                          Next.js route + composition root
  layout.tsx
  page.tsx
  ClientApp.tsx  ─┐
                 ├──> interface_adapter/ (Controller, Presenter, ViewModel)
                 ├──> data_access/ (StaticChapterRepository)
                 ├──> use_case/ (ShowChapterInteractor)
                 └──> view/ (Hero, ChapterSection, ChapterDialog, OceanJourney)
view/                ─────> entity/Chapter (type only)
view/                ─────> interface_adapter/ChapterViewModel (type only)
interface_adapter/   ─────> use_case/ (ports/DTOs)
data_access/         ─────> use_case/ChapterReadGateway
use_case/            ─────> entity/Chapter
entity/              ─────> no project dependencies
```

The intended interaction is:

```text
View (click fish)
  → Controller.open(id)
  → ShowChapterInputData
  → ShowChapterInputBoundary (Interactor)
  → ChapterReadGateway (StaticChapterRepository) / Chapter entity
  → ShowChapterOutputData
  → ShowChapterOutputBoundary (Presenter)
  → ChapterViewModel
  → View (dialog)
```

## SOLID assessment

- **S:** Clear boundaries for static content, interaction, presentation and drawing. Main rendering functions remain single-purpose.
- **O:** New chapter data can be added to the catalogue without modifying the use case or controller. New visual behavior can be added without altering core rules.
- **L:** Not meaningfully exercised; the only implementation of the read gateway meets its declared contract.
- **I:** One method on `ChapterReadGateway`, with two narrowly scoped use-case boundaries.
- **D:** The interactor depends on ports, not concrete repositories or presenters; the controller depends on an input boundary. Wiring happens only in `app`.

## Remaining concerns and scope limits

- This is a static portfolio, not a business application. The explicit use-case flow is small and could be simplified if strict CA layering is no longer a goal. There is no need for database or API implementations.
- `app/ClientApp.tsx` intentionally depends on all layers because it is the composition root. The view receives `Chapter` for display, and only a formatted `ChapterViewModel` for the selected dialog.
- The visual click target is the transparent PNG's **image rectangle** (keyboard-accessible button), not a per-pixel alpha mask. This is a usability trade-off to avoid complex pointer logic. If exact hit testing becomes a requirement, add a focused accessibility-aware hit-test adapter without mixing it into data access.
- The original profile text is editable content, not independently verified biographical information. Update it in the static catalogue as needed.

## Tests to add / keep

- Unit tests: chapter order, missing IDs, repository behavior, presenter mapping, path existence and stable five-item catalogue.
- Browser smoke tests (recommended in CI with Playwright): verify scroll across all scenes, mobile breakpoints, click each fish, close with Escape and backdrop, keyboard focus restoration and reduced-motion preference.
- Build checks in CI: `npm run typecheck`, `npm test`, `npm run build`.
