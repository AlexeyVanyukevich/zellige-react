import { expect, test } from '@playwright/test'
import { openPlayground } from './playground'

test('by keyboard: the link, then the table, then the code block', async ({ page }) => {
  await openPlayground(page)
  // A click on the heading starts the Tab order there; the heading itself takes no focus.
  await page.getByRole('heading', { name: 'Markdown', level: 2 }).click()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'the booking terms' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('group', { name: 'Table', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('group', { name: 'Code block', exact: true })).toBeFocused()
})

test('at 320 px, Arrow Right scrolls the focused table and not the page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await openPlayground(page)
  const wrapper = page.getByRole('group', { name: 'Table', exact: true })
  await wrapper.focus()

  await page.keyboard.press('ArrowRight')

  await expect.poll(() => wrapper.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  expect(await page.evaluate(() => window.scrollX)).toBe(0)
})
