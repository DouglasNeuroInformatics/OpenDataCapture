import type { Locator } from '@playwright/test';

import { RemoteAssignmentsPage } from '../pages/_app/group/remote-assignments.page';
import { expect, test } from '../support/fixtures';

const API = '/api/v1';

const boundingBox = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element is not rendered');
  }
  return box;
};

/**
 * The wizard through the UI. The API-level guarantees are covered by `bulk-remote-assignments.spec.ts`;
 * this drives the page itself, so nothing is submitted and no assignment is created.
 */
test.describe('remote assignments wizard', () => {
  test('should fit the page column, span the stepper across the card, and advance to the instruments step', async ({
    adminToken,
    api,
    apiRequestContext,
    authenticateAs,
    page,
    uniqueId
  }) => {
    // The page sits behind an instance toggle that is on by default. Assert that rather than flip
    // it: other specs expand the "Group Actions" nav group it produces, and the database is shared.
    const setupResponse = await apiRequestContext.get(`${API}/setup`);
    const setupState = (await setupResponse.json()) as { isBulkRemoteAssignmentsEnabled?: boolean };
    expect(setupState.isBulkRemoteAssignmentsEnabled).toBe(true);

    // A dedicated group + manager rather than the cached `GROUP_MANAGER` account: a one-group user
    // lands on this group, so the picker lists exactly the subjects seeded here.
    const group = await api.createGroup({ name: `Wizard${uniqueId}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });
    for (const index of [0, 1]) {
      const response = await apiRequestContext.post(`${API}/sessions`, {
        data: {
          date: new Date().toISOString(),
          groupId: group.id,
          subjectData: { id: `wizard_${uniqueId}_${index}` },
          type: 'IN_PERSON'
        },
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(response.status(), await response.text()).toBe(201);
    }

    await authenticateAs(credentials);
    await page.goto('/group/remote-assignments?mode=create');
    await expect(page).toHaveURL(/\/group\/remote-assignments\?mode=create/);
    const wizardPage = new RemoteAssignmentsPage(page);
    await expect(wizardPage.wizard).toBeVisible();

    // The root once sized itself to its content and overflowed the column; the stepper was capped
    // at a fraction of the card.
    const [wizard, container, breadcrumbs] = await Promise.all([
      boundingBox(wizardPage.wizard),
      boundingBox(wizardPage.container),
      boundingBox(wizardPage.breadcrumbs)
    ]);
    expect(wizard.width).toBeLessThanOrEqual(container.width);
    expect(breadcrumbs.width).toBeGreaterThanOrEqual(wizard.width * 0.9);

    await wizardPage.selectAllSubjects.click();
    await wizardPage.useSelectedSubjects.click();
    await expect(wizardPage.timepointsStep).toBeVisible();
    await expect(wizardPage.breadcrumb('INSTRUMENTS')).toHaveAttribute('aria-current', 'step');
    await expect(wizardPage.breadcrumb('SUBJECTS')).toBeEnabled();
  });

  /** One row under a header of `columnCount` columns, the first of which is the subject id. */
  const wideCsv = (columnCount: number, uniqueId: string) => {
    const headers = ['subject_id', ...Array.from({ length: columnCount - 1 }, (_, index) => `extra_${index}`)];
    const row = [`wide_${uniqueId}`, ...Array.from({ length: columnCount - 1 }, (_, index) => `value_${index}`)];
    return `${headers.join(',')}\n${row.join(',')}\n`;
  };

  // A file with many columns grew the mapping table until the step's own controls sat below the
  // fold, so the frame is capped at 28rem and scrolls within itself instead.
  test('should cap the column mapping table and scroll it rather than lengthening the step', async ({
    api,
    authenticateAs,
    page,
    uniqueId
  }) => {
    const group = await api.createGroup({ name: `WizardWide${uniqueId}` });
    const { credentials } = await api.createUser({ basePermissionLevel: 'GROUP_MANAGER', groupIds: [group.id] });

    await authenticateAs(credentials);
    await page.goto('/group/remote-assignments?mode=create');
    const wizardPage = new RemoteAssignmentsPage(page);
    await expect(wizardPage.wizard).toBeVisible();

    await wizardPage.sourceMode('FILE');
    await wizardPage.uploadFile({
      buffer: Buffer.from(wideCsv(24, uniqueId)),
      mimeType: 'text/csv',
      name: 'wide.csv'
    });

    await expect(wizardPage.mapStep).toBeVisible();
    // One row per column of the file, so the grid is certainly taller than the cap.
    await expect(wizardPage.columnMapping.locator('tbody tr')).toHaveCount(24);

    const mapping = await boundingBox(wizardPage.columnMapping);
    expect(mapping.height).toBeLessThanOrEqual(448);

    const [scrollHeight, clientHeight] = await wizardPage.columnMapping.evaluate((element) => [
      element.scrollHeight,
      element.clientHeight
    ]);
    expect(scrollHeight).toBeGreaterThan(clientHeight);
  });
});
