import { cpus } from 'os';
import { join } from 'path';
import { Worker } from 'worker_threads';

import { replacer, reviver } from '@douglasneuroinformatics/libjs';
import { InjectModel, InjectPrismaClient, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { linearRegression } from '@douglasneuroinformatics/libstats';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException
} from '@nestjs/common';
import { translateInstrument } from '@opendatacapture/instrument-utils';
import type { Json, ScalarInstrument } from '@opendatacapture/runtime-core';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
  InstrumentRecordsExport,
  InstrumentRecordSummary,
  LinearRegressionResults,
  SubjectRecordSummary,
  UploadInstrumentRecordsData
} from '@opendatacapture/schemas/instrument-records';
import { Prisma } from '@prisma/client';
import type { InstrumentRecord as PrismaInstrumentRecord } from '@prisma/client';
import { isNumber, mergeWith, pickBy } from 'lodash-es';

import { accessibleQuery, forcedAppSubject } from '@/auth/ability.utils';
import type { AppAbility } from '@/auth/auth.types';
import type { RuntimePrismaClient } from '@/core/prisma';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { StorageService } from '@/storage/storage.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

import { InstrumentMeasuresService } from './instrument-measures.service';

import type {
  BeginChunkProcessingMessage,
  InitData,
  InitialMessage,
  InitMessage,
  RecordType,
  WorkerMessage
} from './thread-types';

@Injectable()
export class InstrumentRecordsService {
  constructor(
    @InjectPrismaClient() private readonly prismaClient: RuntimePrismaClient,
    private readonly loggingService: LoggingService,
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    @InjectModel('Session') private readonly sessionModel: Model<'Session'>,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly instrumentMeasuresService: InstrumentMeasuresService,
    private readonly instrumentsService: InstrumentsService,
    private readonly sessionsService: SessionsService,
    private readonly storageService: StorageService,
    private readonly subjectsService: SubjectsService
  ) {}

  async count(
    filter: Prisma.InstrumentRecordWhereInput = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<number> {
    return this.instrumentRecordModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), filter] }
    });
  }

  async create(
    {
      data: rawData,
      date,
      groupId,
      instrumentId,
      seriesInstrumentId,
      sessionId,
      subjectId
    }: CreateInstrumentRecordData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecord> {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }
    const instrumentGroupIds = groupId ? [groupId] : undefined;
    const instrument = await this.instrumentsService.findById(instrumentId, options, instrumentGroupIds);
    if (instrument.kind === 'SERIES') {
      throw new UnprocessableEntityException(
        `Cannot create instrument record for series instrument '${instrument.id}'`
      );
    }
    if (instrument.kind === 'FILE' && !this.storageService.isEnabled) {
      throw new ServiceUnavailableException(
        `Cannot create instrument record for file instrument '${instrument.id}': file storage is not configured`
      );
    }

    // When the record was collected through a series instrument, verify the reference points at an
    // actual series before persisting it in the record's metadata.
    if (seriesInstrumentId) {
      const seriesInstrument = await this.instrumentsService.findById(seriesInstrumentId, options, instrumentGroupIds);
      if (seriesInstrument.kind !== 'SERIES') {
        throw new UnprocessableEntityException(
          `Instrument '${seriesInstrumentId}' referenced as seriesInstrumentId is not a series instrument`
        );
      }
    }

    await this.subjectsService.findById(subjectId);
    await this.sessionsService.findById(sessionId);

    const parseResult = instrument.validationSchema.safeParse(this.parseJson(rawData));
    if (!parseResult.success) {
      throw new UnprocessableEntityException({
        error: 'Unprocessable Entity',
        issues: parseResult.error.issues,
        message: `Data received for record does not pass validation schema of instrument '${instrument.id}'`,
        statusCode: 422
      });
    }

    return this.instrumentRecordModel.create({
      data: {
        computedMeasures: instrument.measures
          ? this.instrumentMeasuresService.computeMeasures(instrument.measures, parseResult.data)
          : null,
        data: this.serializeData(parseResult.data),
        date,
        group: groupId
          ? {
              connect: { id: groupId }
            }
          : undefined,
        instrument: {
          connect: {
            id: instrumentId
          }
        },
        pending: instrument.kind === 'FILE',
        seriesInstrument: seriesInstrumentId
          ? {
              connect: {
                id: seriesInstrumentId
              }
            }
          : undefined,
        session: {
          connect: {
            id: sessionId
          }
        },
        subject: {
          connect: {
            id: subjectId
          }
        }
      }
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const where = { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], id };
    const record = await this.instrumentRecordModel.findFirst({ where });
    if (!record) {
      throw new NotFoundException(`Could not find record with ID '${id}'`);
    }
    const files = await this.prismaClient.instrumentRecordFile.findMany({ where: { recordId: record.id } });
    const [, deletedRecord] = await this.prismaClient.$transaction([
      this.prismaClient.instrumentRecordFile.deleteMany({ where: { id: { in: files.map((file) => file.id) } } }),
      this.prismaClient.instrumentRecord.delete({ where })
    ]);
    const storageFiles = files.map(({ basename, groupId, index, recordId }) => ({
      groupId,
      location: { basename, index },
      recordId
    }));
    try {
      await this.storageService.deleteObjects(storageFiles);
    } catch (error) {
      this.loggingService.error({
        error,
        files: storageFiles,
        message: `Failed to delete storage objects after deleting record '${id}'; orphaned objects require cleanup`
      });
    }
    return deletedRecord;
  }

  async exists(where: Prisma.InstrumentRecordWhereInput): Promise<boolean> {
    return this.instrumentRecordModel.exists(where);
  }

  async exportRecords(
    { groupId }: { groupId?: string } = {},
    { ability }: Required<Pick<EntityOperationOptions, 'ability'>>
  ): Promise<InstrumentRecordsExport> {
    const records = await this.queryRecordsRaw(ability, groupId);

    const instrumentIds = new Set(records.map((r) => r.instrumentId));

    const instrumentsArray = await Promise.all(
      instrumentIds.values().map((id) => this.instrumentsService.findById(id) as Promise<ScalarInstrument>)
    );

    const instruments = new Map(instrumentsArray.map((instrument) => [instrument.id, instrument]));

    const seriesNames = await this.resolveSeriesNames(records);

    const numWorkers = Math.min(cpus().length, Math.ceil(records.length / 100)); // Use up to CPU count, chunk size 100
    const chunkSize = Math.ceil(records.length / numWorkers);
    const chunks = [];

    for (let i = 0; i < records.length; i += chunkSize) {
      chunks.push(records.slice(i, i + chunkSize));
    }

    const availableInstrumentArray: InitData = instruments
      .values()
      .toArray()
      .map((item) => {
        return {
          edition: item.internal.edition,
          id: item.id!,
          name: item.internal.name
        };
      });

    const workerPromises = chunks.map((chunk) => {
      return new Promise<InstrumentRecordsExport>((resolve, reject) => {
        const worker = new Worker(join(import.meta.dirname, 'export-worker.js'));
        worker.postMessage({
          data: { instruments: availableInstrumentArray, seriesNames },
          type: 'INIT'
        } satisfies InitMessage);

        worker.on('message', (message: InitialMessage) => {
          if (message.success) {
            worker.postMessage({ data: chunk, type: 'BEGIN_CHUNK_PROCESSING' } satisfies BeginChunkProcessingMessage);
            worker.on('message', (message: WorkerMessage) => {
              if (message.success) {
                resolve(message.data);
              } else {
                reject(new Error(message.error));
              }
              void worker.terminate();
            });
          }
        });

        worker.on('error', (error) => {
          reject(error as Error);
          void worker.terminate();
        });
      });
    });

    const results = await Promise.all(workerPromises);

    return results.flat();
  }

  async find(
    { groupId, instrumentId, kind, minDate, seriesInstrumentId, subjectId }: InstrumentRecordQueryParams,
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentRecord[]> {
    if (groupId) {
      await this.groupsService.findById(groupId);
    }
    if (instrumentId) {
      await this.instrumentsService.findById(instrumentId);
    }
    if (seriesInstrumentId) {
      const series = await this.instrumentsService.findById(seriesInstrumentId);
      if (series.kind !== 'SERIES') {
        throw new UnprocessableEntityException(
          `Instrument '${seriesInstrumentId}' is not a series instrument, so it orchestrates no records`
        );
      }
    }

    const instrumentKindIds = await this.instrumentsService
      .find({ kind })
      .then((instruments) => instruments.map((instrument) => instrument.id));

    const records = await this.instrumentRecordModel.findMany({
      include: {
        instrument: false
      },
      where: {
        AND: [
          { date: { gte: minDate } },
          { groupId },
          { instrumentId },
          { instrumentId: { in: instrumentKindIds } },
          { seriesInstrumentId },
          accessibleQuery(ability, 'read', 'InstrumentRecord'),
          { subjectId },
          // records created before the file instrument feature do not have the pending field at all,
          // and prisma NOT filters on mongodb exclude documents where the field is missing entirely
          { OR: [{ pending: { isSet: false } }, { pending: null }, { pending: false }] }
        ]
      }
    });

    // The per-subject, per-instrument and per-series views render the collection method and username
    // columns; /dashboard fetches every record in the group and reads `instrumentId` alone, so
    // labelling there would buy a second query with an `$in` as long as the group's record list for
    // fields it throws away. Any of these filters bounds the set enough to be worth joining.
    if (!subjectId && !instrumentId && !seriesInstrumentId) {
      return records;
    }

    return this.withSessionMetadata(records, ability);
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const record = await this.instrumentRecordModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord')], id }
    });
    if (!record) {
      throw new NotFoundException();
    }
    return record;
  }

  async linearModel(
    { groupId, instrumentId }: { groupId?: string; instrumentId: string },
    { ability }: EntityOperationOptions = {}
  ): Promise<LinearRegressionResults> {
    if (groupId) {
      await this.groupsService.findById(groupId);
    }
    const instrument = await this.getInstrumentById(instrumentId);

    if (instrument.kind === 'SERIES') {
      throw new UnprocessableEntityException(`Cannot create linear model for series instrument '${instrument.id}'`);
    }

    if (!instrument.measures) {
      return {};
    }

    const records = await this.instrumentRecordModel.findMany({
      include: { instrument: true },
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), { groupId }, { instrumentId }] }
    });

    if (3 > records.length) {
      return {};
    }

    const data: { [key: string]: [x: number[], y: number[]] } = {};
    for (const record of records) {
      const numericMeasures = pickBy(record.computedMeasures, isNumber);
      for (const measure in numericMeasures) {
        const x = record.date.getTime();
        const y = numericMeasures[measure]!;
        if (Array.isArray(data[measure])) {
          data[measure][0].push(x);
          data[measure][1].push(y);
        } else {
          data[measure] = [[x], [y]];
        }
      }
    }

    const results: LinearRegressionResults = {};
    for (const measure in data) {
      results[measure] = linearRegression(new Float64Array(data[measure]![0]), new Float64Array(data[measure]![1]));
    }
    return results;
  }

  /**
   * Per-instrument collection statistics for the instrument hub's listing.
   *
   * See `summarizeRecords` for why the fold happens in JS rather than in the aggregation.
   */
  async summarizeByInstrument(
    { groupId }: { groupId?: string } = {},
    { ability }: Required<Pick<EntityOperationOptions, 'ability'>>
  ): Promise<InstrumentRecordSummary[]> {
    const summaries = await this.summarizeRecords('instrumentId', groupId, ability);
    return Array.from(summaries, ([instrumentId, summary]) => ({
      instrumentId,
      lastCollectedAt: summary.lastCollectedAt,
      recordCount: summary.recordCount,
      subjectCount: summary.subjectIds.size
    }));
  }

  /**
   * Per-series collection statistics: everything a series orchestrated, across the scalar
   * instruments it composes. This is what makes a series row in the instrument hub worth opening.
   */
  async summarizeBySeries(
    { groupId }: { groupId?: string } = {},
    { ability }: Required<Pick<EntityOperationOptions, 'ability'>>
  ): Promise<InstrumentRecordSummary[]> {
    const summaries = await this.summarizeRecords('seriesInstrumentId', groupId, ability);
    return Array.from(summaries, ([instrumentId, summary]) => ({
      instrumentId,
      lastCollectedAt: summary.lastCollectedAt,
      recordCount: summary.recordCount,
      subjectCount: summary.subjectIds.size
    }));
  }

  /** Per-subject collection statistics for the subject hub's listing. */
  async summarizeBySubject(
    { groupId }: { groupId?: string } = {},
    { ability }: Required<Pick<EntityOperationOptions, 'ability'>>
  ): Promise<SubjectRecordSummary[]> {
    const summaries = await this.summarizeRecords('subjectId', groupId, ability);
    return Array.from(summaries, ([subjectId, summary]) => ({
      lastCollectedAt: summary.lastCollectedAt,
      recordCount: summary.recordCount,
      subjectId
    }));
  }

  async updateById(id: string, data: unknown[] | { [key: string]: unknown }, { ability }: EntityOperationOptions = {}) {
    const instrumentRecord = await this.instrumentRecordModel.findFirst({
      where: { id }
    });
    if (!instrumentRecord) {
      throw new NotFoundException(`Could not find record with ID '${id}'`);
    }

    if (Array.isArray(instrumentRecord.data) && !Array.isArray(data)) {
      throw new BadRequestException('Data must be an array when the instrument record data is an array');
    }

    // all records must be attached to scalar instruments
    const instrument = (await this.getInstrumentById(instrumentRecord.instrumentId)) as ScalarInstrument;

    const updatedData = mergeWith(instrumentRecord.data, data, (updatedValue: unknown, sourceValue: unknown) => {
      if (Array.isArray(sourceValue)) {
        return updatedValue;
      }
      return undefined;
    });

    const parseResult = await instrument.validationSchema.safeParseAsync(updatedData);
    if (!parseResult.success) {
      throw new BadRequestException({
        issues: parseResult.error.issues,
        message: 'Merged data does not match validation schema'
      });
    }

    return this.instrumentRecordModel.update({
      data: {
        computedMeasures: instrument.measures
          ? this.instrumentMeasuresService.computeMeasures(instrument.measures, parseResult.data as Json)
          : null,
        data: parseResult.data
      },
      where: { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], id }
    });
  }

  async upload(
    { groupId, instrumentId, records, username }: UploadInstrumentRecordsData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecord[]> {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }

    const instrument = await this.instrumentsService.findById(instrumentId, options);
    if (instrument.kind === 'SERIES') {
      throw new UnprocessableEntityException(
        `Cannot create instrument record for series instrument '${instrument.id}'`
      );
    }
    // A bulk-uploaded file record could never be completed: the payload schema has nowhere to carry a
    // file, this path never attaches one, and the response ids the client would need to attach one
    // afterwards are discarded. Refuse it rather than write a record that can only ever be pending.
    if (instrument.kind === 'FILE') {
      throw new UnprocessableEntityException(
        `Cannot create instrument record for file instrument '${instrument.id}': files cannot be attached to a bulk upload`
      );
    }

    if (username) {
      const user = await this.usersService.findByUsername(username, options);
      if (groupId && !user.groups.some((g) => g.id === groupId)) {
        throw new ForbiddenException(`User '${username}' is not a member of group '${groupId}'`);
      }
      if (!groupId && user.basePermissionLevel !== 'ADMIN') {
        throw new ForbiddenException(`The Non-Admin User '${username}' must be part of a group`);
      }
    }

    // Every record is validated before anything is written, so a malformed record in the middle of a
    // batch rejects the request without first creating sessions that then have to be rolled back.
    const validatedRecords = records.map((record, index) => {
      const parseResult = instrument.validationSchema.safeParse(this.parseJson(record.data));
      if (!parseResult.success) {
        throw new UnprocessableEntityException({
          error: 'Unprocessable Entity',
          issues: parseResult.error.issues,
          message: `Data received for record at index ${index} does not pass validation schema of instrument '${instrument.id}'`,
          statusCode: 422
        });
      }
      return { data: parseResult.data, date: record.date, subjectId: record.subjectId };
    });

    // One batched call rather than one session creation per record, which cost several queries each.
    // Returned in input order, so each record can be paired with its session by index.
    const sessions = await this.sessionsService.createMany(
      {
        entries: validatedRecords.map((record) => ({
          date: record.date,
          subjectData: { id: record.subjectId }
        })),
        groupId: groupId ?? null,
        type: 'RETROSPECTIVE',
        username: username ?? undefined
      },
      options
    );

    // Only the insert is rolled back on failure. Deleting the sessions after it has succeeded would
    // strand the records that now reference them, so the read-back below sits outside the catch.
    try {
      await this.instrumentRecordModel.createMany({
        data: validatedRecords.map((record, index) => ({
          computedMeasures: instrument.measures
            ? this.instrumentMeasuresService.computeMeasures(instrument.measures, record.data)
            : null,
          data: this.serializeData(record.data),
          date: record.date,
          groupId,
          instrumentId,
          pending: false,
          sessionId: sessions[index]!.id,
          subjectId: record.subjectId
        }))
      });
    } catch (err) {
      await this.sessionsService.deleteByIds(sessions.map((session) => session.id));
      throw err;
    }

    // Only the rows this call wrote. Filtering by instrument alone returned every group's records
    // when `groupId` was omitted, and `accessibleQuery` cannot scope this read: a STANDARD uploader
    // holds no `read InstrumentRecord` rule, which makes CASL throw rather than filter.
    return this.instrumentRecordModel.findMany({
      where: {
        sessionId: { in: sessions.map((session) => session.id) }
      }
    });
  }

  private getInstrumentById(instrumentId: string) {
    return this.instrumentsService
      .findById(instrumentId)
      .then((instrument) => this.instrumentsService.getInstrumentInstance(instrument));
  }

  private parseJson(data: unknown) {
    return JSON.parse(JSON.stringify(data), reviver) as unknown;
  }

  private async queryRecordsRaw(appAbility: AppAbility, groupId?: string) {
    const pipeline = [
      {
        // Join with Session collection
        $lookup: {
          as: 'session',
          foreignField: '_id',
          from: 'SessionModel',
          localField: 'sessionId' // Ensure this matches your @map or field name in Prisma
        }
      },
      { $unwind: { path: '$session', preserveNullAndEmptyArrays: true } },
      {
        // session.userId is an ObjectId reference to UserModel, but a small number of legacy
        // sessions have it stored as a plain string; $convert normalizes both to a real ObjectId
        // (or null, if the session has no user) so the following $lookup can match on it.
        $addFields: {
          'session.userObjectId': {
            $convert: { input: '$session.userId', onError: null, onNull: null, to: 'objectId' }
          }
        }
      },
      {
        // Join with User collection, to resolve the username of whoever ran the session
        $lookup: {
          as: 'sessionUser',
          foreignField: '_id',
          from: 'UserModel',
          localField: 'session.userObjectId'
        }
      },
      { $unwind: { path: '$sessionUser', preserveNullAndEmptyArrays: true } },
      {
        // Join with Subject collection
        $lookup: {
          as: 'subject',
          foreignField: '_id',
          from: 'SubjectModel',
          localField: 'subjectId'
        }
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $expr: groupId
            ? {
                $eq: ['$groupId', { $toObjectId: groupId }]
              }
            : {}
        }
      },
      {
        $project: {
          computedMeasures: 1,
          date: {
            $dateToString: {
              date: '$createdAt',
              format: '%Y-%m-%d'
            }
          },
          // `$ifNull` for the same reason as in `summarizeRecords`: `$toString` of a missing field is
          // itself missing, so a record belonging to no group would drop `groupId` from the row
          // entirely and arrive as undefined behind a type that says it is a string.
          groupId: { $toString: { $ifNull: ['$groupId', null] } },
          id: {
            $toString: '$_id'
          },
          instrumentId: 1,
          seriesInstrumentId: { $ifNull: ['$seriesInstrumentId', null] },
          session: {
            date: {
              $dateToString: {
                date: '$session.date',
                format: '%Y-%m-%d'
              }
            },
            id: {
              $toString: '$session._id'
            },
            type: '$session.type',
            user: { username: '$sessionUser.username' }
          },
          // sessionId: 1,
          subject: {
            age: {
              $dateDiff: {
                endDate: '$$NOW',
                startDate: '$subject.dateOfBirth',
                unit: 'year'
              }
            },
            dateOfBirth: '$subject.dateOfBirth',
            groupIds: '$subject.groupIds', // TBD make sure groupIds is string array
            id: {
              $toString: '$subject._id'
            },
            sex: '$subject.sex'
          }
        }
      }
    ];

    const records = (await this.instrumentRecordModel.aggregateRaw({ pipeline })) as unknown as RecordType[];

    /**
     * We need to create a shallow copy of all records here, as the aggregateRaw method returns objects
     * with the Symbol(nodejs.util.inspect.custom) property defined, which is not serializable.
     */

    // Raw rows carry no model name, so CASL would resolve them as `Object` and match only `manage all`
    return records
      .filter((record) => appAbility.can('read', forcedAppSubject('InstrumentRecord', { groupId: record.groupId })))
      .map((record) => ({ ...record }));
  }

  /**
   * Map every series instrument referenced by these records to its title.
   *
   * A series instrument has no `internal.name`, so unlike the scalar instruments beside it in the
   * export there is no language-independent identifier to use — the title is translated here, to
   * `en`, because a background worker has no request language. The stable identifier an analysis
   * should key on is the accompanying `seriesId`.
   */
  private async resolveSeriesNames(records: RecordType[]): Promise<{ [id: string]: string }> {
    const seriesIds = new Set(
      records.flatMap((record) => (record.seriesInstrumentId ? [record.seriesInstrumentId] : []))
    );
    const entries = await Promise.all(
      seriesIds.values().map(async (id) => {
        const instrument = await this.instrumentsService.findById(id);
        return [id, translateInstrument(instrument, 'en').details.title] as const;
      })
    );
    return Object.fromEntries(entries);
  }

  private serializeData(data: unknown) {
    return JSON.parse(JSON.stringify(data, replacer)) as unknown;
  }

  /**
   * Record counts, distinct subjects and the latest collection date, keyed by `by`.
   *
   * Aggregation groups by group, key and subject rather than by the key alone, and the final fold
   * happens here in JS, for two reasons: the per-row `groupId` is what the ability check needs, and
   * unioning subject ids across groups is what makes a distinct subject count exact for an unscoped
   * caller instead of a sum that counts a shared subject twice. The grouped set is bounded by
   * subjects × keys, not by records.
   */
  private async summarizeRecords(
    by: 'instrumentId' | 'seriesInstrumentId' | 'subjectId',
    groupId: string | undefined,
    ability: AppAbility
  ): Promise<Map<string, { lastCollectedAt: Date | null; recordCount: number; subjectIds: Set<string> }>> {
    if (groupId) {
      await this.groupsService.findById(groupId);
    }

    const pipeline = [
      {
        $match: {
          // records created before the file instrument feature do not have the field at all
          $or: [{ pending: { $exists: false } }, { pending: null }, { pending: false }],
          ...(groupId ? { $expr: { $eq: ['$groupId', { $toObjectId: groupId }] } } : {})
        }
      },
      {
        // `$ifNull` is load-bearing, not defensive. A grouping expression that resolves to nothing —
        // `seriesInstrumentId` on a record collected outside any series, `groupId` on one belonging
        // to no group — is omitted from `_id` entirely rather than stored as null, and `$project`
        // then omits the field from the row too. Normalising here is what lets every consumer below
        // treat the shape as fixed instead of remembering that a key can simply be missing.
        $group: {
          _id: {
            groupId: { $ifNull: ['$groupId', null] },
            key: { $ifNull: [`$${by}`, null] },
            subjectId: { $ifNull: ['$subjectId', null] }
          },
          lastCollectedAt: { $max: '$date' },
          recordCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          groupId: { $toString: '$_id.groupId' },
          key: '$_id.key',
          lastCollectedAt: { $dateToString: { date: '$lastCollectedAt' } },
          recordCount: 1,
          subjectId: '$_id.subjectId'
        }
      }
    ];

    /**
     * Every field is present because the pipeline normalises each grouping key with `$ifNull`; the
     * nullable ones are genuinely null rather than absent. Keep that guarantee if the pipeline
     * changes, or the optionality has to come back here and at every use below.
     */
    const rows = (await this.instrumentRecordModel.aggregateRaw({ pipeline })) as unknown as {
      groupId: null | string;
      key: null | string;
      lastCollectedAt: null | string;
      recordCount: number;
      subjectId: null | string;
    }[];

    const summaries = new Map<string, { lastCollectedAt: Date | null; recordCount: number; subjectIds: Set<string> }>();
    for (const row of rows) {
      // Raw rows carry no model name, so CASL would resolve them as `Object` and match only `manage all`
      if (!ability.can('read', forcedAppSubject('InstrumentRecord', { groupId: row.groupId }))) {
        continue;
      }
      // Grouping by series buckets every record collected outside one under a null key. Those are
      // not a series and have no row to belong to.
      if (row.key === null) {
        continue;
      }
      let summary = summaries.get(row.key);
      if (!summary) {
        summary = { lastCollectedAt: null, recordCount: 0, subjectIds: new Set() };
        summaries.set(row.key, summary);
      }
      summary.recordCount += row.recordCount;
      if (row.subjectId !== null) {
        summary.subjectIds.add(row.subjectId);
      }
      const lastCollectedAt = row.lastCollectedAt ? new Date(row.lastCollectedAt) : null;
      if (lastCollectedAt && (!summary.lastCollectedAt || lastCollectedAt > summary.lastCollectedAt)) {
        summary.lastCollectedAt = lastCollectedAt;
      }
    }
    return summaries;
  }

  /**
   * Label each record with its session's data collection method and the user who conducted it, so
   * clients can show those columns without fetching every session in the group.
   *
   * Deliberately a second scoped query rather than an `include` on the relation: `session` is
   * declared required, so Prisma aborts the whole query with "Inconsistent query result" if any one
   * record's session has since been deleted. Looking the sessions up by id degrades to a missing
   * type and username for that record instead of a failed request.
   */
  private async withSessionMetadata(
    records: PrismaInstrumentRecord[],
    ability?: AppAbility
  ): Promise<InstrumentRecord[]> {
    if (records.length === 0) {
      return [];
    }
    const sessions = await this.sessionModel.findMany({
      select: { id: true, type: true, user: { select: { username: true } } },
      where: {
        AND: [
          // Depends on the caller holding some `read Session` rule: given none at all, this throws a
          // CASL ForbiddenError instead of returning a restrictive filter, and the request 500s. Every
          // base permission level grants one, pinned by a test in auth/__tests__/ability.factory.test.ts.
          accessibleQuery(ability, 'read', 'Session'),
          { id: { in: Array.from(new Set(records.map((record) => record.sessionId))) } }
        ]
      }
    });
    const sessionById = new Map(sessions.map((session) => [session.id, session]));
    return records.map((record) => {
      const session = sessionById.get(record.sessionId);
      return {
        ...record,
        session: { type: session?.type ?? null, user: { username: session?.user?.username ?? null } }
      };
    });
  }
}
