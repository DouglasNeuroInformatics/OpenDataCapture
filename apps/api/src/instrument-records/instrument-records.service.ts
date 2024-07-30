import module from 'node:module';

import { yearsPassed } from '@douglasneuroinformatics/libjs';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import type { InstrumentRecordModel } from '@opendatacapture/prisma-client/api';
import type { InstrumentMeasureValue, InstrumentMeasures, ScalarInstrument } from '@opendatacapture/schemas/instrument';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordQueryParams,
  InstrumentRecordsExport,
  LinearRegressionResults
} from '@opendatacapture/schemas/instrument-records';
import type { Prisma } from '@prisma/client';
import { isNumber, pickBy } from 'lodash-es';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { VirtualizationService } from '@/virtualization/virtualization.service';

import { InstrumentMeasuresService } from './instrument-measures.service';

const require = module.createRequire(import.meta.url);

const { linearRegression } = require('@opendatacapture/stats') as typeof import('@opendatacapture/stats');

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
    { data, date, groupId, instrumentId, sessionId, subjectId }: CreateInstrumentRecordData,
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

    return this.instrumentRecordModel.create({
      data: {
        computedMeasures: instrument.measures
          ? this.instrumentMeasuresService.computeMeasures(instrument.measures, data)
          : null,
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
          // Prisma does not allow index signature, so this is typed as "JSON"
          value: measureValue as InstrumentMeasureValue
        });
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

    const instrumentKindIds = await this.instrumentsService
      .find({ kind })
      .then((instruments) => instruments.map((instrument) => instrument.id));

    return (await this.instrumentRecordModel.findMany({
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
    })) satisfies Omit<InstrumentRecord, 'computedMeasures'>[] as InstrumentRecord[];
  }

  async linearModel(
    { groupId, instrumentId }: { groupId?: string; instrumentId: string },
    { ability }: EntityOperationOptions = {}
  ): Promise<LinearRegressionResults> {
    groupId && (await this.groupsService.findById(groupId));
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

    const data: { [key: string]: [number, number][] } = {};
    for (const record of records) {
      const numericMeasures = pickBy(record.computedMeasures as InstrumentMeasures, isNumber);
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
