import type { ReactElement } from 'react'
import { Field, Input, Select, Textarea } from '../../../src'

const houses = (
  <>
    <option>North cabin</option>
    <option>South cabin</option>
  </>
)

export const ROWS: Record<string, ReactElement> = {
  input: <Input type="search" aria-label="Search" />,
  select: <Select aria-label="House">{houses}</Select>,
  textarea: <Textarea aria-label="Note" />,
  'field-with-hint': (
    <Field label="Name" hint="As on the passport">
      <Input />
    </Field>
  ),
  'field-with-error': (
    <Field label="Name" error="Enter a name">
      <Input />
    </Field>
  ),
  'field-with-hint-and-error': (
    <Field label="Name" hint="As on the passport" error="Enter a name">
      <Input />
    </Field>
  ),
  'field-with-select': (
    <Field label="House">
      <Select>{houses}</Select>
    </Field>
  ),
  'field-with-textarea': (
    <Field label="Note">
      <Textarea />
    </Field>
  ),
  disabled: (
    <Field label="Arrival">
      <Input defaultValue="12 October" disabled />
    </Field>
  ),
}
