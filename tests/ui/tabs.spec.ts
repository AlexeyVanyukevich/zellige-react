import { expect, test, type Page } from '@playwright/test'
import { openPlayground } from './playground'

function tab(page: Page, list: string, name: string) {
  return page.getByRole('tablist', { name: list, exact: true }).getByRole('tab', { name })
}

interface KeyCase {
  list: 'Card' | 'Card, right to left'
  key: 'ArrowRight' | 'ArrowLeft' | 'Home' | 'End'
  from: string
  to: string
}

// React Aria's keyboard model, read through the binding's wiring: arrows follow the text
// direction and wrap at both ends; Home and End go to the first and last tab.
const KEYS: readonly KeyCase[] = [
  { list: 'Card', key: 'ArrowRight', from: 'Spec', to: 'Plan' },
  { list: 'Card', key: 'ArrowRight', from: 'Review', to: 'Spec' },
  { list: 'Card', key: 'ArrowLeft', from: 'Plan', to: 'Spec' },
  { list: 'Card', key: 'ArrowLeft', from: 'Spec', to: 'Review' },
  { list: 'Card', key: 'Home', from: 'Review', to: 'Spec' },
  { list: 'Card', key: 'End', from: 'Spec', to: 'Review' },
  { list: 'Card, right to left', key: 'ArrowLeft', from: 'Spec', to: 'Plan' },
  { list: 'Card, right to left', key: 'ArrowLeft', from: 'Review', to: 'Spec' },
  { list: 'Card, right to left', key: 'ArrowRight', from: 'Plan', to: 'Spec' },
  { list: 'Card, right to left', key: 'ArrowRight', from: 'Spec', to: 'Review' },
  { list: 'Card, right to left', key: 'Home', from: 'Review', to: 'Spec' },
  { list: 'Card, right to left', key: 'End', from: 'Spec', to: 'Review' },
]

test.beforeEach(async ({ page }) => {
  await openPlayground(page)
})

for (const { list, key, from, to } of KEYS) {
  test(`${list}: ${key} from ${from} focuses and selects ${to}`, async ({ page }) => {
    // The starting tab is selected with the mouse: only a selected tab takes focus from Tab.
    await tab(page, list, from).click()
    await expect(tab(page, list, from)).toBeFocused()
    await expect(tab(page, list, from)).toHaveAttribute('aria-selected', 'true')

    await page.keyboard.press(key)

    await expect(tab(page, list, to)).toBeFocused()
    await expect(tab(page, list, to)).toHaveAttribute('aria-selected', 'true')
  })
}

test('the list is one tab stop, the selected tab', async ({ page }) => {
  const tabs = page.getByRole('tablist', { name: 'Card', exact: true }).getByRole('tab')
  await tab(page, 'Card', 'Plan').click()

  await expect(tabs).toHaveCount(3)
  const stops = await tabs.evaluateAll((elements) => elements.map((element) => element.tabIndex))
  expect(stops).toEqual([-1, 0, -1])
})

test('by keyboard: into a panel with a control, across the tabs, and into a text panel', async ({
  page,
}) => {
  const guest = tab(page, 'Booking', 'Guest')
  await guest.focus()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('textbox', { name: 'Full name' })).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(guest).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(tab(page, 'Booking', 'Payment')).toBeFocused()
  const panel = page.getByRole('tabpanel', { name: 'Payment' })
  await expect(panel).toHaveText('Paid by card.')

  await page.keyboard.press('Tab')
  await expect(panel).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(tab(page, 'Booking', 'Payment')).toBeFocused()
})
