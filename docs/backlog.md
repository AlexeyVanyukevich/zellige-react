# Backlog

What is known to be wrong and not yet fixed, newest first. The rule for this file is charter's
`core/rules/backlog.md`: one entry per finding, deleted by the commit that fixes it.

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
