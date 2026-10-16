import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, test } from 'vitest'
import { canonical, contractFiles } from './contract'

type Rows = Record<string, ReactElement>

// One rows file per contract file, named after it: `contract/button.tsx` for `button.html`.
const modules = import.meta.glob<Rows>('./contract/*.tsx', { eager: true, import: 'ROWS' })
const rowsFiles = new Map(
  Object.entries(modules).map(([path, rows]) => [
    path.slice('./contract/'.length, -'.tsx'.length),
    rows,
  ]),
)

// Contract files whose component is not built yet. Each component's task takes its file off;
// the last one deletes this list and the skip below.
const PENDING = ['badge', 'dialog', 'notice', 'status', 'tabs']

const files = contractFiles()

for (const { component, examples } of files) {
  const rows = rowsFiles.get(component)
  const pending = PENDING.includes(component)

  test.skipIf(pending)(`${component}.html has a rows file`, () => {
    expect(rows, `tests/integration/contract/${component}.tsx is missing`).toBeDefined()
  })

  describe.skipIf(pending)(`${component}.html`, () => {
    for (const { name, element } of examples) {
      test(`${name} renders the contract's markup`, () => {
        const row = rows?.[name]
        expect(row, `no row for the example ${name}`).toBeDefined()

        const { container } = render(<>{row}</>)
        expect(container.children).toHaveLength(1)
        expect(canonical(container.children[0] as Element)).toBe(canonical(element))
      })
    }

    test('every row is an example in the contract', () => {
      const names = new Set(examples.map((example) => example.name))
      expect(Object.keys(rows ?? {}).filter((name) => !names.has(name))).toEqual([])
    })
  })
}

test('every rows file is for a contract file', () => {
  const components = new Set(files.map((file) => file.component))
  expect([...rowsFiles.keys()].filter((component) => !components.has(component))).toEqual([])
})

test('no component with a rows file is still pending', () => {
  expect(PENDING.filter((component) => rowsFiles.has(component))).toEqual([])
})
