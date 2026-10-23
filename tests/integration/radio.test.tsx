import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { Radio, RadioGroup, type RadioGroupProps } from '../../src'

/** The text of each element `aria-describedby` names, in its order. */
function description(element: Element): string[] {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? `missing #${id}`)
}

function Retries(props: Partial<RadioGroupProps>) {
  return (
    <RadioGroup label="Retries" {...props}>
      <Radio value="three">Three times</Radio>
      <Radio value="five" description="Slower, but surer">
        Five times
      </Radio>
      <Radio value="ten">Ten times</Radio>
    </RadioGroup>
  )
}

const radio = (name: string) => screen.getByRole<HTMLInputElement>('radio', { name })
const checked = () =>
  screen
    .getAllByRole<HTMLInputElement>('radio')
    .filter((input) => input.checked)
    .map((input) => input.value)

interface StartCase {
  name: string
  value: string | null | undefined
  defaultValue: string | undefined
  expected: string[]
}

const STARTS: readonly StartCase[] = [
  { name: 'nothing', value: undefined, defaultValue: undefined, expected: [] },
  { name: 'defaultValue', value: undefined, defaultValue: 'five', expected: ['five'] },
  { name: 'value', value: 'ten', defaultValue: undefined, expected: ['ten'] },
  { name: 'value over defaultValue', value: 'ten', defaultValue: 'five', expected: ['ten'] },
  { name: 'a null value over defaultValue', value: null, defaultValue: 'five', expected: [] },
]

describe('the radio checked at first is', () => {
  for (const { name, value, defaultValue, expected } of STARTS) {
    test(`${name}: ${expected.join() || 'none'}`, () => {
      render(<Retries value={value} defaultValue={defaultValue} />)
      expect(checked()).toEqual(expected)
    })
  }
})

describe('choosing', () => {
  test('uncontrolled, a click checks the radio and reports its value', () => {
    const onChange = vi.fn()
    render(<Retries onChange={onChange} />)

    fireEvent.click(radio('Ten times'))

    expect(onChange).toHaveBeenCalledWith('ten')
    expect(checked()).toEqual(['ten'])
  })

  test('controlled, a click reports its value and checks only what value says', () => {
    const onChange = vi.fn()
    render(<Retries value="three" onChange={onChange} />)

    fireEvent.click(radio('Ten times'))

    expect(onChange).toHaveBeenCalledWith('ten')
    expect(checked()).toEqual(['three'])
  })
})

interface DescribeCase {
  name: string
  props: Partial<RadioGroupProps>
  group: string[]
  three: string[]
  five: string[]
  invalid: string | null
}

// Each radio is described by its own description, then the group's error, then the group's
// description: React Aria's order, which core's contract records.
const DESCRIBE: readonly DescribeCase[] = [
  { name: 'nothing', props: {}, group: [], three: [], five: ['Slower, but surer'], invalid: null },
  {
    name: 'a description',
    props: { description: 'How often' },
    group: ['How often'],
    three: ['How often'],
    five: ['Slower, but surer', 'How often'],
    invalid: null,
  },
  {
    name: 'an error',
    props: { error: 'Choose how often' },
    group: ['Choose how often'],
    three: ['Choose how often'],
    five: ['Slower, but surer', 'Choose how often'],
    invalid: 'true',
  },
  {
    name: 'a description and an error',
    props: { description: 'How often', error: 'Choose how often' },
    group: ['How often', 'Choose how often'],
    three: ['Choose how often', 'How often'],
    five: ['Slower, but surer', 'Choose how often', 'How often'],
    invalid: 'true',
  },
]

describe('a group with', () => {
  for (const { name, props, group, three, five, invalid } of DESCRIBE) {
    test(`${name} describes itself and its radios`, () => {
      render(<Retries {...props} />)
      const element = screen.getByRole('radiogroup', { name: 'Retries' })
      expect(description(element)).toEqual(group)
      expect(element.getAttribute('aria-invalid')).toBe(invalid)
      expect(description(radio('Three times'))).toEqual(three)
      expect(description(radio('Five times'))).toEqual(five)
    })
  }
})

describe('a radio', () => {
  test('is named by its label alone, not by its description', () => {
    render(<Retries />)
    expect(screen.getByRole('radio', { name: 'Five times' })).toBe(radio('Five times'))
    expect(radio('Five times').closest('label')?.textContent?.trim()).toBe('Five times')
  })

  test('is disabled, with the group, when the group is', () => {
    render(<Retries disabled />)
    expect(screen.getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true')
    expect(screen.getAllByRole<HTMLInputElement>('radio').map((input) => input.disabled)).toEqual([
      true,
      true,
      true,
    ])
  })

  test('takes its ref and its own attributes on the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <RadioGroup label="Retries">
        <Radio value="three" ref={ref} className="first" data-row="three">
          Three times
        </Radio>
      </RadioGroup>,
    )
    const input = radio('Three times')
    expect(ref.current).toBe(input)
    expect([...input.classList].sort()).toEqual(['first', 'zl-radio__input'])
    expect(input.dataset.row).toBe('three')
  })

  test('outside a group throws, naming the group', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Radio value="three">Three times</Radio>)).toThrow(
      'Radio must be inside a RadioGroup',
    )
  })
})
