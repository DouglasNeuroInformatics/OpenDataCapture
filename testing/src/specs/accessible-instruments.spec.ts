import { PHONE_VIEWPORT } from '../support/constants';
import { expect, test } from '../support/fixtures';

test.describe('accessible instruments on a phone', () => {
  test.use({ viewport: PHONE_VIEWPORT });

  test('should give the search bar a full-width row above the filters, so the dropdowns cannot crowd it out', async ({
    getPageModel
  }) => {
    const accessibleInstrumentsPage = await getPageModel('/instruments/accessible-instruments');
    await expect(accessibleInstrumentsPage.searchBar).toBeVisible();

    const showcaseBox = (await accessibleInstrumentsPage.instrumentShowcase.boundingBox())!;
    const searchBarBox = (await accessibleInstrumentsPage.searchBar.boundingBox())!;
    const kindFilterBox = (await accessibleInstrumentsPage.kindFilter.boundingBox())!;

    expect(searchBarBox.width).toBeCloseTo(showcaseBox.width, 0);
    expect(kindFilterBox.y).toBeGreaterThanOrEqual(searchBarBox.y + searchBarBox.height);
  });
});

test.describe('accessible instruments', () => {
  test('should filter the instrument showcase to cards matching the search query', async ({ getPageModel }) => {
    const accessibleInstrumentsPage = await getPageModel('/instruments/accessible-instruments');
    await expect(accessibleInstrumentsPage.instrumentShowcase).toBeVisible();

    const nonMatchingCard = accessibleInstrumentsPage.instrumentCard('General Consent Form');
    await expect(nonMatchingCard).toBeVisible();

    await accessibleInstrumentsPage.search('Happiness');

    await expect(accessibleInstrumentsPage.instrumentCard('Happiness Questionnaire')).toBeVisible();
    await expect(nonMatchingCard).not.toBeVisible();
  });
});
