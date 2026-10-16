import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Loading, Trouble, UiProvider, type UiStrings } from '../../src'

interface LabelCase {
  name: string
  provider: Partial<UiStrings> | undefined
  own: string | undefined
  loading: string
  retry: string
}

const RUSSIAN = { loading: 'Загрузка…', retry: 'Повторить' }

const LABELS: readonly LabelCase[] = [
  { name: 'the default', provider: undefined, own: undefined, loading: 'Loading…', retry: 'Retry' },
  { name: "the provider's", provider: RUSSIAN, own: undefined, ...RUSSIAN },
  { name: 'its own prop', provider: RUSSIAN, own: 'Mine', loading: 'Mine', retry: 'Mine' },
]

function within(provider: Partial<UiStrings> | undefined, element: ReactElement) {
  return provider ? <UiProvider strings={provider}>{element}</UiProvider> : element
}

describe('the text each component falls back to', () => {
  for (const { name, provider, own, loading, retry } of LABELS) {
    test(`Loading shows ${name}`, () => {
      render(within(provider, <Loading label={own} />))

      expect(screen.getByRole('status').textContent).toBe(loading)
    })

    test(`Trouble's retry button is named by ${name}`, () => {
      render(within(provider, <Trouble title="Failed" onRetry={() => {}} retryLabel={own} />))

      expect(screen.getByRole('button').textContent).toBe(retry)
    })
  }
})

test('Trouble has a retry button only when it has onRetry, and the button calls it', () => {
  const onRetry = vi.fn()
  const { rerender } = render(<Trouble title="Failed" />)
  expect(screen.queryByRole('button')).toBeNull()

  rerender(<Trouble title="Failed" onRetry={onRetry} />)
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

  expect(onRetry).toHaveBeenCalledOnce()
})
