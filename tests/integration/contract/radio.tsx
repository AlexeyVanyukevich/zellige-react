import type { ReactElement } from 'react'
import { Radio, RadioGroup } from '../../../src'

// Each row passes the contract's `name`: `canonical()` compares it as text, and React Aria
// generates one only when it is given none.
export const ROWS: Record<string, ReactElement> = {
  plain: (
    <RadioGroup label="Retries" name="radio-plain">
      <Radio value="three">Three times</Radio>
      <Radio value="five">Five times</Radio>
      <Radio value="ten">Ten times</Radio>
    </RadioGroup>
  ),
  checked: (
    <RadioGroup
      label="Retries"
      description="How often a failed request is tried again"
      name="radio-checked"
      defaultValue="five"
    >
      <Radio value="three">Three times</Radio>
      <Radio value="five" description="Slower, but surer">
        Five times
      </Radio>
    </RadioGroup>
  ),
  invalid: (
    <RadioGroup label="Backoff" error="Choose a backoff" name="radio-invalid">
      <Radio value="fixed">Fixed</Radio>
      <Radio value="doubling">Doubling</Radio>
    </RadioGroup>
  ),
  disabled: (
    <RadioGroup label="Region" name="radio-disabled" disabled>
      <Radio value="north">North</Radio>
      <Radio value="south">South</Radio>
    </RadioGroup>
  ),
}
