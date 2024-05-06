import { yearsPassed } from '@douglasneuroinformatics/libjs';
import { Injectable } from '@nestjs/common';
import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';
import type { InstrumentRecordModel } from '@opendatacapture/prisma-client/api';
import type { AnyInstrument, InstrumentMeasureValue } from '@opendatacapture/schemas/instrument';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
  InstrumentRecordsExport,
  LinearRegressionResults
} from '@opendatacapture/schemas/instrument-records';
import { linearRegression } from '@opendatacapture/stats';
import type { Prisma } from '@prisma/client';
import { isNumber, pickBy } from 'lodash-es';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { SubjectsService } from '@/subjects/subjects.service';

import { InstrumentMeasuresService } from './instrument-measures.service';

@Injectable()
export class InstrumentRecordsService {
  private readonly interpreter: InstrumentInterpreter;

  constructor(
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
    private readonly groupsService: GroupsService,
    private readonly instrumentMeasuresService: InstrumentMeasuresService,
    private readonly instrumentsService: InstrumentsService,
    private readonly subjectsService: SubjectsService
  ) {
    this.interpreter = new InstrumentInterpreter();
  }

  async count(
    filter: NonNullable<Parameters<Model<'InstrumentRecord'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<number> {
    return this.instrumentRecordModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), filter] }
    });
  }

  async create(
    { data, date, groupId, instrumentId, subjectId }: CreateInstrumentRecordData,
    options?: EntityOperationOptions
  ): Promise<InstrumentRecordModel> {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }
    await this.instrumentsService.findById(instrumentId);
    const subject = await this.subjectsService.findById(subjectId);

    return this.instrumentRecordModel.create({
      data: {
        data,
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
        subject: {
          connect: {
            id: subject.id
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

  async exportRecords(
    { groupId }: { groupId?: string } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentRecordsExport> {
    const subjects = await this.subjectsService.find({ groupId }, { ability });
    const data: InstrumentRecordsExport = [];
    const instruments = new Map<string, AnyInstrument>();
    for (const subject of subjects) {
      const records = await this.instrumentRecordModel.findMany({
        include: { instrument: true },
        where: { groupId, subjectId: subject.id }
      });
      for (const record of records) {
        let instrument: AnyInstrument;
        if (instruments.has(record.instrumentId)) {
          instrument = instruments.get(record.instrumentId)!;
        } else {
          instrument = await record.instrument.toInstance();
          instruments.set(record.instrumentId, instrument);
        }

        if (!instrument.measures) {
          continue;
        }

        const measures = this.instrumentMeasuresService.computeMeasures(instrument.measures, record.data);

        for (const [measureKey, measureValue] of Object.entries(measures)) {
          data.push({
            instrumentName: record.instrument.name,
            instrumentVersion: record.instrument.version,
            measure: measureKey,
            subjectAge: yearsPassed(subject.dateOfBirth),
            subjectId: subject.id,
            subjectSex: subject.sex,
            timestamp: record.date.toISOString(),
            value: measureValue
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
    groupId && (await this.groupsService.findById(groupId));
    instrumentId && (await this.instrumentsService.findById(instrumentId));

    const records = await this.instrumentRecordModel.findMany({
      include: {
        instrument: {
          select: {
            bundle: true,
            kind: true
          }
        }
      },
      where: {
        AND: [
          { date: { gte: minDate } },
          { groupId },
          { instrumentId },
          accessibleQuery(ability, 'read', 'InstrumentRecord'),
          { subjectId },
          {
            instrument: {
              kind
            }
          }
        ]
      }
    });

    return await Promise.all(
      records.map(async (record) => {
        const instance = await this.interpreter.interpret(record.instrument.bundle);
        let computedMeasures: { [key: string]: InstrumentMeasureValue } | undefined;
        if (instance.measures) {
          computedMeasures = this.instrumentMeasuresService.computeMeasures(instance.measures, record.data);
        }
        return Object.assign(record, { computedMeasures });
      })
    );
  }

  async linearModel(
    { groupId, instrumentId }: { groupId?: string; instrumentId: string },
    { ability }: EntityOperationOptions = {}
  ): Promise<LinearRegressionResults> {
    groupId && (await this.groupsService.findById(groupId));
    const instrument = await this.instrumentsService
      .findById(instrumentId)
      .then((instrument) => instrument.toInstance());

    if (!instrument.measures) {
      return {};
    }

    const records = await this.instrumentRecordModel.findMany({
      include: { instrument: true },
      where: { AND: [accessibleQuery(ability, 'read', 'InstrumentRecord'), { groupId }, { instrumentId }] }
    });

    const data: { [key: string]: [number, number][] } = {};
    for (const record of records) {
      const computedMeasures = this.instrumentMeasuresService.computeMeasures(instrument.measures, record.data);
      const numericMeasures = pickBy(computedMeasures, isNumber);
      for (const measure in numericMeasures) {
        const x = record.date.getTime();
        const y = numericMeasures[measure];
        if (Array.isArray(data[measure])) {
          data[measure].push([x, y]);
        } else {
          data[measure] = [[x, y]];
        }
      }
    }

    const results: LinearRegressionResults = {};
    for (const measure in data) {
      results[measure] = linearRegression(data[measure]);
    }
    return results;
  }
}
