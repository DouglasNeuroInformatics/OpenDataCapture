import { expect, test } from '../support/fixtures';

/** A minimal payload satisfying the seeded happiness questionnaire's validation schema. */
const HAPPINESS_RECORD = {
  isSatisfiedOverall: true,
  personalLifeSatisfaction: 8,
  professionalLifeSatisfaction: 7
};

test.describe('instrument record upload', () => {
  // The response was previously every record in the group for the instrument, so a second upload
  // leaked the first one's records back to the caller. An earlier upload to the same group and
  // instrument is what distinguishes the scoped response from the group-wide one.
  test('should answer a batch upload with exactly the records it created', async ({ api, uniqueId }) => {
    const group = await api.createGroup();
    const instrumentId = await api.findInstrumentIdByName('DNP_HAPPINESS_QUESTIONNAIRE');
    await api.uploadRecords(group.id, instrumentId, [
      { data: HAPPINESS_RECORD, date: new Date(), subjectId: `upload-${uniqueId}-earlier` }
    ]);

    const batch = ['a', 'b', 'c'].map((suffix) => `upload-${uniqueId}-${suffix}`);
    const records = await api.uploadRecords(
      group.id,
      instrumentId,
      batch.map((subjectId) => ({ data: HAPPINESS_RECORD, date: new Date(), subjectId }))
    );

    expect(records).toHaveLength(3);
    expect(new Set(records.map((record) => record.subjectId))).toStrictEqual(new Set(batch));
  });
});
