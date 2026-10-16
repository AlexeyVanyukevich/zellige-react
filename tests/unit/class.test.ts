import { describe, expect, test } from 'vitest'
import { buttonClass, cx, type ButtonVariant } from '../../src/class'

interface ButtonClassCase {
  variant: ButtonVariant | undefined
  extra: string | undefined
  expected: string
}

const BUTTON_CLASS: readonly ButtonClassCase[] = [
  { variant: undefined, extra: undefined, expected: 'zl-button' },
  { variant: 'neutral', extra: undefined, expected: 'zl-button' },
  { variant: 'primary', extra: undefined, expected: 'zl-button zl-button--primary' },
  { variant: 'quiet', extra: undefined, expected: 'zl-button zl-button--quiet' },
  { variant: 'danger', extra: undefined, expected: 'zl-button zl-button--danger' },
  { variant: undefined, extra: 'wide', expected: 'zl-button wide' },
  { variant: 'primary', extra: 'wide', expected: 'zl-button zl-button--primary wide' },
]

describe('buttonClass', () => {
  for (const { variant, extra, expected } of BUTTON_CLASS) {
    test(`${variant ?? 'no variant'}, ${extra ?? 'no extra'} → "${expected}"`, () => {
      expect(buttonClass(variant, extra)).toBe(expected)
    })
  }
})

interface MergeCase {
  name: string
  parts: readonly (string | false | undefined)[]
  expected: string
}

const MERGE: readonly MergeCase[] = [
  { name: 'the kit class alone', parts: ['zl-card', undefined], expected: 'zl-card' },
  { name: 'an empty className', parts: ['zl-card', ''], expected: 'zl-card' },
  {
    name: "the caller's class after the kit's",
    parts: ['zl-card', 'mine'],
    expected: 'zl-card mine',
  },
  { name: 'several classes from the caller', parts: ['zl-card', 'a b'], expected: 'zl-card a b' },
  {
    name: 'a modifier switched off',
    parts: ['zl-badge', false, 'mine'],
    expected: 'zl-badge mine',
  },
  { name: 'stray spaces', parts: [' zl-card ', '  mine  '], expected: 'zl-card mine' },
]

describe('cx', () => {
  for (const { name, parts, expected } of MERGE) {
    test(`${name} → "${expected}"`, () => {
      expect(cx(...parts)).toBe(expected)
    })
  }
})
