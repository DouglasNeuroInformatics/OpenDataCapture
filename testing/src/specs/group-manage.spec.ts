import type { Locator } from '@playwright/test';

import { expect, test } from '../support/fixtures';

/** Seeded as a series; `SCALAR_INSTRUMENT_TITLE` is one of the items it repeats. */
const SERIES_INSTRUMENT_TITLE = 'Happiness Questionnaire (Repeated)';

const SCALAR_INSTRUMENT_TITLE = 'Happiness Questionnaire';

test.describe('group manage', () => {
  // Saving the selection and settings is the API suite's (apps/api/test/suites/09-group-access.suite.ts):
  // the e2e instance is a demo, which a production build serves read-only. That gating is itself
  // what only a production build against a real setup state can show.
  test('should list every accessible instrument with its date, preview and availability, read-only on a production demo', async ({
    getPageModel,
    page
  }) => {
    const groupManagePage = await getPageModel('/group/manage');
    await expect(groupManagePage.instrumentCheckbox(SCALAR_INSTRUMENT_TITLE)).toBeDisabled();

    // Every instrument carries the date it was stored, whether it was uploaded, imported from a
    // repository, or built here as a series.
    for (const title of [SERIES_INSTRUMENT_TITLE, SCALAR_INSTRUMENT_TITLE]) {
      await expect(groupManagePage.instrumentCreatedAt(title)).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
    }

    // The tags are what make the rows scannable, so they have to form columns rather than sit
    // wherever each row's own content puts them — which is what a per-row grid did. `evaluateAll`
    // reads the DOM as it finds it, with none of a locator's waiting, so more than one row has to be
    // on the page first, or a single edge would satisfy any assertion about a column.
    const distinctLeftEdges = async (locator: Locator) => {
      await expect(locator.nth(1)).toBeVisible();
      const edges = await locator.evaluateAll((elements) => {
        return elements.map((element) => Math.round(element.getBoundingClientRect().left));
      });
      return new Set(edges).size;
    };
    expect(await distinctLeftEdges(groupManagePage.instrumentPreviewButtons)).toBe(1);
    expect(await distinctLeftEdges(groupManagePage.instrumentCreatedAtTags)).toBe(1);

    // A series can be one this group built for itself or one shared across the whole instance, and
    // the two are indistinguishable in the list. The seeded series is uploaded, so it belongs to no
    // group.
    const dialog = groupManagePage.$ref.getByRole('dialog');
    await groupManagePage.instrumentPreviewButton(SERIES_INSTRUMENT_TITLE).click();
    await expect(dialog.getByTestId('instrument-availability')).toHaveText('Available to: All groups');
    // A plain date: the preview reports the day, not the minute the record happens to carry.
    await expect(dialog.getByTestId('instrument-created-at')).toHaveText(/^Added: \d{4}-\d{2}-\d{2}$/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Only a series is owned by a group, so the line would be meaningless on a form.
    await groupManagePage.instrumentPreviewButton(SCALAR_INSTRUMENT_TITLE).click();
    await expect(dialog.getByRole('button', { name: 'Preview Form' })).toBeVisible();
    await expect(dialog.getByTestId('instrument-availability')).toHaveCount(0);
  });
});
