import { expect, test } from '../support/fixtures';

/**
 * The terminal error page, reached by failing a route loader's request with a status the axios
 * retry budget does not treat as transient — 500 rather than one of 502/503/504, which would show
 * the self-healing connection screen instead. The copy assertion needs `clipboard-read`, which
 * Playwright grants on chromium only.
 */
test.describe('error page', () => {
  test.beforeEach(async ({ authenticateAs, page }) => {
    await authenticateAs('GROUP_MANAGER');
    await page.route('**/v1/subjects*', (route) => {
      return route.fulfill({
        body: JSON.stringify({ error: 'Internal Server Error', message: 'Something broke', statusCode: 500 }),
        contentType: 'application/json',
        status: 500
      });
    });
  });

  test('should offer the error report beside its download, and put it on the clipboard so it need not be downloaded to be shared', async ({
    context,
    page
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/datahub/subjects');
    await expect(page.getByTestId('error-page')).toBeVisible();
    await expect(page.getByTestId('download-error-report')).toContainText('Download Error Report');
    const copyButton = page.getByTestId('copy-error-report');
    await expect(copyButton).toContainText('Copy Error Report');
    await copyButton.click();
    await expect(copyButton).toContainText('Copied');

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    // Parsed rather than matched as text: the point is that a readable report arrives, not that it
    // is serialized in any particular shape.
    expect(JSON.parse(copied)).toMatchObject({ message: expect.stringContaining('500') });
  });
});
