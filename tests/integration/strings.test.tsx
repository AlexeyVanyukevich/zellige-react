import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, test } from 'vitest'
import { UiProvider, type UiStrings } from '../../src'
import { useString } from '../../src/provider'

function Probe({ name, own }: { name: keyof UiStrings; own: string | undefined }) {
  return <output>{useString(name, own)}</output>
}

interface Case {
  name: string
  string: keyof UiStrings
  /** The providers around the probe, outermost first; none means no provider at all. */
  providers: readonly Partial<UiStrings>[]
  own: string | undefined
  expected: string
}

const CASES: readonly Case[] = [
  { name: 'no provider', string: 'close', providers: [], own: undefined, expected: 'Close' },
  { name: 'no provider', string: 'retry', providers: [], own: undefined, expected: 'Retry' },
  { name: 'no provider', string: 'loading', providers: [], own: undefined, expected: 'Loading…' },
  {
    name: "the provider's value",
    string: 'close',
    providers: [{ close: 'Закрыть' }],
    own: undefined,
    expected: 'Закрыть',
  },
  {
    name: 'a provider that leaves the string alone',
    string: 'retry',
    providers: [{ close: 'Закрыть' }],
    own: undefined,
    expected: 'Retry',
  },
  {
    name: 'the own prop over the provider',
    string: 'loading',
    providers: [{ loading: 'Загрузка…' }],
    own: 'Loading the board…',
    expected: 'Loading the board…',
  },
  {
    name: 'the own prop with no provider',
    string: 'retry',
    providers: [],
    own: 'Try again',
    expected: 'Try again',
  },
  {
    name: 'an inner provider over an outer one, for what it names',
    string: 'close',
    providers: [{ close: 'Закрыть', retry: 'Повторить' }, { close: 'Скрыть' }],
    own: undefined,
    expected: 'Скрыть',
  },
  {
    name: "the outer provider's value where the inner one is silent",
    string: 'retry',
    providers: [{ close: 'Закрыть', retry: 'Повторить' }, { close: 'Скрыть' }],
    own: undefined,
    expected: 'Повторить',
  },
]

for (const { name, string, providers, own, expected } of CASES) {
  test(`${string}: ${name} → "${expected}"`, () => {
    const probe: ReactNode = <Probe name={string} own={own} />
    render(
      providers.reduceRight<ReactNode>(
        (inner, strings) => <UiProvider strings={strings}>{inner}</UiProvider>,
        probe,
      ),
    )

    expect(screen.getByRole('status').textContent).toBe(expected)
  })
}
