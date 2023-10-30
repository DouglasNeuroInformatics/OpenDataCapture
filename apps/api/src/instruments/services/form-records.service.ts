import { type AccessibleModel } from '@casl/mongoose';
import type { FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { AjvService } from '@douglasneuroinformatics/nestjs/modules';
import { linearRegression, mean, std } from '@douglasneuroinformatics/stats';
import { yearsPassed } from '@douglasneuroinformatics/utils';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  AppAbility,
  FormInstrumentRecord,
  FormInstrumentRecordsSummary,
  Group,
  InstrumentRecordsExport,
  Language,
  Measure,
  SubjectFormRecords
} from '@open-data-capture/types';
import { Model } from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { CreateFormRecordDto } from '../dto/create-form-record.dto';
import { FormInstrumentEntity } from '../entities/form-instrument.entity';
import { FormInstrumentRecordEntity } from '../entities/form-instrument-record.entity';
import { InstrumentRecordEntity } from '../entities/instrument-record.entity';
import { FormsService } from './forms.service';

@Injectable()
export class FormRecordsService {
  constructor(
    @InjectModel(InstrumentRecordEntity.modelName)
    private readonly formRecordsModel: Model<FormInstrumentRecordEntity, AccessibleModel<FormInstrumentRecordEntity>>,
    private readonly ajvService: AjvService,
    private readonly formsService: FormsService,
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService
  ) {}

  private computeMeasure<T extends FormInstrumentData>(measure: Measure<T>, data: T): number {
    // data[measure.formula.field] should always be a number because only numeric fields may be used for fields in measure
    switch (measure.formula.kind) {
      case 'const':
        return data[measure.formula.field as keyof T] as number;
      case 'sum':
        // eslint-disable-next-line no-case-declarations
        const coerceBool = measure.formula.options?.coerceBool;
        return measure.formula.fields
          .map((field: keyof T) => {
            if (typeof data[field] === 'number') {
              return data[field] as number;
            } else if (typeof data[field] === 'boolean' && coerceBool) {
              return Number(data[field]);
            }
            throw new Error(`Unexpected type of field '${field.toString()}': ${typeof data[field]}`);
          })
          .reduce((a, b) => a + b, 0);
    }
  }

  /** Return an object with measures corresponding to all outcomes  */
  private getMeasuresFromRecords<T extends FormInstrumentData>(
    records: FormInstrumentRecord<T>[]
  ): Record<string, number[]> {
    const data: Record<string, number[]> = {};
    for (const record of records) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for (const measure in record.instrument.measures) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const value = this.computeMeasure(record.instrument.measures[measure]!, record.data);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!data[measure]) {
          data[measure] = [value];
        } else {
          data[measure]!.push(value);
        }
      }
    }
    return data;
  }

  async create(dto: CreateFormRecordDto, ability: AppAbility): Promise<FormInstrumentRecord> {
    const { data, groupName, instrumentName, kind, subjectInfo, time } = dto;

    const instrument = await this.formsService.findByName(instrumentName);
    const subject = await this.subjectsService.lookup(subjectInfo);

    let group: Group | undefined;
    if (groupName) {
      group = await this.groupsService.findByName(groupName, ability);
      if (!subject.groups.includes(group)) {
        await this.subjectsService.appendGroup(subject.identifier, group);
      }
    }

    return this.formRecordsModel.create({
      data: this.ajvService.validate(data, instrument.validationSchema, (error) => {
        console.error(error);
        throw new BadRequestException();
      }),
      group,
      instrument,
      kind,
      subject,
      time
    });
  }

  async exportRecords(ability: AppAbility, groupName?: string): Promise<InstrumentRecordsExport> {
    const group = groupName ? await this.groupsService.findByName(groupName, ability) : undefined;
    const subjects = await this.subjectsService.findAll(ability, groupName);
    const data: InstrumentRecordsExport = [];
    for (const subject of subjects) {
      const records = await this.formRecordsModel.find({ group, kind: 'form', subject }).populate('instrument');
      for (const record of records) {
        for (const measure of Object.keys(record.data)) {
          data.push({
            instrumentName: record.instrument.name,
            instrumentVersion: record.instrument.version,
            measure: measure,
            subjectAge: yearsPassed(subject.dateOfBirth),
            subjectId: subject.identifier,
            subjectSex: subject.sex,
            timestamp: new Date(record.time).toISOString(),
            value: record.data[measure] as unknown
          });
        }
      }
    }
    return data;
  }

  async find(ability: AppAbility, subjectIdentifier: string, language?: Language): Promise<SubjectFormRecords[]> {
    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);

    const instrumentDocs = await this.formRecordsModel
      .find({ subject }, 'instrument')
      .accessibleBy(ability)
      .populate({ path: 'instrument', select: 'identifier details.language' })
      .lean();

    const uniqueIdentifiers = Array.from(new Set(instrumentDocs.map((item) => item.instrument.identifier)));

    const arr: SubjectFormRecords[] = [];
    for (const identifier of uniqueIdentifiers) {
      let instrument: FormInstrumentEntity;
      let instruments: FormInstrumentEntity[];
      try {
        instrument = await this.formsService.findOne(identifier, language);
        instruments = await this.formsService.findByIdentifier(identifier);
      } catch (error) {
        if (error instanceof NotFoundException) {
          continue;
        }
        throw error;
      }
      const records: SubjectFormRecords['records'] = await this.formRecordsModel
        .find({ instrument: { $in: instruments }, subject })
        .populate({ path: 'instrument', select: 'identifier details.language' })
        .accessibleBy(ability)
        .select(['data', 'time'])
        .lean();

      if (instrument.measures) {
        for (const record of records) {
          const computedMeasures: Record<string, number> = {};
          for (const key in instrument.measures) {
            const measure = instrument.measures[key]!;
            computedMeasures[key] = this.computeMeasure(measure, record.data);
          }
          record.computedMeasures = computedMeasures;
        }
      }
      arr.push({ instrument, records: records });
    }
    return arr;
  }

  async linearRegression(
    ability: AppAbility,
    groupName?: string,
    instrumentIdentifier?: string
  ): Promise<Record<string, { intercept: number; slope: number; stdErr: number }>> {
    if (!instrumentIdentifier) {
      throw new BadRequestException('Must specify instrument identifier');
    }
    const instruments = await this.formsService.findByIdentifier(instrumentIdentifier);

    const records = await this.formRecordsModel
      .find({
        group: groupName ? await this.groupsService.findByName(groupName, ability) : undefined,
        instrument: instrumentIdentifier ? { $in: instruments } : undefined
      })
      .populate('instrument')
      .accessibleBy(ability);

    const data: Record<string, [number, number][]> = {};
    for (const record of records) {
      for (const measure in record.instrument.measures) {
        const x = record.time;
        const y = this.computeMeasure(record.instrument.measures[measure]!, record.data);
        if (Array.isArray(data[measure])) {
          data[measure]!.push([x, y]);
        } else {
          data[measure] = [[x, y]];
        }
      }
    }

    const results: Record<string, { intercept: number; slope: number; stdErr: number }> = {};
    for (const measure in data) {
      results[measure] = linearRegression(data[measure]!);
    }
    return results;
  }

  async summary(
    ability: AppAbility,
    groupName?: string,
    instrumentIdentifier?: string
  ): Promise<FormInstrumentRecordsSummary> {
    const group = groupName ? await this.groupsService.findByName(groupName, ability) : undefined;
    const instruments = instrumentIdentifier
      ? await this.formsService.findByIdentifier(instrumentIdentifier)
      : undefined;
    const records = await this.formRecordsModel
      .find({ group, instrument: instrumentIdentifier ? { $in: instruments } : undefined })
      .populate('instrument')
      .accessibleBy(ability);

    let centralTendency: Record<string, { mean: number; std: number }> | undefined;
    if (instrumentIdentifier) {
      centralTendency = Object.fromEntries(
        Object.entries(this.getMeasuresFromRecords(records)).map(([key, arr]) => {
          return [
            key,
            {
              mean: mean(arr),
              std: std(arr)
            }
          ];
        })
      );
    }

    return {
      centralTendency: centralTendency,
      count: records.length
    };
  }
}
