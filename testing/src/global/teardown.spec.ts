import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api-client';
import { ADMIN } from '../support/constants';

// Runs once after every dependent project; drops the database so the next run starts clean.
test('delete database', async ({ request }) => {
  const token = await ApiClient.login(request, { password: ADMIN.password, username: ADMIN.username });
  const response = await request.delete('/api/v1/setup', {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(response.status()).toBe(200);
});
