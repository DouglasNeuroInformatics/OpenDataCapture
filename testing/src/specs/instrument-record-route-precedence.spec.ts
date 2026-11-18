import { expect, test } from '../support/fixtures';

test.describe('instrument record route precedence', () => {
  test('should resolve a fixed linear-model path before the dynamic record-id path', async ({
    adminToken,
    api,
    apiRequestContext
  }) => {
    const group = await api.createGroup();
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');

    const response = await apiRequestContext.get('/api/v1/instrument-records/linear-model', {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { groupId: group.id, instrumentId }
    });

    expect(response.status()).toBe(200);
    const model = (await response.json()) as { [key: string]: unknown };
    expect(model).toEqual({});
  });
});
