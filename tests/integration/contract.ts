import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface Example {
  name: string
  element: Element
}

export interface ContractFile {
  /** The file's name without `.html`: `button`, `status`. */
  component: string
  examples: readonly Example[]
}

const MARKER = /^ example: ([a-z0-9-]+) $/

// Through core's `exports`, as an application would reach the files, so a broken entry fails here.
const directory = dirname(fileURLToPath(import.meta.resolve('@zellige/core/contract/button.html')))

/** Every contract file in the installed `@zellige/core`, split into its examples. */
export function contractFiles(): ContractFile[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.html'))
    .sort()
    .map((file) => ({
      component: file.slice(0, -'.html'.length),
      examples: split(file, readFileSync(join(directory, file), 'utf8')),
    }))
}

// Each `<!-- example: <name> -->` opens an example, which is the one element after it.
function split(file: string, source: string): Example[] {
  const template = document.createElement('template')
  template.innerHTML = source
  const examples: Example[] = []
  let name: string | undefined
  for (const node of Array.from(template.content.childNodes)) {
    const marker = node.nodeType === Node.COMMENT_NODE ? MARKER.exec(node.textContent ?? '') : null
    if (marker?.[1]) {
      name = marker[1]
    } else if (node instanceof Element) {
      if (!name) throw new Error(`${file}: <${node.localName}> follows no example comment`)
      examples.push({ name, element: node })
      name = undefined
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      throw new Error(`${file}: text outside any element`)
    }
  }
  if (name) throw new Error(`${file}: example ${name} has no element`)
  return examples
}

// Attributes whose value is an id, or a list of them. Ids are generated (`useId`, React Aria) on
// one side and written by hand on the other, so both are renamed by order of first appearance.
const ID_REFS = new Set(['for', 'aria-labelledby', 'aria-describedby', 'aria-controls'])

/**
 * The structure the contract fixes, as text: one line per element and per text node. Tag names;
 * every attribute but `data-*`, sorted, `class` as a sorted set; text with its whitespace
 * collapsed. Equal strings mean the same markup, and a difference reads as a diff.
 */
export function canonical(root: Element): string {
  const ids = new Map<string, string>()
  for (const element of [root, ...Array.from(root.querySelectorAll('[id]'))]) {
    const id = element.getAttribute('id')
    if (id !== null && !ids.has(id)) ids.set(id, `id-${ids.size + 1}`)
  }
  const rename = (id: string) => ids.get(id) ?? `missing(${id})`

  const lines: string[] = []
  const walk = (node: Node, depth: number) => {
    const indent = '  '.repeat(depth)
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (text) lines.push(`${indent}"${text}"`)
      return
    }
    if (!(node instanceof Element)) return

    const attributes = Array.from(node.attributes)
      .filter(({ name }) => !name.startsWith('data-'))
      .map(({ name, value }) => {
        if (name === 'class')
          return `class="${value.split(/\s+/).filter(Boolean).sort().join(' ')}"`
        if (name === 'id') return `id="${rename(value)}"`
        if (ID_REFS.has(name)) return `${name}="${value.split(/\s+/).map(rename).join(' ')}"`
        return value === '' ? name : `${name}="${value}"`
      })
      .sort()
    lines.push(`${indent}<${node.localName}${attributes.map((a) => ` ${a}`).join('')}>`)
    // A `<template>`'s children are in its content; nothing in the contract uses one.
    for (const child of Array.from(node.childNodes)) walk(child, depth + 1)
  }
  walk(root, 0)
  return lines.join('\n')
}
