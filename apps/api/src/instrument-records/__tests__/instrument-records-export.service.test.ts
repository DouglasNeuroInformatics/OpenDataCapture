import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { NotFoundException, StreamableFile, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS,
  INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS,
  INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE
} from '@opendatacapture/schemas/instrument-records';
import type {
  InstrumentRecordsExport,
  InstrumentRecordsExportFrame
} from '@opendatacapture/schemas/instrument-records';
import { Unpackr } from 'msgpackr';
import { beforeEach, describe, expect, it } from 'vitest';

import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';
import { InstrumentsService } from '@/instruments/instruments.service';

import { InstrumentRecordsExportService } from '../instrument-records-export.service';

import type { RawExportRecord } from '../instrument-records-export.service';

const ADMIN = createAppAbility([{ action: 'manage', subject: 'all' }]);

const decodeFrames = (buffer: Buffer): InstrumentRecordsExportFrame[] => {
  const unpackr = new Unpackr({ structures: [] });
  const frames: InstrumentRecordsExportFrame[] = [];
  let offset = 0;
  while (offset < buffer.byteLength) {
    const frameLength = buffer.readUInt32BE(offset);
    offset += 4;
    frames.push(
      ...(unpackr.unpackMultiple(buffer.subarray(offset, offset + frameLength)) as InstrumentRecordsExportFrame[])
    );
    offset += frameLength;
  }
  return frames;
};

const readFrames = async (file: StreamableFile): Promise<InstrumentRecordsExportFrame[]> => {
  const chunks: Buffer[] = [];
  for await (const chunk of file.getStream()) {
    chunks.push(chunk as Buffer);
  }
  return decodeFrames(Buffer.concat(chunks));
};

const rawRecord = (overrides: Partial<RawExportRecord> = {}): RawExportRecord => ({
  computedMeasures: { score: 85 },
  date: '2025-01-02',
  groupId: 'group-1',
  id: 'record-1',
  instrumentId: 'instrument-1',
  seriesInstrumentId: null,
  session: {
    date: '2025-01-01',
    groupId: 'group-1',
    id: 'session-1',
    type: 'IN_PERSON',
    user: { username: 'jane.doe' }
  },
  subject: {
    age: 30,
    groupIds: ['group-1'],
    id: 'group-1$subject-1',
    sex: 'FEMALE'
  },
  ...overrides
});

const expectedRow: InstrumentRecordsExport[number] = {
  groupId: 'group-1',
  instrumentEdition: 2,
  instrumentName: 'Happiness Questionnaire',
  measure: 'score',
  seriesId: null,
  seriesName: null,
  sessionDate: '2025-01-01',
  sessionId: 'session-1',
  sessionType: 'IN_PERSON',
  subjectAge: 30,
  subjectId: 'subject-1',
  subjectSex: 'FEMALE',
  timestamp: '2025-01-02',
  username: 'jane.doe',
  value: 85
};

describe('InstrumentRecordsExportService', () => {
  let exportService: InstrumentRecordsExportService;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let loggingService: MockedInstance<LoggingService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentRecordsExportService,
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(LoggingService)
      ]
    }).compile();

    exportService = moduleRef.get(InstrumentRecordsExportService);
    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    instrumentsService = moduleRef.get(InstrumentsService);
    loggingService = moduleRef.get(LoggingService);
  });

  const seedSingleRecord = (record: RawExportRecord, seriesInstrumentId: null | string = null) => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: record.id, instrumentId: record.instrumentId, seriesInstrumentId }
    ]);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' },
      kind: 'FORM'
    });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([record]);
  };

  it('should stream uint32BE length-prefixed rows with subject scope removed and measure at column 4', async () => {
    seedSingleRecord(rawRecord());

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const frames = await readFrames(file);

    expect(file.getHeaders().type).toBe('application/x-msgpack');
    expect(frames).toStrictEqual([
      { done: false, rows: [expectedRow] },
      { done: true, rowCount: 1 }
    ]);
    if (frames[0] && !frames[0].done) {
      expect(Object.keys(frames[0].rows[0]!)).toStrictEqual([
        'groupId',
        'instrumentEdition',
        'instrumentName',
        'measure',
        'seriesId',
        'seriesName',
        'sessionDate',
        'sessionId',
        'sessionType',
        'subjectAge',
        'subjectId',
        'subjectSex',
        'timestamp',
        'username',
        'value'
      ]);
    }
  });

  it('should scope the upfront id lookup by ability, groupId, subjectIds, completed status, and the record cap', async () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' }
    ]);
    instrumentRecordModel.findMany.mockResolvedValueOnce([]);

    const file = await exportService.exportRecords(
      { groupId: 'group-1', subjectIds: ['subject-1', 'subject-2'] },
      { ability }
    );
    const frames = await readFrames(file);

    expect(instrumentRecordModel.findMany).toHaveBeenCalledWith({
      select: { id: true, instrumentId: true, seriesInstrumentId: true },
      take: INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS + 1,
      where: {
        AND: [
          accessibleQuery(ability, 'read', 'InstrumentRecord'),
          { groupId: 'group-1' },
          { subjectId: { in: ['subject-1', 'subject-2'] } },
          { OR: [{ pending: { isSet: false } }, { pending: null }, { pending: false }] }
        ]
      }
    });
    expect(frames).toStrictEqual([{ done: true, rowCount: 0 }]);
    expect(instrumentRecordModel.aggregateRaw).not.toHaveBeenCalled();
  });

  it('should leave subjectId unconstrained when subjectIds is omitted', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([]);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    await readFrames(file);

    expect(instrumentRecordModel.findMany.mock.lastCall?.[0].where.AND[2]).toStrictEqual({ subjectId: undefined });
  });

  it('should reject an export exceeding INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS with 422 before streaming', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce(
      Array.from({ length: INSTRUMENT_RECORDS_EXPORT_MAX_RECORDS + 1 }, (_, i) => ({
        id: `record-${i}`,
        instrumentId: 'instrument-1',
        seriesInstrumentId: null
      }))
    );

    await expect(exportService.exportRecords({}, { ability: ADMIN })).rejects.toBeInstanceOf(
      UnprocessableEntityException
    );
    expect(instrumentRecordModel.aggregateRaw).not.toHaveBeenCalled();
  });

  it('should project foreign keys directly and normalize nullable joined fields with $ifNull in each raw page query', async () => {
    const id = '507f1f77bcf86cd799439011';
    seedSingleRecord(rawRecord({ id }));

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    await readFrames(file);

    const [{ pipeline }] = instrumentRecordModel.aggregateRaw.mock.lastCall as [{ pipeline: any[] }];
    expect(pipeline[0]).toStrictEqual({
      $match: { _id: { $in: [{ $oid: id }] } }
    });
    const userLookupStage = pipeline.find((stage) => stage.$lookup?.from === 'UserModel');
    expect(userLookupStage).toBeDefined();
    const projectStage = pipeline.find((stage) => stage.$project);
    expect(projectStage.$project.subject).toStrictEqual({
      age: {
        $ifNull: [
          {
            $dateDiff: {
              endDate: '$$NOW',
              startDate: '$subject.dateOfBirth',
              unit: 'year'
            }
          },
          null
        ]
      },
      groupIds: {
        $map: {
          as: 'groupId',
          in: { $toString: '$$groupId' },
          input: { $ifNull: ['$subject.groupIds', []] }
        }
      },
      id: '$subjectId',
      sex: { $ifNull: ['$subject.sex', null] }
    });
    expect(projectStage.$project.session).toStrictEqual({
      date: {
        $ifNull: [
          {
            $dateToString: {
              date: '$session.date',
              format: '%Y-%m-%d'
            }
          },
          null
        ]
      },
      groupId: { $toString: { $ifNull: ['$session.groupId', null] } },
      id: { $toString: '$sessionId' },
      type: { $ifNull: ['$session.type', null] },
      user: { username: { $ifNull: ['$sessionUser.username', null] } }
    });
  });

  it('should export records whose joined Subject or Session was deleted or whose custom-ID subject has unset sex', async () => {
    const recordWithDeletedJoins = rawRecord({
      groupId: null,
      session: {
        date: null,
        groupId: null,
        id: 'session-fk-1',
        type: null,
        user: { username: null }
      },
      subject: {
        age: null,
        groupIds: [],
        id: 'group-1$custom-subject',
        sex: null
      }
    });
    seedSingleRecord(recordWithDeletedJoins);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const frames = await readFrames(file);

    expect(frames).toStrictEqual([
      {
        done: false,
        rows: [
          {
            ...expectedRow,
            groupId: 'root',
            sessionDate: null,
            sessionId: 'session-fk-1',
            sessionType: null,
            subjectAge: null,
            subjectId: 'custom-subject',
            subjectSex: null,
            username: 'N/A'
          }
        ]
      },
      { done: true, rowCount: 1 }
    ]);
  });

  it('should expand array measures and skip null, undefined, empty-array, or absent computedMeasures', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: null },
      { id: 'record-2', instrumentId: 'instrument-1', seriesInstrumentId: null }
    ]);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' },
      kind: 'FORM'
    });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([
      rawRecord({ computedMeasures: null, id: 'record-1' }),
      rawRecord({
        computedMeasures: {
          empty: [],
          missing: undefined,
          none: null,
          trials: [{ rt: 300 }, { correct: true, rt: 450 }]
        },
        groupId: null,
        id: 'record-2',
        session: { ...rawRecord().session, user: { username: null } }
      })
    ]);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const frames = await readFrames(file);

    expect(frames).toStrictEqual([
      {
        done: false,
        rows: [
          { ...expectedRow, groupId: 'root', measure: 'trials - rt', username: 'N/A', value: 300 },
          { ...expectedRow, groupId: 'root', measure: 'trials - correct', username: 'N/A', value: true },
          { ...expectedRow, groupId: 'root', measure: 'trials - rt', username: 'N/A', value: 450 }
        ]
      },
      { done: true, rowCount: 3 }
    ]);
  });

  it('should stream records in pages of INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE rather than querying all at once', async () => {
    const matched = Array.from({ length: INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE + 1 }, (_, i) => ({
      id: `record-${i}`,
      instrumentId: 'instrument-1',
      seriesInstrumentId: null
    }));
    instrumentRecordModel.findMany.mockResolvedValueOnce(matched);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' }
    });
    instrumentRecordModel.aggregateRaw
      .mockResolvedValueOnce([rawRecord({ id: 'record-0' })])
      .mockResolvedValueOnce([rawRecord({ id: `record-${INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE}` })]);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const frames = await readFrames(file);

    expect(instrumentRecordModel.aggregateRaw).toHaveBeenCalledTimes(2);
    const firstPageIds = (instrumentRecordModel.aggregateRaw.mock.calls[0]![0] as { pipeline: any[] }).pipeline[0]
      .$match._id.$in;
    const secondPageIds = (instrumentRecordModel.aggregateRaw.mock.calls[1]![0] as { pipeline: any[] }).pipeline[0]
      .$match._id.$in;
    expect(firstPageIds).toHaveLength(INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE);
    expect(secondPageIds).toStrictEqual([{ $oid: `record-${INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE}` }]);
    expect(frames).toHaveLength(3);
    expect(frames[2]).toStrictEqual({ done: true, rowCount: 2 });
  });

  it('should cap each emitted data frame at INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS even when a page expands to more rows', async () => {
    const computedMeasures = Object.fromEntries(
      Array.from({ length: INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS + 5 }, (_, i) => [`m_${i}`, i])
    );
    seedSingleRecord(rawRecord({ computedMeasures }));

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const frames = await readFrames(file);

    expect(frames).toMatchObject([
      { done: false, rows: { length: INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS } },
      { done: false, rows: { length: 5 } },
      { done: true, rowCount: INSTRUMENT_RECORDS_EXPORT_MAX_FRAME_ROWS + 5 }
    ]);
  });

  it('should mask joined Session and Subject metadata when the caller may read the record but not its Session or Subject', async () => {
    const ability = createAppAbility([
      { action: 'read', subject: 'InstrumentRecord' },
      { action: 'read', conditions: { groupId: { in: ['group-1'] } }, subject: 'Session' },
      { action: 'read', conditions: { groupIds: { hasSome: ['group-1'] } }, subject: 'Subject' }
    ]);
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-in-group', instrumentId: 'instrument-1', seriesInstrumentId: null },
      { id: 'record-foreign-group', instrumentId: 'instrument-1', seriesInstrumentId: null }
    ]);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' },
      kind: 'FORM'
    });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([
      rawRecord({ id: 'record-in-group' }),
      rawRecord({
        groupId: 'group-2',
        id: 'record-foreign-group',
        session: {
          date: '2025-02-01',
          groupId: 'group-2',
          id: 'session-2',
          type: 'REMOTE',
          user: { username: 'foreign.clinician' }
        },
        subject: {
          age: 45,
          groupIds: ['group-2'],
          id: 'group-2$subject-2',
          sex: 'MALE'
        }
      })
    ]);

    const file = await exportService.exportRecords({}, { ability, callerGroupIds: ['group-1'] });
    const frames = await readFrames(file);

    expect(frames).toStrictEqual([
      {
        done: false,
        rows: [
          expectedRow,
          {
            ...expectedRow,
            groupId: 'group-2',
            sessionDate: null,
            sessionId: 'session-2',
            sessionType: null,
            subjectAge: null,
            subjectId: 'subject-2',
            subjectSex: null,
            username: 'N/A'
          }
        ]
      },
      { done: true, rowCount: 2 }
    ]);
  });

  // Resolving a series title unscoped would read the name of a series owned by a group the caller
  // cannot see, and write it into a file they are handed.
  it("should resolve each referenced series title with the caller ability and groups, so no export names another group's series", async () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' },
      { action: 'read', subject: 'Instrument' }
    ]);
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: 'series-1' }
    ]);
    instrumentsService.findById
      .mockResolvedValueOnce({ id: 'instrument-1', internal: { edition: 2, name: 'X' }, kind: 'FORM' })
      .mockResolvedValueOnce({
        details: { title: 'Happiness Series' },
        id: 'series-1',
        kind: 'SERIES',
        language: 'en'
      });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([rawRecord({ seriesInstrumentId: 'series-1' })]);

    const file = await exportService.exportRecords({}, { ability, callerGroupIds: ['group-1'] });
    const frames = await readFrames(file);

    expect(instrumentsService.findById).toHaveBeenCalledWith('series-1', { ability }, ['group-1']);
    expect(frames[0]).toMatchObject({
      done: false,
      rows: [expect.objectContaining({ seriesId: 'series-1', seriesName: 'Happiness Series' })]
    });
  });

  it('should not narrow series lookups by caller groups when the caller manages all resources', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: 'series-1' }
    ]);
    instrumentsService.findById
      .mockResolvedValueOnce({ id: 'instrument-1', internal: { edition: 2, name: 'X' }, kind: 'FORM' })
      .mockResolvedValueOnce({
        details: { title: 'Admin Series' },
        id: 'series-1',
        kind: 'SERIES',
        language: 'en'
      });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([rawRecord({ seriesInstrumentId: 'series-1' })]);

    const file = await exportService.exportRecords({}, { ability: ADMIN, callerGroupIds: ['group-1'] });
    await readFrames(file);

    expect(instrumentsService.findById).toHaveBeenCalledWith('series-1', { ability: ADMIN }, undefined);
  });

  it('should emit a null seriesName when a referenced series belongs to another group or no longer exists', async () => {
    const ability = createAppAbility([
      { action: 'read', subject: 'InstrumentRecord' },
      { action: 'read', subject: 'Instrument' }
    ]);
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: 'foreign-series' }
    ]);
    instrumentsService.findById
      .mockResolvedValueOnce({ id: 'instrument-1', internal: { edition: 2, name: 'X' }, kind: 'FORM' })
      .mockRejectedValueOnce(new NotFoundException());
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([rawRecord({ seriesInstrumentId: 'foreign-series' })]);

    const file = await exportService.exportRecords({}, { ability, callerGroupIds: ['group-1'] });
    const frames = await readFrames(file);

    expect(frames[0]).toMatchObject({
      done: false,
      rows: [expect.objectContaining({ seriesId: 'foreign-series', seriesName: null })]
    });
  });

  it('should emit a null seriesName without querying series instruments when the caller lacks read Instrument permission', async () => {
    const ability = createAppAbility([
      { action: 'read', conditions: { groupId: 'group-1' }, subject: 'InstrumentRecord' }
    ]);
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: 'series-1' }
    ]);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'X' },
      kind: 'FORM'
    });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([rawRecord({ seriesInstrumentId: 'series-1' })]);

    const file = await exportService.exportRecords({}, { ability, callerGroupIds: ['group-1'] });
    const frames = await readFrames(file);

    expect(instrumentsService.findById).toHaveBeenCalledTimes(1);
    expect(instrumentsService.findById).toHaveBeenCalledWith('instrument-1');
    expect(frames[0]).toMatchObject({
      done: false,
      rows: [expect.objectContaining({ seriesId: 'series-1', seriesName: null })]
    });
  });

  it('should propagate unexpected errors thrown while resolving series titles', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: 'series-1' }
    ]);
    instrumentsService.findById
      .mockResolvedValueOnce({ id: 'instrument-1', internal: { edition: 2, name: 'X' }, kind: 'FORM' })
      .mockRejectedValueOnce(new Error('database unavailable'));

    await expect(exportService.exportRecords({}, { ability: ADMIN })).rejects.toThrow('database unavailable');
  });

  it('should reject with 422 when a matched record references a series instrument as its scalar instrumentId', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'series-1', seriesInstrumentId: null }
    ]);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'series-1',
      kind: 'SERIES'
    });

    await expect(exportService.exportRecords({}, { ability: ADMIN })).rejects.toBeInstanceOf(
      UnprocessableEntityException
    );
  });

  it('should log and rethrow when a raw page record references an instrument missing from the resolved map', async () => {
    instrumentRecordModel.findMany.mockResolvedValueOnce([
      { id: 'record-1', instrumentId: 'instrument-1', seriesInstrumentId: null }
    ]);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' },
      kind: 'FORM'
    });
    instrumentRecordModel.aggregateRaw.mockResolvedValueOnce([rawRecord({ instrumentId: 'unexpected-instrument' })]);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    await expect(readFrames(file)).rejects.toThrow('Instrument not found for ID: unexpected-instrument');
    expect(loggingService.error).toHaveBeenCalledWith({
      error: expect.objectContaining({ message: 'Instrument not found for ID: unexpected-instrument' }),
      message: 'Failed to stream instrument records export page'
    });
  });

  it('should log and rethrow when a page fails mid-stream, so Fastify returns 500 pre-headers or destroys the socket post-headers', async () => {
    const matched = Array.from({ length: INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE + 1 }, (_, i) => ({
      id: `record-${i}`,
      instrumentId: 'instrument-1',
      seriesInstrumentId: null
    }));
    instrumentRecordModel.findMany.mockResolvedValueOnce(matched);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' }
    });
    const error = new Error('page query failed');
    instrumentRecordModel.aggregateRaw
      .mockResolvedValueOnce([rawRecord({ id: 'record-0' })])
      .mockRejectedValueOnce(error);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const receivedChunks: Buffer[] = [];
    await expect(
      (async () => {
        for await (const chunk of file.getStream()) {
          receivedChunks.push(chunk as Buffer);
        }
      })()
    ).rejects.toThrow('page query failed');

    expect(decodeFrames(Buffer.concat(receivedChunks))).toStrictEqual([{ done: false, rows: [expectedRow] }]);
    expect(loggingService.error).toHaveBeenCalledWith({
      error,
      message: 'Failed to stream instrument records export page'
    });
  });

  it('should stop querying remaining pages cleanly when the consumer destroys the stream early', async () => {
    const matched = Array.from({ length: INSTRUMENT_RECORDS_EXPORT_PAGE_SIZE * 4 + 1 }, (_, i) => ({
      id: `record-${i}`,
      instrumentId: 'instrument-1',
      seriesInstrumentId: null
    }));
    instrumentRecordModel.findMany.mockResolvedValueOnce(matched);
    instrumentsService.findById.mockResolvedValueOnce({
      id: 'instrument-1',
      internal: { edition: 2, name: 'Happiness Questionnaire' }
    });
    instrumentRecordModel.aggregateRaw.mockResolvedValue([rawRecord({ id: 'record-0' })]);

    const file = await exportService.exportRecords({}, { ability: ADMIN });
    const stream = file.getStream();
    for await (const chunk of stream) {
      expect(chunk).toBeDefined();
      stream.destroy();
      break;
    }

    expect(instrumentRecordModel.aggregateRaw.mock.calls.length).toBeLessThan(5);
  });
});
