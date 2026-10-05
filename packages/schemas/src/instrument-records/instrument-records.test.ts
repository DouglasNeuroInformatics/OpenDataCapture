import { describe, expect, it } from 'vitest';

import {
  $CreateInstrumentRecordData,
  $InstrumentRecord,
  $InstrumentRecordFile,
  $InstrumentRecordFiles,
  $InstrumentRecordSummary,
  $LinearRegressionResults,
  $UpdateInstrumentRecordData,
  $UploadInstrumentRecordsData
} from './instrument-records.js';

describe('$CreateInstrumentRecordData', () => {
  it('should accept the required fields with the optional ones omitted', () => {
    expect(
      $CreateInstrumentRecordData.safeParse({
        data: { value: 1 },
        date: '2024-01-01',
        instrumentId: 'instrument-1',
        sessionId: 'session-1',
        subjectId: 'subject-1'
      }).success
    ).toBe(true);
  });
  it('should reject a value missing instrumentId', () => {
    expect(
      $CreateInstrumentRecordData.safeParse({
        data: { value: 1 },
        date: '2024-01-01',
        sessionId: 'session-1',
        subjectId: 'subject-1'
      }).success
    ).toBe(false);
  });
});

describe('$UpdateInstrumentRecordData', () => {
  it('should accept a record data', () => {
    expect($UpdateInstrumentRecordData.safeParse({ data: { value: 1 } }).success).toBe(true);
  });
  it('should accept an array data', () => {
    expect($UpdateInstrumentRecordData.safeParse({ data: [1, 2, 3] }).success).toBe(true);
  });
});

describe('$UploadInstrumentRecordsData', () => {
  it('should accept a list of records with the optional fields omitted', () => {
    expect(
      $UploadInstrumentRecordsData.safeParse({
        instrumentId: 'instrument-1',
        records: [{ data: { value: 1 }, date: '2024-01-01', subjectId: 'subject-1' }]
      }).success
    ).toBe(true);
  });
});

describe('$InstrumentRecord', () => {
  it('should accept a record with only its required fields', () => {
    expect(
      $InstrumentRecord.safeParse({
        createdAt: '2024-01-01',
        data: { value: 1 },
        date: '2024-01-01',
        id: 'record-1',
        instrumentId: 'instrument-1',
        sessionId: 'session-1',
        subjectId: 'subject-1',
        updatedAt: '2024-01-01'
      }).success
    ).toBe(true);
  });
  it('should reject a record missing sessionId', () => {
    expect(
      $InstrumentRecord.safeParse({
        createdAt: '2024-01-01',
        data: { value: 1 },
        date: '2024-01-01',
        id: 'record-1',
        instrumentId: 'instrument-1',
        subjectId: 'subject-1',
        updatedAt: '2024-01-01'
      }).success
    ).toBe(false);
  });
});

describe('$InstrumentRecord session metadata', () => {
  const base = {
    createdAt: '2024-01-01',
    data: { value: 1 },
    date: '2024-01-01',
    id: 'record-1',
    instrumentId: 'instrument-1',
    sessionId: 'session-1',
    subjectId: 'subject-1',
    updatedAt: '2024-01-01'
  };
  it('should accept the data collection method on the session, which is the column the datahub renders', () => {
    const result = $InstrumentRecord.safeParse({ ...base, session: { type: 'REMOTE', user: { username: 'alice' } } });
    expect(result.success).toBe(true);
    expect(result.data?.session?.type).toBe('REMOTE');
  });
  // A record whose session was deleted reads back without a type, which must not fail the response.
  it('should accept a null collection method', () => {
    expect($InstrumentRecord.safeParse({ ...base, session: { type: null, user: null } }).success).toBe(true);
  });
  it('should reject a collection method that is not a session type', () => {
    expect($InstrumentRecord.safeParse({ ...base, session: { type: 'IN_CLINIC' } }).success).toBe(false);
  });
});

describe('$InstrumentRecordSummary', () => {
  const base = { instrumentId: 'instrument-1', lastCollectedAt: '2024-01-01', recordCount: 5, subjectCount: 3 };
  it('should accept a summary and coerce its collection date', () => {
    const result = $InstrumentRecordSummary.safeParse(base);
    expect(result.success).toBe(true);
    expect(result.data?.lastCollectedAt).toStrictEqual(new Date('2024-01-01'));
  });
  // An instrument accessible to the caller but never collected has no date to report.
  it('should accept a null collection date', () => {
    expect($InstrumentRecordSummary.safeParse({ ...base, lastCollectedAt: null }).success).toBe(true);
  });
  it('should reject a negative count, which no aggregation can legitimately produce', () => {
    expect($InstrumentRecordSummary.safeParse({ ...base, recordCount: -1 }).success).toBe(false);
  });
  it('should reject a fractional subject count, since subjects are counted not measured', () => {
    expect($InstrumentRecordSummary.safeParse({ ...base, subjectCount: 1.5 }).success).toBe(false);
  });
});

describe('$LinearRegressionResults', () => {
  it('should accept a record of measure name to intercept, slope and stdErr', () => {
    expect($LinearRegressionResults.safeParse({ score: { intercept: 0, slope: 1, stdErr: 0.5 } }).success).toBe(true);
  });
});

describe('$InstrumentRecordFile', () => {
  it('should accept a presigned file with an expiry and URL', () => {
    expect(
      $InstrumentRecordFile.safeParse({
        exp: 1700000000,
        name: 'file.txt',
        size: 100,
        url: 'https://example.org/file.txt'
      }).success
    ).toBe(true);
  });
});

describe('$InstrumentRecordFiles', () => {
  it('should accept a record of field name to an array of presigned files', () => {
    expect(
      $InstrumentRecordFiles.safeParse({
        upload: [{ exp: 1700000000, name: 'file.txt', size: 100, url: 'https://example.org/file.txt' }]
      }).success
    ).toBe(true);
  });
});
