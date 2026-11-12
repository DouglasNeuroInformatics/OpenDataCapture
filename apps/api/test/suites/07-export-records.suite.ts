import { randomUUID } from 'node:crypto';

import { PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { Unpackr } from 'msgpackr';
import { beforeAll, expect, it } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';

import { defineSuite } from '../helpers';

const EXPORT_SUITE_BUNDLE = `(${JSON.stringify({
  __runtimeVersion: 1,
  content: {},
  details: {
    description: 'Export Suite Instrument',
    estimatedDuration: 1,
    instructions: ['Complete the form'],
    license: 'Apache-2.0',
    title: 'Export Suite Instrument'
  },
  internal: {
    edition: 1,
    name: 'EXPORT_SUITE_INSTRUMENT'
  },
  kind: 'FORM',
  language: 'en',
  measures: {},
  tags: ['Test']
})})`;

const decodeExportPayload = (buffer: Buffer): unknown[] => {
  const unpackr = new Unpackr({ structures: [] });
  const frames: unknown[] = [];
  let offset = 0;
  while (offset < buffer.byteLength) {
    const frameLength = buffer.readUInt32BE(offset);
    offset += 4;
    const values: unknown[] = unpackr.unpackMultiple(buffer.subarray(offset, offset + frameLength));
    frames.push(...values);
    offset += frameLength;
  }
  return frames;
};

export default defineSuite('export records with missing relations and unset fields', function () {
  let prisma: RuntimePrismaClient;
  let adminHeaders: { authorization: string };
  let groupId: string;
  let instrumentId: string;

  beforeAll(async () => {
    prisma = this.app.get(PRISMA_CLIENT_TOKEN);
    const login = await this.app.inject({
      method: 'POST',
      payload: { password: 'DataCapture2025_Test', username: 'admin' },
      url: '/v1/auth/login'
    });
    expect(login.statusCode).toBe(200);
    adminHeaders = { authorization: `Bearer ${login.json<{ accessToken: string }>().accessToken}` };

    const groupResponse = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { name: `Export Suite ${randomUUID()}`, type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(groupResponse.statusCode).toBe(201);
    groupId = groupResponse.json<{ id: string }>().id;

    instrumentId = (
      await prisma.instrument.create({
        data: {
          bundle: EXPORT_SUITE_BUNDLE,
          groupIds: [groupId],
          id: `export-suite-${randomUUID()}`
        }
      })
    ).id;
  });

  it('should export foreign-key ids and null joined fields when Subject or Session was deleted or custom-ID sex is unset', async () => {
    const customSubject = await prisma.subject.create({
      data: { groupIds: [groupId], id: `${groupId}$custom-unset-sex` }
    });
    const liveSession = await prisma.session.create({
      data: { date: new Date('2025-06-15T00:00:00.000Z'), groupId, subjectId: customSubject.id, type: 'IN_PERSON' }
    });
    await prisma.instrumentRecord.create({
      data: {
        computedMeasures: { score: 10 },
        createdAt: new Date('2025-06-15T00:00:00.000Z'),
        date: new Date('2025-06-15T00:00:00.000Z'),
        groupId,
        instrumentId,
        pending: false,
        sessionId: liveSession.id,
        subjectId: customSubject.id
      }
    });

    const deletedSubject = await prisma.subject.create({
      data: { groupIds: [groupId], id: `${groupId}$deleted-subject` }
    });
    const deletedSession = await prisma.session.create({
      data: { date: new Date('2025-06-16T00:00:00.000Z'), groupId, subjectId: deletedSubject.id, type: 'REMOTE' }
    });
    await prisma.instrumentRecord.create({
      data: {
        computedMeasures: { score: 20 },
        createdAt: new Date('2025-06-16T00:00:00.000Z'),
        date: new Date('2025-06-16T00:00:00.000Z'),
        groupId,
        instrumentId,
        pending: false,
        sessionId: deletedSession.id,
        subjectId: deletedSubject.id
      }
    });
    await prisma.$runCommandRaw({
      delete: 'SessionModel',
      deletes: [{ limit: 1, q: { _id: { $oid: deletedSession.id } } }]
    });
    await prisma.$runCommandRaw({
      delete: 'SubjectModel',
      deletes: [{ limit: 1, q: { _id: deletedSubject.id } }]
    });

    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: { groupId },
      url: '/v1/instrument-records/export'
    });

    expect(response.statusCode).toBe(200);
    const frames = decodeExportPayload(response.rawPayload);
    expect(frames).toStrictEqual([
      {
        done: false,
        rows: [
          {
            groupId,
            instrumentEdition: 1,
            instrumentName: 'EXPORT_SUITE_INSTRUMENT',
            measure: 'score',
            seriesId: null,
            seriesName: null,
            sessionDate: '2025-06-15',
            sessionId: liveSession.id,
            sessionType: 'IN_PERSON',
            subjectAge: null,
            subjectId: 'custom-unset-sex',
            subjectSex: null,
            timestamp: '2025-06-15',
            username: 'N/A',
            value: 10
          },
          {
            groupId,
            instrumentEdition: 1,
            instrumentName: 'EXPORT_SUITE_INSTRUMENT',
            measure: 'score',
            seriesId: null,
            seriesName: null,
            sessionDate: null,
            sessionId: deletedSession.id,
            sessionType: null,
            subjectAge: null,
            subjectId: 'deleted-subject',
            subjectSex: null,
            timestamp: '2025-06-16',
            username: 'N/A',
            value: 20
          }
        ]
      },
      { done: true, rowCount: 2 }
    ]);
  });
});
