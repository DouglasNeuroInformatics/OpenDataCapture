import { ConfigService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Permissions } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type { User } from '@opendatacapture/schemas/user';
import JSZip from 'jszip';
import { beforeAll, expect, it, onTestFinished, vi } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';
import { decryptSecret, encryptSecret } from '@/core/secret-cipher';

import { defineSuite } from '../helpers';

const PASSWORD = 'DataCapture2025_Test';

type AuthHeaders = { authorization: string };

// Registering a repository through the API downloads it from GitHub, so each one these tests re-add is
// written directly, and every download a re-add would start is answered by a stub.
export default defineSuite('re-adding a registered instrument repository', function () {
  let adminHeaders: AuthHeaders;
  let ownGroup: Group;
  let otherGroup: Group;

  const prisma = () => this.app.get<RuntimePrismaClient>(PRISMA_CLIENT_TOKEN);
  const secretKey = () => this.app.get<ConfigService>(ConfigService).getOrThrow('SECRET_KEY');

  const login = async (username: string): Promise<AuthHeaders> => {
    const response = await this.app.inject({
      method: 'POST',
      payload: { password: PASSWORD, username },
      url: '/v1/auth/login'
    });
    expect(response.statusCode).toBe(200);
    return { authorization: `Bearer ${response.json<{ accessToken: string }>().accessToken}` };
  };

  const createGroup = async (name: string): Promise<Group> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(response.statusCode).toBe(201);
    return response.json<Group>();
  };

  /** A standard user in `ownGroup` holding exactly `permissions`, signed in. */
  const signInGrantee = async (username: string, permissions: Permissions): Promise<AuthHeaders> => {
    const created = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'Repo',
        groupIds: [ownGroup.id],
        lastName: 'Grantee',
        password: PASSWORD,
        username
      },
      url: '/v1/users'
    });
    expect(created.statusCode).toBe(201);
    const granted = await this.app.inject({
      headers: adminHeaders,
      method: 'PUT',
      payload: { kind: 'custom', permissions },
      url: `/v1/users/${created.json<User>().id}/permissions`
    });
    expect(granted.statusCode).toBe(200);
    return login(username);
  };

  const registerRepo = (repoName: string, groupIds: string[]) => {
    return prisma().instrumentRepo.create({
      data: {
        accessToken: encryptSecret('stored-token', secretKey()),
        groupIds,
        instrumentIds: [],
        name: repoName,
        owner: 'odc-test',
        repoName,
        url: `https://github.com/odc-test/${repoName}`
      }
    });
  };

  const storedToken = async (id: string) => {
    return (await prisma().instrumentRepo.findUniqueOrThrow({ where: { id } })).accessToken;
  };

  /** Answers every GitHub download with an empty repository, and passes any other request on. */
  const stubGitHub = async () => {
    const archive = await new JSZip().generateAsync({ type: 'arraybuffer' });
    const realFetch = globalThis.fetch;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      return typeof input === 'string' && input.startsWith('https://api.github.com/')
        ? Promise.resolve(new Response(archive))
        : realFetch(input, init);
    });
    onTestFinished(() => fetchSpy.mockRestore());
    return fetchSpy;
  };

  const reAdd = (headers: AuthHeaders, url: string) => {
    return this.app.inject({
      headers,
      method: 'POST',
      payload: { accessToken: 'new-token', url },
      url: '/v1/instrument-repos'
    });
  };

  beforeAll(async () => {
    adminHeaders = await login('admin');
    ownGroup = await createGroup('Repo Grantee Group');
    otherGroup = await createGroup('Repo Owner Group');
  });

  it("should refuse a user whose grants are confined to their own group with a 409, keeping another group's repository token", async () => {
    const headers = await signInGrantee('repo.scoped.updater', [
      { action: 'create', groupId: ownGroup.id, subject: 'InstrumentRepo' },
      { action: 'update', groupId: ownGroup.id, subject: 'InstrumentRepo' }
    ]);
    const repo = await registerRepo('scoped-updater-target', [otherGroup.id]);
    const fetchSpy = await stubGitHub();

    const response = await reAdd(headers, repo.url);

    expect(response.statusCode).toBe(409);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(await storedToken(repo.id)).toBe(repo.accessToken);
  });

  it('should refuse a user holding only a scoped create grant with a 409, rather than a 500', async () => {
    const headers = await signInGrantee('repo.scoped.creator', [
      { action: 'create', groupId: ownGroup.id, subject: 'InstrumentRepo' }
    ]);
    const repo = await registerRepo('scoped-creator-target', [otherGroup.id]);
    await stubGitHub();

    const response = await reAdd(headers, repo.url);

    expect(response.statusCode).toBe(409);
    expect(await storedToken(repo.id)).toBe(repo.accessToken);
  });

  it("should re-sync for a user whose update grant covers the repository's group", async () => {
    const headers = await signInGrantee('repo.own.updater', [
      { action: 'create', groupId: ownGroup.id, subject: 'InstrumentRepo' },
      { action: 'update', groupId: ownGroup.id, subject: 'InstrumentRepo' }
    ]);
    const repo = await registerRepo('own-group-target', [ownGroup.id]);
    await stubGitHub();

    const response = await reAdd(headers, repo.url);

    expect(response.statusCode).toBe(201);
  });

  it('should let an administrator replace the token and re-sync, which is how an expired one is refreshed', async () => {
    const repo = await registerRepo('admin-target', [otherGroup.id]);
    const fetchSpy = await stubGitHub();

    const response = await reAdd(adminHeaders, repo.url);

    expect(response.statusCode).toBe(201);
    expect(fetchSpy).toHaveBeenCalled();
    const token = await storedToken(repo.id);
    expect(token && decryptSecret(token, secretKey())).toBe('new-token');
  });
});
