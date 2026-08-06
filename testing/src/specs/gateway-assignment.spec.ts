import type { Page } from '@playwright/test';

import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { ApiClient } from '../support/api-client';
import { gatewayApiKey } from '../support/env';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

const INSTRUMENT_TITLE = 'Happiness Questionnaire';

/**
 * Starts a session and creates a remote assignment for the Happiness Questionnaire, returning the
 * gateway link. Shared by every test in this file that needs a real link to drive the gateway
 * origin against, so the expensive part (the Cap proof-of-work) is only ever solved where a test
 * actually needs a verified assignment.
 */
async function createRemoteAssignmentLink(getPageModel: GetPageModel, page: Page, uniqueId: string): Promise<string> {
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

  return assignmentUrl;
}

test.describe('gateway remote assignment', () => {
  // Spans two origins and waits on the Cap proof-of-work, so it needs more than the default budget.
  test.describe.configure({ timeout: 180_000 });

  test('should let a patient complete an assignment and report it back to the clinician @smoke', async ({
    context,
    getPageModel,
    page,
    uniqueId
  }) => {
    const assignmentUrl = await createRemoteAssignmentLink(getPageModel, page, uniqueId);

    // The patient receives the link out of band, so drive it from a separate page.
    const gatewayPage = await context.newPage();
    await gatewayPage.goto(assignmentUrl);

    // The gateway gates submission behind a Cap proof-of-work widget (a custom element, which
    // Playwright reaches through its open shadow root). Solving it is what enables "Begin".
    const capWidget = gatewayPage.locator('cap-widget');
    await capWidget.waitFor({ state: 'visible' });
    await expect(gatewayPage.getByRole('button', { name: 'Begin' })).toBeDisabled();
    await expect(gatewayPage.getByRole('button', { name: "Click to verify you're a human" })).toBeVisible();
    await capWidget.click();

    const gatewayInstrument = new RenderInstrumentPage(gatewayPage);
    await expect(gatewayInstrument.beginButton).toBeEnabled({ timeout: 120_000 });
    await gatewayInstrument.begin();
    await gatewayInstrument.completeHappinessQuestionnaire();
    await gatewayInstrument.submit();
    await expect(gatewayInstrument.summaryHeading).toBeVisible();

    // Revisiting the same link after completion must not serve the instrument again. Reuses this
    // now-completed assignment rather than soloing a second, expensive Cap proof-of-work just to
    // exercise this branch.
    //
    // Which refusal arrives is a race with the API's gateway synchronizer, which runs every
    // GATEWAY_REFRESH_INTERVAL (10s): until it sweeps the completed assignment across into a real
    // record the gateway still holds it and answers 409, and once it has, the record is deleted
    // from the gateway by design and the link is a 404. Asserting 409 alone made this test fail
    // whenever a sync tick landed in the window, so both terminal answers are accepted and the
    // invariant that actually matters — the instrument is not re-served — is asserted directly.
    const revisitResponse = await gatewayPage.goto(assignmentUrl);
    const revisitStatus = revisitResponse?.status();
    expect([404, 409]).toContain(revisitStatus);
    await expect(gatewayPage.getByRole('button', { name: 'Begin' })).toBeHidden();
    if (revisitStatus === 409) {
      await expect(gatewayPage.getByText('Assignment already completed')).toBeVisible();
    }

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

// An admin holds no groups, so the create dialog sends no `groupId` and the assignment is created
// unscoped. Every other test here acts as a GROUP_MANAGER, whose assignment always carries one, so
// this is the only cover for the unscoped path reaching the gateway and back.
test.describe('gateway remote assignment without a group', () => {
  test.use({ actingRole: 'ADMIN' });
  test.describe.configure({ timeout: 180_000 });

  test('should let an admin with no groups create a remote assignment', async ({ getPageModel, page, uniqueId }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Ungrouped${uniqueId}`, `Patient${uniqueId}`, 'Female');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
    await expect(card).toBeVisible();
    await card.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Create Remote Assignment');

    // Asserting the status directly is what distinguishes "the gateway accepted this" from a 500 the
    // UI would surface identically to any other failure.
    const created = page.waitForResponse(
      (response) => response.url().includes('/v1/assignments') && response.request().method() === 'POST'
    );
    await dialog.getByRole('button', { name: 'Submit' }).click();
    expect((await created).status()).toBe(201);

    const linkInput = page.locator('input[readonly]');
    await expect(linkInput).toBeVisible();
    expect(await linkInput.inputValue()).toMatch(/^https?:\/\/.+\/assignments\/.+/);
  });
});

test.describe('gateway assignment errors', () => {
  test('should respond with 404 when the assignment id in the link does not exist', async ({
    context,
    getPageModel,
    page,
    uniqueId
  }) => {
    const assignmentUrl = await createRemoteAssignmentLink(getPageModel, page, uniqueId);
    const invalidUrl = assignmentUrl.replace(/[^/]+$/, `nonexistent-${uniqueId}`);

    const gatewayPage = await context.newPage();
    const response = await gatewayPage.goto(invalidUrl);
    expect(response?.status()).toBe(404);

    await gatewayPage.close();
  });

  // The languages an assignment offers are stored on the gateway's own database and read back
  // server-side, so `?lang=` must be honoured in the SSR'd HTML rather than swapped in after
  // hydration. Asserting against the raw response body is what distinguishes the two.
  test('should render the assignment server-side in a requested active language', async ({
    context,
    getPageModel,
    page,
    uniqueId
  }) => {
    const assignmentUrl = await createRemoteAssignmentLink(getPageModel, page, uniqueId);

    // The stepper is the only translated copy in the first paint — everything below it waits on the
    // instrument bundle, which loads client-side.
    const gatewayPage = await context.newPage();
    const french = await gatewayPage.goto(`${assignmentUrl}?lang=fr`);
    expect(await french!.text()).toContain('Aperçu');

    // A language the instance does not offer falls back to the first active one rather than
    // rendering the blank strings an unresolvable language would produce.
    const unknown = await gatewayPage.goto(`${assignmentUrl}?lang=klingon`);
    expect(await unknown!.text()).toContain('Overview');

    await gatewayPage.close();
  });

  // Every other test here drives a gateway that accepts, so the branch taken when it refuses had no
  // cover at all — and that branch is the whole feature: without it the clinician gets a 500 naming
  // neither the gateway nor what it said. Cancelling deletes the remote assignment, so cancelling
  // the same one twice is the one way to make the real gateway refuse a real request without
  // sabotaging the server every other worker shares.
  test('should report what the gateway answered when it no longer holds the assignment', async ({
    apiRequestContext,
    getPageModel,
    page,
    roleAccount,
    uniqueId
  }) => {
    const assignmentUrl = await createRemoteAssignmentLink(getPageModel, page, uniqueId);
    const assignmentId = assignmentUrl.split('/').pop()!;
    const { accessToken } = await roleAccount('GROUP_MANAGER');
    const cancel = () =>
      apiRequestContext.patch(`/api/v1/assignments/${assignmentId}`, {
        data: { status: 'CANCELED' },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

    expect((await cancel()).status()).toBe(200);

    const response = await cancel();
    expect(response.status()).toBe(502);
    const body = (await response.json()) as { message: string };
    expect(body.message).toMatch(/gateway/i);
    expect(body.message).toContain('404');
  });

  // The clinician-facing half of the same fix, and the only case where a real gateway refusal
  // reaches a real user. It must read as the error it is: 502 is a status the axios layer otherwise
  // treats as a network blip, and the "Connection Problem" screen it would show offers a retry that
  // can never succeed.
  test('should show the clinician the gateway’s refusal rather than a connection problem', async ({
    apiRequestContext,
    getPageModel,
    page,
    uniqueId
  }) => {
    const assignmentUrl = await createRemoteAssignmentLink(getPageModel, page, uniqueId);
    const assignmentId = assignmentUrl.split('/').pop()!;

    // Drop the record on the gateway directly, which leaves this instance's assignment OUTSTANDING —
    // the only status whose Cancel button is enabled, and so the only way a click reaches this path.
    const forgotten = await apiRequestContext.delete(
      `${new URL(assignmentUrl).origin}/api/assignments/${assignmentId}`,
      { headers: { Authorization: `Bearer ${gatewayApiKey}` } }
    );
    expect(forgotten.status()).toBe(200);

    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');
    await page.getByRole('link', { name: 'Assignments' }).click();
    await page.waitForURL('**/datahub/**/assignments');
    await page.getByTestId('assignment-row').first().click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('heading', { name: '502 - Bad Gateway' })).toBeVisible();
    await expect(page.getByText('Connection Problem')).toBeHidden();
  });

  // `POST /v1/assignments/:id/email` mails a live assignment credential to a caller-supplied
  // address, and its guard (`update Assignment`) is group-scoped rather than admin-only — so the
  // control that matters is row scoping, which no blanket-403 table can assert.
  test('should not let a manager outside the group email an assignment link', async ({
    api,
    apiRequestContext,
    getPageModel,
    page,
    uniqueId
  }) => {
    const assignmentUrl = await createRemoteAssignmentLink(getPageModel, page, uniqueId);
    const assignmentId = assignmentUrl.split('/').pop()!;

    const outsiderGroup = await api.createGroup();
    const { credentials } = await api.createUser({ groupIds: [outsiderGroup.id] });
    const token = await ApiClient.login(apiRequestContext, credentials);

    const response = await apiRequestContext.post(`/api/v1/assignments/${assignmentId}/email`, {
      data: { language: 'en', recipient: 'outsider-target@example.org' },
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([403, 404]).toContain(response.status());
  });
});
