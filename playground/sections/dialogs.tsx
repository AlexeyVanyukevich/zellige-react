import { useState, type FormEvent } from 'react'
import { Button, Dialog, Field, Input, Select, Textarea } from '../../src'
import { Section } from '../section'

type Open = 'booking' | 'card' | 'shortcuts' | null

// The application's state alone decides whether a dialog is open; every way of closing one
// arrives here as `onClose`.
export function Dialogs() {
  const [open, setOpen] = useState<Open>(null)
  const close = () => setOpen(null)
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    close()
  }

  return (
    <Section id="dialog" title="Dialog">
      <div className="playground__row">
        <Button onClick={() => setOpen('booking')}>New booking</Button>
        <Button onClick={() => setOpen('card')}>Edit the card</Button>
        <Button onClick={() => setOpen('shortcuts')}>Keyboard shortcuts</Button>
      </div>

      <Dialog
        open={open === 'booking'}
        onClose={close}
        title="New booking"
        footer={
          <>
            <Button onClick={close}>Cancel</Button>
            {/* In the foot, outside the form, so it submits through `form`. */}
            <Button type="submit" form="booking-form" variant="primary">
              Save
            </Button>
          </>
        }
      >
        <form id="booking-form" onSubmit={save}>
          <Field label="Guest">
            <Input name="guest" autoComplete="off" />
          </Field>
        </form>
      </Dialog>

      <Dialog
        open={open === 'card'}
        onClose={close}
        title="Card"
        placement="side"
        footer={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" onClick={close}>
              Save
            </Button>
          </>
        }
      >
        <Field label="Title">
          <Input defaultValue="Fix the login redirect" />
        </Field>
        <Field label="Status">
          <Select>
            <option>Open</option>
            <option>In progress</option>
            <option>Done</option>
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea />
        </Field>
      </Dialog>

      <Dialog open={open === 'shortcuts'} onClose={close} title="Keyboard shortcuts">
        <p>Press N for a new card and slash to search.</p>
      </Dialog>
    </Section>
  )
}
