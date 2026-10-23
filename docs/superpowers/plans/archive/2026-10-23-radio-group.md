# Radio group — implementation plan

Spec: `docs/superpowers/specs/2026-10-23-radio-group-design.md`, approved 2026-10-23. Work happens
on `feat/radio-group`, which holds the spec. Each task writes its test first and sees it fail.
It is done when `./run check` passes, and it ends in one commit holding the test and the code.
Merge by rebase onto `main`, then `git merge --ff-only`.

`docs/backlog.md` was read before planning. No entry touches the radio group's files; "WebKit is
not run" covers it as it covers the rest.

## Decisions this plan adds to the spec

- **Core 0.2.0 comes in with the component.** Raising the dev dependency alone would fail the
  contract test — core's new `radio.html` has no rows file — so the peer range, the dev
  dependency, the rows file and the component are one commit, as the architecture's release
  rule says.
- **The group's state reaches `Radio` through a context of its own** in `src/radio.tsx`, holding
  React Stately's state; `Radio` throws `Radio must be inside a RadioGroup` without it.
- **The playground's radio section is `playground/sections/radios.tsx`**, placed after Fields.

## Task 1: `RadioGroup` and `Radio`

**Files:** `package.json`, `package-lock.json`, `src/radio.tsx` (new), `src/index.ts`,
`tests/integration/contract/radio.tsx` (new), `tests/integration/radio.test.tsx` (new).

- [ ] `@zellige/core`: peer `~0.2.0`, dev `github:AlexeyVanyukevich/zellige-core#v0.2.0`;
      `npm install`.
- [ ] **Test**: the rows file, one row per core example, each passing the contract's `name`;
      `radio.test.tsx` as the spec's §5 lists, its starting choices as a dataset.
- [ ] Run `npx vitest run`; the contract rows and the new tests fail: no `RadioGroup`.
- [ ] **Implement** §3: `useRadioGroupState`, `useRadioGroup` with `validationBehavior: 'aria'`,
      `useRadio`, spread onto core's markup; the description beside the label; `Radio`'s props
      and `ref` on the input; both exported from `src/index.ts` with their props types.
- [ ] Run `./run check`; commit `feat(radio): add the radio group`.

## Task 2: The playground and the browser journeys

**Files:** `playground/sections/radios.tsx` (new), `playground/main.tsx`,
`tests/ui/radio.spec.ts` (new), `tests/ui/scan.spec.ts`.

- [ ] **Test**: `radio.spec.ts` — the keyboard journey and the arrow-key dataset of the spec's
      §5; `scan.spec.ts` gains the section's states: an error shown, all answered.
- [ ] Run `./run test radio`; it fails: no section.
- [ ] **Implement** the section: a form, "Retries" (three radios, one described) and "Backoff"
      (two), whose Send focuses the first unanswered group's first radio after setting its error,
      and writes "Retries: …, backoff: …" into a Notice mounted from the start; and "Retries,
      right to left" inside `I18nProvider locale="he-IL"`.
- [ ] Run `./run check`; commit `test(radio): drive the radio group by keyboard in the playground`.

## Task 3: The documents

- [ ] `docs/architecture.md`: version 0.2 holds core 0.2's nine components; the dependency
      table's core row; the components table gains `RadioGroup` and `Radio`; a `### RadioGroup`
      section; the tests tables gain `radio.test.tsx` and `radio.spec.ts`; Radio's exception to
      the root rule under Conventions.
- [ ] The spec's status: **built**, with the date. Move this plan to
      `docs/superpowers/plans/archive/`. Commit `docs: document the radio group`.

## Task 4: Release 0.2.0

- [ ] `package.json` version `0.2.0`, `npm install`; `./run check`; commit
      `chore: release 0.2.0`; rebase onto `main`, `git merge --ff-only`, tag `v0.2.0`.
- [ ] Push `main` and the tag after the owner says so.
