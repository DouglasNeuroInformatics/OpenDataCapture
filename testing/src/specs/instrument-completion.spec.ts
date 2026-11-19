import type { Page } from '@playwright/test';

import { RenderInstrumentPage } from '../pages/_app/instruments/render/$id.page';
import { HAPPINESS_RECORD } from '../support/constants';
import { expect, test } from '../support/fixtures';

import type { GetPageModel } from '../support/fixtures';

// Title shown on the instrument card in the showcase (`details.title`), which differs from the
// title shown while running it (`clientDetails.title`, "Questionnaire on Happiness").
const INSTRUMENT_TITLE = 'Happiness Questionnaire';

// Every field on this instrument is optional, and its content is grouped across several titled
// sections (select, radio and number inputs), unlike the flat Happiness Questionnaire.
const DEMOGRAPHICS_INSTRUMENT_TITLE = 'Enhanced Demographics Questionnaire';

/**
 * Starts a session for a new subject and begins the instrument with this card title. The active
 * session lives in memory, so every step navigates via the sidebar; a hard navigation would drop
 * the session and disable these nav buttons.
 */
async function beginInstrument(
  getPageModel: GetPageModel,
  page: Page,
  firstName: string,
  title: string
): Promise<RenderInstrumentPage> {
  const startSessionPage = await getPageModel('/session/start-session');
  await startSessionPage.sessionForm.waitFor({ state: 'visible' });
  await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
  await startSessionPage.fillSessionForm(firstName, `Subject${firstName}`, 'Female');
  await startSessionPage.submitForm();
  await expect(startSessionPage.successMessage).toBeVisible();

  await page.getByTestId('nav-button-/instruments/accessible-instruments').click();
  await page.waitForURL('**/instruments/accessible-instruments');

  const card = page.locator('[data-testid^="instrument-card-"]').filter({ hasText: title }).first();
  await expect(card).toBeVisible();
  await card.click();

  const instrumentPage = new RenderInstrumentPage(page);
  await instrumentPage.begin();
  return instrumentPage;
}

/** Opens the current subject's record table on the records of the instrument with this title. */
async function openSubjectRecords(page: Page, title: string): Promise<void> {
  // "View Current Subject" targets the active subject's record table directly, which is far more
  // robust than matching a hashed row in the data hub list.
  await page.locator('[data-testid^="nav-button-/datahub/subjects/"]').click();
  await page.waitForURL('**/datahub/subjects/**/table');

  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: title }).click();
}

test.describe('instrument completion', () => {
  test('should administer an instrument and surface the record for the subject', async ({
    getPageModel,
    page,
    roleAccount,
    uniqueId
  }) => {
    const instrumentPage = await beginInstrument(getPageModel, page, `Instrument${uniqueId}`, INSTRUMENT_TITLE);
    await instrumentPage.completeHappinessQuestionnaire();
    await instrumentPage.submit();

    await expect(instrumentPage.summaryHeading).toBeVisible();

    await openSubjectRecords(page, INSTRUMENT_TITLE);
    await expect(page.getByTestId('data-table-body').getByTestId('data-table-row').first()).toBeVisible();

    // The one place the api -> web username contract is exercised end to end. Both unit tiers mock
    // the other side of it: the api spec mocks prisma, and the useInstrumentVisualization test mocks
    // useInstrumentRecords. A record carries its session's user from `GET /v1/instrument-records`,
    // and 'N/A' is what the hook falls back to when that field does not arrive.
    const { username } = await roleAccount('GROUP_MANAGER');
    await expect(page.getByTestId('subject-table-cell-username').first()).toHaveText(username);
  });

  // The set is serialized by the renderer, stored by the api, and revived by the web client, so this
  // is the only test that crosses every hop a z.set() field takes before it is shown.
  test('should show the members of a z.set() field in the subject table rather than [object Set]', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const instrumentPage = await beginInstrument(getPageModel, page, `SetField${uniqueId}`, INSTRUMENT_TITLE);
    await instrumentPage.completeHappinessQuestionnaireDissatisfied(['Money', 'Friends']);
    await instrumentPage.submit();

    await expect(instrumentPage.summaryHeading).toBeVisible();

    await openSubjectRecords(page, INSTRUMENT_TITLE);
    await expect(page.getByTestId('subject-table-cell-causesOfDissatisfaction').first()).toHaveText('MONEY, FRIENDS');
  });

  test('should report validation errors localized and under their own fields, focusing the first', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const instrumentPage = await beginInstrument(getPageModel, page, `Validation${uniqueId}`, INSTRUMENT_TITLE);
    await expect(instrumentPage.errorSummary).toHaveCount(0);

    // The happiness questionnaire is authored against /runtime/v1/zod@3.x/v4, so submitting with
    // nothing filled in exercises the v4 error map that apps/web/src/services/zod.ts registers on
    // the runtime-served zod instance. Without that registration, zod's own default message
    // ("Invalid input: ...") renders instead of the localized one.
    await instrumentPage.submit();

    await expect(instrumentPage.errorMessages.first()).toBeVisible();
    for (const message of await instrumentPage.errorMessages.allTextContents()) {
      expect(message).toBe('This field is required');
    }
    await expect(instrumentPage.errorSummary).toBeVisible();
    // The first invalid field is a slider, whose focusable element is a Radix thumb rather than an
    // input, which only a real browser lays out and focuses.
    await expect(instrumentPage.firstInvalidField).toBeInViewport();
    await expect(instrumentPage.firstInvalidField.locator(':focus')).toHaveCount(1);

    await instrumentPage.answerHappinessQuestionnaireDissatisfiedWithoutReason();
    await instrumentPage.submit();

    // An issue without a path is rendered above the Submit button instead of under any field, so the
    // single error must sit inside the reason field's group.
    const reasonFieldGroup = page.locator('[data-field-group="reasonNotSatisfied"]');
    await expect(reasonFieldGroup.getByTestId('error-message-text')).toHaveText(
      'This field is required / Ce champ est obligatoire'
    );
    await expect(instrumentPage.errorMessages).toHaveCount(1);
    await expect(instrumentPage.summaryHeading).toBeHidden();
  });

  test('should refuse a malformed postal code, then store a lowercase one in uppercase alongside an age at immigration of 0', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const instrumentPage = await beginInstrument(
      getPageModel,
      page,
      `Demographics${uniqueId}`,
      DEMOGRAPHICS_INSTRUMENT_TITLE
    );
    const postalCode = page.locator('[name="postalCode"]');

    // Every field on this instrument is optional, so an out-of-format postal code is the only value
    // filled in, isolating the format error from any required-field error. The instrument is
    // authored against zod v3, whose own message for a failed regex is the bare word "Invalid":
    // asserting the text is what proves the runtime-served v3 instance carries the shared error map,
    // and that the map does not echo the pattern back at the clinician.
    await postalCode.fill('invalid');
    await instrumentPage.submit();
    await expect(instrumentPage.errorMessages).toHaveText('Does not match the expected format');

    await instrumentPage.completeEnhancedDemographicsQuestionnaire();
    await postalCode.fill('h4h 1r3');
    await page.locator('[name="ageAtImmigration"]').fill('0');
    await instrumentPage.submit();

    await expect(instrumentPage.summaryHeading).toBeVisible();

    await openSubjectRecords(page, DEMOGRAPHICS_INSTRUMENT_TITLE);
    await expect(page.getByTestId('subject-table-cell-postalCode').first()).toHaveText('H4H 1R3');
    await expect(page.getByTestId('subject-table-cell-ageAtImmigration').first()).toHaveText('0');
  });

  // Records collected in person carry no assignmentId, and MongoDB indexes a missing field as null,
  // so a unique index on that field would reject the second record here as a duplicate key. See
  // DATABASE_INDEXES in the api's src/core/prisma.ts.
  test('should store the same instrument twice in one session for one subject, neither record having an assignment', async ({
    api,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `Repeat ${uniqueId}` });
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    const session = await api.createSession(group.id, { id: `repeat-${uniqueId}` });

    const first = await api.createRecord(group.id, instrumentId, session, HAPPINESS_RECORD);
    const second = await api.createRecord(group.id, instrumentId, session, HAPPINESS_RECORD);

    expect(second.id).not.toBe(first.id);
    expect([first.assignmentId ?? null, second.assignmentId ?? null]).toEqual([null, null]);
  });
});
