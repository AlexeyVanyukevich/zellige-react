# @zellige/react

The React binding of the zellige component kit: Button, Field with Input, Select and Textarea,
RadioGroup with Radio, Card, Badge, Notice, Empty / Loading / Trouble, Dialog and Tabs. It
renders `@zellige/core`'s markup exactly and adds the behaviour — the platform's `<dialog>`, and
React Aria's hooks for Tabs and RadioGroup. Classes, tokens and markup are core's, in its own repository.

How the binding is built, and why it is shaped as it is: [`docs/architecture.md`](docs/architecture.md).

## Installing

Over git, at release tags, both packages:

```json
"dependencies": {
  "@zellige/core": "github:AlexeyVanyukevich/zellige-core#v0.2.1",
  "@zellige/react": "github:AlexeyVanyukevich/zellige-react#v0.2.0"
}
```

It needs React 19, and an application bundler: the build's imports resolve as a bundler does.

## Using it

Load core's CSS once, then use the components:

```tsx
import '@zellige/core/tokens.css'
import '@zellige/core/zl.css'
import { Dialog, Field, Input, UiProvider } from '@zellige/react'

;<Dialog open={open} onClose={() => setOpen(false)} title="New booking">
  <Field label="Guest" error={error}>
    <Input ref={guest} />
  </Field>
</Dialog>
```

The kit's own text — `Close`, `Retry`, `Loading…` — comes from a provider:

```tsx
<UiProvider strings={{ close: 'Закрыть', retry: 'Повторить', loading: 'Загрузка…' }}>
```

A right-to-left application also wraps itself in `I18nProvider` from `react-aria`, which Tabs
reads its direction from.

## Working on it

Needs Node 24 or newer and Docker, which runs the browsers.

```bash
./run          # installs and lists the scenarios
./run dev      # the playground: every component and flow, at http://127.0.0.1:5181
./run test     # the browser suite, in the Playwright image; arguments go to playwright test
./run check    # formatting, types, lint, the build, Vitest, then the browser suite
```
