import { expect, test } from '../support/fixtures';

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
