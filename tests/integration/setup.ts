import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library unmounts after each test only where the runner has globals; this suite has none.
afterEach(cleanup)
