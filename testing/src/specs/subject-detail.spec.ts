import type { Page } from '@playwright/test';

import { SubjectAssignmentsPage } from '../pages/_app/datahub/$subjectId/assignments.page';
import { SubjectGraphPage } from '../pages/_app/datahub/$subjectId/graph.page';
import { SubjectRecordDetailPage } from '../pages/_app/datahub/$subjectId/table/$recordId.page';
import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { RemoteAssignmentPage } from '../pages/_app/session/remote-assignment.page';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

// Title shown on the instrument card in the showcase (`details.title`), which differs from the
// title shown while running it (`clientDetails.title`, "Questionnaire on Happiness").
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

/**
 * Starts a session, completes the Happiness Questionnaire for it, and lands on the resulting
 * subject's record table — the precondition every test in this file needs. Mirrors the flow in
 * instrument-completion.spec.ts; factored out here since three tests need it.
 */
async function seedSubjectWithRecord(getPageModel: GetPageModel, page: Page, namePrefix: string): Promise<void> {
  const startSessionPage = await getPageModel('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(`${namePrefix}Instrument`, `${namePrefix}Subject`, 'Female');
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();

  // The active session lives in memory, so every step from here navigates via the sidebar; a
  // hard navigation would drop the session and disable these nav buttons.
  await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
  await page.waitForURL('**/instruments/accessible-instruments');

  const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: INSTRUMENT_TITLE }).first();
  await expect(card).toBeVisible();
  await card.click();

  const instrumentPage = new RenderInstrumentPage(page);
  await instrumentPage.begin();
  await instrumentPage.completeHappinessQuestionnaire();
  await instrumentPage.submit();
  await expect(instrumentPage.summaryHeading).toBeVisible();

  await page.locator('[data-testid^="nav-button-/datahub/"]').click();
  await page.waitForURL('**/datahub/**/table');
}

test.describe('subject detail', () => {
  test('should plot a selected measure on the graph tab for a subject with a completed record @smoke', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await seedSubjectWithRecord(getPageModel, page, `Graph${uniqueId}`);

    await page.getByRole('link', { name: 'Graph' }).click();
    await page.waitForURL('**/graph');

    const graphPage = new SubjectGraphPage(page);
    await graphPage.selectInstrument(INSTRUMENT_TITLE);
    await graphPage.selectMeasure('Overall Satisfaction Score');

    // `.recharts-line-curve` is the path connecting two or more points, which this single-record
    // subject never has; `.recharts-line-dot` renders per point regardless of count.
    await expect(graphPage.chart.locator('.recharts-line-dot')).toBeVisible();
  });

  test('should list a remote assignment created for the subject and allow canceling it', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`Assign${uniqueId}`, `Subject${uniqueId}`, 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    await page.getByTestId('nav-button-/session/remote-assignment').click();
    await page.waitForURL('**/session/remote-assignment');

    const remoteAssignmentPage = new RemoteAssignmentPage(page);
    await remoteAssignmentPage.clickFirstInstrumentCard();
    await remoteAssignmentPage.submitAssignmentForm();
    await expect(page.getByRole('link', { name: 'Assignment Link' })).toBeVisible();

    // The result slider is a modal sheet, so it blocks clicks on the sidebar underneath until dismissed.
    await page.keyboard.press('Escape');
    await page.locator('[data-testid^="nav-button-/datahub/"]').click();
    await page.waitForURL('**/datahub/**/table');

    await page.getByRole('link', { name: 'Assignments' }).click();
    await page.waitForURL('**/assignments');

    const assignmentsPage = new SubjectAssignmentsPage(page);
    await expect(assignmentsPage.assignmentRows).toHaveCount(1);
    await expect(assignmentsPage.assignmentRows.first()).toContainText('Outstanding');

    await assignmentsPage.assignmentRows.first().click();
    await expect(assignmentsPage.assignmentLink).toBeVisible();
    await assignmentsPage.cancelButton.click();

    await expect(assignmentsPage.assignmentRows.first()).toContainText('Canceled');
  });

  test('should show the subject, instrument and results sections when opening a record from the table', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    await seedSubjectWithRecord(getPageModel, page, `Record${uniqueId}`);

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: INSTRUMENT_TITLE }).click();

    const row = page.getByTestId('data-table-body').getByTestId('data-table-row').first();
    await expect(row).toBeVisible();
    await row.dblclick();

    const recordDetailPage = new SubjectRecordDetailPage(page);
    await expect(recordDetailPage.subjectGroupHeading).toBeVisible();
    await expect(recordDetailPage.instrumentGroupHeading).toBeVisible();
    await expect(recordDetailPage.resultsGroupHeading).toBeVisible();
    await expect(page.getByText('Satisfaction With Personal Life')).toBeVisible();
  });
});
