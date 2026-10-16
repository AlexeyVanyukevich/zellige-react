# zellige react v0.1 — implementation plan

Spec: `docs/superpowers/specs/2026-10-14-zellige-react-design.md`. Work happens on
`feat/zellige-react`, branched from `main` after the charter setup and the spec are committed.
Each task writes its test first and sees it fail where it can. It is done when `./run check`
passes, and it ends in one commit holding the test and the code.

There is no backlog yet. Task 12 creates `docs/backlog.md`.

## Decisions this plan adds to the spec

- **`react-aria` is pinned to exactly `3.53.1`, and `react-stately` to `3.51.0`,** the version
  `react-aria` 3.53.1 itself depends on. Core's Tabs contract records 3.53.1's attributes, so a
  caret range would let an install drift from the version the contract test proved. Raising
  either is its own commit, with the contract test run against the new version.
- **`@zellige/core` comes over git at its tag.** The dev dependency is
  `github:AlexeyVanyukevich/zellige-core#v0.1.0`; the peer range is `~0.1.0`, which an install
  from that tag satisfies because its `package.json` says `0.1.0`.
- **The browser suite runs as core's does:** Chromium in the
  `mcr.microsoft.com/playwright:v<version>-noble` image, started by `./run test`, with the runner
  and Vite on the host and `connectOptions: { wsEndpoint, exposeNetwork: '<loopback>' }`. The
  binding takes no screenshots, so this is for one Playwright setup across both repositories, not
  for identical pixels. The ports differ from core's — Vite on `5181`, the browser server on
  `3556`, moved by `ZELLIGE_BROWSER_PORT` — so both suites can run at once. Chromium only, as in
  core; WebKit goes in the backlog (Task 12).
- **Vitest has two projects in one `vitest.config.ts`:** `unit` (`tests/unit/`, Node) and
  `integration` (`tests/integration/`, jsdom). `./run check` runs `npx vitest run`.
- **What the contract test compares.** Both sides are parsed into DOM trees and walked together.
  At each element: the tag name; every attribute, with `class` compared as a set of tokens and
  `data-*` attributes left out, since the contract records none and core's CSS selects on none;
  and the trimmed text of each text node. Comments and whitespace-only text are skipped. Ids are
  normalised by order of first appearance — each distinct `id` becomes `id-1`, `id-2`, … — and
  the same mapping is applied to `for`, `aria-labelledby`, `aria-describedby` and
  `aria-controls`, so a reference to a missing id fails.
- **Rows live beside the test, one file per contract file:** `tests/integration/contract/<component>.tsx`
  exports a `Record<string, ReactElement>` keyed by example name. Until every component exists,
  `contract.test.tsx` holds a `PENDING` list of contract files that have no rows file yet; a file
  on it is skipped, and a file neither on it nor with a rows file fails. Each component task
  removes its entry; Task 10 removes the last one and the list with it.
- **The playground has two schemes, not themes:** `?scheme=dark` sets `color-scheme: dark` on
  the root; light is the default. A native `<select>` labelled Scheme switches it.
- **The retry flow moves focus to the region's heading,** an `h3` with `tabindex="-1"`, not to
  the Loading. The heading stays through Loading, Trouble and the result, so the journey's
  assertion does not depend on how long the playground's loader takes.
- **The playground's loader is deterministic:** its first attempt fails and every later one
  succeeds, each settling on the next microtask. No timer, so no test waits on a clock.
- **Right-to-left Tabs comes from React Aria's `I18nProvider`.** React Aria reads the direction
  from its locale, not from the DOM's `dir`. The playground renders a second Tabs inside
  `<I18nProvider locale="he-IL">` and a `dir="rtl"` wrapper. The binding re-exports nothing for
  this; an application that is right-to-left wraps itself in React Aria's provider, and
  `docs/architecture.md` says so.
- **The package ships `dist/` only:** `files: ["dist"]`, one `exports` entry `"."` with `types`
  and `import`, and `prepare` runs `tsc -p tsconfig.build.json`.

## Task 1 — the runner and the playground

- Dependencies: `react` and `react-dom` (`^19.3.1`). Dev dependencies: `@types/react`,
  `@types/react-dom`, `vite`, `@vitejs/plugin-react`, `@playwright/test` (exact `1.64.1`, as
  core), `@axe-core/playwright`, `axe-core`, and `@zellige/core` over git as above.
- `vite.config.ts` serves `playground/` on `127.0.0.1:5181`. `playwright.config.ts` has one
  project, `ui`, for `tests/ui/`, Chromium, with `webServer` starting Vite; with
  `ZELLIGE_BROWSER_WS` set it passes `connectOptions`.
- `./run` gets core's `test` and `dev` scenarios, adapted to the ports and a
  `zellige-react-browsers-$$` container. `check` adds `tsc`, `oxlint --deny-warnings` and the
  browser suite.
- `playground/index.html` and `playground/main.tsx`: `@zellige/core/tokens.css` and
  `@zellige/core/zl.css` imported by package name; one `h1`, a `main`, the Scheme select.
- `tests/ui/wcag.ts` holds `WCAG_TAGS`; `tests/ui/schemes.ts` holds the two schemes.
- Tests: `page.spec.ts` — one `h1`, one `main`, no skipped heading level, no repeated `id`, the
  Scheme select by keyboard. `scan.spec.ts` — axe over the page in both schemes; later tasks add
  a row per state their flows reach.
- Commit: `build: run the browser suite in the playwright image`

## Task 2 — the class helpers, and Vitest

- Dev dependencies: `vitest`, `jsdom`, `@testing-library/react`. `vitest.config.ts` with the
  two projects. `./run check` adds `npx vitest run`.
- Test first: `tests/unit/class.test.ts`, two datasets — `buttonClass(variant?, extra?)` for
  every variant with and without `extra`, and the merge that appends a caller's `className`
  (undefined, empty, one class, several). See it fail.
- `src/class.ts`; `src/index.ts` exports `buttonClass`.
- Commit: `feat: add buttonClass and the class merge`

## Task 3 — the contract test, and Button

- Test first:
  - `tests/integration/contract.ts`: reads every `contract/*.html` in the installed
    `@zellige/core`, found through `import.meta.resolve`, splits each on its example comments,
    and compares as above.
  - `tests/integration/contract.test.tsx`: one test per example, the rows check in both
    directions, and `PENDING` holding every file but `button.html`.
  - `tests/integration/contract/button.tsx`: the seven rows, `link` as
    `<a className={buttonClass()} href="/board">`.
  - `tests/integration/button.test.tsx`: `type` defaults to `"button"`; with `busy`, a click
    does not call `onClick` and the button stays focusable.

  See them fail.

- `src/button.tsx`; export it.
- Playground: a Buttons section, an `h2`, every variant and a busy one.
- Commit: `feat(button): add button, held to core's contract`

## Task 4 — the provider

- Test first: `tests/integration/strings.test.tsx`, a dataset of string, provider value and
  own prop, against what a probe component reads: defaults without a provider, the provider's
  value, the own prop over both. See it fail.
- `src/provider.tsx`: `UiProvider`, and the internal `useStrings()` the components read.
- Commit: `feat: add UiProvider and the kit's strings`

## Tasks 5–10 — one component each

Every task does the same, using the spec's §5 and §6:

1. Its rows file in `tests/integration/contract/`, and its file off `PENDING`. See it fail.
2. Its wiring tests in `tests/integration/`, where the spec's §7 lists any. See them fail.
3. The component in `src/`, exported from `src/index.ts`.
4. Its playground section, an `h2` each, and any flow below; a row in `scan.spec.ts` for every
   state the flow reaches, in both schemes.
5. Commit: `feat(<component>): add <component>, held to core's contract`

Notes for particular components:

- **Task 5, Field, Input, Select, Textarea.** Wiring: label, hint and error connected, the hint
  before the error in `aria-describedby`, `aria-invalid` only with an error, an explicit `id`,
  `aria-describedby` or `aria-invalid` winning, each control working without a field.
  Playground flow: a form with a required Name; submitting it empty shows the error and focuses
  the input through its `ref`. Journey: fill and fail by keyboard, focus on the input after the
  failed submit.
- **Task 6, Card and Badge.** Two commits, `feat(card): …` and `feat(badge): …`.
- **Task 7, Notice.** `tone` gives `role`. The playground keeps one Notice mounted and writes
  into it, as the spec's §6 asks of an application.
- **Task 8, Empty, Loading, Trouble.** One rows file, `status.tsx`. Wiring: `label` and
  `retryLabel` fall back to the provider; Retry only with `onRetry`. Playground flow: the Issues
  region with the loader above. Journey: Load, Trouble announced as an alert, Retry by keyboard,
  focus on the region's heading, the result shown. Commit scope `status`.
- **Task 9, Dialog.** Rows render `open={false}`; the contract has no `open` attribute. Browser
  tests in `dialog.spec.ts`: the five cases of the spec's §7, the backdrop cases with the mouse.
  Playground flow: "New booking" opens a dialog whose Save, in the foot, submits the body's form
  through `form`; Cancel and Close call `onClose`. Journey: open by keyboard, focus on the frame,
  Tab through close, body and foot, Escape, focus on the opener. Scans with the dialog open.
- **Task 10, Tabs.** Dependencies: `react-aria` and `react-stately`, pinned. `PENDING` and its
  check are deleted. Browser tests in `tabs.spec.ts`: a dataset of key, starting tab and
  expected tab, run once left-to-right and once in the `he-IL` Tabs; and the roving tabindex.
  Journey: Tab to the list, arrows across, Tab into the panel.

## Task 11 — the package

- Test first: `tests/integration/package.test.ts`, in Vitest's `integration` project with no DOM
  needed: `npm pack --dry-run --json` ships exactly `dist/` and `package.json`, and every name
  `src/index.ts` exports is exported from `dist/index.js` with a `.d.ts` beside it. See it fail.
- `tsconfig.build.json` extends the root, includes only `src/`, sets `noEmit: false`,
  `declaration`, `outDir: dist`. `package.json`: `exports`, `files`, `prepare`, the peers
  (`react`, `react-dom` `^19`, `@zellige/core` `~0.1.0`). `./run check` builds before the suites.
- Commit: `build: build and export the package`

## Task 12 — close the slice

- `docs/architecture.md` describes the binding as built: the exports, the conventions, each
  component's props and behaviour, the provider, right-to-left through `I18nProvider`, the
  contract test and what it compares, the playground, `./run test`, and how a core release
  reaches the binding.
- `README.md` covers installing (both packages, over git), loading core's CSS, the provider, and
  the `./run` scenarios, including that Docker is needed.
- In `CLAUDE.md`, replace the "Not built yet" paragraph with a pointer to
  `docs/architecture.md`.
- `docs/backlog.md` gets "WebKit is not run", for the same application core's entry names, and
  anything else found along the way.
- The spec's status becomes **built**, and this plan moves to `archive/`.
- Commits: `docs: document the react binding`, then `docs: archive the react plan`

The release follows the rebase onto `main` and is not part of this plan: `chore: release 0.1.0`
and the `v0.1.0` tag.

## Still unproven when this plan is written

- That React Aria 3.53.1's hook props match core's Tabs contract; Task 10 proves it or files the
  difference with core.
- That `import.meta.resolve` finds `@zellige/core/contract/*` through core's `exports` under
  Vitest. If not, the harness reads the directory from `node_modules/@zellige/core`.
- That npm treats `@zellige/core` installed from a git tag as satisfying the peer range
  `~0.1.0` without a warning; Task 11 shows it.
- What the spec's §9 lists: a screen reader, 200% zoom and a 320 px viewport are not tried by
  any task here. The slice's review says which of them were tried.
