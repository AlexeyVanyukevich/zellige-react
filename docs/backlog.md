# Backlog

What is known to be wrong and not yet fixed, newest first. The rule for this file is charter's
`core/rules/backlog.md`: one entry per finding, deleted by the commit that fixes it.

## Loading is a `div` with `role="status"` where `jsx-a11y` asks for `<output>`

- Where: `src/status.tsx`, `Loading`, under an `oxlint-disable` comment; core's
  `contract/status.html`, the `loading` example
- Found: 2026-10-16, while adding the status states
- Problem: `jsx-a11y/prefer-tag-over-role` reports the `role="status"` on a `div` and prefers
  `<output>`, whose implicit role is `status`. The binding cannot change the element: the
  contract test holds it to core's markup, so the rule is disabled for that one line.
- Impact: none on what is announced today. It is a question for core — whether Loading should
  be an `<output>` — and until core answers it, the binding's lint carries one exception.
