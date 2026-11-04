import { beforeAll, expect, it } from 'vitest';

import { defineSuite } from '../helpers';

export default defineSuite('assignment redirect URL', function () {
  let adminHeaders: { authorization: string };

  beforeAll(async () => {
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: 'DataCapture2025_Test', username: 'admin' },
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
  });

  it('should refuse an assignment that would send its subject on over plain http', async () => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        expiresAt: new Date(Date.now() + 86_400_000),
        instrumentId: 'instrument-1',
        redirectUrl: 'http://example.com/done',
        subjectId: 'subject-1'
      },
      url: '/v1/assignments'
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('redirectUrl');
  });

  it('should refuse a bulk operation that would send its subjects on over plain http', async () => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        groupId: 'group-1',
        redirectUrl: 'http://example.com/done',
        subjectIds: ['subject-1'],
        timepoints: [{ expiresAt: new Date(Date.now() + 86_400_000), instrumentId: 'instrument-1' }]
      },
      url: '/v1/assignments/bulk'
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('redirectUrl');
  });
});
