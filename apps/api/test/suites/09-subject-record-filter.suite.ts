import { randomUUID } from 'node:crypto';

import type { Group } from '@opendatacapture/schemas/group';
import { expect, it } from 'vitest';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

export default defineSuite('subject record filter', function () {
  const login = async (username: string) => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  // `GET /v1/subjects` is gated on `read Subject`, which a standard user holds, but resolving
  // `hasRecord` reads instrument records, which they do not. The honest answer is an empty list.
  it('should answer the with-records filter with no subjects for a caller who may read no records', async () => {
    const adminHeaders = await login('admin');
    const group = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Record Filter ${randomUUID()}`, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(group.statusCode).toBe(201);
    const username = `record-filter-${randomUUID()}`;
    const user = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'Record',
        groupIds: [group.json<Group>().id],
        lastName: 'Filter',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });
    expect(user.statusCode).toBe(201);

    const response = await this.app.inject({
      headers: await login(username),
      method: 'GET',
      query: { hasRecord: 'true' },
      url: '/v1/subjects'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual([]);
  });
});
