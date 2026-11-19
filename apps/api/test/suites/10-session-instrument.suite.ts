import { randomUUID } from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import { InstrumentsService } from '@/instruments/instruments.service';

import { defineSuite, scoreFormBundle } from '../helpers';

type Group = { accessibleInstrumentIds: string[]; id: string; settings: { sessionInstrumentId?: null | string } };

export default defineSuite('session instrument', function () {
  let adminHeaders: { authorization: string };
  let otherFormId: string;
  let sessionInstrumentId: string;

  const createGroup = async (settings?: { [key: string]: unknown }) => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Session Instrument ${randomUUID()}`, settings, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    return response.json<Group>();
  };

  const updateGroup = (groupId: string, payload: { [key: string]: unknown }) => {
    return this.app.inject({ headers: adminHeaders, method: 'PATCH', payload, url: `/v1/groups/${groupId}` });
  };

  const groupRequiringSessionInstrument = async () => {
    const group = await createGroup();
    const response = await updateGroup(group.id, {
      accessibleInstrumentIds: [sessionInstrumentId, otherFormId],
      settings: { sessionInstrumentId }
    });
    expect(response.statusCode).toBe(200);
    return response.json<Group>();
  };

  const startSession = (groupId: string, extra: { [key: string]: unknown } = {}) => {
    const subjectId = `session-instrument-${randomUUID()}`;
    const request = this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        date: '2026-03-04T05:06:07.000Z',
        groupId,
        subjectData: { id: subjectId },
        type: 'RETROSPECTIVE',
        ...extra
      },
      url: '/v1/sessions'
    });
    return { request, subjectId };
  };

  const subjectExists = async (subjectId: string) => {
    const response = await this.app.inject({ headers: adminHeaders, method: 'GET', url: `/v1/subjects/${subjectId}` });
    return response.statusCode === 200;
  };

  beforeAll(async () => {
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: 'DataCapture2025_Test', username: 'admin' },
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
    const instruments = this.app.get(InstrumentsService);
    sessionInstrumentId = (await instruments.create({ bundle: scoreFormBundle('SESSION_INSTRUMENT') })).id;
    otherFormId = (await instruments.create({ bundle: scoreFormBundle('SESSION_INSTRUMENT_OTHER') })).id;
  });

  describe('POST /v1/sessions', () => {
    it('should create the session and a record of the answers in it, dated as the session is', async () => {
      const group = await groupRequiringSessionInstrument();
      const { request, subjectId } = startSession(group.id, {
        sessionInstrumentAnswers: { data: { score: 7 }, instrumentId: sessionInstrumentId }
      });
      const response = await request;
      expect(response.statusCode).toBe(201);
      const session = response.json<{ id: string }>();

      const records = await this.app.inject({
        headers: adminHeaders,
        method: 'GET',
        url: `/v1/instrument-records?subjectId=${subjectId}`
      });
      expect(records.json()).toMatchObject([
        {
          data: { score: 7 },
          date: '2026-03-04T05:06:07.000Z',
          instrumentId: sessionInstrumentId,
          sessionId: session.id
        }
      ]);
    });

    it('should refuse a session without the answers, creating neither it nor its subject', async () => {
      const group = await groupRequiringSessionInstrument();
      const { request, subjectId } = startSession(group.id);
      expect((await request).statusCode).toBe(422);
      expect(await subjectExists(subjectId)).toBe(false);
    });

    it('should refuse answers the instrument rejects, creating neither the session nor its subject', async () => {
      const group = await groupRequiringSessionInstrument();
      const { request, subjectId } = startSession(group.id, {
        sessionInstrumentAnswers: { data: { score: 'seven' }, instrumentId: sessionInstrumentId }
      });
      expect((await request).statusCode).toBe(422);
      expect(await subjectExists(subjectId)).toBe(false);
    });

    it('should refuse answers sent for a group that requires none, rather than drop them', async () => {
      const group = await createGroup();
      const { request } = startSession(group.id, {
        sessionInstrumentAnswers: { data: { score: 7 }, instrumentId: sessionInstrumentId }
      });
      expect((await request).statusCode).toBe(422);
    });
  });

  describe('PATCH /v1/groups/:id', () => {
    it("should refuse to remove the session instrument from the group's instruments, naming the setting", async () => {
      const group = await groupRequiringSessionInstrument();
      const response = await updateGroup(group.id, { accessibleInstrumentIds: [otherFormId] });
      expect(response.statusCode).toBe(400);
      expect(response.json<{ message: string }>().message).toContain('Session Instrument');
    });
  });

  describe('POST /v1/groups', () => {
    it('should create a group without a session instrument, even when one is sent', async () => {
      const group = await createGroup({ defaultIdentificationMethod: 'CUSTOM_ID', sessionInstrumentId });
      expect(group.settings.sessionInstrumentId).toBeFalsy();
    });
  });

  describe('a new edition of the session instrument', () => {
    it('should become the session instrument of every group that required the previous edition', async () => {
      const group = await groupRequiringSessionInstrument();
      const nextEdition = await this.app
        .get(InstrumentsService)
        .create({ bundle: scoreFormBundle('SESSION_INSTRUMENT', { edition: 2 }) });

      const response = await this.app.inject({ headers: adminHeaders, method: 'GET', url: `/v1/groups/${group.id}` });
      expect(response.json<Group>().settings.sessionInstrumentId).toBe(nextEdition.id);
    });
  });
});
