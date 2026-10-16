# zellige react — design

Status: **built**, 2026-10-16, against `@zellige/core` 0.1.0 and charter 3.3.

> **This becomes a decision record once the slice ships.**
>
> It states what was decided before any of it was built, and is not revised after. Read it to
> learn **why** the binding is shaped as it is. For **what** it does today, read
> `docs/architecture.md`, which the slice's last task writes.

The kit as a whole — why it exists, why it is two packages in two repositories, how they are
released together, and the order applications move onto it — is in core's design, in the
`zellige-core` repository: `docs/superpowers/specs/2026-10-14-zellige-core-design.md`. Its
tokens, classes and reference markup are core's too. This document covers only what the React
binding adds: an API, and behaviour.

---

## 1. Goal

**An application writes `<Dialog>`, `<Tabs>`, `<Field>` and gets core's markup, exactly, with
the behaviour the platform or React Aria provides.**

### Success criteria

1. Every component's output matches its `contract/<component>.html` in the installed
   `@zellige/core`, enforced by a test.
2. Dialog's and Tabs' behaviour holds in a real browser, driven by the keyboard alone.
3. Every interactive state the binding produces — an open dialog, an invalid field, a selected
   tab, a busy button — passes an axe scan against WCAG 2.2 AA.

## 2. Non-goals

- No markup, class or token of its own. Anything that changes what is rendered starts in core.
- No server rendering. Every consumer is a client-side single-page app.
- No `react-aria-components`: it renders its own DOM, which would make core's contract describe
  somebody else's markup.
- No router dependency. A link that looks like a button is the application's own
  `<Link className={buttonClass('primary')}>`.
- Never published to the public npm registry.

## 3. The package

`@zellige/react`, set up with charter 3.3 as one root workspace taking
`frontend typescript react vitest playwright`. It does not take the `html` stack, which core
does: the binding writes no HTML by hand, only JSX, which `jsx-a11y` reads, and the contract
test holds what that JSX renders to core's checked HTML.

- **Exports**: one entry, `@zellige/react` — the components, `UiProvider` and `buttonClass`.
- **Dependencies**:
  - `react-aria` and `react-stately`, ordinary dependencies.
  - `react` and `react-dom` `^19`, required peers.
  - `@zellige/core`, a required peer at the range the binding was tested against, and the same
    version as a dev dependency for the contract test and the playground — 0.1.0 at first,
    installed over git at its tag. An application imports core's CSS itself and lists it as
    its own dependency.
- **Build**: `tsc` compiles `src/` to ES modules with `.d.ts` files in `dist/`, through a
  `tsconfig.build.json` that extends the root one and turns emit back on (charter's `react`
  tsconfig sets `noEmit`). Applications never type-check or transpile kit source. A `prepare`
  script builds it, so an install over git works. It resolves as a bundler does, so its output
  is for bundled applications.
- **No CSS.** The binding imports none; the application loads `@zellige/core/tokens.css`, then
  `@zellige/core/zl.css` or the `@zellige/core/css/<file>.css` files it picks.

### Layout

```
zellige-react/
  package.json  charter.json  run  CLAUDE.md  README.md
  src/                        one file per component, plus provider.tsx, class.ts, index.ts
  playground/                 Vite page: every component's interactive states and flows
  tests/unit/  tests/integration/  tests/ui/
```

## 4. Conventions

- Props extend the root element's props (`ComponentProps<'button'>` and so on). The rest are
  spread onto the root, `className` is appended to the kit's classes, and `ref` is a prop
  (React 19).
- **Behaviour is borrowed.** The platform's where it has one; otherwise React Aria's hooks from
  `react-aria`, with state from `react-stately`, their props spread onto core's elements. The
  binding's own code for a widget only wires that behaviour to its props.
- **No hard-coded text.** The kit's only own strings are `close`, `retry` and `loading`, from
  `<UiProvider strings={{ close: 'Закрыть' }}>`, with defaults `Close`, `Retry` and
  `Loading…`. A component's own prop overrides the provider for that instance. Without a
  provider the defaults apply.
- A `jsx-a11y` finding is fixed, not silenced. An `oxlint-disable` on one carries its reason.

## 5. Components

### Button

- `<Button variant? busy?>`. `type` defaults to `"button"`, so a button never submits a form by
  accident.
- `busy` sets `aria-busy="true"`; the button stays focusable, and its own click handler is not
  called.
- `buttonClass(variant?, extra?)` returns the class string for a non-button element.

### Field, Input, Select, Textarea

- `<Field label hint? error?>` wraps one control. It creates the ids with `useId` and passes
  them through context.
- `<Input>`, `<Select>` and `<Textarea>` read that context for `id`, `aria-describedby` and
  `aria-invalid`. Any of those passed explicitly wins. Each works without a field.
- The controls take `ref`, so an application whose submit fails can move focus to the first
  invalid field. Doing so is the application's job; the binding does not own the form.

### Card, Badge

`<Card>` renders a `div`; a card on another element takes the class. `<Badge tone?>`.

### Notice

`<Notice tone? title?>`. Rendered with its message, it is read in place, not announced (core's
design, §6). An application that announces an outcome keeps the Notice mounted and changes its
children.

### Empty, Loading, Trouble

- `<Empty title>`, `<Loading label?>`, `<Trouble title detail? onRetry? retryLabel?>`.
- The retry button is rendered only when `onRetry` is given.
- `label` and `retryLabel` fall back to the provider's strings.
- Retry usually swaps Trouble for Loading, which removes the focused button. The application
  owns that swap, so it moves focus — to the region's heading or the Loading — and the
  playground's retry flow shows how.

### Dialog

Behaviour from the platform: `<dialog>` and `showModal()`, which give the focus trap, the top
layer and focus return to the opener.

`<Dialog open onClose title placement? footer? closeLabel?>`.

- **Opening**: `open` becoming true calls `showModal()`, then `frame.focus()`, so the keyboard
  starts where the eye is, not on Close. Becoming false, or unmounting, calls `close()`.
- **Escape**: the `cancel` event is prevented and calls `onClose`. The application's state
  stays the only thing that decides whether the dialog is open.
- **Closed by the browser**: a browser may close the dialog without a cancelable `cancel`.
  Chrome does this after repeated Escape presses with no user activation in between. The
  `close` event therefore also calls `onClose` whenever the dialog closes while `open` is still
  true, so the application's state never says open over a closed dialog.
- **Backdrop**: **only a press that began on the backdrop closes it.** `pointerdown` records
  whether its target was the `<dialog>`, and `click` closes only if both targets were.
  Otherwise the tap that opened the dialog, which the browser aims after it appears, would
  close it.
- The head and the foot are core's `div`s, not `header` and `footer`, which would be read as
  page landmarks. The foot is rendered only when `footer` is given. A button there submits a
  form in the body through its `form` attribute.

### Tabs

Behaviour from React Aria: `useTabList`, `useTab` and `useTabPanel` from `react-aria`, with
`useTabListState` from `react-stately`. Their props are spread onto core's Tabs markup, which
records them as React Aria 3.53.1 produces them.

`<Tabs label items value? defaultValue? onChange?>`.

- `items` is `{ id: string; label: ReactNode; panel: ReactNode }[]`, turned into React
  Stately's collection inside the component; an application never sees the collection API.
- Controlled when `value` is given; otherwise it starts at `defaultValue` or the first item.

What comes with React Aria:

- **Activation is automatic**: moving focus with a key also selects the tab.
- **Roving tabindex**: only the selected tab is in the tab order.
- Arrow keys move to the next and previous tab and wrap at both ends; they follow the text
  direction, so a right-to-left page swaps them. `Home` and `End` go to the first and last tab.
- Only the selected panel is rendered, and it is focusable only when it holds nothing
  focusable.

## 6. Accessibility

Core's design, §6, states what the markup promises: names, headings and states as they sit in
the contract. This section states what the binding adds — behaviour, and where each name and
state comes from in the API. The page an application assembles from the components is the
application's, and its own slices state it.

**Focus order.** Source order throughout; the binding sets no `tabindex` of its own beyond
core's markup and React Aria's roving tabindex. Three components move focus or hand it on:

- **Dialog.** Opening it calls `showModal()`, then focuses the frame. Tab then reaches the
  close button, the body's controls and the foot's controls, in that order, and nothing behind
  the dialog. Every way of closing — Escape, a backdrop press, Close, `open` turning false —
  ends in `close()`, and the platform returns focus to the opener. If the application removed
  the opener while the dialog was open, moving focus is the application's job.
- **Tabs.** The list is one tab stop, the selected tab; the arrow keys, `Home` and `End` move
  between tabs as §5 lists. Tab goes on to the panel when it holds nothing focusable, or to the
  panel's first control.
- **Trouble.** Retry usually unmounts the focused button. The application moves focus to the
  region's heading or to the Loading that replaces it, and the playground's retry flow does.

Field, Notice and the status states never move focus.

**Accessible names**, and which prop gives each:

| Element                 | Name                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| Button                  | `children`; an icon-only button takes `aria-label` from the caller            |
| Input, Select, Textarea | Field's `label`, through `<label for>`; used alone, the caller's `aria-label` |
| Dialog                  | `title`, through `aria-labelledby` with an id from `useId`                    |
| Dialog's close button   | `closeLabel`, else the provider's `close`, else `Close`                       |
| Tab list                | `label`, a required prop, as `aria-label`                                     |
| Tab, tab panel          | The item's `label`; the panel by `aria-labelledby` its tab, from React Aria   |
| Loading                 | `label`, else the provider's `loading`, else `Loading…`                       |
| Trouble's retry button  | `retryLabel`, else the provider's `retry`, else `Retry`                       |

Nothing in the types makes a lone control take `aria-label`: an application's axe scans catch
a control with no name.

**Heading structure.** The binding renders one heading, Dialog's `title`, as core's `h2`. The
titles of Notice, Empty and Trouble are paragraphs, as in core. The playground is a valid page
of its own: one `h1`, an `h2` per component, no skipped level, a `main` landmark.

**States, and how each is announced:**

| State        | Prop             | On the element                                | Announced                                           |
| ------------ | ---------------- | --------------------------------------------- | --------------------------------------------------- |
| Disabled     | `disabled`       | `disabled`                                    | As unavailable                                      |
| Busy button  | `busy`           | `aria-busy="true"`; the click is ignored      | Not reliably; the application announces the outcome |
| Hint         | Field's `hint`   | `aria-describedby`                            | After the name, on focus                            |
| Invalid      | Field's `error`  | `aria-invalid="true"`, `aria-describedby`     | As invalid, then the error, on focus                |
| Selected tab | `value`, or keys | `aria-selected="true"`, from React Aria       | As selected                                         |
| Open dialog  | `open`           | `showModal()`; focus on the frame             | As a dialog, with its title                         |
| Loading      | —                | `role="status"`                               | Politely, if written into a mounted region          |
| Trouble      | —                | `role="alert"`                                | At once, with the same condition                    |
| Notice       | `tone`           | `role="status"`, or `role="alert"` for danger | By tone, with the same condition                    |

The condition is core's: a live region is announced when its content changes, not when it
mounts with it. A Notice or Trouble rendered with its message is read in place. An application
that announces an outcome keeps the component mounted and changes its children.

**What an error does.** Field's `error` is text inside the field, tied to the control by
`aria-invalid` and `aria-describedby`, after the hint when both are given, so it is never
colour alone. The binding announces nothing and moves no focus when an error appears. A failed
submit is the application's: it focuses the first invalid control through its `ref`, or shows
a danger Notice that sums up the errors. A failed load is Trouble, announced as an alert, with
Retry rendered only when `onRetry` is given. Escape in a Dialog calls `onClose` and changes
nothing else: if the application keeps `open` true, the dialog stays open and focus stays in it.

The browser tests in §7 hold each of these: the keyboard journeys assert every focus move above,
and the scans every state.

## 7. Testing

charter's rules apply: tests before implementation, cases in typed datasets, journeys by role
with an axe scan of every state. `./run check` runs types, formatting, lint
(`oxlint --deny-warnings`) and every suite.

- **Unit tests** (`tests/unit/`, Vitest): `buttonClass` and the class merge, against datasets.
- **Integration tests** (`tests/integration/`, Vitest, jsdom, Testing Library):
  - **Contract.** Each `contract/<component>.html` in the installed `@zellige/core` is a list
    of examples, each one top-level element after an `<!-- example: <name> -->` comment. The
    test splits the files on those comments and keys a dataset of props on
    `<component>/<name>`; every example, rendered from its row, must have the same structure:
    elements, classes, roles and ARIA attributes, with generated ids normalised. An example
    with no row fails, and so does a row with no example, so a core release that adds or
    renames one cannot pass unnoticed. An example with no component of its own, Button's
    `link`, is rendered as an application would: `<a className={buttonClass()}>`. For Tabs this
    is where React Aria's props are first held to the contract, including the unselected tab's
    missing `aria-controls` and the panel's conditional `tabindex`.
  - **Wiring.** Field connects label, hint and error, including `aria-invalid`. The provider's
    strings apply, and a component's own prop overrides them. Button with `busy` does not call
    its handler.
- **Browser tests** (`tests/ui/`, Playwright against the playground). Elements are found by
  role and accessible name, never by class.
  - **Dialog** (jsdom has no modal `<dialog>`):
    - Escape calls `onClose`.
    - A browser-initiated close, triggered by calling `close()` on the element, calls
      `onClose`.
    - A press that began on the backdrop closes the dialog; the tap that opened it does not.
    - A press inside that is released on the backdrop does not close it.
    - Focus starts on the frame and returns to the opener.
  - **Tabs**: a dataset of key, starting tab and expected tab, in both text directions, plus
    the roving tabindex. It proves React Aria's keyboard model survives the binding's wiring,
    not the model itself.
  - **Keyboard journeys**: each playground flow — open and close a dialog, fill and fail a
    form, move through tabs, retry a failed load — driven by the keyboard alone, asserting
    where focus lands after every step that moves it.
  - **Accessibility**: `@axe-core/playwright` with one shared `WCAG_TAGS` constant over every
    state each flow reaches, in the kit default light and dark.

**Themes and screenshots are not the binding's.** The contract test proves the binding's markup
is core's, and a theme changes only CSS. Core scans and screenshots that markup in its own
defaults and in a sample theme, each light and dark; an application's own theme is proved by
that application's journeys, not by core or the binding. The playground is a valid page — one
`h1`, ordered headings, a `main` landmark — so its scans test the components and not the page
around them.

## 8. Releases

By core's design, §2: own version, own release commit and tag, `0.x` until the console and the
booking admin have both migrated. A core release that changes the contract is followed by a
binding release that raises the peer range in the same commit as the component changes.

At `1.0.0`, renaming or removing a component, prop or provider string is a major version.
Adding one is a minor version.

## 9. Unproven

- That React Aria's hook props, spread onto core's markup, match the contract in every state.
  Core's Tabs contract was read from the 3.53.1 source, not rendered.
- That React Aria's `useTabListState` collection, built from `items` inside the component,
  stays cheap for the handful of tabs an application has; nothing measures it.
- That a screen reader announces the dialog and its title when focus lands on the frame, a
  `div` inside the `<dialog>`, rather than on the `<dialog>` itself. Core makes the same
  promise (its design, §6) and has not tried one either.
- Not tried at design time: a screen reader, 200% zoom, a 320 px wide viewport. The slice's
  review states which of these it then tried.
