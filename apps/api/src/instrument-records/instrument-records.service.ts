import { replacer, reviver, yearsPassed } from '@douglasneuroinformatics/libjs';
import { accessibleQuery, InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { linearRegression } from '@douglasneuroinformatics/libstats';
import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Json, ScalarInstrument } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import { $RecordArrayFieldValue } from '@opendatacapture/schemas/instrument';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
  InstrumentRecordsExport,
  LinearRegressionResults,
  UploadInstrumentRecordsData
} from '@opendatacapture/schemas/instrument-records';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { Prisma } from '@prisma/client';
import type { Session } from '@prisma/client';
import { isNumber, mergeWith, pickBy } from 'lodash-es';

import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { CreateSubjectDto } from '@/subjects/dto/create-subject.dto';
import { SubjectsService } from '@/subjects/subjects.service';

import { InstrumentMeasuresService } from './instrument-measures.service';

type ExpandDataType =
  | {
      measure: string;
      measureValue: boolean | Date | number | string | undefined;
      success: true;
    }
  | {
      message: string;
      success: false;
    };

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

  async exportRecords({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const data: InstrumentRecordsExport = [];
    const records = await this.instrumentRecordModel.findMany({
      include: {
        session: {
          select: {
            date: true,
            id: true,
            type: true,
            user: true
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
        if (measureValue == null) {
          continue;
        }

        if (!Array.isArray(measureValue)) {
          data.push({
            groupId: record.subject.groupIds[0] ?? DEFAULT_GROUP_NAME,
            instrumentEdition: instrument.internal.edition,
            instrumentName: instrument.internal.name,
            measure: measureKey,
            sessionDate: record.session.date.toISOString(),
            sessionId: record.session.id,
            sessionType: record.session.type,
            subjectAge: record.subject.dateOfBirth ? yearsPassed(record.subject.dateOfBirth) : null,
            subjectId: removeSubjectIdScope(record.subject.id),
            subjectSex: record.subject.sex,
            timestamp: record.date.toISOString(),
            userId: record.session.user?.username ?? 'N/A',
            value: measureValue
          });
        }

        if (Array.isArray(measureValue) && measureValue.length < 1) continue;

        if (Array.isArray(measureValue) && measureValue.length >= 1) {
          const arrayResult = this.expandData(measureValue);
          arrayResult.forEach((arrayEntry: ExpandDataType) => {
            if (!arrayEntry.success)
              throw new Error(`exportRecords: ${instrument.internal.name}.${measureKey} — ${arrayEntry.message}`);
            data.push({
              groupId: record.subject.groupIds[0] ?? DEFAULT_GROUP_NAME,
              instrumentEdition: instrument.internal.edition,
              instrumentName: instrument.internal.name,
              measure: `${measureKey} - ${arrayEntry.measure}`,
              sessionDate: record.session.date.toISOString(),
              sessionId: record.session.id,
              sessionType: record.session.type,
              subjectAge: record.subject.dateOfBirth ? yearsPassed(record.subject.dateOfBirth) : null,
              subjectId: removeSubjectIdScope(record.subject.id),
              subjectSex: record.subject.sex,
              timestamp: record.date.toISOString(),
              userId: record.session.user?.username ?? 'N/A',
              value: arrayEntry.measureValue
            });
          });
        }
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

  private expandData(listEntry: any[]): ExpandDataType[] {
    const validRecordArrayList: ExpandDataType[] = [];
    if (listEntry.length < 1) {
      throw new Error('Record Array is Empty');
    }
    for (const objectEntry of Object.values(listEntry)) {
      for (const [dataKey, dataValue] of Object.entries(objectEntry as { [key: string]: any })) {
        const parseResult = $RecordArrayFieldValue.safeParse(dataValue);
        if (!parseResult.success) {
          validRecordArrayList.push({
            message: `Error interpreting value ${dataValue} and record array key ${dataKey}`,
            success: false
          });
        }
        validRecordArrayList.push({
          measure: dataKey,
          measureValue: parseResult.data,
          success: true
        });
      }
    }
    return validRecordArrayList;
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
}
