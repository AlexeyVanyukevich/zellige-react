# Markdown — design

Status: **approved**, 2026-11-04. Against `@zellige/core` 0.3.0.

> **This becomes a decision record once the slice ships.**
>
> It states what was decided before any of it was built, and is not revised after. Read it to
> learn **why** the Markdown component has the shape it has. For **what** the binding does today,
> read `docs/architecture.md`, which the slice's last task updates.

The [binding's design](2026-10-14-zellige-react-design.md) holds for everything this one does not
mention: its conventions, its contract test, its playground and checks. This document adds one
component to it, and is issue #8.

Roles, as in `docs/architecture.md`: **core** is `@zellige/core`, whose 0.3.0 release added prose
— the `.zl-prose` styles and `contract/prose.html` — and left parsing Markdown to a binding; **an
application** installs both packages. And **the asking application** is the one this is added
for: a board that shows agent-written specs, plans and question contexts, today as raw Markdown
source, and whose rules forbid a renderer of its own.

---

## 1. Goal

`Markdown`, turning a Markdown string into core's prose markup exactly, with the text treated as
untrusted.

### Success criteria

- The contract test passes for core 0.3.0's three prose examples — `document`, `wide-table`,
  `long-code-line` — with no change to `canonical()`.
- No source makes the component create an element core's contract does not have: no raw HTML
  element, no `img`, no link to a scheme other than `http:`, `https:` or `mailto:`.
- An application places the rendered outline under its own headings with one prop.

## 2. What core's design already settled

Core fixed the markup and this binding renders it, as with every component:

- **The root is `div.zl-prose`, and everything inside is classless** — the elements Markdown
  produces.
- **Every `table` and every `pre` sits in a scroll wrapper**:
  `<div class="zl-prose__scroll" role="group" tabindex="0" aria-label="Table">`, or
  `aria-label="Code block"`. A named `group`, not a `region` — issue #8 asked for a region; core
  shipped a group so that several tables do not crowd the landmark list, and the binding follows
  core.
- **Headings are styled for a shifted outline**, so an `h4` at the top of a document reads as its
  top.

## 3. The component

```tsx
<Markdown source={plan.body} headingLevel={3} />
```

| Component  | Root           | Props beyond the root's                                      |
| ---------- | -------------- | ------------------------------------------------------------ |
| `Markdown` | `div.zl-prose` | `source` (`string`), `headingLevel` (`1`–`6`), no `children` |

- **Props extend the `div`'s**, without `children`: the content is `source`.
- **`headingLevel` is required.** It is the level the source's shallowest heading renders at;
  deeper ones keep their distance from it, capped at `h6`. A source whose top heading is `##`,
  given `headingLevel={4}`, renders `##` as `h4` and `###` as `h5`; a source whose top heading is
  `####`, given `headingLevel={2}`, renders it as `h2`. Only the application knows where the
  text sits in its page, and a default would be wrong in most of them: `1` gives the page a
  second `h1`.
- **No state and no live region.** The same `source` renders the same markup. An application
  that announces a change wraps the component in its own live region.
- **The parser is `react-markdown` 10.1.0, with GFM tables and nothing else of GFM**:
  `micromark-extension-gfm-table` 2.1.2 and `mdast-util-gfm-table` 2.0.0, added to
  `react-markdown` as a remark plugin of a few lines. All three are dependencies at exact
  versions, as React Aria's are. Not `remark-gfm`: it cannot be had without footnotes, which
  render an `h2` whatever `headingLevel` says, a class core does not have and in-page links; and
  task lists, which render unlabelled checkboxes. `mdast-util-gfm-table` 2.0.0 rather than 2.0.1:
  2.0.1 was a day old when this was written, and its fix is to serialising, which is not used.

## 4. What the source cannot do

The text is written by an agent, so the component decides what reaches the DOM, not the source.
Measured with `react-markdown` 10.1.0 before this was written:

| Source                                    | `react-markdown` alone                          | `Markdown`                                       |
| ----------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Raw HTML, inline or block                 | Literal text                                    | The same — kept, and proved by rows              |
| A link to `javascript:` or another scheme | `<a href="">` with the text                     | The text, no `a`                                 |
| A relative link, `/docs` or `#part`       | `<a href="/docs">`                              | The text, no `a`                                 |
| An `http:`, `https:` or `mailto:` link    | `<a href>`                                      | `<a href>`, nothing added: no `target`, no `rel` |
| An image                                  | `<img>`, and React 19 hoists a preload `<link>` | Its alt text, no request                         |
| A fenced block with a language            | `<code class="language-js">`                    | `<code>`                                         |
| A table column with an alignment          | `style="text-align: …"` on each cell            | No `style`                                       |

- **A link** keeps its `href` only when `new URL(href)` parses and its protocol is `http:`,
  `https:` or `mailto:`; otherwise the `a` is replaced by its children. The URL parser drops the
  tabs and newlines that hide a scheme, so `java\tscript:` is `javascript:`. A relative link is
  dropped with the rest: the text is shown away from wherever it was written, and the link would
  resolve against the application's page.
- **An image** is not loaded: its URL is the source's, and a request to it tells that host who
  is reading. Core leaves `img` unstyled, too, so a wide one would scroll the page.
- **The language class and the alignment style** are not core's markup, which has no class
  inside prose and no inline style anywhere. A right-aligned column renders aligned to the start.

## 5. Accessibility

What the binding adds to core's design for prose.

**Focus order.** The only Tab stops are links and scroll wrappers, in document order. Each
wrapper is one stop whether or not its content overflows, as core decided, so a keyboard user can
always scroll it. The binding moves focus nowhere.

**Names.** A wrapper is named by the kit's strings, which gain two: `table` and `codeBlock`,
defaulting to `Table` and `Code block`, set through `UiProvider` like `close`, `retry` and
`loading`. No prop sets them per component: a document can hold several tables, and a prop
naming one would name them all alike. A link is named by its text.

**Headings.** The outline is the source's, moved by `headingLevel`; the application chooses the
level that continues its own, and the playground's section shows one that does. Levels inside the
source keep their gaps: a source jumping from `#` to `###` still jumps.

**States.** None. The component is not a live region and announces nothing.

**Errors.** No source is an error. Markdown that does not parse as a construct renders as
text; the component does not throw on its `source`.

## 6. Testing

- **The contract test**: `tests/integration/contract/prose.tsx`, one row per core example, each
  a `Markdown` whose source produces the example — `document` with its top heading at
  `headingLevel={4}`.
- **`markdown.test.tsx`**, Vitest in jsdom: a dataset of `source`, `headingLevel` and the
  expected markup as HTML, both sides reduced by `canonical()`. Rows: a heading shifted down; one
  shifted up; a clamp at `h6`; a GFM table in its wrapper; an aligned table with no `style`; a
  code block in its wrapper with its language dropped; `<img src=x onerror=alert(1)>` and
  `<b>bold</b>`, inline and as a block, shown as text; a `javascript:` link, an obfuscated one, a
  relative one and an autolinked `javascript:` as text; an `https:` and a `mailto:` link kept; an
  image as its alt text; an HTML entity inside and outside a code span; an empty source.
- **`strings.test.tsx`** gains the two strings to its dataset: default and provider.
- **The playground** gains a Markdown section — `h2` "Markdown", the document at
  `headingLevel={3}` — holding a heading, a list, a link, a table and a code block.
- **`markdown.spec.ts`**, by keyboard: Tab from the section's start reaches the link, then the
  group named "Table", then the group named "Code block"; Arrow Right in a focused wrapper scrolls
  a wide one.
- **`page.spec.ts`** and **`scan.spec.ts`** cover the section as they cover the page: no skipped
  heading level, no repeated `id`, axe clean in both schemes.

## 7. Releasing

Core's peer range becomes `~0.3.0` and its dev dependency `#v0.3.0`, in the same commit as the
component, as the architecture's rule for a contract change says: the contract test fails on core
0.3.0 until the prose rows exist. Then `0.3.0` of the binding, a minor release: a new component
and nothing changed. An application on core 0.2 stays on the binding's 0.2.

## 8. Not in scope

Raised as issues when the slice ships, not built here:

- **Task lists** (`- [ ] step`): show as literal text. The asking application's plans use them,
  and they were asked for; but core's contract has no markup for them, and markup is core's.
  Core's issue #13 proposes one — the checkbox inside a `label` with its item's text, which axe
  passes where GitHub's unlabelled checkbox fails `label` — and the binding follows once core
  ships it.
- **Strikethrough, bare-URL autolinks and footnotes**: show as literal text.
- **Syntax highlighting**, and anything that needs the fence's language.
- **Rendering cost**: the source is parsed on every render; nothing is memoised.

## 9. Unproven

- **Screen readers**, 200% zoom and 320 px: not tried, as for the rest of the binding. Core
  measured 320 px for its own examples, in Chromium.
- **WebKit**: not run (issue #5).
- **Adversarial input beyond the rows**: the rows are the cases listed; no fuzzing.
