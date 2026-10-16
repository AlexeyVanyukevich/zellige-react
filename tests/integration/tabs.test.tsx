import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { Tabs, type TabItem } from '../../src'

const ITEMS: readonly TabItem[] = [
  { id: 'spec', label: 'Spec', panel: <p>The design.</p> },
  { id: 'plan', label: 'Plan', panel: <p>The steps.</p> },
  { id: 'review', label: 'Review', panel: <p>The changes.</p> },
]

function selected(): string | null {
  return screen.getByRole('tab', { selected: true }).textContent
}

interface StartCase {
  name: string
  value: string | undefined
  defaultValue: string | undefined
  expected: string
  panel: string
}

const STARTS: readonly StartCase[] = [
  {
    name: 'the first item',
    value: undefined,
    defaultValue: undefined,
    expected: 'Spec',
    panel: 'The design.',
  },
  {
    name: 'defaultValue',
    value: undefined,
    defaultValue: 'plan',
    expected: 'Plan',
    panel: 'The steps.',
  },
  {
    name: 'value',
    value: 'review',
    defaultValue: undefined,
    expected: 'Review',
    panel: 'The changes.',
  },
  {
    name: 'value over defaultValue',
    value: 'review',
    defaultValue: 'plan',
    expected: 'Review',
    panel: 'The changes.',
  },
]

describe('the tab selected at first is', () => {
  for (const { name, value, defaultValue, expected, panel } of STARTS) {
    test(`${name}: ${expected}`, () => {
      render(<Tabs label="Card" items={ITEMS} value={value} defaultValue={defaultValue} />)

      expect(selected()).toBe(expected)
      expect(screen.getByRole('tabpanel').textContent).toBe(panel)
    })
  }
})

test('without value, a key moves the selection and reports it', () => {
  const onChange = vi.fn()
  render(<Tabs label="Card" items={ITEMS} onChange={onChange} />)

  fireEvent.keyDown(screen.getByRole('tab', { name: 'Spec' }), { key: 'ArrowRight' })

  expect(onChange).toHaveBeenCalledWith('plan')
  expect(selected()).toBe('Plan')
  expect(screen.getByRole('tabpanel').textContent).toBe('The steps.')
})

test('with value, a key only reports; the selection moves when the application passes it', () => {
  const onChange = vi.fn()
  const { rerender } = render(<Tabs label="Card" items={ITEMS} value="spec" onChange={onChange} />)

  fireEvent.keyDown(screen.getByRole('tab', { name: 'Spec' }), { key: 'ArrowRight' })

  expect(onChange).toHaveBeenCalledWith('plan')
  expect(selected()).toBe('Spec')

  rerender(<Tabs label="Card" items={ITEMS} value="plan" onChange={onChange} />)
  expect(selected()).toBe('Plan')
})
