# Backlog

What is known to be wrong and not yet fixed, newest first. The rule for this file is charter's
`core/rules/backlog.md`: one entry per finding, deleted by the commit that fixes it.

## WebKit is not run

- Where: `playwright.config.ts`, the `ui` project
- Found: 2026-10-16, deferred on purpose by the v0.1 plan, as in core
- Problem: every browser test runs in Chromium only. One of the applications due to migrate is
  a PWA used on iPhones, where every browser is WebKit, and nothing here has driven the dialog's
  `cancel` and `close` handling, the backdrop presses or React Aria's Tabs there.
- Impact: that application's migration, the last one, would be the first WebKit run of the
  binding. Add a WebKit project before it starts.

## No test proves that Dialog focuses its frame

- Where: `src/dialog.tsx`, the `frame.current?.focus()` after `showModal()`;
  `tests/ui/dialog.spec.ts`
- Found: 2026-10-16, while checking that each dialog test fails without the behaviour it covers
- Problem: with the call removed, every test still passes. Chromium's `showModal()` focuses the
  frame on its own, as the first focusable element in the dialog. The call is kept because the
  design asks for it and another engine may pick a different element, but nothing shows it does
  anything today.
- Impact: a change that drops the call passes review unnoticed; the gap matters once WebKit runs

## A dialog mounted already open is untested

- Where: `src/dialog.tsx`, the `closing` flag; `playground/sections/dialogs.tsx`
- Found: 2026-10-16, while writing the dialog
- Problem: every playground dialog is mounted closed and opened later. One rendered with `open`
  true from its first render, under React's `StrictMode`, runs its effect, its cleanup and its
  effect again; the cleanup's `close()` is marked so its `close` event does not call `onClose`,
  but no test renders that case.
- Impact: an application that mounts a dialog open, as with `{open && <Dialog open …>}`, may
  find it closing itself in development if the marking is ever broken

## Core's Tabs contract leaves out the tab list's `id`, which React Aria writes

- Where: core's `contract/tabs.html`, the `zl-tabs__list` element; `src/tabs.tsx`, where the
  binding drops the `id` from `useTabList`'s props
- Found: 2026-10-16, when the contract test first rendered Tabs
- Problem: React Aria 3.53.1's `useTabList` returns an `id` for the list, the base it builds
  the tab and panel ids from. Nothing in the DOM refers to it. Core's contract, which says its
  Tabs attributes are React Aria's, has no `id` there, so the binding removes it to match.
- Impact: the binding departs from "spread React Aria's props" for one attribute. If core adds
  the `id` to the contract, the binding deletes the line that drops it; if a later React Aria
  starts referring to the list's id, dropping it would break that reference silently

## Loading is a `div` with `role="status"` where `jsx-a11y` asks for `<output>`

- Where: `src/status.tsx`, `Loading`, under an `oxlint-disable` comment; core's
  `contract/status.html`, the `loading` example
- Found: 2026-10-16, while adding the status states
- Problem: `jsx-a11y/prefer-tag-over-role` reports the `role="status"` on a `div` and prefers
  `<output>`, whose implicit role is `status`. The binding cannot change the element: the
  contract test holds it to core's markup, so the rule is disabled for that one line.
- Impact: none on what is announced today. It is a question for core — whether Loading should
  be an `<output>` — and until core answers it, the binding's lint carries one exception.
