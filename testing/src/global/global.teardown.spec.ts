import { expect, test } from '@playwright/test';

test('delete database', async ({ request }) => {
  const response = await request.delete('/api/v1/setup', {
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}`
    }
  });
  expect(response.status()).toBe(200);
});
