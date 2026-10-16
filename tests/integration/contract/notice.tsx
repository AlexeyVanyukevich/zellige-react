import type { ReactElement } from 'react'
import { Notice } from '../../../src'

export const ROWS: Record<string, ReactElement> = {
  info: (
    <Notice title="Booking saved">
      <p>It is on the calendar for 12 to 14 October.</p>
    </Notice>
  ),
  danger: (
    <Notice tone="danger" title="Payment failed">
      <p>The card was declined. Try another card.</p>
    </Notice>
  ),
  'title-only': <Notice title="All changes are saved" />,
}
