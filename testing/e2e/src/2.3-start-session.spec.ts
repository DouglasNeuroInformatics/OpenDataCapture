import { expect, test } from './helpers/fixtures';

test.describe('start session', () => {
  test('should display the start session form header', async ({ getPageModel }) => {
    const startSessionPage = await getPageModel('/session/start-session');
    await expect(startSessionPage.pageHeader).toBeVisible();
    await expect(startSessionPage.pageHeader).toContainText('Start Session');
    await expect(startSessionPage.subjectIdentificationInput).toBeDefined();
  });
});
