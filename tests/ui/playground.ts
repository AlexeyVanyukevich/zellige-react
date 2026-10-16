import { expect, type Page } from '@playwright/test'
import type { Scheme } from '../../playground/schemes'

export async function openPlayground(page: Page, scheme: Scheme = 'light') {
  await page.goto(`/?scheme=${scheme}`)
  // React renders after the page loads; the heading is there once it has.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}
