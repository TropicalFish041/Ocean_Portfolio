# Architecture review — minimal ocean portfolio

## Actual repository audited

`TropicalFish041/Personal_Website`, `main`. Stack: Next.js 15, React 19, TypeScript. The repository already uses a small Clean Architecture pipeline for showing chapter details. No Java/Swing classes exist or are appropriate here.

## Remaining unnecessary presentation (before this revision)

| File | Unnecessary responsibility/content | SOLID / CA effect | Change |
| --- | --- | --- | --- |
| `view/Hero.tsx` | Heading, introduction, and scrolling instructions | Display violates the requested minimal responsibility, not a strict SOLID violation | Remove all visible text; produce sunset only using vector CSS |
| `view/OceanJourney.tsx` | Header/navigation and footer text | Extra UI responsibility | Remove completely |
| `view/ChapterSection.tsx` | Title, eyebrow, subtitle, teaser, discovery hint, and chapter counter | SRP: interactive fish mixed with nonessential editorial content | Render fish button alone; optional alpha-aware hit testing is local to the view |
| `view/ChapterDialog.tsx` | Decorative labels, repeated intro, extra external navigation link | Redundant information | Keep only title, item list, and close control |
| `entity/Chapter.ts` + presenter | Chapter DTO included editorial fields no longer displayed | Excess model and adapter maintenance, OCP risk when content changes | Narrow entity and view model; eliminate unused fields |
| `app/globals.css` | Numerous rules for deleted copy and navigation | Maintainability / unused CSS | Replace with small scene, fish, and modal style sheet |

No demonstrated LSP problem was found. The single `ChapterReadGateway` method satisfies ISP; creating another interface would be unnecessary. The existing use-case and dependency injection already satisfy the relevant DIP constraint.

## Small, correct dependency direction

```text
app/ClientApp.tsx                         composition root (only place with concrete wiring)
    ├── view/                             React UI, CSS gradient, fish buttons, dialog
    ├── interface_adapter/                controller, presenter, dialog view model
    ├── data_access/StaticChapterRepository.ts  concrete static JSON adapter
    │    └── data/chapters.json
    └── use_case/showChapter.ts           input/output boundaries + interactor
         └── entity/Chapter.ts            framework-agnostic portfolio types
```

Click flow:

```text
Fish button → ShowChapterController.open(id)
→ ShowChapterInteractor.execute({chapterId})
→ ChapterReadGateway.findById(id)
→ ShowChapterPresenter.present({chapter})
→ ChapterViewModel → accessible native <dialog>
```

Application rules do **not** import React, the modal, the concrete JSON repository, or Next.js. The controller depends on the input boundary, and the repository implements a narrow gateway defined by the use case. No persistent state is needed; the displayed dialog is ephemeral React state.

## SOLID summary

- **SRP:** distinct concerns for portfolio data, selecting content, formatting output, drawing scenes, and modal interaction.
- **OCP:** adding or updating chapters is data-driven, without altering the interactor, controller, or presenter.
- **LSP:** no inheritance hierarchy; fake gateway substitution is tested.
- **ISP:** one narrow gateway method and separate input/output boundaries.
- **DIP:** inward application dependencies; concrete wiring stays in `app/ClientApp.tsx`.

## Remaining concerns

- The design is deliberately static. More interfaces, persistence or API adapters would be over-engineering without new requirements.
- Pixel-accurate pointer hit-testing works on transparent PNG alpha using canvas; keyboard activation always opens the panel. If canvas reading fails, the click gracefully uses the accessible image rectangle.
- Details in the portfolio JSON are user-editable; review their factual accuracy before public deployment.

## Validation

Run `npm test` to check the five image assets, ordering, dependency direction, selected chapter pipeline, adapter substitution, and absence of visible on-page copy. Browser tests should verify clicking all fish, transparent-area non-activation, Escape/backdrop/close, mobile layout and reduced motion. Run `npm run build` after installing dependencies.
