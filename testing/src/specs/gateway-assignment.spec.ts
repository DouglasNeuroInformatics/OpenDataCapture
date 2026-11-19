import type { $CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { BrowserContext } from '@playwright/test';

import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { gatewayRefreshInterval } from '../support/env';
import { expect, test } from '../support/fixtures';

import type { ApiClient } from '../support/api-client';

/** Administers the Happiness Questionnaire twice, so one assignment produces two records. */
const SERIES_INSTRUMENT_TITLE = 'Happiness Questionnaire (Repeated)';

/**
 * How long the API's gateway synchronizer may take to sweep a completed assignment across. It runs
 * every `gatewayRefreshInterval`, but a pass is slow locally under fullyParallel.
 */
const SYNC_TIMEOUT = 15 * gatewayRefreshInterval;

/** Seeds a new group with one subject and an outstanding assignment for it, over the API. */
async function seedAssignment(api: ApiClient, data: Pick<$CreateAssignmentData, 'instrumentId' | 'redirectUrl'>) {
  const group = await api.createGroup();
  return api.createAssignment({
    expiresAt: new Date(Date.now() + 86_400_000),
    groupId: group.id,
    subjectId: await api.createSubject(group.id),
    ...data
  });
}

/**
 * Opens the link the patient was sent in a page of its own, as they would receive it out of band,
 * and solves the Cap proof-of-work that gates submission (a custom element, which Playwright
 * reaches through its open shadow root).
 */
async function openVerifiedAssignment(context: BrowserContext, url: string) {
  const gatewayPage = await context.newPage();
  await gatewayPage.goto(url);
  const capWidget = gatewayPage.locator('cap-widget');
  await capWidget.waitFor({ state: 'visible' });
  const gatewayInstrument = new RenderInstrumentPage(gatewayPage);
  await expect(gatewayInstrument.beginButton).toBeDisabled();
  await expect(gatewayPage.getByRole('button', { name: "Click to verify you're a human" })).toBeVisible();
  await capWidget.click();
  await expect(gatewayInstrument.beginButton).toBeEnabled({ timeout: 120_000 });
  return { gatewayInstrument, gatewayPage };
}

// Each spans two origins and waits on the Cap proof-of-work, so it needs more than the default budget.
test.describe.configure({ timeout: 180_000 });

test.describe('gateway remote assignment', () => {
  test.use({ actingRole: 'ADMIN' });

  test('should let a patient complete an assignment and report it back to the clinician', async ({
    api,
    context,
    getPageModel
  }) => {
    const assignment = await seedAssignment(api, {
      instrumentId: await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE')
    });
    const { gatewayInstrument, gatewayPage } = await openVerifiedAssignment(context, assignment.url);
    await gatewayInstrument.begin();

    // Submitting empty first, before answering, so the one expensive Cap proof-of-work above covers
    // this too. The gateway registers the shared zod error maps in `entry-client.tsx`; without that
    // a patient sees zod's untranslated default here regardless of the language they chose.
    await gatewayInstrument.submit();
    await expect(gatewayInstrument.errorMessages.first()).toBeVisible();
    for (const message of await gatewayInstrument.errorMessages.allTextContents()) {
      expect(message).toBe('This field is required');
    }
    await expect(gatewayInstrument.errorSummary).toBeVisible();

    await gatewayInstrument.completeHappinessQuestionnaire();
    await gatewayInstrument.submit();
    await expect(gatewayInstrument.summaryHeading).toBeVisible();
    await expect(gatewayInstrument.errorSummary).toHaveCount(0);
    // Created without a redirect URL, so the subject is left on the completion screen.
    await expect(gatewayPage.getByTestId('completion-redirect')).toHaveCount(0);
    await gatewayPage.close();

    // The completion reaches the API on the synchronizer's next pass, not with the submission.
    const findStatus = async () => {
      const assignments = await api.findAssignments(assignment.subjectId);
      return assignments.find(({ id }) => id === assignment.id)?.status;
    };
    await expect.poll(findStatus, { timeout: SYNC_TIMEOUT }).toBe('COMPLETE');

    const assignmentsPage = await getPageModel('/datahub/subjects/$subjectId/assignments', {
      subjectId: assignment.subjectId
    });
    await expect(assignmentsPage.assignmentRows).toHaveCount(1);
    await expect(assignmentsPage.assignmentRows).toContainText('Complete');
  });
});

test.describe('gateway assignment records', () => {
  test('should link every record of a remote series to its assignment, record its completion, and send the subject on to its redirect URL', async ({
    api,
    context,
    uniqueId
  }) => {
    const redirectUrl = `https://redirect.example.test/done/${uniqueId}`;
    const assignment = await seedAssignment(api, {
      instrumentId: await api.findInstrumentIdByTitle(SERIES_INSTRUMENT_TITLE),
      redirectUrl
    });

    const { gatewayInstrument, gatewayPage } = await openVerifiedAssignment(context, assignment.url);
    // The site the subject is sent back to is not part of the stack, so answer for it here.
    await gatewayPage.route('https://redirect.example.test/**', (route) => {
      return route.fulfill({ body: '<h1>Study portal</h1>', contentType: 'text/html' });
    });
    await gatewayInstrument.begin();
    await gatewayInstrument.completeHappinessQuestionnaire();
    await gatewayInstrument.submit();
    // Waits out the first item, whose answers would otherwise take the second item's keystrokes.
    await expect(gatewayInstrument.happinessSatisfiedRadio).not.toBeChecked();
    await gatewayInstrument.completeHappinessQuestionnaire();
    await gatewayInstrument.submit();
    await expect(gatewayInstrument.seriesCompletionHeading).toBeVisible();

    // The completion screen offers the redirect, so the subject sees it before leaving. Following
    // the link rather than waiting out the countdown; CompletionRedirect.test.tsx owns the timer.
    // The submission toast sits over the link until it fades, so follow it from the keyboard.
    await gatewayPage.getByTestId('completion-redirect-link').press('Enter');
    await gatewayPage.waitForURL(redirectUrl);
    await expect(gatewayPage.getByRole('heading', { name: 'Study portal' })).toBeVisible();
    await gatewayPage.close();

    // The status and completion date are written after the records, in the same synchronizer pass.
    const findSyncedState = async () => {
      const [records, assignments] = await Promise.all([
        api.findRecordsBySubject(assignment.subjectId),
        api.findAssignments(assignment.subjectId)
      ]);
      return {
        completedAt: assignments.find(({ id }) => id === assignment.id)?.completedAt,
        linkedRecordCount: records.filter(({ assignmentId }) => assignmentId === assignment.id).length
      };
    };
    await expect
      .poll(findSyncedState, { timeout: SYNC_TIMEOUT })
      .toEqual({ completedAt: expect.any(String), linkedRecordCount: 2 });
  });
});
