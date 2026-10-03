import { expect, test } from '../support/fixtures';

test('should delete a record carrying file metadata and make its files inaccessible', async ({
  adminToken,
  api,
  apiRequestContext,
  uniqueId
}) => {
  const headers = { Authorization: `Bearer ${adminToken}` };
  const session = await api.createSession(null, { id: `file-deletion-${uniqueId}` });
  const instrumentId = await api.findInstrumentIdByName('ARBITRARY_SINGLE_FILE');
  const created = await apiRequestContext.post('/api/v1/instrument-records', {
    data: {
      data: {},
      date: new Date(),
      instrumentId,
      sessionId: session.id,
      subjectId: session.subjectId
    },
    headers
  });
  expect(created.status()).toBe(201);
  const record = (await created.json()) as { id: string };
  const recordPath = `/api/v1/instrument-records/${record.id}`;
  const name = `file-${uniqueId}.txt`;

  const completed = await apiRequestContext.post(`${recordPath}/files/upload-complete`, {
    data: { uploads: { file: [{ location: { basename: 'file', index: 0 }, name, size: 4 }] } },
    headers
  });
  expect(completed.status()).toBe(201);
  const files = await apiRequestContext.get(`${recordPath}/files`, { headers });
  expect(files.status()).toBe(200);
  expect(await files.json()).toMatchObject({ file: [{ name, size: 4 }] });

  const deleted = await apiRequestContext.delete(recordPath, { headers });
  expect(deleted.status()).toBe(204);
  const missingRecord = await apiRequestContext.get(recordPath, { headers });
  expect(missingRecord.status()).toBe(404);
  const missingFiles = await apiRequestContext.get(`${recordPath}/files`, { headers });
  expect(missingFiles.status()).toBe(404);
});
