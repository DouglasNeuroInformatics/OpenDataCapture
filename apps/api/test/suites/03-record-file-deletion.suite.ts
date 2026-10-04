import { randomUUID } from 'node:crypto';

import { LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { InstrumentRecord } from '@prisma/client';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';
import { StorageService } from '@/storage/storage.service';

import { defineSuite } from '../helpers';

export default defineSuite('record file deletion', function () {
  let prisma: RuntimePrismaClient;
  let adminHeaders: { authorization: string };
  let scopedHeaders: { authorization: string };
  let groupId: string;
  let otherGroupId: string;
  let instrumentId: string;
  let cleanup: MockInstance<StorageService['deleteObjects']>;

  const seed = async (recordGroupIds: string[]) => {
    const subject = await prisma.subject.create({
      data: { groupIds: [groupId], id: `issue1572-${randomUUID()}` }
    });
    const records: InstrumentRecord[] = [];
    for (const recordGroupId of recordGroupIds) {
      const session = await prisma.session.create({
        data: { date: new Date(), groupId: recordGroupId, subjectId: subject.id, type: 'IN_PERSON' }
      });
      records.push(
        await prisma.instrumentRecord.create({
          data: {
            date: new Date(),
            files: { create: { basename: 'file', groupId: recordGroupId, index: 0, name: 'test.txt', size: 4 } },
            groupId: recordGroupId,
            instrumentId,
            pending: false,
            sessionId: session.id,
            subjectId: subject.id
          }
        })
      );
    }
    return { records, subject };
  };

  beforeAll(async () => {
    prisma = this.app.get(PRISMA_CLIENT_TOKEN);
    const password = 'DataCapture2025_Test';
    const login = await this.app.inject({
      method: 'POST',
      payload: { password, username: 'admin' },
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };
    const createGroup = async (name: string) => {
      const response = await this.app.inject({
        headers: adminHeaders,
        method: 'POST',
        payload: { name, type: 'RESEARCH' },
        url: '/v1/groups'
      });
      expect(response.statusCode).toBe(201);
      return response.json<{ id: string }>().id;
    };
    groupId = await createGroup('File Deletion');
    otherGroupId = await createGroup('Other File Deletion');
    instrumentId = (
      await prisma.instrument.create({
        data: { bundle: '{}', groupIds: [], id: `file-deletion-${randomUUID()}` }
      })
    ).id;
    const username = `file-deletion-${randomUUID()}`;
    const user = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        basePermissionLevel: 'STANDARD',
        firstName: 'File',
        groupIds: [groupId],
        lastName: 'Deletion',
        password,
        username
      },
      url: '/v1/users'
    });
    expect(user.statusCode).toBe(201);
    const permissions = await this.app.inject({
      headers: adminHeaders,
      method: 'PUT',
      payload: {
        permissions: ['InstrumentRecord', 'Session', 'Subject'].map((subject) => ({
          action: 'delete',
          groupId,
          subject
        }))
      },
      url: `/v1/users/${user.json<{ id: string }>().id}/permissions`
    });
    expect(permissions.statusCode).toBe(200);
    const scopedLogin = await this.app.inject({
      method: 'POST',
      payload: { password, username },
      url: '/v1/auth/login'
    });
    expect(scopedLogin.statusCode).toBe(200);
    scopedHeaders = { authorization: `Bearer ${scopedLogin.json<{ accessToken: string }>().accessToken}` };
  });

  beforeEach(() => {
    cleanup = vi.spyOn(this.app.get(StorageService), 'deleteObjects').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete a record carrying a file and request cleanup after its rows are gone', async () => {
    const {
      records: [record]
    } = await seed([groupId]);
    cleanup.mockImplementationOnce(async () => {
      expect(await prisma.instrumentRecord.findUnique({ where: { id: record!.id } })).toBeNull();
      expect(await prisma.instrumentRecordFile.count({ where: { recordId: record!.id } })).toBe(0);
    });
    const response = await this.app.inject({
      headers: scopedHeaders,
      method: 'DELETE',
      url: `/v1/instrument-records/${record!.id}`
    });
    expect(response.statusCode).toBe(204);
    expect(cleanup).toHaveBeenCalledWith([{ groupId, location: { basename: 'file', index: 0 }, recordId: record!.id }]);
    expect(await prisma.session.findUnique({ where: { id: record!.sessionId } })).not.toBeNull();
  });

  it('should hide inaccessible records just like missing records and preserve their files', async () => {
    const {
      records: [record]
    } = await seed([otherGroupId]);
    for (const id of [record!.id, '000000000000000000000000']) {
      const response = await this.app.inject({
        headers: scopedHeaders,
        method: 'DELETE',
        url: `/v1/instrument-records/${id}`
      });
      expect(response.statusCode).toBe(404);
    }
    expect(await prisma.instrumentRecordFile.count({ where: { recordId: record!.id } })).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('should force-delete all records, file rows, sessions and the subject', async () => {
    const { records, subject } = await seed([groupId, otherGroupId]);
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'DELETE',
      url: `/v1/subjects/${subject.id}?force=true`
    });
    expect(response.statusCode).toBe(200);
    expect(await prisma.subject.findUnique({ where: { id: subject.id } })).toBeNull();
    expect(await prisma.session.count({ where: { subjectId: subject.id } })).toBe(0);
    expect(await prisma.instrumentRecord.count({ where: { subjectId: subject.id } })).toBe(0);
    expect(
      await prisma.instrumentRecordFile.count({ where: { recordId: { in: records.map((record) => record.id) } } })
    ).toBe(0);
    expect(cleanup).toHaveBeenCalledWith(
      records.map((record) => ({
        groupId: record.groupId,
        location: { basename: 'file', index: 0 },
        recordId: record.id
      }))
    );
  });

  it('should roll back force deletion when some records are outside the caller scope', async () => {
    const { records, subject } = await seed([groupId, otherGroupId]);
    const response = await this.app.inject({
      headers: scopedHeaders,
      method: 'DELETE',
      url: `/v1/subjects/${subject.id}?force=true`
    });
    expect(response.statusCode).toBe(500);
    expect(await prisma.instrumentRecord.count({ where: { subjectId: subject.id } })).toBe(2);
    expect(
      await prisma.instrumentRecordFile.count({ where: { recordId: { in: records.map((record) => record.id) } } })
    ).toBe(2);
    expect(await prisma.session.count({ where: { subjectId: subject.id } })).toBe(2);
    expect(await prisma.subject.findUnique({ where: { id: subject.id } })).not.toBeNull();
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('should refuse an inaccessible subject before deleting any dependent rows', async () => {
    const {
      records: [record],
      subject
    } = await seed([otherGroupId]);
    await prisma.subject.update({ data: { groupIds: [otherGroupId] }, where: { id: subject.id } });
    const response = await this.app.inject({
      headers: scopedHeaders,
      method: 'DELETE',
      url: `/v1/subjects/${subject.id}?force=true`
    });
    expect(response.statusCode).toBe(404);
    expect(await prisma.instrumentRecordFile.count({ where: { recordId: record!.id } })).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('should keep non-force subject deletion restricted while files and records exist', async () => {
    const {
      records: [record],
      subject
    } = await seed([groupId]);
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'DELETE',
      url: `/v1/subjects/${subject.id}`
    });
    expect(response.statusCode).toBe(500);
    expect(await prisma.instrumentRecordFile.count({ where: { recordId: record!.id } })).toBe(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('should keep a committed record deletion successful when storage fails and log the orphan', async () => {
    const {
      records: [record]
    } = await seed([groupId]);
    const error = new Error('storage unavailable');
    cleanup.mockRejectedValueOnce(error);
    const log = vi.spyOn(LoggingService.prototype, 'error').mockImplementation(() => undefined);
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'DELETE',
      url: `/v1/instrument-records/${record!.id}`
    });
    expect(response.statusCode).toBe(204);
    expect(await prisma.instrumentRecord.findUnique({ where: { id: record!.id } })).toBeNull();
    expect(await prisma.instrumentRecordFile.count({ where: { recordId: record!.id } })).toBe(0);
    expect(log.mock.lastCall?.[0]).toMatchObject({ error });
    expect(log.mock.lastCall?.[0]).toHaveProperty(
      'message',
      expect.stringContaining('orphaned objects require cleanup')
    );
  });
});
