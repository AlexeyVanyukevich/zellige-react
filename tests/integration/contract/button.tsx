import type { ReactElement } from 'react'
import { Button, buttonClass } from '../../../src'

export const ROWS: Record<string, ReactElement> = {
  neutral: <Button>Cancel</Button>,
  primary: <Button variant="primary">Save</Button>,
  quiet: <Button variant="quiet">Show more</Button>,
  danger: <Button variant="danger">Delete</Button>,
  disabled: (
    <Button variant="primary" disabled>
      Save
    </Button>
  ),
  busy: (
    <Button variant="primary" busy>
      Save
    </Button>
  ),
  // No component of its own: an application styles its link with the class.
  link: (
    <a className={buttonClass()} href="/board">
      Open the board
    </a>
  ),
}
