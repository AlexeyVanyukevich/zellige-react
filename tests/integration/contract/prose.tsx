import type { ReactElement } from 'react'
import { Markdown } from '../../../src'

// Each row is the Markdown an agent would write for the example. The document's top heading is
// `#`, rendered at core's `h4`.
const DOCUMENT = `# Booking a cabin

A **confirmed** booking holds the cabin for the *whole* stay. Check the
\`arrival\` date first, then read the
<https://example.com/cabins/north/booking-terms/2026/winter/cancellation-and-refunds>.

## Before you arrive

- Pack warm clothes
- Bring food for the stay
  - Dry goods
  - Fresh produce
- Tell the owner when you will arrive

### Steps

1. Choose the dates
2. Confirm the guests
3. Pay the deposit

> The stove burns best with dry birch.

---

| Cabin | Beds |
| ----- | ---- |
| North | 4    |
| South | 2    |

\`\`\`
const cabin = book('north', '2026-12-24')
console.log(cabin.status)
\`\`\`

That is all.
`

const WIDE_TABLE = `| Requirement | Description | Responsible | Milestone | Estimate |
| --- | --- | --- | --- | --- |
| Authentication | Registration | Backend-team | Milestone-one | Two-weeks |
| Authorisation | Permissions | Platform-team | Milestone-two | Three-weeks |
`

const LONG_CODE_LINE = `\`\`\`
const reservation = await bookings.reserve({ cabin: 'north', arrival: '2026-12-24', nights: 7, guests: 4 })
\`\`\`
`

export const ROWS: Record<string, ReactElement> = {
  document: <Markdown source={DOCUMENT} headingLevel={4} />,
  'wide-table': <Markdown source={WIDE_TABLE} headingLevel={2} />,
  'long-code-line': <Markdown source={LONG_CODE_LINE} headingLevel={2} />,
}
