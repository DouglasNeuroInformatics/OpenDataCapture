import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { expect, test } from '../support/fixtures';

const INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('gateway remote assignment', () => {
  // Spans two origins and waits on the Cap proof-of-work, so it needs more than the default budget.
  test.describe.configure({ timeout: 180_000 });

  test('should let a patient complete an assignment and report it back to the clinician', async ({
    context,
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Gateway${uniqueId}`, `Patient${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Create Remote Assignment');
    await dialog.getByRole('button', { name: 'Submit' }).click();

    // The dialog swaps in place to reveal the gateway link (a different origin than the web app).
    const linkInput = page.locator('input[readonly]');
    await expect(linkInput).toBeVisible();
    const assignmentUrl = await linkInput.inputValue();
    expect(assignmentUrl).toMatch(/^https?:\/\/.+\/assignments\/.+/);

    // Dismiss the dialog: its overlay covers the sidebar and would swallow later nav clicks.
    await dialog.getByRole('button', { name: 'Close' }).first().click();
    await expect(dialog).toBeHidden();

    // The patient receives the link out of band, so drive it from a separate page.
    const gatewayPage = await context.newPage();
    await gatewayPage.goto(assignmentUrl);

    // The gateway gates submission behind a Cap proof-of-work widget (a custom element, which
    // Playwright reaches through its open shadow root). Solving it is what enables "Begin".
    const capWidget = gatewayPage.locator('cap-widget');
    await capWidget.waitFor({ state: 'visible' });
    await capWidget.click();

    const gatewayInstrument = new RenderInstrumentPage(gatewayPage);
    await expect(gatewayInstrument.beginButton).toBeEnabled({ timeout: 120_000 });
    await gatewayInstrument.begin();
    await gatewayInstrument.completeHappinessQuestionnaire();
    await gatewayInstrument.submit();
    await expect(gatewayInstrument.summaryHeading).toBeVisible();
    await gatewayPage.close();

    // Back on the clinician side the assignment should now read as complete.
    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');
    await page.getByRole('link', { name: 'Assignments' }).click();
    await page.waitForURL('**/datahub/**/assignments');

    // The completion posts back from the gateway asynchronously (it can still read "Outstanding"
    // for a while on a slow runner), and assertion retries re-query the locator rather than
    // refetching -- so retry the reload itself until the status settles. Reloading is safe here:
    // the page is addressed by subject id, not the (now irrelevant) in-memory session.
    await expect(async () => {
      await page.reload();
      await expect(page.getByRole('table')).toContainText('Complete', { timeout: 5_000 });
    }).toPass({ timeout: 90_000 });
  });
});
