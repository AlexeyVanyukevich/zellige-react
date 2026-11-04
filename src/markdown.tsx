import type { Heading, Nodes, Root } from 'mdast'
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'
import { gfmTable } from 'micromark-extension-gfm-table'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { cx } from './class'
import { useString, type UiStrings } from './provider'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface MarkdownProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The Markdown: CommonMark and GFM tables. Untrusted: it decides no element of its own. */
  source: string
  /** The level the source's shallowest heading renders at; deeper ones keep their distance. */
  headingLevel: HeadingLevel
}

/** Core's prose markup for a Markdown string, written by someone the page does not trust. */
export function Markdown({ source, headingLevel, className, ...props }: MarkdownProps) {
  return (
    <div {...props} className={cx('zl-prose', className)}>
      <ReactMarkdown remarkPlugins={[tables, [headings, headingLevel]]} components={COMPONENTS}>
        {source}
      </ReactMarkdown>
    </div>
  )
}

// What reaches the DOM. Each takes only what core's markup has, so `react-markdown`'s `node`, a
// link's `title`, a code block's language class and a cell's alignment style are all dropped.
const COMPONENTS: Components = {
  a: ({ href, children }) => (allowed(href) ? <a href={href}>{children}</a> : children),
  // Not loaded: the URL is the source's, and a request to it tells that host who is reading.
  img: ({ alt }) => alt,
  code: ({ children }) => <code>{children}</code>,
  th: ({ children }) => <th>{children}</th>,
  td: ({ children }) => <td>{children}</td>,
  table: ({ children }) => (
    <Scroll name="table">
      <table>{children}</table>
    </Scroll>
  ),
  pre: ({ children }) => (
    <Scroll name="codeBlock">
      <pre>{children}</pre>
    </Scroll>
  ),
}

// Core's wrapper for anything that may be wider than the page. It is a Tab stop whether or not it
// overflows, so a keyboard can always scroll it.
function Scroll({ name, children }: { name: keyof UiStrings; children: ReactNode }) {
  const label = useString(name, undefined)
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-tabindex -- the markup is core's (issue #9)
    <div className="zl-prose__scroll" role="group" tabIndex={0} aria-label={label}>
      {children}
    </div>
  )
}

const SCHEMES = new Set(['http:', 'https:', 'mailto:'])

// An absolute URL with a scheme the page can follow safely. A relative one would resolve against
// the application's page, not wherever the text was written.
function allowed(href: string | undefined): href is string {
  if (!href || !URL.canParse(href)) return false
  return SCHEMES.has(new URL(href).protocol)
}

interface ParserData {
  micromarkExtensions?: unknown[]
  fromMarkdownExtensions?: unknown[]
}

// GFM's table syntax, and nothing else of GFM: what `remark-gfm` does for all of it. The
// processor is `unified`'s, which is `react-markdown`'s dependency and not this package's, so its
// data is typed here by the two lists the parser reads.
function tables(this: { data(): object }) {
  const data = this.data() as ParserData
  ;(data.micromarkExtensions ??= []).push(gfmTable())
  ;(data.fromMarkdownExtensions ??= []).push(gfmTableFromMarkdown())
}

// The shallowest heading becomes `level`; the rest keep their distance from it, up to `h6`.
function headings(level: HeadingLevel) {
  return (tree: Root) => {
    const found: Heading[] = []
    const walk = (node: Nodes) => {
      if (node.type === 'heading') found.push(node)
      if ('children' in node) for (const child of node.children) walk(child)
    }
    walk(tree)
    const top = Math.min(...found.map((heading) => heading.depth))
    for (const heading of found) {
      heading.depth = Math.min(6, heading.depth - top + level) as Heading['depth']
    }
  }
}
