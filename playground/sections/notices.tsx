import { Notice } from '../../src'
import { Section } from '../section'

// Rendered with the page, so read in place. The form above shows one written into after mount.
export function Notices() {
  return (
    <Section id="notice" title="Notice">
      <Notice title="Booking saved">
        <p>It is on the calendar for 12 to 14 October.</p>
      </Notice>
      <Notice tone="danger" title="Payment failed">
        <p>The card was declined. Try another card.</p>
      </Notice>
    </Section>
  )
}
