import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { SCHEMES } from '../../playground/schemes'
import { openPlayground } from './playground'
import { WCAG_TAGS } from './wcag'

interface State {
  name: string
  /** From the freshly opened playground to the state, by whatever input is quickest. */
  reach: (page: Page) => Promise<void>
}

// Every state a playground flow reaches. A flow's task adds its rows here.
const STATES: readonly State[] = [
  { name: 'the page as it opens', reach: async () => {} },
  {
    name: 'the form after a failed submit',
    reach: async (page) => {
      await page.getByRole('button', { name: 'Add the guest' }).click()
      await expect(page.getByText('Enter a name')).toBeVisible()
    },
  },
  {
    name: 'the failed load',
    reach: async (page) => {
      await page.getByRole('button', { name: 'Load the issues' }).click()
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    },
  },
  {
    name: 'the load after a retry',
    reach: async (page) => {
      await page.getByRole('button', { name: 'Load the issues' }).click()
      await page.getByRole('button', { name: 'Retry' }).click()
      await expect(page.getByText('No open issues')).toHaveCount(2)
    },
  },
]

for (const scheme of SCHEMES) {
  for (const state of STATES) {
    test(`${state.name} meets WCAG 2.2 AA, ${scheme}`, async ({ page }) => {
      await openPlayground(page, scheme)
      await state.reach(page)

      const scan = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
      expect(scan.violations).toEqual([])
    })
  }
}
