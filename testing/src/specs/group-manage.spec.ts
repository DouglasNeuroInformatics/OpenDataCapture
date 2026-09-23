import type { Locator } from '@playwright/test';

import { GroupManagePage } from '../pages/_app/group/manage.page';
import { expect, test } from '../support/fixtures';

/** Seeded as a series; `SCALAR_INSTRUMENT_TITLE` is one of the items it repeats. */
const SERIES_INSTRUMENT_TITLE = 'Happiness Questionnaire (Repeated)';

const SCALAR_INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('group manage', () => {
  test('should give a newly created group access to every uploaded instrument, so a manager has something to administer', async ({
    adminToken,
    apiRequestContext,
    uniqueId
  }) => {
    // Deliberately not the `api.createGroup` fixture: that helper PATCHes the accessible instruments
    // in after creating the group, so it passes whether or not creation connected anything itself.
    // An uploaded instrument has no `sourceRepoId` key at all, and the selection query has to match
    // that as well as an explicit null.
    const response = await apiRequestContext.post('/api/v1/groups', {
      data: { name: `RawGroup${uniqueId}`, type: 'CLINICAL' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(response.status()).toBe(201);

    const group = (await response.json()) as { accessibleInstrumentIds: string[] };
    expect(group.accessibleInstrumentIds.length).toBeGreaterThan(0);
  });

  test('should let a group manager preview an accessible instrument', async ({ getPageModel }) => {
    const groupManagePage = await getPageModel('/group/manage');

    // Not asserting which instrument this is: form order is whatever the API returns, not something
    // this test controls.
    await groupManagePage.$ref.getByRole('button', { name: 'Preview instrument' }).first().click();

    const dialog = groupManagePage.$ref.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Preview Form' })).toBeVisible();
  });

  // Every instrument carries the date it was stored, whether it was uploaded, imported from a
  // repository, or built here as a series.
  test('should tag every instrument with the date it was added', async ({ getPageModel }) => {
    const groupManagePage = await getPageModel('/group/manage');

    for (const title of [SERIES_INSTRUMENT_TITLE, SCALAR_INSTRUMENT_TITLE]) {
      const createdAt = groupManagePage.instrumentCreatedAt(title);
      await expect(createdAt).toBeVisible();
      await expect(createdAt).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // The tags are what make the rows scannable, so they have to form columns rather than sit wherever
  // each row's own content puts them — which is what a per-row grid did.
  test('should line the tags and actions of every row into columns', async ({ getPageModel }) => {
    const groupManagePage = await getPageModel('/group/manage');

    const leftEdges = async (locator: Locator) => {
      const boxes = await locator.evaluateAll((elements) =>
        elements.map((element) => Math.round(element.getBoundingClientRect().left))
      );
      // One row proves nothing about a column, so require enough rows for the assertion to bite.
      expect(boxes.length).toBeGreaterThan(1);
      return new Set(boxes);
    };

    expect(await leftEdges(groupManagePage.instrumentPreviewButtons)).toHaveProperty('size', 1);
    expect(await leftEdges(groupManagePage.instrumentCreatedAtTags)).toHaveProperty('size', 1);
  });

  // A series can be one this group built for itself or one shared across the whole instance, and the
  // two are indistinguishable in the list. The seeded series is uploaded, so it belongs to no group.
  test('should tell the previewer which groups a series is available to', async ({ getPageModel }) => {
    const groupManagePage = await getPageModel('/group/manage');

    await groupManagePage.instrumentPreviewButton(SERIES_INSTRUMENT_TITLE).click();
    const dialog = groupManagePage.$ref.getByRole('dialog');
    await expect(dialog.getByTestId('instrument-availability')).toHaveText('Available to: All groups');
    // A plain date: the preview reports the day, not the minute the record happens to carry.
    await expect(dialog.getByTestId('instrument-created-at')).toHaveText(/^Added: \d{4}-\d{2}-\d{2}$/);
  });

  // Only a series is owned by a group, so the line would be meaningless on a form.
  test('should not claim an availability for a scalar instrument', async ({ getPageModel }) => {
    const groupManagePage = await getPageModel('/group/manage');

    await groupManagePage.instrumentPreviewButton(SCALAR_INSTRUMENT_TITLE).click();
    const dialog = groupManagePage.$ref.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('instrument-availability')).toHaveCount(0);
  });

  test('should update accessible instruments and group settings, and keep them after navigating away and back', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    // A dedicated group + user, rather than the default `actingRole: 'GROUP_MANAGER'` fixture: that
    // role's group is created once and cached per worker (see `roleAccount` in fixtures.ts) and shared
    // by every other spec using the default role, so mutating it here would leak into their state.
    const group = await api.createGroup({ name: `Group${uniqueId}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });

    await authenticateAs(credentials);
    await page.goto('/group/manage');
    await expect(page).toHaveURL('/group/manage');

    const groupManagePage = new GroupManagePage(page);
    // `api.createGroup` grants access to every instrument, so uncheck one to produce an observable,
    // reversible change. Assert it starts checked first: `uncheck()` is a no-op on an already-
    // unchecked box, so without this the rest of the test would still pass if the precondition
    // silently stopped holding.
    await expect(groupManagePage.instrumentCheckbox('Happiness Questionnaire')).toBeChecked();
    await groupManagePage.instrumentCheckbox('Happiness Questionnaire').uncheck();
    await groupManagePage.subjectIdDisplayLengthInput.fill('6');
    await groupManagePage.submitButton.click();
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();

    // `currentGroup` is derived from the access token at boot rather than re-fetched on reload, so a
    // hard reload with the same token would show what the group looked like at login time, not the
    // update just made. Navigating away and back in the same session instead reflects the store, which
    // the mutation's own response already updated.
    await page.getByTestId('nav-button-/dashboard').click();
    // The group auto-closes on leaving /group/manage, so expanding before the URL settles could
    // toggle a still-open group shut.
    await expect(page).toHaveURL('/dashboard');
    // Bulk remote assignments is enabled by default, nesting group links under "Group Actions"
    await groupManagePage.expandNavGroup('Group Actions');
    await page.getByTestId('nav-button-/group/manage').click();
    await expect(page).toHaveURL('/group/manage');

    await expect(groupManagePage.instrumentCheckbox('Happiness Questionnaire')).not.toBeChecked();
    await expect(groupManagePage.subjectIdDisplayLengthInput).toHaveValue('6');
  });
});
