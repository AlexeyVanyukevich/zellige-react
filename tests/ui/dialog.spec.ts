import { expect, test } from '@playwright/test'
import { DIALOGS, dialogNamed, frameHasFocus, openDialog } from './dialogs'
import { openPlayground } from './playground'

const [booking] = DIALOGS
if (!booking) throw new Error('The playground needs a dialog')

test.beforeEach(async ({ page }) => {
  await openPlayground(page)
})

test('Escape calls onClose, and the dialog closes', async ({ page }) => {
  const dialog = await openDialog(page, booking)

  await page.keyboard.press('Escape')

  await expect(dialog).toBeHidden()
})

test('a close by the browser, not by the binding, reaches the state: the opener opens it again', async ({
  page,
}) => {
  const dialog = await openDialog(page, booking)

  // What Chrome does after repeated Escape presses with no user activation between them.
  await dialog.evaluate((element: HTMLDialogElement) => element.close())
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: booking.opener }).click()
  await expect(dialog).toBeVisible()
})

test('a press that begins and ends on the backdrop closes the dialog', async ({ page }) => {
  const dialog = await openDialog(page, booking)

  // The top-left corner is backdrop: the centred dialog is narrower and shorter than the page.
  await page.mouse.click(4, 4)

  await expect(dialog).toBeHidden()
})

test('a press that begins inside and is released on the backdrop does not close it', async ({
  page,
}) => {
  const dialog = await openDialog(page, booking)
  const title = dialog.getByRole('heading', { name: booking.title })
  const box = await title.boundingBox()
  if (!box) throw new Error('The title has no box')

  await page.mouse.move(box.x + 4, box.y + 4)
  await page.mouse.down()
  await page.mouse.move(4, 4)
  await page.mouse.up()

  await expect(dialog).toBeVisible()
})

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true })

  test('the tap that opens the dialog does not close it', async ({ page }) => {
    await page.getByRole('button', { name: booking.opener }).tap()
    const dialog = dialogNamed(page, booking.title)

    await expect(dialog).toBeVisible()
    // Long enough for a click aimed after the dialog appeared to have landed.
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => setTimeout(done))))
    await expect(dialog).toBeVisible()
  })
})

for (const example of DIALOGS) {
  test(`by keyboard, ${example.title}: focus starts on the frame, follows the written order, and returns to the opener`, async ({
    page,
  }) => {
    const opener = page.getByRole('button', { name: example.opener })
    await opener.focus()
    await page.keyboard.press('Enter')
    const dialog = dialogNamed(page, example.title)
    await expect(dialog).toBeVisible()

    expect(await frameHasFocus(dialog)).toBe(true)
    for (const { role, name } of example.tabOrder) {
      await page.keyboard.press('Tab')
      await expect(dialog.getByRole(role, { name })).toBeFocused()
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
  })
}

test('by keyboard, Save in the foot submits the form in the body, and focus returns', async ({
  page,
}) => {
  const opener = page.getByRole('button', { name: booking.opener })
  await opener.focus()
  await page.keyboard.press('Enter')
  const dialog = dialogNamed(page, booking.title)

  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Ada Lovelace')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Save' })).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
})
