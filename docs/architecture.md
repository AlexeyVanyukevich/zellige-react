# Architecture

What `@zellige/react` is today. This document is authoritative for that: where it and the design
record disagree, this one is right. The design record,
[`docs/superpowers/specs/2026-10-14-zellige-react-design.md`](superpowers/specs/2026-10-14-zellige-react-design.md),
says **why** the binding has the shape it does; read it for reasons, never for behaviour. Known
defects that were found and not yet fixed are listed in [`docs/backlog.md`](backlog.md), not here.

Roles used below:

- **Core** — `@zellige/core`, in its own repository: the tokens, the CSS and each component's
  reference markup in `contract/`. Every class, token and element the binding renders is core's.
- **An application** — anything that installs both packages, loads core's CSS and renders the
  binding's components.

Version 0.2 holds the nine components of core 0.2 — Button, Field with Input, Select and
Textarea, RadioGroup with Radio, Card, Badge, Notice, Empty / Loading / Trouble, Dialog, Tabs —
plus `UiProvider` and `buttonClass`. It ships no CSS.

## What ships

One entry, `@zellige/react`: `package.json`'s `exports` maps `"."` to `dist/index.js` and its
`dist/index.d.ts`, and `files` ships `dist/` alone. `tsc -p tsconfig.build.json` compiles `src/`
to ES modules with declarations; it is the `prepare` script, so an install over git builds it.
Relative imports in `dist/` carry no extension, as the source's do: the output is for an
application's bundler, not for Node.

| Dependency                    | Kind                       | Range                     |
| ----------------------------- | -------------------------- | ------------------------- |
| `react-aria`, `react-stately` | Dependency                 | Exactly 3.53.1 and 3.51.0 |
| `react`, `react-dom`          | Peer                       | `^19.0.0`                 |
| `@zellige/core`               | Peer, and dev at a git tag | `~0.2.0`; dev `#v0.2.1`   |

`react-stately` 3.51.0 is the version `react-aria` 3.53.1 itself depends on. Both are exact
because core's Tabs and radio group contracts record 3.53.1's attributes; raising them is a commit of its own,
with the contract test run against the new version.

An application imports core's CSS itself: `@zellige/core/tokens.css`, then `@zellige/core/zl.css`
or the `@zellige/core/css/<file>.css` files it picks.

## Conventions

- **Props extend the root element's** (`ComponentPropsWithRef<'button'>` and so on). The rest
  are spread onto the root, `className` is appended to the kit's classes by `cx` in
  `src/class.ts`, and `ref` is a prop. **`Radio` is the one exception**: its props, `ref` and
  `className` go to its input, the element an application focuses after a failed submit, as
  Field's controls' do; its wrapper and label are core's and take none.
- **Behaviour is borrowed.** Dialog's is the platform's `<dialog>`; Tabs' and RadioGroup's are
  React Aria's hooks with React Stately's state. No component writes a keyboard model of its own.
- **The kit's only own text** is `close`, `retry` and `loading`, defaulting to `Close`, `Retry`
  and `Loading…`. `<UiProvider strings={…}>` sets any of them for everything inside; a nested
  provider overrides only what it names. A component's own prop (`closeLabel`, `retryLabel`,
  `label`) wins over every provider. Components read them through `useString` in
  `src/provider.tsx`.
- **A `jsx-a11y` finding is fixed, not silenced.** The one `oxlint-disable` in `src/` is on
  Loading, whose element is core's (backlog).

## Components

| Component                     | Root                               | Props beyond the root's                                                                                               |
| ----------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Button`                      | `button`, `type="button"`          | `variant?`, `busy?`                                                                                                   |
| `Field`                       | `div.zl-field`                     | `label`, `hint?`, `error?`; one control as children                                                                   |
| `Input`, `Select`, `Textarea` | the native control                 | —                                                                                                                     |
| `RadioGroup`                  | `div.zl-radio-group`               | `label`, `description?`, `error?`, `value?`, `defaultValue?`, `onChange?`, `name?`, `disabled?`; `Radio`s as children |
| `Radio`                       | `div.zl-radio`; props to its input | `value`, `description?`; the label as children                                                                        |
| `Card`                        | `div.zl-card`                      | —                                                                                                                     |
| `Badge`                       | `span.zl-badge`                    | `tone?`: neutral, accent, success, warning, danger                                                                    |
| `Notice`                      | `div`, `role` by tone              | `tone?`: info (`status`), danger (`alert`); `title?`                                                                  |
| `Empty`                       | `div.zl-empty`                     | `title`; children as the body                                                                                         |
| `Loading`                     | `div` with `role="status"`         | `label?`                                                                                                              |
| `Trouble`                     | `div` with `role="alert"`          | `title`, `detail?`, `onRetry?`, `retryLabel?`                                                                         |
| `Dialog`                      | `dialog.zl-dialog`                 | `open`, `onClose`, `title`, `placement?`, `footer?`, `closeLabel?`                                                    |
| `Tabs`                        | `div.zl-tabs`                      | `label`, `items`, `value?`, `defaultValue?`, `onChange?`                                                              |

`buttonClass(variant?, extra?)` returns core's button classes for an element that is not a
`<button>`, such as an application's router link.

### Button

`type` defaults to `"button"`. `busy` sets `aria-busy="true"`; the button stays focusable, and a
click neither calls `onClick` nor does its default, so a busy submit button does not submit
again.

### Field and its controls

`Field` makes the control's id with `useId` and passes it, the description and the validity
through context. `Input`, `Select` and `Textarea` take `id`, `aria-describedby` (the hint's id,
then the error's) and `aria-invalid="true"` (only with an `error`) from it. Any of the three set
on the control wins; a control's own `id` is reported back to the field, so the `<label for>`
still names it. Each control works without a field and takes `ref`, which is how an application
focuses the first invalid control after a failed submit. The binding never moves focus or
announces an error itself.

### RadioGroup

`useRadioGroup` and `useRadio` from `react-aria`, with `useRadioGroupState` from `react-stately`,
spread onto core's markup; the state reaches each `Radio` through a context, and a `Radio` outside
a group throws "Radio must be inside a RadioGroup". Controlled when `value` is given (`null`
checks none); otherwise it starts at `defaultValue`, or with none checked. `onChange` receives
the checked radio's `value`. `name` is React Aria's generated one unless given; the contract rows
give core's.

- `error` is React Aria's `isInvalid` and `errorMessage`, with `validationBehavior: 'aria'`, so
  the browser's own validation never runs. As with Field, the application sets it and moves focus,
  through a `ref` on a `Radio`.
- Each radio is described by its own description, the group's error, then the group's
  description. A radio's description is rendered beside its `<label>`, with `useRadio`'s
  `descriptionProps` and their `ref`: React Aria lists the description in the input's
  `aria-describedby` only once that ref has seen it rendered.
- From React Aria: the group is one tab stop, the checked radio or the first; Down and Right move
  to the next radio, Up and Left to the previous, wrapping at both ends, and check it. React Aria
  swaps Right and Left in a right-to-left locale only for a horizontal group, and core's is
  vertical, so they keep their meaning there.

### Notice and the status states

Notice, Loading and Trouble are live regions on their own root. A live region announces what is
written into it, not reliably what it was mounted with, so an application that announces an
outcome keeps the component mounted and changes its title or children. Empty announces nothing.
Trouble renders its retry button only with `onRetry`; a retry usually unmounts that button, and
the application moves focus, as the playground does to the region's heading.

### Dialog

The `<dialog>` is always rendered; `open` drives it.

- `open` turning true calls `showModal()` and then focuses the frame. Turning false, or
  unmounting, calls `close()`; the platform returns focus to the opener.
- Escape: the `cancel` event is prevented and calls `onClose`. The application's state alone
  closes the dialog.
- A `close` the binding did not make — a browser closing the dialog on its own, as Chrome does
  after repeated Escape presses — calls `onClose` while `open` is still true. The binding marks
  its own `close()` calls so their `close` events are not taken for the browser's.
- Backdrop: `pointerdown` records whether its target was the `<dialog>` itself, which core's CSS
  makes the backdrop, and `click` calls `onClose` only when both were. A press that began inside
  and ended on the backdrop does not close it, nor does the tap that opened the dialog.
- The title is core's `h2`, named to the dialog by `aria-labelledby`. The head and foot are
  `div`s; the foot is rendered only with `footer`, where a submit button names its form with
  `form`.

The listeners are added once with `addEventListener` and read the latest props through a ref.

### Tabs

`useTabList`, `useTab` and `useTabPanel` from `react-aria`, with `useTabListState` from
`react-stately`, spread onto core's markup. `items` (`{ id, label, panel }[]`) becomes React
Stately's collection inside the component. Controlled when `value` is given; otherwise it starts
at `defaultValue` or the first item. `onChange` receives the selected item's `id`.

From React Aria: activation follows focus; only the selected tab is in the tab order; the arrow
keys move and wrap, following the locale's direction, and `Home` and `End` go to the ends; only
the selected panel is rendered, and it takes `tabindex="0"` only when it holds nothing focusable.
React Aria reads the direction from its `I18nProvider` locale, not from the DOM's `dir`: a
right-to-left application wraps itself in `I18nProvider` from `react-aria`, which the binding does
not re-export.

## The contract test

`tests/integration/contract.test.tsx` holds the binding to core's `contract/*.html`, read from the
installed `@zellige/core` through its `exports`.

- Each file is split on its `<!-- example: <name> -->` comments. `tests/integration/contract/<component>.tsx`
  exports `ROWS`, one element per example name, rendered in jsdom.
- Both sides are reduced by `canonical()` in `tests/integration/contract.ts` to one line per
  element and text node: the tag name; every attribute except `data-*`, sorted, with `class` as
  a sorted set; text with whitespace collapsed. Ids are renamed by order of first appearance, and
  `for`, `aria-labelledby`, `aria-describedby` and `aria-controls` with them, so a reference to a
  missing id fails.
- A contract file with no rows file fails, an example with no row fails, a row with no example
  fails, and a rows file with no contract file fails. A core release that adds or renames an
  example therefore fails here until the binding follows.
- Dialog's rows render `open={false}`: the contract has no `open` attribute. Button's `link`
  example is rendered as an application would, `<a className={buttonClass()}>`.

## The playground

A React page in `playground/`, served by Vite (`vite.config.ts`) on `127.0.0.1:5181`, one port
above core's. It is not shipped. It imports core's CSS by package name and the binding from
`src/`.

- One `h1`, a `main`, an `h2` section per component (`playground/sections/`).
- `?scheme=light|dark` sets `color-scheme` on the root; a Scheme select switches it. Themes are
  core's to test: the binding's markup is core's, and a theme changes only CSS.
- The flows the journeys drive: a form whose failed submit shows the error and focuses Name, and
  whose good submit writes into a Notice mounted from the start; two radio groups whose failed
  send sets the first unanswered group's error and focuses its first radio, and whose good one
  writes into a Notice, with a third group inside `I18nProvider locale="he-IL"`; a load that
  fails once and is
  retried, focus moving to the region's `h3`; three dialogs, one per contract example, the
  booking one submitting its body's form from the foot; Tabs left-to-right, controlled with a
  control in its panel, and right-to-left inside `I18nProvider locale="he-IL"`.
- The loader fails its first attempt and succeeds after, each settling on the next microtask, so
  no test waits on a timer.

## Checks

`./run check` runs, in order: Prettier, `tsc`, `oxlint --deny-warnings`, the build, Vitest, then
the browser suite.

**Vitest** (`vitest.config.ts`) has two projects: `unit` (`tests/unit/`, Node) and `integration`
(`tests/integration/`, jsdom, Testing Library, cleaned up after each test by `setup.ts`).

| File                 | What it proves                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unit/class.test.ts` | `buttonClass` for every variant, and the class merge                                                                                                                          |
| `contract.test.tsx`  | Every example in core's contract, as above                                                                                                                                    |
| `button.test.tsx`    | `type` defaults to `button`; busy keeps focus and neither calls the handler nor submits; `ref`                                                                                |
| `strings.test.tsx`   | Defaults, provider, nested providers and the own prop, for each string                                                                                                        |
| `field.test.tsx`     | Label, hint, error and validity wiring; each control in and out of a field; own attributes win                                                                                |
| `status.test.tsx`    | Loading's and Retry's text fall back as the strings do; Retry only with `onRetry`                                                                                             |
| `dialog.test.tsx`    | The close button's name falls back as the strings do, and it calls `onClose`                                                                                                  |
| `tabs.test.tsx`      | The tab selected at first; uncontrolled and controlled selection                                                                                                              |
| `radio.test.tsx`     | The radio checked at first; choosing, controlled and not; names, descriptions and validity; `disabled`; `ref` and own attributes on the input; a radio outside a group throws |
| `package.test.ts`    | `npm pack` ships `dist/` alone; every module has declarations; the entry exports what `src/` does                                                                             |

`package.test.ts` reads the `dist/` the build step made and fails if there is none.

**The browser suite** runs as core's does. `./run test` (arguments go on to `playwright test`)
starts `mcr.microsoft.com/playwright:v<version>-noble` running `playwright run-server`, with the
version read from the installed `@playwright/test`, which is pinned exactly. The runner and Vite
stay on the host and connect with `connectOptions: { wsEndpoint, exposeNetwork: '<loopback>' }`.
`ZELLIGE_BROWSER_PORT` moves the port from 3556, one above core's. Chromium only.

| Spec             | What it proves                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `page.spec.ts`   | One `h1`, one `main`, no skipped heading level, no repeated `id`; the Scheme select by keyboard                                                              |
| `scan.spec.ts`   | axe under `WCAG_TAGS` in both schemes, over every state the flows reach, each dialog open                                                                    |
| `field.spec.ts`  | By keyboard: a failed submit focuses Name and describes the error; a good one clears it and writes into the Notice                                           |
| `status.spec.ts` | By keyboard: the failed load is an alert, Retry moves focus to the region heading, the result arrives                                                        |
| `dialog.spec.ts` | Escape; a browser's own `close()`; backdrop presses; the opening tap; focus order and return, per dialog; the foot submitting the body's form                |
| `tabs.spec.ts`   | A dataset of key, start and end tab in both directions; the single tab stop; a keyboard journey into each kind of panel                                      |
| `radio.spec.ts`  | A dataset of key, start and end radio in both directions; by keyboard, one stop per group, a failed send focusing the unanswered group, a good one announced |

Elements are found by role and accessible name. The dialog specs read focus on the frame with
`document.activeElement`, the frame having no role.

## Releasing

Version 0.x, with its own `chore: release X.Y.Z` commit and `vX.Y.Z` tag, until the applications
that already have their own components have migrated onto the kit. A core release that changes
the contract is followed by a binding release that raises the `@zellige/core` peer range and dev
dependency in the same commit as the component changes; the contract test proves the pair.

## What is not built yet

- WebKit is not run (backlog).
- Nothing is published to a registry; installs are over git at a tag. No application has yet
  installed the binding over git, so the `prepare` build on install is untried.
- No screen reader, 200% zoom or 320 px viewport has been tried.
