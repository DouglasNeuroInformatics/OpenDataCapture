import { randomUUID } from 'node:crypto';

import { beforeAll, expect, it } from 'vitest';

import { InstrumentsService } from '@/instruments/instruments.service';

import { defineSuite, scoreFormBundle } from '../helpers';

type UploadedRecord = { subjectId: string };

export default defineSuite('instrument record upload', function () {
  let adminHeaders: { authorization: string };
  let groupId: string;
  let instrumentId: string;

  const upload = async (subjectIds: string[]): Promise<UploadedRecord[]> => {
    const response = await this.app.inject({
      headers: adminHeaders,
      method: 'POST',
      payload: {
        groupId,
        instrumentId,
        records: subjectIds.map((subjectId) => ({ data: { score: 1 }, date: new Date(), subjectId }))
      },
      url: '/v1/instrument-records/upload'
    });
    expect(response.statusCode).toBe(201);
    return response.json<UploadedRecord[]>();
  };

  beforeAll(async () => {
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
      payload: { name: 'Record Upload', type: 'RESEARCH' },
      url: '/v1/groups'
    });
    expect(group.statusCode).toBe(201);
    groupId = group.json<{ id: string }>().id;
    instrumentId = (await this.app.get(InstrumentsService).create({ bundle: scoreFormBundle('RECORD_UPLOAD') })).id;
  });

  // The response was once every record in the group for the instrument, so a second upload handed
  // the first one's records back to the caller. The earlier upload is what tells the two apart.
  it('should answer a batch upload with exactly the records it created', async () => {
    await upload([`upload-earlier-${randomUUID()}`]);
    const batch = ['a', 'b', 'c'].map((suffix) => `upload-${suffix}-${randomUUID()}`);

    const records = await upload(batch);

    expect(records.map((record) => record.subjectId).sort()).toStrictEqual([...batch].sort());
  });
});
