import { replacer, yearsPassed } from '@douglasneuroinformatics/libjs';
import { reviver } from '@douglasneuroinformatics/libjs';
import { linearRegression } from '@douglasneuroinformatics/libstats';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { ScalarInstrument } from '@opendatacapture/runtime-core';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
  InstrumentRecordsExport,
  LinearRegressionResults,
  UploadInstrumentRecordsData
} from '@opendatacapture/schemas/instrument-records';
import { type InstrumentRecordModel, Prisma, type SessionModel } from '@prisma/generated-client';
import { isNumber, pickBy } from 'lodash-es';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { SessionsService } from '@/sessions/sessions.service';
import type { CreateSubjectDto } from '@/subjects/dto/create-subject.dto';
import { SubjectsService } from '@/subjects/subjects.service';
import { VirtualizationService } from '@/virtualization/virtualization.service';

import { InstrumentMeasuresService } from './instrument-measures.service';

@Injectable()
export class InstrumentRecordsService {
  constructor(
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    private readonly groupsService: GroupsService,
    private readonly instrumentMeasuresService: InstrumentMeasuresService,
    private readonly instrumentsService: InstrumentsService,
    private readonly sessionsService: SessionsService,
    private readonly subjectsService: SubjectsService,
    private readonly virtualizationService: VirtualizationService
  ) {}

  async count(
    filter: NonNullable<Parameters<Model<'InstrumentRecord'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<number> {
    return this.instrumentRecordModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), filter] }
    });
  }

  async create(
    { data: rawData, date, groupId, instrumentId, sessionId, subjectId }: CreateInstrumentRecordData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecordModel> {
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
      console.error(parseResult.error.issues);
      throw new UnprocessableEntityException(
        `Data received for record does not pass validation schema of instrument '${instrument.id}'`
      );
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
    return this.instrumentRecordModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'InstrumentRecord')], id }
    });
  }

  async exists(where: Prisma.InstrumentRecordModelWhereInput): Promise<boolean> {
    return this.instrumentRecordModel.exists(where);
  }

  async exportRecords({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const data: InstrumentRecordsExport = [];
    const records = await this.instrumentRecordModel.findMany({
      include: {
        session: {
          select: {
            date: true,
            id: true,
            type: true
          }
        },
        subject: true
      },
      where: {
        AND: [
          {
            subject: groupId ? { groupIds: { has: groupId } } : {}
          },
          accessibleQuery(ability, 'read', 'InstrumentRecord')
        ]
      }
    });

    const instruments = new Map<string, ScalarInstrument>();
    for (const record of records) {
      if (!record.computedMeasures) {
        continue;
      }
      let instrument: ScalarInstrument;
      if (instruments.has(record.instrumentId)) {
        instrument = instruments.get(record.instrumentId)!;
      } else {
        instrument = (await this.instrumentsService.findById(record.instrumentId)) as ScalarInstrument;
        instruments.set(record.instrumentId, instrument);
      }

      for (const [measureKey, measureValue] of Object.entries(record.computedMeasures)) {
        data.push({
          instrumentEdition: instrument.internal.edition,
          instrumentName: instrument.internal.name,
          measure: measureKey,
          sessionDate: record.session.date.toISOString(),
          sessionId: record.session.id,
          sessionType: record.session.type,
          subjectAge: record.subject.dateOfBirth ? yearsPassed(record.subject.dateOfBirth) : null,
          subjectId: record.subject.id,
          subjectSex: record.subject.sex,
          timestamp: record.date.toISOString(),
          value: measureValue
        });
      }
    }

    return data;
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
        instrument: {
          select: {
            bundle: true,
            id: true
          }
        }
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

  async linearModel(
    { groupId, instrumentId }: { groupId?: string; instrumentId: string },
    { ability }: EntityOperationOptions = {}
  ): Promise<LinearRegressionResults> {
    if (groupId) {
      await this.groupsService.findById(groupId);
    }
    const instrument = await this.instrumentsService
      .findById(instrumentId)
      .then((instrument) => this.virtualizationService.getInstrumentInstance(instrument));

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

  async upload(
    { groupId, instrumentId, records }: UploadInstrumentRecordsData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecordModel[]> {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }

    const instrument = await this.instrumentsService.findById(instrumentId);
    if (instrument.kind === 'SERIES') {
      throw new UnprocessableEntityException(
        `Cannot create instrument record for series instrument '${instrument.id}'`
      );
    }

    const createdSessionsArray: SessionModel[] = [];

    try {
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

          // Ensure subject exists
          await this.createSubjectIfNotFound(subjectId);

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

  private async createSubjectIfNotFound(subjectId: string) {
    try {
      return await this.subjectsService.findById(subjectId);
    } catch (exception) {
      if (exception instanceof NotFoundException) {
        const addedSubject: CreateSubjectDto = {
          id: subjectId
        };
        try {
          return await this.subjectsService.create(addedSubject);
        } catch (prismaError) {
          if (prismaError instanceof Prisma.PrismaClientKnownRequestError && prismaError.code === 'P2002') {
            console.error(prismaError);
            return await this.subjectsService.findById(subjectId);
          } else {
            throw prismaError;
          }
        }
      } else {
        throw exception;
      }
    }
  }

  private parseJson(data: unknown) {
    return JSON.parse(JSON.stringify(data), reviver) as unknown;
  }

  private serializeData(data: unknown) {
    return JSON.parse(JSON.stringify(data, replacer)) as unknown;
  }
}
