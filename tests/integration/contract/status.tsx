import type { ReactElement } from 'react'
import { Empty, Loading, Trouble } from '../../../src'

export const ROWS: Record<string, ReactElement> = {
  empty: (
    <Empty title="No open issues">
      <p>New issues appear here as they arrive.</p>
    </Empty>
  ),
  loading: <Loading />,
  trouble: (
    <Trouble
      title="Couldn't load the issues"
      detail="The server did not answer. Check the connection and try again."
      onRetry={() => {}}
    />
  ),
  'trouble-without-retry': (
    <Trouble
      title="This board was deleted"
      detail="Ask its owner to restore it from the archive."
    />
  ),
}
