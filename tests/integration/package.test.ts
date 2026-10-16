// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

// The package as an install over git would get it. `./run check` builds `dist/` first; this
// reads what is there rather than building again.
const root = fileURLToPath(new URL('../..', import.meta.url))

interface Packed {
  files: { path: string }[]
}

function packed(): string[] {
  const output = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: root,
    encoding: 'utf8',
  })
  const [pack] = JSON.parse(output) as Packed[]
  return (pack?.files ?? []).map((file) => file.path).sort()
}

test('the build has run', () => {
  expect(existsSync(`${root}/dist/index.js`), 'run `./run check`, which builds first').toBe(true)
})

test('npm packs dist/ and nothing of the source, tests or playground', () => {
  // npm adds package.json and the README to every package, whatever `files` says.
  const outside = packed().filter(
    (path) => !path.startsWith('dist/') && path !== 'package.json' && path !== 'README.md',
  )

  expect(outside).toEqual([])
})

test('every module in src/ ships as JavaScript with its declarations', () => {
  const files = packed()
  const modules = files.filter((path) => path.endsWith('.js')).map((path) => path.slice(0, -3))

  expect(modules).toContain('dist/index')
  expect(modules.filter((module) => !files.includes(`${module}.d.ts`))).toEqual([])
})

test('the entry exports every name the source does', async () => {
  const source = await import('../../src/index')
  const built = (await import(/* @vite-ignore */ `${root}/dist/index.js`)) as object

  expect(Object.keys(built).sort()).toEqual(Object.keys(source).sort())
})

test('exports names one entry, with its types', async () => {
  const manifest = (await import('../../package.json', { with: { type: 'json' } })).default as {
    exports: Record<string, { types: string; import: string }>
  }

  expect(manifest.exports).toEqual({
    '.': { types: './dist/index.d.ts', import: './dist/index.js' },
  })
})
