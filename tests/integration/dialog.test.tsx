import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Dialog, UiProvider, type UiStrings } from '../../src'

// jsdom has no modal `<dialog>`, so the dialog stays closed here and the queries reach into it
// with `hidden: true`. Its behaviour is proved in the browser, in tests/ui/dialog.spec.ts.

interface CloseLabelCase {
  name: string
  provider: Partial<UiStrings> | undefined
  own: string | undefined
  expected: string
}

const CLOSE_LABELS: readonly CloseLabelCase[] = [
  { name: 'the default', provider: undefined, own: undefined, expected: 'Close' },
  { name: "the provider's", provider: { close: 'Закрыть' }, own: undefined, expected: 'Закрыть' },
  { name: 'its own prop', provider: { close: 'Закрыть' }, own: 'Dismiss', expected: 'Dismiss' },
]

function within(provider: Partial<UiStrings> | undefined, element: ReactElement) {
  return provider ? <UiProvider strings={provider}>{element}</UiProvider> : element
}

describe('the close button is named by', () => {
  for (const { name, provider, own, expected } of CLOSE_LABELS) {
    test(`${name}: "${expected}"`, () => {
      render(
        within(
          provider,
          <Dialog open={false} onClose={() => {}} title="Shortcuts" closeLabel={own}>
            <p>Press N.</p>
          </Dialog>,
        ),
      )

      expect(screen.getByRole('button', { name: expected, hidden: true })).toBeDefined()
    })
  }
})

test('the close button calls onClose', () => {
  const onClose = vi.fn()
  render(
    <Dialog open={false} onClose={onClose} title="Shortcuts">
      <p>Press N.</p>
    </Dialog>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }))

  expect(onClose).toHaveBeenCalledOnce()
})
