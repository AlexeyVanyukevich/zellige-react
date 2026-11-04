import { Markdown } from '../../src'
import { Section } from '../section'

// Written as an agent writes a plan: its own top heading is `#`, placed under the section's `h2`.
const PLAN = `# Winter opening

Open the north cabin for the season, as [the booking terms](https://example.com/terms) say.

## Before the first guest

- Sweep the chimney
- Stock the woodshed
  - Birch for the stove
  - Kindling

| Cabin | Beds | Stove | Water | Opens |
| --- | --- | --- | --- | --- |
| North | Four | Wood-burning | Well-water | December-twentieth |
| South | Two | Electric-heater | Mains-water | January-tenth |

\`\`\`
open('north', { from: '2026-12-20' })
\`\`\`
`

export function MarkdownSection() {
  return (
    <Section id="markdown" title="Markdown">
      <Markdown source={PLAN} headingLevel={3} />
    </Section>
  )
}
