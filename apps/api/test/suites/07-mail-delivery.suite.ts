import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';

import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';
import { GatewayService } from '@/gateway/gateway.service';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

/** Logins come from an address of their own, so they spend none of the default address's throttle budget. */
const LOGIN_ADDRESS = '192.0.2.70';

/** A loopback port nothing listens on, so a delivery attempt is refused at once rather than timing out. */
async function findClosedPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  await new Promise((resolve) => {
    server.close(resolve);
  });
  if (typeof address !== 'object' || address === null) {
    throw new Error('Expected the probe server to listen on a TCP port');
  }
  return address.port;
}

/**
 * The delivery results a caller relies on to fall back to manual delivery, over real HTTP: the
 * controllers' unit tests mock the mail service, and the web app's tests mock these responses.
 */
export default defineSuite('mail delivery', function () {
  let adminHeaders: { authorization: string };

  const setMailConfig = async (enabled: boolean, port: number) => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'PATCH',
      payload: {
        config: {
          enabled,
          encryption: 'none',
          host: '127.0.0.1',
          password: 'mail-password',
          port,
          senderAddress: 'noreply@example.org',
          username: 'mailer'
        }
      },
      url: '/v1/mail/settings'
    });
    expect(response.statusCode).toBe(200);
  };

  let closedPort: number;

  beforeAll(async () => {
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username: 'admin' },
      remoteAddress: LOGIN_ADDRESS,
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
    closedPort = await findClosedPort();
    await setMailConfig(true, closedPort);
  });

  // Mail is instance-wide, and every later suite assumes it is off.
  afterAll(async () => {
    await setMailConfig(false, closedPort);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should answer a created user with the rendered welcome message when it cannot be delivered', async () => {
    const username = `welcome-${randomUUID()}`;
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'ADMIN',
        email: `${username}@example.org`,
        firstName: 'Welcome',
        groupIds: [],
        lastName: 'Probe',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });

    expect(response.statusCode).toBe(201);
    const { welcomeEmail } = response.json<{ welcomeEmail: EmailDeliveryResult }>();
    expect(welcomeEmail).toMatchObject({ error: 'CONNECTION_REFUSED', status: 'FAILED' });
    expect(welcomeEmail.message).toContain(username);
  });

  // The bulk route sits beside `:id/email`, which would capture `bulk` as an assignment id if the
  // two were ever matched in the wrong order.
  it('should report a failed bulk assignment email as a delivery result rather than an error', async () => {
    const prisma = this.app.get<RuntimePrismaClient>(PRISMA_CLIENT_TOKEN);
    const group = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Mail Delivery ${randomUUID()}`, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(group.statusCode).toBe(201);
    const groupId = group.json<{ id: string }>().id;
    const instrumentId = (
      await prisma.instrument.create({
        data: { bundle: '{}', groupIds: [groupId], id: `mail-delivery-${randomUUID()}` }
      })
    ).id;
    await prisma.group.update({ data: { accessibleInstrumentIds: [instrumentId] }, where: { id: groupId } });
    const subject = await prisma.subject.create({ data: { groupIds: [groupId], id: `mail-${randomUUID()}` } });
    vi.spyOn(this.app.get(GatewayService), 'createRemoteAssignment').mockResolvedValue(undefined as never);
    const assignment = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { expiresAt: new Date(Date.now() + 86_400_000), groupId, instrumentId, subjectId: subject.id },
      url: '/v1/assignments'
    });
    expect(assignment.statusCode).toBe(201);

    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        assignmentIds: [assignment.json<{ id: string }>().id],
        language: 'en',
        recipient: 'participant@example.org'
      },
      url: '/v1/assignments/bulk/email'
    });

    expect(response.statusCode, response.body).toBe(201);
    expect(response.json()).toMatchObject({ error: 'CONNECTION_REFUSED', status: 'FAILED' });
  });
});
