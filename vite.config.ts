import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Fixed, so the browser suite can wait on it, and one above core's, so both playgrounds can run
// at once. Loopback only: the browser in the Playwright image reaches it through the runner's
// connection, never over the network.
export const PLAYGROUND = { host: '127.0.0.1', port: 5181 }

export default defineConfig({
  root: fileURLToPath(new URL('playground', import.meta.url)),
  plugins: [react()],
  server: { ...PLAYGROUND, strictPort: true },
})
