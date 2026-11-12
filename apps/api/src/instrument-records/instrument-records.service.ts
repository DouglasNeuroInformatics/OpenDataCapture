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
import type { Json, ScalarInstrument } from '@opendatacapture/runtime-core';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
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

type RecordSummaryFold = Map<string, { lastCollectedAt: Date | null; recordCount: number; subjectIds: Set<string> }>;

/**
 * Projects a fold keyed by instrument id into the wire shape, replacing the subject id set with its
 * size. Shared by the per-instrument and per-series summaries, which differ only in what they keyed
 * the fold on.
 */
function toInstrumentSummaries(summaries: RecordSummaryFold): InstrumentRecordSummary[] {
  return Array.from(summaries, ([instrumentId, summary]) => ({
    instrumentId,
    lastCollectedAt: summary.lastCollectedAt,
    recordCount: summary.recordCount,
    subjectCount: summary.subjectIds.size
  }));
}

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

  async find(
    { groupId, instrumentId, kind, minDate, seriesInstrumentId, subjectId }: InstrumentRecordQueryParams,
    { ability, callerGroupIds }: EntityOperationOptions & { callerGroupIds?: string[] } = {}
  ): Promise<InstrumentRecord[]> {
    if (groupId) {
      await this.groupsService.findById(groupId);
    }
    if (instrumentId) {
      await this.instrumentsService.findById(instrumentId);
    }
    if (seriesInstrumentId) {
      // `read Instrument` carries no group condition, so the ability alone cannot tell a series
      // another group owns from one that does not exist: its id answers 200 with an empty list where
      // an unknown id answers 404, and the difference reports whether the series is real. Narrowing
      // to the caller's own groups is what collapses the two. An administrator belongs to no group
      // and reads every group's series, so they are not narrowed.
      const seriesGroupIds = ability?.can('manage', 'all') ? undefined : callerGroupIds;
      const series = await this.instrumentsService.findById(seriesInstrumentId, { ability }, seriesGroupIds);
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
    return toInstrumentSummaries(await this.summarizeRecords('instrumentId', groupId, ability));
  }

  /**
   * Per-series collection statistics: everything a series orchestrated, across the scalar
   * instruments it composes. This is what makes a series row in the instrument hub worth opening.
   */
  async summarizeBySeries(
    { groupId }: { groupId?: string } = {},
    { ability }: Required<Pick<EntityOperationOptions, 'ability'>>
  ): Promise<InstrumentRecordSummary[]> {
    return toInstrumentSummaries(await this.summarizeRecords('seriesInstrumentId', groupId, ability));
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

  async updateById(
    id: string,
    data: unknown[] | { [key: string]: unknown },
    { ability }: Required<Pick<EntityOperationOptions, 'ability'>>
  ) {
    const where = { AND: [accessibleQuery(ability, 'update', 'InstrumentRecord')], id };
    const instrumentRecord = await this.instrumentRecordModel.findFirst({ where });
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
      where
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
    // holds no `read InstrumentRecord` rule, which makes `accessibleQuery` throw rather than filter.
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
  ): Promise<RecordSummaryFold> {
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

    const summaries: RecordSummaryFold = new Map();
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
