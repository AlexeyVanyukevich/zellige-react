import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Markdown, type MarkdownProps } from '../../src'
import { canonical } from './contract'

interface Case {
  name: string
  source: string
  headingLevel: MarkdownProps['headingLevel']
  /** The markup inside `div.zl-prose`, as HTML. */
  expected: string
}

const table = (inner: string) =>
  `<div class="zl-prose__scroll" role="group" tabindex="0" aria-label="Table"><table>${inner}</table></div>`
const code = (inner: string) =>
  `<div class="zl-prose__scroll" role="group" tabindex="0" aria-label="Code block"><pre><code>${inner}</code></pre></div>`

const CASES: readonly Case[] = [
  // Headings
  {
    name: 'a top heading of ## moved down to h4',
    source: '## Top\n\n### Under',
    headingLevel: 4,
    expected: '<h4>Top</h4><h5>Under</h5>',
  },
  {
    name: 'a top heading of #### moved up to h2',
    source: '#### Top\n\n##### Under',
    headingLevel: 2,
    expected: '<h2>Top</h2><h3>Under</h3>',
  },
  {
    name: 'headings past h6 clamped at h6',
    source: '# A\n\n## B\n\n### C',
    headingLevel: 5,
    expected: '<h5>A</h5><h6>B</h6><h6>C</h6>',
  },
  {
    name: "a gap in the source's outline kept",
    source: '# A\n\n### C',
    headingLevel: 2,
    expected: '<h2>A</h2><h4>C</h4>',
  },

  // Tables and code blocks
  {
    name: 'a GFM table in its wrapper',
    source: '| Cabin | Beds |\n| --- | --- |\n| North | 4 |',
    headingLevel: 2,
    expected: table(
      '<thead><tr><th>Cabin</th><th>Beds</th></tr></thead><tbody><tr><td>North</td><td>4</td></tr></tbody>',
    ),
  },
  {
    name: 'an aligned table with no style',
    source: '| Cabin | Beds |\n| :-- | --: |\n| North | 4 |',
    headingLevel: 2,
    expected: table(
      '<thead><tr><th>Cabin</th><th>Beds</th></tr></thead><tbody><tr><td>North</td><td>4</td></tr></tbody>',
    ),
  },
  {
    name: 'a fenced block in its wrapper, its language dropped',
    source: "```js\nbook('north')\n```",
    headingLevel: 2,
    expected: code("book('north')"),
  },

  // Raw HTML
  {
    name: 'inline raw HTML as text',
    source: '<img src=x onerror=alert(1)> and <b>bold</b>',
    headingLevel: 2,
    expected: '<p>&lt;img src=x onerror=alert(1)&gt; and &lt;b&gt;bold&lt;/b&gt;</p>',
  },
  {
    name: 'block raw HTML as text',
    source: '<div onclick="alert(1)">hi</div>',
    headingLevel: 2,
    expected: '&lt;div onclick="alert(1)"&gt;hi&lt;/div&gt;',
  },

  // Links and images
  {
    name: 'a javascript: link as its text',
    source: '[Open](javascript:alert(1))',
    headingLevel: 2,
    expected: '<p>Open</p>',
  },
  {
    name: 'a javascript: link hidden by a tab, as its text',
    source: '[Open](java&#9;script:alert(1))',
    headingLevel: 2,
    expected: '<p>Open</p>',
  },
  {
    name: 'an autolinked javascript: as its text',
    source: '<javascript:alert(1)>',
    headingLevel: 2,
    expected: '<p>javascript:alert(1)</p>',
  },
  {
    name: 'a relative link as its text',
    source: '[Docs](/docs) and [part](#part)',
    headingLevel: 2,
    expected: '<p>Docs and part</p>',
  },
  {
    name: 'an https: link kept, with nothing added',
    source: '[Terms](https://example.com/terms "The terms")',
    headingLevel: 2,
    expected: '<p><a href="https://example.com/terms">Terms</a></p>',
  },
  {
    name: 'an email autolink kept as mailto:',
    source: '<owner@example.com>',
    headingLevel: 2,
    expected: '<p><a href="mailto:owner@example.com">owner@example.com</a></p>',
  },
  {
    name: 'an image as its alt text',
    source: '![A cabin](https://example.com/cabin.png)',
    headingLevel: 2,
    expected: '<p>A cabin</p>',
  },

  // Text
  {
    name: 'an entity decoded outside a code span and kept inside one',
    source: '`&amp;` and &amp;',
    headingLevel: 2,
    expected: '<p><code>&amp;amp;</code> and &amp;</p>',
  },
  { name: 'an empty source', source: '', headingLevel: 2, expected: '' },
]

function parse(html: string): Element {
  const template = document.createElement('template')
  template.innerHTML = `<div class="zl-prose">${html}</div>`
  return template.content.firstElementChild as Element
}

for (const { name, source, headingLevel, expected } of CASES) {
  test(`${name}, from headingLevel ${headingLevel}`, () => {
    const { container } = render(<Markdown source={source} headingLevel={headingLevel} />)
    const root = container.firstElementChild as Element
    // React writes each text run as its own node; how text is split is not markup.
    root.normalize()

    expect(canonical(root)).toBe(canonical(parse(expected)))
  })
}

test('an image makes no request', () => {
  render(<Markdown source="![A cabin](https://example.com/cabin.png)" headingLevel={2} />)

  expect(document.querySelector('img, link[rel="preload"]')).toBeNull()
})

test("the root takes the div's props, and its class after core's", () => {
  const { container } = render(
    <Markdown source="Hi" headingLevel={2} id="plan" className="board__plan" />,
  )

  expect(container.firstElementChild?.outerHTML).toBe(
    '<div id="plan" class="zl-prose board__plan"><p>Hi</p></div>',
  )
})
