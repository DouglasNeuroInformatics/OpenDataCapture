import { cpus } from 'os';
import { join } from 'path';
import { Worker } from 'worker_threads';

import { replacer, reviver } from '@douglasneuroinformatics/libjs';
import { InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { linearRegression } from '@douglasneuroinformatics/libstats';
import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Json, ScalarInstrument } from '@opendatacapture/runtime-core';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
  InstrumentRecordsExport,
  LinearRegressionResults,
  UploadInstrumentRecordsData
} from '@opendatacapture/schemas/instrument-records';
import { Prisma } from '@prisma/client';
import type { Session } from '@prisma/client';
import { isNumber, mergeWith, pickBy } from 'lodash-es';

import { accessibleQuery } from '@/auth/ability.utils';
import type { AppAbility } from '@/auth/auth.types';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { CreateSubjectDto } from '@/subjects/dto/create-subject.dto';
import { SubjectsService } from '@/subjects/subjects.service';

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
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    private readonly groupsService: GroupsService,
    private readonly instrumentMeasuresService: InstrumentMeasuresService,
    private readonly instrumentsService: InstrumentsService,
    private readonly sessionsService: SessionsService,
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
    { data: rawData, date, groupId, instrumentId, sessionId, subjectId }: CreateInstrumentRecordData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecord> {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }
    const instrument = await this.instrumentsService.findById(instrumentId);
    if (instrument.kind === 'SERIES') {
      throw new UnprocessableEntityException(
        `Cannot create instrument record for series instrument '${instrument.id}'`
      );
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
    const isExisting = await this.instrumentRecordModel.exists({ id });
    if (!isExisting) {
      throw new NotFoundException(`Could not find record with ID '${id}'`);
    }
    return this.instrumentRecordModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], id }
    });
  }

  async exists(where: Prisma.InstrumentRecordWhereInput): Promise<boolean> {
    return this.instrumentRecordModel.exists(where);
  }

  async exportRecords({ groupId }: { groupId?: string } = {}, { ability }: Required<EntityOperationOptions>) {
    const records = await this.queryRecordsRaw(ability, groupId);

    const instrumentIds = new Set(records.map((r) => r.instrumentId));

    const instrumentsArray = await Promise.all(
      instrumentIds.values().map((id) => this.instrumentsService.findById(id) as Promise<ScalarInstrument>)
    );

    const instruments = new Map(instrumentsArray.map((instrument) => [instrument.id, instrument]));

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
        const worker = new Worker(join(import.meta.dirname, 'export-worker.ts'));
        worker.postMessage({ data: availableInstrumentArray, type: 'INIT' } satisfies InitMessage);

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
          reject(error);
          void worker.terminate();
        });
      });
    });

    const results = await Promise.all(workerPromises);

    return results.flat();
  }

  async find(
    { groupId, instrumentId, kind, minDate, subjectId }: InstrumentRecordQueryParams,
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentRecord[]> {
    if (groupId) {
      await this.groupsService.findById(groupId);
    }
    if (instrumentId) {
      await this.instrumentsService.findById(instrumentId);
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
          accessibleQuery(ability, 'read', 'InstrumentRecord'),
          { subjectId }
        ]
      }
    });

    return records;
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
    { groupId, instrumentId, records }: UploadInstrumentRecordsData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecord[]> {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }

    const instrument = await this.instrumentsService.findById(instrumentId);
    if (instrument.kind === 'SERIES') {
      throw new UnprocessableEntityException(
        `Cannot create instrument record for series instrument '${instrument.id}'`
      );
    }

    const createdSessionsArray: Session[] = [];

    try {
      const subjectIdList = records.map(({ subjectId }) => {
        const subjectToAdd: CreateSubjectDto = { id: subjectId };

        return subjectToAdd;
      });

      await this.subjectsService.createMany(subjectIdList);

      const preProcessedRecords = await Promise.all(
        records.map(async (record) => {
          const { data: rawData, date, subjectId } = record;

          // Validate data
          const parseResult = instrument.validationSchema.safeParse(this.parseJson(rawData));
          if (!parseResult.success) {
            console.error(parseResult.error.issues);
            throw new UnprocessableEntityException(
              `Data received for record does not pass validation schema of instrument '${instrument.id}'`
            );
          }

          const session = await this.sessionsService.create({
            date: date,
            groupId: groupId ?? null,
            subjectData: { id: subjectId },
            type: 'RETROSPECTIVE'
          });

          createdSessionsArray.push(session);

          const computedMeasures = instrument.measures
            ? this.instrumentMeasuresService.computeMeasures(instrument.measures, parseResult.data)
            : null;

          return {
            computedMeasures,
            data: this.serializeData(parseResult.data),
            date,
            groupId,
            instrumentId,
            sessionId: session.id,
            subjectId
          };
        })
      );
      await this.instrumentRecordModel.createMany({
        data: preProcessedRecords
      });

      return this.instrumentRecordModel.findMany({
        where: {
          groupId,
          instrumentId
        }
      });
    } catch (err) {
      await this.sessionsService.deleteByIds(createdSessionsArray.map((session) => session.id));
      throw err;
    }
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
          groupId: {
            $toString: '$groupId'
          },
          id: {
            $toString: '$_id'
          },
          instrumentId: 1,
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
            user: { username: '$session.user.username' } // TBD test this works
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

    const records = (await this.instrumentRecordModel.aggregateRaw({ pipeline })) as unknown as unknown[];

    /**
     * We need to create a shallow copy of all records here, as the aggregateRaw method returns objects
     * with the Symbol(nodejs.util.inspect.custom) property defined, which is not serializable.
     */

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return (records.filter((record) => appAbility.can('read', record as any)) as RecordType[]).map((record) => ({
      ...record
    }));
  }

  private serializeData(data: unknown) {
    return JSON.parse(JSON.stringify(data, replacer)) as unknown;
  }
}
