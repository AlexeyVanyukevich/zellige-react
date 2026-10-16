import { Button, buttonClass } from '../../src'
import { Section } from '../section'

export function Buttons() {
  return (
    <Section id="button" title="Button">
      <div className="playground__row">
        <Button>Cancel</Button>
        <Button variant="primary">Save</Button>
        <Button variant="quiet">Show more</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="primary" disabled>
          Publish
        </Button>
        <Button variant="primary" busy>
          Sending
        </Button>
        <a className={buttonClass()} href="#button-heading">
          Back to the top of Button
        </a>
      </div>
    </Section>
  )
}
