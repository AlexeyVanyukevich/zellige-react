import { expect, test } from '@playwright/test'
import { openPlayground } from './playground'

test('by keyboard, a failed load is retried and focus waits on the region heading', async ({
  page,
}) => {
  await openPlayground(page)
  const load = page.getByRole('button', { name: 'Load the issues' })

  await load.focus()
  await page.keyboard.press('Enter')

  await expect(
    page.getByRole('alert').filter({ hasText: "Couldn't load the issues" }),
  ).toBeVisible()
  await expect(load).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Retry' })).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('heading', { name: 'Issues', level: 3 })).toBeFocused()
  await expect(page.getByRole('alert').filter({ hasText: "Couldn't load the issues" })).toHaveCount(
    0,
  )
  await expect(page.getByText('No open issues')).toHaveCount(2)
})
