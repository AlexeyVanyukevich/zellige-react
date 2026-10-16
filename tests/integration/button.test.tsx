import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { expect, test, vi } from 'vitest'
import { Button } from '../../src'

test('a button is type="button" unless told otherwise, so it never submits by accident', () => {
  render(
    <>
      <Button>Plain</Button>
      <Button type="submit">Send</Button>
    </>,
  )

  expect(screen.getByRole('button', { name: 'Plain' })).toHaveProperty('type', 'button')
  expect(screen.getByRole('button', { name: 'Send' })).toHaveProperty('type', 'submit')
})

test('a busy button stays focusable, and a click neither calls its handler nor submits', () => {
  const onClick = vi.fn()
  const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
  render(
    <form onSubmit={onSubmit}>
      <Button type="submit" busy onClick={onClick}>
        Save
      </Button>
    </form>,
  )
  const button = screen.getByRole('button', { name: 'Save' })

  button.focus()
  fireEvent.click(button)

  expect(document.activeElement).toBe(button)
  expect(onClick).not.toHaveBeenCalled()
  expect(onSubmit).not.toHaveBeenCalled()
})

test('a button that is not busy calls its handler', () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick}>Save</Button>)

  fireEvent.click(screen.getByRole('button', { name: 'Save' }))

  expect(onClick).toHaveBeenCalledOnce()
})

test("the caller's className follows the kit's, and ref reaches the element", () => {
  const ref = createRef<HTMLButtonElement>()
  render(
    <Button ref={ref} variant="danger" className="wide">
      Delete
    </Button>,
  )

  expect(ref.current).toBe(screen.getByRole('button', { name: 'Delete' }))
  expect(ref.current?.className).toBe('zl-button zl-button--danger wide')
})
