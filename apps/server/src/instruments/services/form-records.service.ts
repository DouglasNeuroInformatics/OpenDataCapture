import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Language } from '@douglasneuroinformatics/common';
import { AppAbility } from '@douglasneuroinformatics/common/auth';
import { Group } from '@douglasneuroinformatics/common/groups';
import {
  FormInstrumentData,
  FormInstrumentRecord,
  FormInstrumentRecordsSummary,
  InstrumentRecordsExport,
  Measure,
  SubjectFormRecords
} from '@douglasneuroinformatics/common/instruments';
import { DateUtils } from '@douglasneuroinformatics/common/utils';
import { Model } from 'mongoose';

import { CreateFormRecordDto } from '../dto/create-form-record.dto';
import { FormInstrumentRecordEntity } from '../entities/form-instrument-record.entity';
import { FormInstrumentEntity } from '../entities/form-instrument.entity';
import { InstrumentRecordEntity } from '../entities/instrument-record.entity';

import { FormsService } from './forms.service';

import { AjvService } from '@/ajv/ajv.service';
import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';

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

  async create(dto: CreateFormRecordDto, ability: AppAbility): Promise<FormInstrumentRecord> {
    const { kind, time, data, instrumentName, groupName, subjectInfo } = dto;

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
      kind,
      time,
      data: this.ajvService.validate(data, instrument.validationSchema, (error) => {
        console.error(error);
        throw new BadRequestException();
      }),
      instrument,
      group,
      subject
    });
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
        .find({ subject, instrument: { $in: instruments } })
        .populate({ path: 'instrument', select: 'identifier details.language' })
        .accessibleBy(ability)
        .select(['data', 'time'])
        .lean();

      if (instrument.measures) {
        for (let i = 0; i < records.length; i++) {
          const computedMeasures: Record<string, number> = {};
          for (const key in instrument.measures) {
            const measure = instrument.measures[key];
            computedMeasures[key] = this.computeMeasure(measure, records[i].data);
          }
          records[i].computedMeasures = computedMeasures;
        }
      }
      arr.push({ instrument, records: records });
    }
    return arr;
  }

  async summary(
    ability: AppAbility,
    groupName?: string,
    instrumentIdentifier?: string
  ): Promise<FormInstrumentRecordsSummary> {
    const group = groupName ? await this.groupsService.findByName(groupName, ability) : undefined;
    const instrument = instrumentIdentifier
      ? await this.formsService.findByIdentifier(instrumentIdentifier)
      : undefined;
    return {
      count: await this.formRecordsModel.find({ group, instrument }).accessibleBy(ability).count()
    };
  }

  async export(ability: AppAbility, groupName?: string): Promise<InstrumentRecordsExport> {
    const group = groupName ? await this.groupsService.findByName(groupName, ability) : undefined;
    const subjects = await this.subjectsService.findAll(ability, groupName);
    const data: InstrumentRecordsExport = [];
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const records = await this.formRecordsModel.find({ kind: 'form', group, subject }).populate('instrument');
      for (let j = 0; j < records.length; j++) {
        const record = records[j];
        for (const measure of Object.keys(record.data)) {
          data.push({
            subjectId: subject.identifier,
            subjectAge: DateUtils.yearsPassed(subject.dateOfBirth),
            subjectSex: subject.sex,
            instrumentName: record.instrument.name,
            instrumentVersion: record.instrument.version,
            timestamp: new Date(record.time).toISOString(),
            measure: measure,
            value: record.data[measure] as unknown
          });
        }
      }
    }
    return data;
  }

  private computeMeasure<T extends FormInstrumentData>(measure: Measure<T>, data: T): number {
    // data[measure.formula.field] should always be a number because only numeric fields may be used for fields in measure
    switch (measure.formula.kind) {
      case 'const':
        return data[measure.formula.field] as number;
      case 'sum':
        // eslint-disable-next-line no-case-declarations
        const coerceBool = measure.formula.options?.coerceBool;
        return measure.formula.fields
          .map((field) => {
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
}
