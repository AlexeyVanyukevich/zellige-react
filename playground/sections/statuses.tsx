import { useRef, useState } from 'react'
import { Button, Empty, Loading, Trouble } from '../../src'
import { Section } from '../section'

type Load = 'idle' | 'loading' | 'failed' | 'loaded'

// The first attempt fails and every later one succeeds, each settling on the next microtask: a
// flow the journeys can drive with no timer to wait on.
function loader() {
  let attempts = 0
  return async () => {
    const attempt = attempts++
    await Promise.resolve()
    if (attempt === 0) throw new Error('The server did not answer')
  }
}

export function Statuses() {
  const heading = useRef<HTMLHeadingElement>(null)
  const fetchIssues = useRef(loader())
  const [load, setLoad] = useState<Load>('idle')

  const start = () => {
    setLoad('loading')
    fetchIssues.current().then(
      () => setLoad('loaded'),
      () => setLoad('failed'),
    )
  }

  // Retry removes the button that has focus, so focus goes first to the region's heading, which
  // stays through Loading and whatever follows it.
  const retry = () => {
    heading.current?.focus()
    start()
  }

  return (
    <Section id="status" title="Status">
      <Empty title="No open issues">
        <p>New issues appear here as they arrive.</p>
      </Empty>
      <Loading />
      <Trouble
        title="This board was deleted"
        detail="Ask its owner to restore it from the archive."
      />

      <div className="playground__region">
        <h3 id="issues-heading" ref={heading} tabIndex={-1}>
          Issues
        </h3>
        <div className="playground__row">
          <Button onClick={start}>Load the issues</Button>
        </div>
        {load === 'loading' ? <Loading label="Loading the issues…" /> : null}
        {load === 'failed' ? (
          <Trouble
            title="Couldn't load the issues"
            detail="The server did not answer. Check the connection and try again."
            onRetry={retry}
          />
        ) : null}
        {load === 'loaded' ? <Empty title="No open issues" /> : null}
      </div>
    </Section>
  )
}
