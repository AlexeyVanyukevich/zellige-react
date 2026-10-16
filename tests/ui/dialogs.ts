import { expect, type Locator, type Page } from '@playwright/test'

export interface DialogExample {
  opener: string
  title: string
  /** What Tab reaches after the frame, in order: the close button, the body, the foot. */
  tabOrder: readonly { role: 'button' | 'textbox' | 'combobox'; name: string }[]
}

// One row per playground dialog, one per contract example.
export const DIALOGS: readonly DialogExample[] = [
  {
    opener: 'New booking',
    title: 'New booking',
    tabOrder: [
      { role: 'button', name: 'Close' },
      { role: 'textbox', name: 'Guest' },
      { role: 'button', name: 'Cancel' },
      { role: 'button', name: 'Save' },
    ],
  },
  {
    opener: 'Edit the card',
    title: 'Card',
    tabOrder: [
      { role: 'button', name: 'Close' },
      { role: 'textbox', name: 'Title' },
      { role: 'combobox', name: 'Status' },
      { role: 'textbox', name: 'Notes' },
      { role: 'button', name: 'Cancel' },
      { role: 'button', name: 'Save' },
    ],
  },
  {
    opener: 'Keyboard shortcuts',
    title: 'Keyboard shortcuts',
    tabOrder: [{ role: 'button', name: 'Close' }],
  },
]

export function dialogNamed(page: Page, title: string): Locator {
  return page.getByRole('dialog', { name: title })
}

/** Opens a dialog with the mouse and waits until it is shown. */
export async function openDialog(page: Page, example: DialogExample): Promise<Locator> {
  await page.getByRole('button', { name: example.opener }).click()
  const dialog = dialogNamed(page, example.title)
  await expect(dialog).toBeVisible()
  return dialog
}

/** Whether focus is on the dialog's frame, its only child element. */
export function frameHasFocus(dialog: Locator): Promise<boolean> {
  return dialog.evaluate((element) => document.activeElement === element.firstElementChild)
}
