import { PHONE_VIEWPORT } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('sessions on a phone', () => {
  test.use({ viewport: PHONE_VIEWPORT });

  test('should ask for confirmation before the navigation menu ends the session', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`MobileEnd${uniqueId}`, `Subject${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('navbar-menu-trigger').click();
    await page.getByTestId('nav-button-#').filter({ visible: true }).click();

    const confirmation = page.getByRole('dialog', { name: 'End Session' });
    await expect(confirmation).toBeVisible();
    // the modal sets aria-hidden on the rest of the app, which role selectors skip by default
    await expect(
      page.getByRole('heading', { includeHidden: true, name: 'Session Successfully Started' })
    ).toBeVisible();

    await confirmation.getByRole('button', { name: 'Yes' }).click();
    await expect(startSessionPage.sessionForm).toBeVisible();
  });
});
