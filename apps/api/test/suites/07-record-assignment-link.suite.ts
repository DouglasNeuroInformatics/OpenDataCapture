import { randomUUID } from 'node:crypto';

import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';
import { GatewayService } from '@/gateway/gateway.service';
import { InstrumentsService } from '@/instruments/instruments.service';

import { defineSuite, scoreFormBundle } from '../helpers';

/** Logins come from an address of their own, so they spend none of the default address's throttle budget. */
const LOGIN_ADDRESS = '192.0.2.71';

/**
 * Only the gateway synchronizer may link a record to an assignment, so the create route drops the
 * key, but a client that still sends one must not be refused for it. The strip is the schema's, and
 * this is where the stripped body is shown to be what reaches the service.
 */
export default defineSuite('record assignment link', function () {
  let prisma: RuntimePrismaClient;
  let adminHeaders: { authorization: string };
  let groupId: string;
  let instrumentId: string;

  beforeAll(async () => {
    prisma = this.app.get(PRISMA_CLIENT_TOKEN);
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: 'DataCapture2025_Test', username: 'admin' },
      remoteAddress: LOGIN_ADDRESS,
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
    instrumentId = (
      await this.app.get(InstrumentsService).create({ bundle: scoreFormBundle('RECORD_ASSIGNMENT_LINK') })
    ).id;
    // Created after the instrument, so the group is granted it.
    const group = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: 'Record Assignment Link', type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(group.statusCode).toBe(201);
    groupId = group.json<{ id: string }>().id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should accept a record that names an assignment, without linking the two', async () => {
    const session = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { date: new Date(), groupId, subjectData: { id: `assigned-${randomUUID()}` }, type: 'IN_PERSON' },
      url: '/v1/sessions'
    });
    expect(session.statusCode).toBe(201);
    const { id: sessionId, subjectId } = session.json<{ id: string; subjectId: string }>();

    const gatewayService = this.app.get(GatewayService);
    vi.spyOn(gatewayService, 'createRemoteAssignment').mockResolvedValue(undefined as never);
    const assignment = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { expiresAt: new Date(Date.now() + 86_400_000), groupId, instrumentId, subjectId },
      url: '/v1/assignments'
    });
    expect(assignment.statusCode).toBe(201);

    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        assignmentId: assignment.json<{ id: string }>().id,
        data: { score: 1 },
        date: new Date(),
        groupId,
        instrumentId,
        sessionId,
        subjectId
      },
      url: '/v1/instrument-records'
    });

    expect(response.statusCode, response.body).toBe(201);
    const { id } = response.json<{ id: string }>();
    expect(await prisma.instrumentRecord.findUniqueOrThrow({ where: { id } })).toMatchObject({ assignmentId: null });
  });
});
