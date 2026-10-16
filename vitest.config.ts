import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Its own file, so Vitest does not take the playground's root from `vite.config.ts`.
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['tests/unit/**/*.test.{ts,tsx}'], environment: 'node' },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['tests/integration/setup.ts'],
        },
      },
    ],
  },
})
