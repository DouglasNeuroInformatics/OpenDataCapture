import { StartSessionPage } from '../pages/_app/session/start-session.page';
import { expect, test } from '../support/fixtures';

// The form's own validation and its handling of an existing subject's details are covered by
// `apps/web/src/components/StartSessionForm/__tests__/StartSessionForm.test.tsx`, and the identifier
// suggestions it is filled from by `apps/api/test/suites/07-subject-custom-ids.suite.ts`.
test.describe('start session', () => {
  test('should display the start session form', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await expect(startSessionPage.pageHeader).toBeVisible();
    await expect(startSessionPage.pageHeader).toContainText('Start Session');
    await expect(startSessionPage.sessionForm).toBeVisible();
  });

  test('should start a session using personal information', async ({ getPageModel, uniqueId }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.fillSessionForm(`First${uniqueId}`, `Last${uniqueId}`, 'Male');
    await startSessionPage.submitForm();

    await expect(startSessionPage.successMessage).toBeVisible();
  });

  // The pattern is a group setting the form reads through the API, so it is seeded on the group
  // rather than handed to the form. The identifier combobox offers the subjects already enrolled in
  // the group, so a brand new subject's identifier necessarily matches no option, and clicking away
  // used to discard it.
  test("should start a session with a new custom identifier once it matches the group's pattern", async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const pattern = '^custom-[0-9a-f]+$';
    const group = await api.createGroup({
      settings: { defaultIdentificationMethod: 'CUSTOM_ID', idValidationRegex: pattern }
    });
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await authenticateAs(credentials);

    const startSessionPage = new StartSessionPage(page);
    await startSessionPage.goto('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(`CUSTOM-${uniqueId}`, 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.subjectIdErrors).toHaveText(`Must match regular expression: ${pattern}`);

    await startSessionPage.typeSubjectId(`custom-${uniqueId}`);
    await startSessionPage.dismissSubjectIdOptions();
    await expect(startSessionPage.subjectIdField).toHaveValue(`custom-${uniqueId}`);
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();
  });

  // The form used to compute the session date once, when its code first loaded, so every in-person
  // session started later in the same page load was backdated to that moment.
  test('should date an in-person session when it is submitted, not when the page opened', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const openedAt = new Date();
    await page.clock.install({ time: openedAt });
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId(`timed-${uniqueId}`);
    await startSessionPage.dismissSubjectIdOptions();
    await page.clock.fastForward('02:00:00');

    const sessionCreated = page.waitForResponse(
      (response) => response.url().endsWith('/v1/sessions') && response.request().method() === 'POST'
    );
    await startSessionPage.submitForm();
    const session = (await (await sessionCreated).json()) as { date: string };
    expect(new Date(session.date).getTime()).toBeGreaterThanOrEqual(openedAt.getTime() + 2 * 60 * 60 * 1000);
  });
});

// The date picker opens on the browser's current month, so the clock is fixed to a known day; the
// timezone makes the stored instant, which is what the API receives, the same wherever the suite runs.
test.describe('retrospective session time', () => {
  test.use({ timezoneId: 'America/Toronto' });

  test('should keep the time of day entered for a retrospective session', async ({ getPageModel, page, uniqueId }) => {
    await page.clock.install({ time: new Date('2025-06-20T16:00:00Z') });
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId(`retro-${uniqueId}`);
    await startSessionPage.dismissSubjectIdOptions();
    await startSessionPage.selectRetrospective();
    await startSessionPage.pickSessionDay(10);
    await startSessionPage.setSessionTime('14:30:00');

    const sessionCreated = page.waitForRequest(
      (request) => request.url().endsWith('/v1/sessions') && request.method() === 'POST'
    );
    await startSessionPage.submitForm();
    expect((await sessionCreated).postDataJSON()).toMatchObject({ date: '2025-06-10T18:30:00.000Z' });
    await expect(startSessionPage.successMessage).toBeVisible();
  });
});

// A custom id says nothing about the subject behind it, so the form fills in what an existing
// subject already records. An admin with no group has their custom ids scoped as `root$<id>`.
test.describe('existing subject details', () => {
  test('should suggest a default group subject to an admin in no group, even once seen in a group, and fill in and lock its details', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const identifier = `known-${uniqueId}`;
    // Midday UTC, so the date the form shows is the same in any timezone the suite runs in.
    await api.createSession(null, {
      dateOfBirth: new Date('1990-06-15T12:00:00Z'),
      id: `root$${identifier}`,
      sex: 'FEMALE'
    });
    // Starting a session in a group adds that group to the subject, but leaves its id alone.
    await api.createSession((await api.createGroup()).id, { id: `root$${identifier}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [] });
    await authenticateAs(credentials);

    const startSessionPage = new StartSessionPage(page);
    await startSessionPage.goto('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId(identifier);
    await startSessionPage.subjectIdOption(identifier).click();

    await expect(startSessionPage.dateOfBirthField).toHaveValue('1990-06-15');
    await expect(startSessionPage.dateOfBirthField).toBeDisabled();
    await expect(startSessionPage.sexField).toHaveValue('FEMALE');
    await expect(startSessionPage.sexTrigger).toBeDisabled();

    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();
  });
});
