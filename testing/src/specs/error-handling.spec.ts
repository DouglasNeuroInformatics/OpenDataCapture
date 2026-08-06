import { expect, test } from '../support/fixtures';

// `apps/web/src/services/axios.ts` retries idempotent requests on 502/503/504, for the proxies in
// front of the API that answer with HTML or with nothing. A 5xx the API answers itself carries
// libnest's error envelope, and retrying that only spends the whole budget arriving at the same
// answer. No route in the app produces one on a GET — the gateway failures that return 502 arrive
// on writes, which are never retried — so the response is faked at the browser instead.
test.describe('server error handling', () => {
  test('should surface an api error immediately rather than retrying it as a connection blip', async ({
    authenticateAs,
    page
  }) => {
    let attempts = 0;
    await page.route('**/v1/subjects*', async (route) => {
      attempts += 1;
      await route.fulfill({
        body: JSON.stringify({ message: 'Gateway refused to fetch remote assignments', statusCode: 503 }),
        contentType: 'application/json',
        status: 503
      });
    });

    await authenticateAs('GROUP_MANAGER');
    await page.goto('/datahub');

    // The terminal error page, naming the status — not the self-healing "Connection Problem" screen,
    // which invites the user to retry something that will never succeed.
    await expect(page.getByRole('heading', { name: '503 - Service Unavailable' })).toBeVisible();
    await expect(page.getByText('Connection Problem')).toBeHidden();
    expect(attempts).toBe(1);
  });
});
