import type { ReactElement } from 'react'
import { Button, Dialog, Field, Input, Select, Textarea } from '../../../src'

// Closed: the contract records the markup, and `open` is the platform's state, not an attribute
// the binding writes.
const closed = { open: false, onClose: () => {} }

const foot = (
  <>
    <Button>Cancel</Button>
    <Button variant="primary">Save</Button>
  </>
)

export const ROWS: Record<string, ReactElement> = {
  center: (
    <Dialog {...closed} title="New booking" footer={foot}>
      <Field label="Guest">
        <Input />
      </Field>
    </Dialog>
  ),
  side: (
    <Dialog {...closed} title="Card" placement="side" footer={foot}>
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
  ),
  'without-foot': (
    <Dialog {...closed} title="Keyboard shortcuts">
      <p>Press N for a new card and slash to search.</p>
    </Dialog>
  ),
}
