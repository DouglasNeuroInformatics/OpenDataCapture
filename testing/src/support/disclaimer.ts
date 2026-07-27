import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * A brand-new browser context authenticated through the real login form (rather than
 * `getPageModel`, which pre-seeds `appState` via `page.addInitScript`) leaves `isDisclaimerAccepted`
 * at its in-code default of `false`, so the dialog covers the dashboard on first login. Clear it
 * before driving anything else on the page. A snap `isVisible()` right after login can miss the
 * dialog if it hasn't mounted yet, so this gives it a short window to appear rather than racing it.
 */
export async function acceptDisclaimerIfPresent(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Disclaimer' });
  const appeared = await dialog
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  if (appeared) {
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(dialog).not.toBeVisible();
  }
}
