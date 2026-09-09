import { describe, expect, it } from 'vitest';

import {
  $CreateInstrumentRecordData,
  $InstrumentRecord,
  $InstrumentRecordFile,
  $InstrumentRecordFiles,
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
