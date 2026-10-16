import { useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Button, Field, Input, Select, Textarea } from '../../src'
import { Section } from '../section'

// What an application does with a failed submit: show the error, then focus the first invalid
// control. The binding owns neither step.
export function Fields() {
  const name = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('name')
    if (typeof value === 'string' && value.trim()) {
      setError(undefined)
      return
    }
    // The error is on the page before focus arrives, so it is read with the field.
    flushSync(() => setError('Enter a name'))
    name.current?.focus()
  }

  return (
    <Section id="field" title="Field">
      <form className="playground__form" noValidate onSubmit={submit}>
        <Field label="Name" hint="As on the passport" error={error}>
          <Input ref={name} name="name" autoComplete="off" />
        </Field>
        <Field label="House">
          <Select name="house">
            <option>North cabin</option>
            <option>South cabin</option>
          </Select>
        </Field>
        <Field label="Note">
          <Textarea name="note" />
        </Field>
        <Field label="Arrival">
          <Input defaultValue="12 October" disabled />
        </Field>
        <div className="playground__row">
          <Button type="submit" variant="primary">
            Add the guest
          </Button>
        </div>
      </form>
      <Input type="search" aria-label="Search the guests" />
    </Section>
  )
}
