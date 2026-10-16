import type { ReactElement } from 'react'
import { Field, Input, Tabs } from '../../../src'

export const ROWS: Record<string, ReactElement> = {
  'text-panel': (
    <Tabs
      label="Card"
      items={[
        {
          id: 'spec',
          label: 'Spec',
          panel: <p>The design, written and approved before any code.</p>,
        },
        { id: 'plan', label: 'Plan', panel: <p>The steps, one commit each.</p> },
      ]}
    />
  ),
  'panel-with-control': (
    <Tabs
      label="Booking"
      items={[
        {
          id: 'guest',
          label: 'Guest',
          panel: (
            <Field label="Name">
              <Input />
            </Field>
          ),
        },
        { id: 'payment', label: 'Payment', panel: <p>Paid by card.</p> },
      ]}
    />
  ),
}
