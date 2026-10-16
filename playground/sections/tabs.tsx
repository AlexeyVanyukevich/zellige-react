import { useState } from 'react'
import { I18nProvider } from 'react-aria'
import { Field, Input, Tabs, type TabItem } from '../../src'
import { Section } from '../section'

const CARD: readonly TabItem[] = [
  { id: 'spec', label: 'Spec', panel: <p>The design, written and approved before any code.</p> },
  { id: 'plan', label: 'Plan', panel: <p>The steps, one commit each.</p> },
  { id: 'review', label: 'Review', panel: <p>Every change, shown before it is approved.</p> },
]

const BOOKING: readonly TabItem[] = [
  {
    id: 'guest',
    label: 'Guest',
    panel: (
      <Field label="Full name">
        <Input autoComplete="off" />
      </Field>
    ),
  },
  { id: 'payment', label: 'Payment', panel: <p>Paid by card.</p> },
]

export function TabsSection() {
  const [booking, setBooking] = useState('guest')

  return (
    <Section id="tabs" title="Tabs">
      <Tabs label="Card" items={CARD} />
      {/* Controlled, and its first panel holds a control, so the panel takes no tab stop. */}
      <Tabs label="Booking" items={BOOKING} value={booking} onChange={setBooking} />
      {/* React Aria reads the direction from its locale, not from `dir`; a right-to-left
          application wraps itself in its provider. */}
      <I18nProvider locale="he-IL">
        <div dir="rtl">
          <Tabs label="Card, right to left" items={CARD} />
        </div>
      </I18nProvider>
    </Section>
  )
}
