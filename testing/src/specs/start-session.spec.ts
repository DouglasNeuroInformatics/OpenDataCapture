import type { Page } from '@playwright/test';

import { StartSessionPage } from '../pages/_app/session/start-session.page';
import { ApiClient } from '../support/api-client';
import { expect, test } from '../support/fixtures';

// The identifier combobox is filled from this endpoint. It must never carry personal information,
// and must list only the requested group's subjects, and only those the caller may read.
test.describe('custom identifier suggestions', () => {
  test('should list a group’s custom-id subjects but not those identified by personal information', async ({
    api,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const bareId = `bare-${uniqueId}`;
    const customId = `custom-${uniqueId}`;
    const personalInfoId = `personal-${uniqueId}`;
    // The start-session form sends a custom-id subject's date of birth and sex, but no name.
    await api.createSession(group.id, { id: bareId });
    await api.createSession(group.id, { dateOfBirth: new Date('1990-01-01'), id: customId, sex: 'MALE' });
    await api.createSession(group.id, {
      dateOfBirth: new Date('1990-01-01'),
      firstName: 'Ada',
      id: personalInfoId,
      lastName: 'Lovelace',
      sex: 'FEMALE'
    });

    const ids = await api.findSubjectCustomIds(group.id);

    expect(ids).toEqual(expect.arrayContaining([bareId, customId]));
    expect(ids).not.toContain(personalInfoId);
  });

  test('should not list custom-id subjects from another group', async ({ api, uniqueId }) => {
    const group = await api.createGroup();
    const otherGroup = await api.createGroup();
    const otherGroupId = `other-${uniqueId}`;
    await api.createSession(otherGroup.id, { id: otherGroupId });

    expect(await api.findSubjectCustomIds(group.id)).not.toContain(otherGroupId);
  });

  test('should list nothing to a group manager asking for a group they are not a member of', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    const group = await api.createGroup();
    const subjectId = `private-${uniqueId}`;
    await api.createSession(group.id, { id: subjectId });
    const { credentials } = await api.createUser({
      basePermissionLevel: 'GROUP_MANAGER',
      groupIds: [(await api.createGroup()).id]
    });
    const accessToken = await ApiClient.login(apiRequestContext, credentials);

    const response = await apiRequestContext.get(`/api/v1/subjects/groups/${group.id}/custom-ids`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toStrictEqual([]);
  });

  test('should list custom ids scoped to the default group, but not those scoped to a named group, when no group is given', async ({
    api,
    uniqueId
  }) => {
    const rootScopedId = `root$default-${uniqueId}`;
    const groupScopedId = `Clinic$named-${uniqueId}`;
    await api.createSession(null, { id: rootScopedId });
    await api.createSession((await api.createGroup()).id, { id: groupScopedId });

    const ids = await api.findDefaultGroupSubjectCustomIds();

    expect(ids).toContain(rootScopedId);
    expect(ids).not.toContain(groupScopedId);
  });

  test('should still list a default group custom id after its subject is seen in a group', async ({
    api,
    uniqueId
  }) => {
    const rootScopedId = `root$regrouped-${uniqueId}`;
    await api.createSession(null, { id: rootScopedId });
    // Starting a session in a group adds that group to the subject, but leaves its id alone.
    await api.createSession((await api.createGroup()).id, { id: rootScopedId });

    expect(await api.findDefaultGroupSubjectCustomIds()).toContain(rootScopedId);
  });

  test('should list no default group subjects to a group manager outside their groups', async ({
    api,
    apiRequestContext,
    uniqueId
  }) => {
    await api.createSession(null, { id: `root$default-${uniqueId}` });
    const { credentials } = await api.createUser({
      basePermissionLevel: 'GROUP_MANAGER',
      groupIds: [(await api.createGroup()).id]
    });
    const accessToken = await ApiClient.login(apiRequestContext, credentials);

    const response = await apiRequestContext.get('/api/v1/subjects/default-group/custom-ids', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toStrictEqual([]);
  });
});

test.describe('start session', () => {
  test('should display the start session form @smoke', async ({ getPageModel }) => {
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

  test('should start a session using a custom identifier', async ({ getPageModel, uniqueId }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(`custom-${uniqueId}`, 'Male');
    await startSessionPage.submitForm();

    await expect(startSessionPage.successMessage).toBeVisible();
  });

  // The identifier combobox offers the subjects already enrolled in the group, so a brand new
  // subject's identifier necessarily matches no option. Clicking away used to discard it.
  test('should keep a custom identifier matching no existing subject when the options popup is dismissed', async ({
    getPageModel,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId(`unmatched-${uniqueId}`);
    await startSessionPage.dismissSubjectIdOptions();

    await expect(startSessionPage.subjectIdField).toHaveValue(`unmatched-${uniqueId}`);

    await startSessionPage.fillSessionDetails('Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();
  });

  test('should start a session for a subject chosen from the existing custom identifiers', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const identifier = `returning-${uniqueId}`;
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(identifier, 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    // The subject only becomes an option once it exists, and the options are read by the route
    // loader, so the second visit has to be a fresh load rather than a client-side navigation.
    await startSessionPage.endSession();
    await page.reload();
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });

    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId(identifier);
    await startSessionPage.subjectIdOption(identifier).click();
    await expect(startSessionPage.subjectIdField).toHaveValue(identifier);

    // The first session recorded the subject's date of birth and sex, so the form fills those in.
    await startSessionPage.fillSessionTiming();
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();
  });

  test('should suggest default group subjects to an admin who belongs to no group, even once seen in a group', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const identifier = `default-${uniqueId}`;
    // With no current group the form scopes a custom id to the default group, as `root$<id>`.
    await api.createSession(null, { id: `root$${identifier}` });
    await api.createSession((await api.createGroup()).id, { id: `root$${identifier}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [] });
    await authenticateAs(credentials);
    await page.goto('/session/start-session');

    const startSessionPage = new StartSessionPage(page);
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId(identifier);

    await expect(startSessionPage.subjectIdOption(identifier)).toBeVisible();
  });

  test('should show a required-field error for every missing field when submitting the personal information form empty', async ({
    getPageModel
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('PERSONAL_INFO');
    await startSessionPage.submitForm();

    // First name, last name, sex and date of birth are all required for this method.
    await expect(startSessionPage.errorMessages).toHaveCount(4);
    for (const message of await startSessionPage.errorMessages.allTextContents()) {
      expect(message).toBe('This field is required');
    }
    await expect(startSessionPage.successMessage).not.toBeVisible();
  });

  test('should show a required-field error for a blank custom identifier', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillSubjectDetails('MALE');
    await startSessionPage.submitForm();

    await expect(startSessionPage.errorMessages).toHaveCount(1);
    await expect(startSessionPage.errorMessages).toHaveText('This field is required');
  });

  test('should reject a custom identifier containing an illegal character with that error alone, not a contradictory required-field one', async ({
    getPageModel
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId('abc$def');
    await startSessionPage.fillSubjectDetails('MALE');
    await startSessionPage.submitForm();

    await expect(startSessionPage.errorMessages).toHaveCount(1);
    await expect(startSessionPage.subjectIdErrors).toHaveText('Illegal character: $');
    await expect(startSessionPage.successMessage).not.toBeVisible();
  });

  test("should enforce the group's identifier pattern, yet still reject an illegal character in an identifier that pattern accepts", async ({
    api,
    authenticateAs,
    page
  }) => {
    const group = await api.createGroup({
      settings: { defaultIdentificationMethod: 'CUSTOM_ID', idValidationRegex: '^[a-z$]+$' }
    });
    const { credentials } = await api.createUser({ groupIds: [group.id] });
    await authenticateAs(credentials);

    const startSessionPage = new StartSessionPage(page);
    await startSessionPage.goto('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.typeSubjectId('ABC');
    await startSessionPage.fillSubjectDetails('MALE');
    await startSessionPage.submitForm();
    await expect(startSessionPage.subjectIdErrors).toHaveText('Must match regular expression: ^[a-z$]+$');

    await startSessionPage.typeSubjectId('abc$def');
    await startSessionPage.dismissSubjectIdOptions();
    await startSessionPage.submitForm();

    await expect(startSessionPage.errorMessages).toHaveCount(1);
    await expect(startSessionPage.subjectIdErrors).toHaveText('Illegal character: $');
    await expect(startSessionPage.successMessage).not.toBeVisible();
  });

  test('should disable the Start Session nav link while a clinical session is active', async ({
    getPageModel,
    page,
    uniqueId
  }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    await startSessionPage.fillCustomIdentifier(`active-${uniqueId}`, 'Male');
    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();

    // There is no way to start a second session over an active one, so the link that would take you
    // back to the form is disabled outright rather than showing the form again. Check it from a
    // different route, since the nav items only re-derive their `disabled` state as an effect and a
    // navigation is what reliably observes the settled state.
    await page.getByTestId('nav-button-/dashboard').click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('nav-button-/session/start-session')).toBeDisabled();
  });
});

// A custom id says nothing about the subject behind it, so the form fills in what an existing subject
// already records. These run as an admin with no group, whose custom ids carry the `root$` scope.
test.describe('existing subject details', () => {
  const openAsGrouplessAdmin = async ({
    api,
    authenticateAs,
    page
  }: {
    api: ApiClient;
    authenticateAs: (credentials: Awaited<ReturnType<ApiClient['createUser']>>['credentials']) => Promise<void>;
    page: Page;
  }) => {
    const { credentials } = await api.createUser({ basePermissionLevel: 'ADMIN', groupIds: [] });
    await authenticateAs(credentials);
    await page.goto('/session/start-session');
    const startSessionPage = new StartSessionPage(page);
    await startSessionPage.sessionForm.waitFor({ state: 'visible' });
    await startSessionPage.selectIdentificationMethod('CUSTOM_ID');
    return startSessionPage;
  };

  // Midday UTC, so the date the form shows is the same in any timezone the suite runs in.
  const dateOfBirth = new Date('1990-06-15T12:00:00Z');

  test('should fill in and lock the details of a subject chosen from the suggestions', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const identifier = `known-${uniqueId}`;
    await api.createSession(null, { dateOfBirth, id: `root$${identifier}`, sex: 'FEMALE' });
    const startSessionPage = await openAsGrouplessAdmin({ api, authenticateAs, page });

    await startSessionPage.typeSubjectId(identifier);
    await startSessionPage.subjectIdOption(identifier).click();

    await expect(startSessionPage.dateOfBirthField).toHaveValue('1990-06-15');
    await expect(startSessionPage.dateOfBirthField).toBeDisabled();
    await expect(startSessionPage.sexField).toHaveValue('FEMALE');
    await expect(startSessionPage.sexTrigger).toBeDisabled();

    await startSessionPage.submitForm();
    await expect(startSessionPage.successMessage).toBeVisible();
  });

  test('should fill in the details when a typed identifier matches an existing subject, as picking it would', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const identifier = `typed-${uniqueId}`;
    await api.createSession(null, { dateOfBirth, id: `root$${identifier}`, sex: 'MALE' });
    const startSessionPage = await openAsGrouplessAdmin({ api, authenticateAs, page });

    await startSessionPage.typeSubjectId(identifier);
    await startSessionPage.dismissSubjectIdOptions();

    await expect(startSessionPage.sexField).toHaveValue('MALE');
    await expect(startSessionPage.sexTrigger).toBeDisabled();
  });

  test('should clear and unlock the details when the identifier changes to one no subject has', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const identifier = `before-${uniqueId}`;
    await api.createSession(null, { dateOfBirth, id: `root$${identifier}`, sex: 'FEMALE' });
    const startSessionPage = await openAsGrouplessAdmin({ api, authenticateAs, page });
    await startSessionPage.typeSubjectId(identifier);
    await startSessionPage.subjectIdOption(identifier).click();
    await expect(startSessionPage.sexTrigger).toBeDisabled();

    await startSessionPage.typeSubjectId(`new-${uniqueId}`);
    await startSessionPage.dismissSubjectIdOptions();

    await expect(startSessionPage.dateOfBirthField).toHaveValue('');
    await expect(startSessionPage.dateOfBirthField).toBeEnabled();
    await expect(startSessionPage.sexField).not.toHaveValue('FEMALE');
    await expect(startSessionPage.sexTrigger).toBeEnabled();
  });

  test('should lock only the details the subject records, leaving the rest to fill in', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const identifier = `partial-${uniqueId}`;
    await api.createSession(null, { id: `root$${identifier}`, sex: 'MALE' });
    const startSessionPage = await openAsGrouplessAdmin({ api, authenticateAs, page });

    await startSessionPage.typeSubjectId(identifier);
    await startSessionPage.subjectIdOption(identifier).click();

    await expect(startSessionPage.sexTrigger).toBeDisabled();
    await expect(startSessionPage.dateOfBirthField).toBeEnabled();
  });
});
