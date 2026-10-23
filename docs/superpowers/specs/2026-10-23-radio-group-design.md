# Radio group — design

Status: **built**, 2026-10-23; approved and designed 2026-10-23. Against `@zellige/core` 0.2.0.

> **This becomes a decision record once the slice ships.**
>
> It states what was decided before any of it was built, and is not revised after. Read it to
> learn **why** the radio group has the shape it has. For **what** the binding does today, read
> `docs/architecture.md`, which the slice's last task updates.

The [binding's design](2026-10-14-zellige-react-design.md) holds for everything this one does not
mention: its conventions, its contract test, its playground and checks. This document adds one
component to it.

Roles, as in `docs/architecture.md`: **core** is `@zellige/core`, whose 0.2.0 release added the
radio group's markup and CSS, and whose own design for it says why that markup is what it is;
**an application** installs both packages. And **the asking application** is the one this is
added for: a board that shows its owner up to eight questions on one form, each answered by
choosing one of a few described options, all sent with one button.

---

## 1. Goal

`RadioGroup` and `Radio`, rendering core's `contract/radio.html` exactly, with React Aria's
`useRadioGroup` and `useRadio` and React Stately's `useRadioGroupState` for the behaviour.

### Success criteria

- The contract test passes for core 0.2.0's four radio examples with no change to `canonical()`.
- An application can answer a question with the keyboard alone, and after a failed submit can
  focus the first unanswered group through a `ref`.
- No keyboard model is written here: React Aria's, which repeats the platform's for native
  radios, is the one in force.

## 2. What core's design already settled

Core recorded, from these same versions of React Aria and React Stately rendered as this
binding's contract test renders, the attributes after mount: the group's `role`, orientation,
label and description references and `aria-invalid` or `aria-disabled`; each radio's
`tabindex`, which follows the checked one; and each radio described by its own description, the
group's error, then the group's description. It placed two things differently from React Aria's
own examples, and this binding follows core:

- **A radio's description sits beside its `<label>`, not in it**, so the radio's name is the
  label's text alone. The binding renders it as a sibling and spreads `useRadio`'s
  `descriptionProps` onto it.
- **The input is the platform's, visible.** No `VisuallyHidden`, which would add an inline
  `style` the contract does not have.

One measurement this design adds: **`useRadioGroup` uses a `name` given to it as given**, and
generates one otherwise. Core's examples carry a hand-written `name`, which `canonical()`
compares as text. The contract rows therefore pass `name`; an application need not.

## 3. The components

```tsx
<RadioGroup
  label="Retries"
  description="How often a failed request is tried again"
  error={missing ? 'Choose how often' : undefined}
  value={retries}
  onChange={setRetries}
>
  <Radio value="three">Three times</Radio>
  <Radio value="five" description="Slower, but surer" ref={firstChoice}>
    Five times
  </Radio>
</RadioGroup>
```

| Component    | Root                                    | Props beyond the root's                                                                                                               |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `RadioGroup` | `div.zl-radio-group`, `role=radiogroup` | `label`, `description?`, `error?`, `value?` (`string \| null`), `defaultValue?`, `onChange?(value)`, `name?`, `disabled?`, `children` |
| `Radio`      | see below                               | `value`, `description?`, `children` as the label                                                                                      |

- **`RadioGroup`'s props extend the `div`'s**, as every component's extend its root's, without
  `onChange` and `defaultValue`, which mean the selection here. Controlled when `value` is
  given; otherwise it starts at `defaultValue`, or with nothing checked. `onChange` receives the
  checked radio's `value`.
- **`error`** makes the group invalid and is its error message: React Aria's `isInvalid` and
  `errorMessage`, with `validationBehavior: 'aria'` so the browser's own validation never runs.
  Like Field's, it is the application's to set and clear; the binding moves no focus.
- **`disabled`** is React Aria's `isDisabled`, named as the native attribute is, as Button's is.
- **`Radio` is the exception to the root rule, and Field's controls are the precedent.** Its
  root is core's `div.zl-radio`, but the element an application holds is the input: focusing it
  after a failed submit, reading it in a test. So `Radio`'s props extend the input's — `ref`,
  `autoFocus`, `aria-*` — without `type`, `name`, `value`, `checked`, `defaultChecked` and
  `onChange`, which the group owns, and are spread onto the input. Its wrapper and `<label>`
  take no props of their own; `className` goes to the input like the rest.
- **The group's state reaches each radio through context**, as Field's wiring reaches its
  control. A `Radio` outside a `RadioGroup` throws, naming the missing group: it has no state to
  read, and a silent radio would be worse.
- **No `orientation`.** Core's contract is vertical only.

## 4. Accessibility

What the binding adds to core's design for the radio group, §6, and to this binding's design,
§6.

**Focus order.** From React Aria: the group is one Tab stop — the checked radio, or the first
when none is checked; the arrow keys move between radios and check them, wrapping at the ends,
in the locale's direction; a disabled radio is skipped. Tab leaves the group. The binding moves
focus nowhere itself.

**Names and descriptions.** The group's name is `label`; each radio's, its children. A radio is
described by its `description`, then the group's `error`, then the group's `description`.

**States.** Checked is the native `checked`; invalid is `aria-invalid="true"` on the group, with
every radio described by the error; disabled is `aria-disabled` on the group and `disabled` on
each input.

**What an error does.** As Field's: the application sets `error`, then focuses the group's first
radio, or its checked one, through a `ref`. The playground shows it.

## 5. Testing

- **The contract test**: `tests/integration/contract/radio.tsx` with one row per core example —
  `plain`, `checked`, `invalid`, `disabled` — each passing `name` as the contract's.
- **`radio.test.tsx`**, Vitest in jsdom, a dataset where cases share a check:
  - the radio checked at first: none, `defaultValue`, `value`, `value` over `defaultValue`;
  - `onChange` receives the clicked radio's value; a controlled group checks only what `value`
    says;
  - the group's name and description, a radio's name and description, the error's place in each
    radio's description, `aria-invalid` with and without `error`;
  - `disabled` disables every input; `ref` on `Radio` is the input; a `Radio` alone throws.
- **The playground** gains a radio section: a form asking two questions, one with descriptions,
  whose failed submit sets the first unanswered group's error and focuses its first radio, and
  whose good one writes into a Notice mounted from the start.
- **`radio.spec.ts`**, by keyboard: Tab into a group lands on its first radio; Arrow Down moves
  and checks; Arrow Up from the first wraps to the last; Tab leaves for the next group; the
  failed submit focuses the unanswered group's first radio and describes it with the error; the
  good one writes into the Notice. Then a dataset of key, start radio and end radio — Arrow
  Down, Up, Right and Left, at the ends and between — in a left-to-right group and in one inside
  `I18nProvider locale="he-IL"`, where Right and Left swap, as Tabs' spec has.
- **`scan.spec.ts`** reaches the section's states: nothing chosen, an error shown, all answered.

## 6. Releasing

Core's peer range becomes `~0.2.0` and its dev dependency `#v0.2.0`, in the same commit as the
component, as the architecture's rule for a contract change says. Then `0.2.0` of the binding,
a minor release: a new component and nothing changed.

## 7. Not in scope

A horizontal group; checkboxes; a `RadioGroup` inside Field (it has its own label); re-exporting
`I18nProvider`.

## 8. Unproven

- **Screen readers**, 200% zoom and 320 px: not tried, as for the rest of the binding.
- **WebKit**: not run (backlog).
- **The group's description on every radio**, React Aria's choice: whether a screen reader then
  repeats it helpfully or noisily is not tried, as core's design says.
