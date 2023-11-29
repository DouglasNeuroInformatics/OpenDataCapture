import { accessibleBy } from '@casl/mongoose';
import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { InjectRepository, type Repository } from '@douglasneuroinformatics/nestjs/modules';
import { linearRegression } from '@douglasneuroinformatics/stats';
import { yearsPassed } from '@douglasneuroinformatics/utils';
import { Injectable } from '@nestjs/common';
import type { FormInstrument, FormInstrumentMeasures } from '@open-data-capture/common/instrument';
import type {
  CreateInstrumentRecordData,
  InstrumentRecord,
  InstrumentRecordsExport,
  LinearRegressionResults
} from '@open-data-capture/common/instrument-records';
import type { Filter } from 'mongodb';

import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { InstrumentRecordEntity } from './entities/instrument-record.entity';

@Injectable()
export class InstrumentRecordsService {
  constructor(
    @InjectRepository(InstrumentRecordEntity)
    private readonly instrumentRecordsRepository: Repository<InstrumentRecordEntity>,
    private readonly groupsService: GroupsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async count(filter: Filter<InstrumentRecordEntity> = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentRecordsRepository.count({
      $and: [filter, ability ? accessibleBy(ability, 'read').InstrumentRecord : {}]
    });
  }

  async create(
    { assignmentId, data, date, groupId, instrumentId, subjectIdentifier }: CreateInstrumentRecordData,
    options?: EntityOperationOptions
  ) {
    if (groupId) {
      await this.groupsService.findById(groupId, options);
    }
    await this.instrumentsService.findById(instrumentId);
    await this.subjectsService.findById(subjectIdentifier);

    return this.instrumentRecordsRepository.create({
      assignmentId,
      data,
      date,
      groupId,
      instrumentId,
      subjectIdentifier
    });
  }

  async exists(filter: Filter<InstrumentRecordEntity>) {
    return this.instrumentRecordsRepository.exists(filter);
  }

  async exportRecords(
    { groupId }: { groupId?: string } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentRecordsExport> {
    const group = groupId ? await this.groupsService.findById(groupId, { ability }) : undefined;
    const subjects = group
      ? await this.subjectsService.findByGroup(group.name, { ability })
      : await this.subjectsService.findAll({ ability });
    const data: InstrumentRecordsExport = [];
    for (const subject of subjects) {
      const records = await this.instrumentRecordsRepository.find({
        groupId,
        subjectIdentifier: subject.identifier
      });
      for (const record of records) {
        const instrument = await this.instrumentsService.findById(record.instrumentId);
        if (instrument.kind !== 'form') {
          continue;
        }
        const formData = record.data as FormDataType;
        for (const measure of Object.keys(formData)) {
          data.push({
            instrumentName: instrument.name,
            instrumentVersion: instrument.version,
            measure: measure,
            subjectAge: yearsPassed(subject.dateOfBirth),
            subjectId: subject.identifier,
            subjectSex: subject.sex,
            timestamp: record.date.toISOString(),
            value: formData[measure] as unknown
          });
        }
      }
    }
    return data;
  }

  async find(
    {
      groupId,
      instrumentId,
      minDate,
      subjectIdentifier
    }: { groupId?: string; instrumentId?: string; minDate?: Date; subjectIdentifier?: string },
    { ability }: EntityOperationOptions = {}
  ) {
    const docs = await this.instrumentRecordsRepository.find({
      $and: [
        ability ? accessibleBy(ability).InstrumentRecord : {},
        {
          date: minDate ? { $gte: minDate } : undefined,
          groupId,
          instrumentId,
          subjectIdentifier
        }
      ]
    });

    const records: InstrumentRecord[] = [];
    for (const doc of docs) {
      const obj: Record<string, unknown> = {};
      const instrument = await this.instrumentsService.findById(doc.instrumentId);
      obj.instrument = instrument;
      if (instrument.kind === 'form' && instrument.measures) {
        obj.computedMeasures = this.computeMeasure(
          instrument.measures as FormInstrumentMeasures,
          doc.data as FormDataType
        );
      }
      records.push(obj as InstrumentRecord);
    }
    return records;
  }

  async linearModel(
    { groupId, instrumentId }: { groupId?: string; instrumentId: string },
    { ability }: EntityOperationOptions = {}
  ) {
    const instrument = await this.instrumentsService.findById<FormInstrument>(instrumentId);
    if (!instrument.measures) {
      throw new Error('Instrument must contain measures');
    }
    const records = await this.instrumentRecordsRepository.find({
      $and: [ability ? accessibleBy(ability).InstrumentRecord : {}, { groupId, instrumentId }]
    });

    const data: Record<string, [number, number][]> = {};
    for (const record of records) {
      const computedMeasures = this.computeMeasure(instrument.measures, record.data as FormDataType);
      for (const measure in computedMeasures) {
        const x = record.date.getTime();
        const y = computedMeasures[measure]!;
        if (Array.isArray(data[measure])) {
          data[measure]!.push([x, y]);
        } else {
          data[measure] = [[x, y]];
        }
      }
    }

    const results: LinearRegressionResults = {};
    for (const measure in data) {
      results[measure] = linearRegression(data[measure]!);
    }
    return results;
  }

  private computeMeasure(measures: FormInstrumentMeasures, data: FormDataType) {
    const computedMeasures: Record<string, number> = {};
    for (const key in measures) {
      computedMeasures[key] = measures[key]!.value(data);
    }
    return computedMeasures;
  }
}
