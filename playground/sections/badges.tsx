import { Badge } from '../../src'
import { Section } from '../section'

export function Badges() {
  return (
    <Section id="badge" title="Badge">
      <div className="playground__row">
        <Badge>Draft</Badge>
        <Badge tone="accent">New</Badge>
        <Badge tone="success">Resolved</Badge>
        <Badge tone="warning">Pending</Badge>
        <Badge tone="danger">Overdue</Badge>
      </div>
    </Section>
  )
}
