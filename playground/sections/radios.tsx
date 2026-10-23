import { useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { I18nProvider } from 'react-aria'
import { Button, Notice, Radio, RadioGroup } from '../../src'
import { Section } from '../section'

const RETRIES = { three: 'Three times', five: 'Five times', ten: 'Ten times' } as const
const BACKOFF = { fixed: 'Fixed', doubling: 'Doubling' } as const

// What an application does with an unanswered question on a failed send: show the group's
// error, then focus its first radio through a ref. The binding owns neither step.
export function Radios() {
  const firstRetry = useRef<HTMLInputElement>(null)
  const firstBackoff = useRef<HTMLInputElement>(null)
  const [retries, setRetries] = useState<keyof typeof RETRIES | null>(null)
  const [backoff, setBackoff] = useState<keyof typeof BACKOFF | null>(null)
  const [missing, setMissing] = useState<{ retries: boolean; backoff: boolean }>({
    retries: false,
    backoff: false,
  })
  const [sent, setSent] = useState<string>()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const gaps = { retries: retries === null, backoff: backoff === null }
    // The error is on the page before focus arrives, so it is read with the radio.
    flushSync(() => setMissing(gaps))
    if (gaps.retries) firstRetry.current?.focus()
    else if (gaps.backoff) firstBackoff.current?.focus()
    else if (retries !== null && backoff !== null)
      setSent(`${RETRIES[retries]}, ${BACKOFF[backoff]}`)
  }

  return (
    <Section id="radio" title="Radio group">
      <form className="playground__form" noValidate onSubmit={submit}>
        <RadioGroup
          label="Retries"
          description="How often a failed request is tried again"
          error={missing.retries ? 'Choose how often' : undefined}
          value={retries}
          onChange={(value) => {
            setRetries(value as keyof typeof RETRIES)
            setMissing((now) => ({ ...now, retries: false }))
          }}
        >
          <Radio value="three" ref={firstRetry}>
            {RETRIES.three}
          </Radio>
          <Radio value="five" description="Slower, but surer">
            {RETRIES.five}
          </Radio>
          <Radio value="ten">{RETRIES.ten}</Radio>
        </RadioGroup>
        <RadioGroup
          label="Backoff"
          error={missing.backoff ? 'Choose a backoff' : undefined}
          value={backoff}
          onChange={(value) => {
            setBackoff(value as keyof typeof BACKOFF)
            setMissing((now) => ({ ...now, backoff: false }))
          }}
        >
          <Radio value="fixed" ref={firstBackoff}>
            {BACKOFF.fixed}
          </Radio>
          <Radio value="doubling">{BACKOFF.doubling}</Radio>
        </RadioGroup>
        <div className="playground__row">
          <Button type="submit" variant="primary">
            Send the answers
          </Button>
        </div>
      </form>
      {/* Mounted from the start and written into, so the outcome is announced. */}
      <Notice title={sent ? `Sent: ${sent}` : 'No answers sent yet'} />
      {/* React Aria reads the direction from its locale, not from `dir`. */}
      <I18nProvider locale="he-IL">
        <div dir="rtl">
          <RadioGroup label="Retries, right to left">
            <Radio value="three">{RETRIES.three}</Radio>
            <Radio value="five">{RETRIES.five}</Radio>
            <Radio value="ten">{RETRIES.ten}</Radio>
          </RadioGroup>
        </div>
      </I18nProvider>
    </Section>
  )
}
