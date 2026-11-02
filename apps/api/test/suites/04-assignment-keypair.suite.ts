import { randomUUID } from 'node:crypto';

import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { AssignmentsService } from '@/assignments/assignments.service';
import type { RuntimePrismaClient } from '@/core/prisma';
import { GatewayService } from '@/gateway/gateway.service';

import { defineSuite } from '../helpers';

export default defineSuite('assignment keypair', function () {
  let prisma: RuntimePrismaClient;
  let adminHeaders: { authorization: string };
  let groupId: string;
  let instrumentId: string;
  let createRemoteAssignment: MockInstance<GatewayService['createRemoteAssignment']>;

  const createAssignment = async () => {
    const subject = await prisma.subject.create({
      data: { groupIds: [groupId], id: `issue1696-${randomUUID()}` }
    });
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { expiresAt: new Date(Date.now() + 86_400_000), groupId, instrumentId, subjectId: subject.id },
      url: '/v1/assignments'
    });
    expect(response.statusCode).toBe(201);
    return response;
  };

  beforeAll(async () => {
    prisma = this.app.get(PRISMA_CLIENT_TOKEN);
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: 'DataCapture2025_Test', username: 'admin' },
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
    const group = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: 'Assignment Keypair', type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(group.statusCode).toBe(201);
    groupId = group.json<{ id: string }>().id;
    instrumentId = (
      await prisma.instrument.create({
        data: { bundle: '{}', groupIds: [groupId], id: `issue1696-${randomUUID()}` }
      })
    ).id;
    await prisma.group.update({ data: { accessibleInstrumentIds: [instrumentId] }, where: { id: groupId } });
  });

  beforeEach(() => {
    const gatewayService = this.app.get(GatewayService);
    createRemoteAssignment = vi.spyOn(gatewayService, 'createRemoteAssignment').mockResolvedValue(undefined as never);
    vi.spyOn(gatewayService, 'deleteRemoteAssignment').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should store the keypair but return and transmit no part of it when creating an assignment', async () => {
    const response = await createAssignment();
    const { id } = response.json<{ id: string }>();
    expect(response.json()).not.toHaveProperty('encryptionKeyPair');
    expect(createRemoteAssignment.mock.lastCall?.[0]).not.toHaveProperty('encryptionKeyPair');
    expect((await this.app.get(AssignmentsService).findPrivateKeyById(id)).length).toBeGreaterThan(0);
  });

  it('should not return any private key when listing assignments', async () => {
    await createAssignment();
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'GET',
      url: `/v1/assignments?groupId=${groupId}`
    });
    expect(response.statusCode).toBe(200);
    expect(response.json<object[]>().length).toBeGreaterThan(0);
    expect(response.json<object[]>().every((assignment) => !('encryptionKeyPair' in assignment))).toBe(true);
    expect(response.body).not.toContain('privateKey');
  });

  it('should not return the private key when cancelling an assignment', async () => {
    const { id } = (await createAssignment()).json<{ id: string }>();
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'PATCH',
      payload: { status: 'CANCELED' },
      url: `/v1/assignments/${id}`
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id, status: 'CANCELED' });
    expect(response.body).not.toContain('privateKey');
  });
});
