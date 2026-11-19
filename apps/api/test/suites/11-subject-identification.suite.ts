import { randomUUID } from 'node:crypto';

import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { beforeAll, describe, expect, it } from 'vitest';

import { defineSuite } from '../helpers';

type AuthHeaders = { authorization: string };

const PASSWORD = 'DataCapture2025_Test';

// Its own address, so these logins never count against another suite's throttling budget.
const LOGIN_ADDRESS = '192.0.2.111';

const definition = {
  fields: [
    { label: { en: 'Animal ID' }, pattern: '[A-Z]{2}[0-9]+' },
    { label: { en: 'Cage' }, pattern: '[0-9]+' }
  ],
  label: { en: 'Animal information' }
};

export default defineSuite('subject identification', function () {
  let adminHeaders: AuthHeaders;
  let standardHeaders: AuthHeaders;
  let groupId: string;

  const login = async (username: string): Promise<AuthHeaders> => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      remoteAddress: LOGIN_ADDRESS,
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  const getSettings = async (headers: AuthHeaders) => {
    const response = await this.app.inject({ headers, method: 'GET', url: '/v1/subjects/identification/settings' });
    expect(response.statusCode).toBe(200);
    return response.json<SubjectIdentificationSettings>();
  };

  const putSettings = (headers: AuthHeaders, payload: object) => {
    return this.app.inject({ headers, method: 'PUT', payload, url: '/v1/subjects/identification/settings' });
  };

  beforeAll(async () => {
    adminHeaders = await login('admin');
    const group = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Identification ${randomUUID()}`, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(group.statusCode).toBe(201);
    groupId = group.json<{ id: string }>().id;
    const username = `identification-${randomUUID()}`;
    const user = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'Identification',
        groupIds: [groupId],
        lastName: 'User',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });
    expect(user.statusCode).toBe(201);
    standardHeaders = await login(username);
  });

  describe('before any definition', () => {
    it('should report no definition, unlocked', async () => {
      await expect(getSettings(adminHeaders)).resolves.toStrictEqual({
        customFields: null,
        isCustomFieldsLocked: false
      });
    });
  });

  describe('PUT /v1/subjects/identification/settings', () => {
    it('should refuse anyone but an administrator', async () => {
      expect((await putSettings(standardHeaders, { customFields: definition })).statusCode).toBe(403);
    });

    it('should store the definition with a salt and iteration count of the server’s choosing', async () => {
      const response = await putSettings(adminHeaders, { customFields: definition });
      expect(response.statusCode).toBe(200);
      const { customFields } = response.json<SubjectIdentificationSettings>();
      expect(customFields).toMatchObject({ ...definition, iterations: 600_000 });
      expect(customFields?.salt).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('GET /v1/subjects/identification/settings', () => {
    it('should serve the definition, salt included, to a user who only reads subjects', async () => {
      const settings = await getSettings(standardHeaders);
      expect(settings.customFields?.salt).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should never put the salt on the public setup route', async () => {
      const { customFields } = await getSettings(adminHeaders);
      const setup = await this.app.inject({ method: 'GET', url: '/v1/setup' });
      expect(setup.body).not.toContain(customFields!.salt);
    });
  });

  describe('once a subject has been identified with the fields', () => {
    let salt: string;

    beforeAll(async () => {
      salt = (await getSettings(adminHeaders)).customFields!.salt;
      const session = await this.app.inject({
        headers: standardHeaders,
        method: 'POST',
        payload: {
          date: new Date(),
          groupId,
          subjectData: { id: `cf_${'0'.repeat(64)}` },
          type: 'IN_PERSON'
        },
        url: '/v1/sessions'
      });
      expect(session.statusCode).toBe(201);
    });

    it('should report the definition locked', async () => {
      await expect(getSettings(standardHeaders)).resolves.toMatchObject({ isCustomFieldsLocked: true });
    });

    it('should refuse to remove the definition', async () => {
      expect((await putSettings(adminHeaders, { customFields: null })).statusCode).toBe(409);
    });

    it('should refuse to change the number of fields', async () => {
      const fewer = { ...definition, fields: definition.fields.slice(0, 1) };
      expect((await putSettings(adminHeaders, { customFields: fewer })).statusCode).toBe(409);
    });

    it('should still accept corrected labels and patterns, keeping the salt', async () => {
      const corrected = {
        fields: definition.fields.map((field) => ({ ...field, pattern: '[A-Z0-9]+' })),
        label: { en: 'Mouse information' }
      };
      const response = await putSettings(adminHeaders, { customFields: corrected });
      expect(response.statusCode).toBe(200);
      expect(response.json<SubjectIdentificationSettings>().customFields).toMatchObject({ ...corrected, salt });
    });
  });
});
