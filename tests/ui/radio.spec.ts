import { expect, test, type Page } from '@playwright/test'
import { openPlayground } from './playground'

type Group = 'Retries' | 'Backoff' | 'Retries, right to left'

function radio(page: Page, group: Group, name: string) {
  return page.getByRole('radiogroup', { name: group, exact: true }).getByRole('radio', { name })
}

interface KeyCase {
  group: 'Retries' | 'Retries, right to left'
  key: 'ArrowDown' | 'ArrowUp' | 'ArrowRight' | 'ArrowLeft'
  from: string
  to: string
}

// React Aria's keyboard model, read through the binding's wiring: Down and Right move to the
// next radio, Up and Left to the previous, wrapping at both ends. React Aria swaps Right and
// Left in a right-to-left locale only for a horizontal group; core's group is vertical, so they
// keep their meaning there too.
const KEYS: readonly KeyCase[] = [
  { group: 'Retries', key: 'ArrowDown', from: 'Three times', to: 'Five times' },
  { group: 'Retries', key: 'ArrowDown', from: 'Ten times', to: 'Three times' },
  { group: 'Retries', key: 'ArrowUp', from: 'Five times', to: 'Three times' },
  { group: 'Retries', key: 'ArrowUp', from: 'Three times', to: 'Ten times' },
  { group: 'Retries', key: 'ArrowRight', from: 'Three times', to: 'Five times' },
  { group: 'Retries', key: 'ArrowLeft', from: 'Five times', to: 'Three times' },
  { group: 'Retries, right to left', key: 'ArrowDown', from: 'Three times', to: 'Five times' },
  { group: 'Retries, right to left', key: 'ArrowUp', from: 'Three times', to: 'Ten times' },
  { group: 'Retries, right to left', key: 'ArrowRight', from: 'Three times', to: 'Five times' },
  { group: 'Retries, right to left', key: 'ArrowLeft', from: 'Five times', to: 'Three times' },
]

test.beforeEach(async ({ page }) => {
  await openPlayground(page)
})

for (const { group, key, from, to } of KEYS) {
  test(`${group}: ${key} from ${from} focuses and checks ${to}`, async ({ page }) => {
    await radio(page, group, from).click()
    await expect(radio(page, group, from)).toBeFocused()
    await expect(radio(page, group, from)).toBeChecked()

    await page.keyboard.press(key)

    await expect(radio(page, group, to)).toBeFocused()
    await expect(radio(page, group, to)).toBeChecked()
  })
}

test('by keyboard: each group is one stop, a failed send focuses the unanswered group, a good one is announced', async ({
  page,
}) => {
  const send = page.getByRole('button', { name: 'Send the answers' })
  const backoff = page.getByRole('radiogroup', { name: 'Backoff', exact: true })

  await radio(page, 'Retries', 'Three times').focus()
  await page.keyboard.press('ArrowDown')
  await expect(radio(page, 'Retries', 'Five times')).toBeChecked()
  await expect(radio(page, 'Retries', 'Five times')).toHaveAccessibleDescription(
    'Slower, but surer How often a failed request is tried again',
  )

  // Out of Retries in one Tab, into Backoff at its first radio, since none is checked.
  await page.keyboard.press('Tab')
  await expect(radio(page, 'Backoff', 'Fixed')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(send).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(radio(page, 'Backoff', 'Fixed')).toBeFocused()
  await expect(backoff).toHaveAttribute('aria-invalid', 'true')
  await expect(radio(page, 'Backoff', 'Fixed')).toHaveAccessibleDescription('Choose a backoff')
  await expect(page.getByRole('radiogroup', { name: 'Retries', exact: true })).not.toHaveAttribute(
    'aria-invalid',
  )

  await page.keyboard.press('ArrowDown')
  await expect(radio(page, 'Backoff', 'Doubling')).toBeChecked()
  await page.keyboard.press('Tab')
  await expect(send).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(send).toBeFocused()
  await expect(page.getByRole('status').filter({ hasText: 'Five times, Doubling' })).toBeVisible()
  await expect(backoff).not.toHaveAttribute('aria-invalid')
})
