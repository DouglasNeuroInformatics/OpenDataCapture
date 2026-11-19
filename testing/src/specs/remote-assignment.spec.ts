import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';

import { SubjectAssignmentsPage } from '../pages/_app/datahub/subjects/$subjectId/assignments.page';
import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { baseURL } from '../support/env';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

/** A session lives only in the client's memory, so a page that needs one starts it through the form. */
async function startSession(getPageModel: GetPageModel, firstName: string, lastName: string, sex: string) {
  const startSessionPage = await getPageModel('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(firstName, lastName, sex);
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();
}

test.describe('remote assignment', () => {
  test('should display the remote assignment page after starting a session', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await startSession(getPageModel, `Remote${uniqueId}`, `Subject${uniqueId}`, 'Male');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await expect(remoteAssignmentPage.pageHeader).toContainText('Remote Assignment');
    await expect(remoteAssignmentPage.instrumentShowcase).toBeVisible();
  });

  // `api.createGroup` grants every instrument, the file instrument included, so the refusal comes
  // from the file rule rather than the group's opt-in list. The series is assigned without a group
  // for the same reason.
  test('should refuse to assign a file instrument, or a series with a file item, remotely, and create nothing', async ({
    adminToken,
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const headers = { Authorization: `Bearer ${adminToken}` };
    const group = await api.createGroup();
    const subjectId = await api.createSubject(group.id);
    const instruments = (await (await apiRequestContext.get('/api/v1/instruments/info', { headers })).json()) as {
      id: string;
      internal?: { edition: number; name: string };
      kind: string;
    }[];
    const fileInstrument = instruments.find((instrument) => instrument.kind === 'FILE')!;
    const series = await apiRequestContext.post('/api/v1/instruments/series', {
      data: {
        confirmDuplicate: true,
        details: { title: `File Series ${uniqueId}` },
        groupId: group.id,
        items: ['FORM', 'FILE'].map((kind) => instruments.find((instrument) => instrument.kind === kind)!.internal),
        language: 'en'
      },
      headers
    });
    expect(series.status(), await series.text()).toBe(201);
    const { instrumentId: seriesId } = (await series.json()) as { instrumentId: string };

    for (const [instrumentId, groupId] of [
      [fileInstrument.id, group.id],
      [seriesId, undefined]
    ] as const) {
      const response = await apiRequestContext.post('/api/v1/assignments', {
        data: { expiresAt: new Date(Date.now() + 86_400_000), groupId, instrumentId, subjectId },
        headers
      });
      expect(response.status()).toBe(422);
      expect(((await response.json()) as BulkAssignmentFailure).issues).toContainEqual({
        instrumentIds: [instrumentId],
        kind: 'INSTRUMENT_UNAVAILABLE'
      });
    }
    expect(await api.findAssignments(subjectId)).toHaveLength(0);
  });

  test('should create a remote assignment shown as a link to copy and scan, and another in the same session', async ({
    context,
    getPageModel,
    page,
    uniqueId
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await startSession(getPageModel, `Assign${uniqueId}`, `User${uniqueId}`, 'Female');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await remoteAssignmentPage.selectInstrument('Happiness Questionnaire');
    await expect(remoteAssignmentPage.createDialog).toContainText('Create Remote Assignment');
    await remoteAssignmentPage.submitAssignmentForm();

    await expect(page.getByRole('link', { name: 'Assignment Link' })).toBeVisible();
    await expect(remoteAssignmentPage.qrCode).toBeVisible();
    const firstUrl = await remoteAssignmentPage.urlInput.inputValue();
    expect(firstUrl).toMatch(/^https?:\/\/.+\/assignments\/.+/);
    await remoteAssignmentPage.copyLinkButton.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(firstUrl);
    await remoteAssignmentPage.closeResultButton.click();

    await remoteAssignmentPage.selectInstrument('General Consent Form');
    await remoteAssignmentPage.submitAssignmentForm();
    await expect(remoteAssignmentPage.urlInput).toBeVisible();
    await expect(remoteAssignmentPage.urlInput).not.toHaveValue(firstUrl);
  });

  test('should create a link that opens the gateway in the language chosen for the assignment', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await startSession(getPageModel, `Language${uniqueId}`, `User${uniqueId}`, 'Female');

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await remoteAssignmentPage.selectInstrument('Happiness Questionnaire');
    await remoteAssignmentPage.chooseLanguage('French');
    await remoteAssignmentPage.submitAssignmentForm();

    await expect(remoteAssignmentPage.urlInput).toHaveValue(/\/assignments\/[^?]+\?lang=fr$/);
  });

  // Entering by URL is the path a bookmarked link takes, and it runs the GATEWAY_ENABLED guard in
  // `beforeLoad` on a cold document load rather than on a client-side transition from the tab.
  // `goto` asserts it landed on the URL it asked for, so a guard that wrongly bounced the request
  // to the table tab fails here.
  test("should let a group manager deep-link to a subject's assignments tab and cancel an outstanding assignment", async ({
    api,
    isolatedGroupManager,
    page
  }) => {
    const group = await isolatedGroupManager();
    const subjectId = await api.createSubject(group.id);
    await api.createAssignment({
      expiresAt: new Date(Date.now() + 86_400_000),
      groupId: group.id,
      instrumentId: await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE'),
      subjectId
    });

    const assignmentsPage = new SubjectAssignmentsPage(page);
    await assignmentsPage.goto('/datahub/subjects/$subjectId/assignments', { subjectId });
    await expect(assignmentsPage.assignmentRows).toHaveCount(1);
    await assignmentsPage.assignmentRows.click();
    await assignmentsPage.cancelButton.click();

    await expect(assignmentsPage.assignmentRows).toContainText('Canceled');
    expect(await api.findAssignments(subjectId)).toMatchObject([{ status: 'CANCELED' }]);
  });
});
