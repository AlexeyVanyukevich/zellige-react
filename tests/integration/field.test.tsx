import { render, screen } from '@testing-library/react'
import { createRef, type ReactNode, type RefObject } from 'react'
import { describe, expect, test } from 'vitest'
import { Field, Input, Select, Textarea } from '../../src'

/** The text of each element `aria-describedby` names, in its order. */
function description(element: Element): string[] {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? `missing #${id}`)
}

interface DescribeCase {
  name: string
  hint: string | undefined
  error: string | undefined
  described: readonly string[]
  invalid: string | null
}

const DESCRIBE: readonly DescribeCase[] = [
  { name: 'nothing', hint: undefined, error: undefined, described: [], invalid: null },
  {
    name: 'a hint',
    hint: 'As on the passport',
    error: undefined,
    described: ['As on the passport'],
    invalid: null,
  },
  {
    name: 'an error',
    hint: undefined,
    error: 'Enter a name',
    described: ['Enter a name'],
    invalid: 'true',
  },
  {
    name: 'a hint and an error, the hint first',
    hint: 'As on the passport',
    error: 'Enter a name',
    described: ['As on the passport', 'Enter a name'],
    invalid: 'true',
  },
]

describe('a field connects its control', () => {
  for (const { name, hint, error, described, invalid } of DESCRIBE) {
    test(`with ${name}`, () => {
      render(
        <Field label="Name" hint={hint} error={error}>
          <Input />
        </Field>,
      )
      const input = screen.getByRole('textbox', { name: 'Name' })

      expect(description(input)).toEqual(described)
      expect(input.getAttribute('aria-invalid')).toBe(invalid)
    })
  }
})

interface Control {
  name: string
  role: 'textbox' | 'combobox'
  render: (label?: string) => { node: ReactNode; ref: RefObject<HTMLElement | null> }
}

const CONTROLS: readonly Control[] = [
  {
    name: 'Input',
    role: 'textbox',
    render: (label) => {
      const ref = createRef<HTMLInputElement>()
      return { ref, node: <Input ref={ref} aria-label={label} /> }
    },
  },
  {
    name: 'Select',
    role: 'combobox',
    render: (label) => {
      const ref = createRef<HTMLSelectElement>()
      return {
        ref,
        node: (
          <Select ref={ref} aria-label={label}>
            <option>North cabin</option>
          </Select>
        ),
      }
    },
  },
  {
    name: 'Textarea',
    role: 'textbox',
    render: (label) => {
      const ref = createRef<HTMLTextAreaElement>()
      return { ref, node: <Textarea ref={ref} aria-label={label} /> }
    },
  },
]

describe('each control', () => {
  for (const control of CONTROLS) {
    test(`${control.name} is named by the field's label and described by its error`, () => {
      render(
        <Field label="Answer" error="Pick one">
          {control.render().node}
        </Field>,
      )
      const element = screen.getByRole(control.role, { name: 'Answer' })

      expect(description(element)).toEqual(['Pick one'])
      expect(element.getAttribute('aria-invalid')).toBe('true')
    })

    test(`${control.name} works without a field, and passes its ref on`, () => {
      const { node, ref } = control.render('Alone')
      render(node)
      const element = screen.getByRole(control.role, { name: 'Alone' })

      expect(ref.current).toBe(element)
      expect(element.hasAttribute('id')).toBe(false)
      expect(element.hasAttribute('aria-describedby')).toBe(false)
      expect(element.hasAttribute('aria-invalid')).toBe(false)
    })
  }
})

interface OverrideCase {
  attribute: 'id' | 'aria-describedby' | 'aria-invalid'
  value: string
}

const OVERRIDES: readonly OverrideCase[] = [
  { attribute: 'id', value: 'guest-name' },
  { attribute: 'aria-describedby', value: 'elsewhere' },
  { attribute: 'aria-invalid', value: 'false' },
]

describe("a control's own attribute wins over the field's", () => {
  for (const { attribute, value } of OVERRIDES) {
    test(`the control's ${attribute}`, () => {
      const { container } = render(
        <Field label="Name" hint="As on the passport" error="Enter a name">
          <Input {...{ [attribute]: value }} />
        </Field>,
      )

      expect(container.querySelector('input')?.getAttribute(attribute)).toBe(value)
    })
  }
})

test("an explicit id still gets the field's label", () => {
  render(
    <Field label="Name">
      <Input id="guest-name" />
    </Field>,
  )

  expect(screen.getByRole('textbox', { name: 'Name' }).id).toBe('guest-name')
})
