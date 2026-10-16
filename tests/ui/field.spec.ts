import { expect, test } from '@playwright/test'
import { openPlayground } from './playground'

test('by keyboard, a failed submit focuses the invalid field and a good one clears it', async ({
  page,
}) => {
  await openPlayground(page)
  const name = page.getByRole('textbox', { name: 'Name' })
  const submit = page.getByRole('button', { name: 'Add the guest' })
  const toSubmit = async () => {
    await page.keyboard.press('Tab')
    await expect(page.getByRole('combobox', { name: 'House' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Note' })).toBeFocused()
    // Arrival is disabled, so Tab passes it.
    await page.keyboard.press('Tab')
    await expect(submit).toBeFocused()
  }

  await name.focus()
  await toSubmit()
  await page.keyboard.press('Enter')

  await expect(name).toBeFocused()
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toHaveAccessibleDescription('As on the passport Enter a name')

  await page.keyboard.type('Ada Lovelace')
  await toSubmit()
  await page.keyboard.press('Enter')

  await expect(submit).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'Ada Lovelace is added' })).toBeVisible()
  await expect(name).not.toHaveAttribute('aria-invalid')
  await expect(name).toHaveAccessibleDescription('As on the passport')
})
