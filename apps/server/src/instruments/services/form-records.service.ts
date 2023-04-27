import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
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
import { Model, ObjectId } from 'mongoose';

import { CreateFormRecordDto } from '../dto/create-form-record.dto';
import { FormInstrumentRecordEntity } from '../entities/form-instrument-record.entity';
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
    const { kind, dateCollected, data, instrumentName, groupName, subjectInfo } = dto;

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
      dateCollected,
      data: this.ajvService.validate(data, instrument.validationSchema, (error) => {
        throw new BadRequestException(error);
      }),
      instrument,
      group,
      subject
    });
  }

  async find(ability: AppAbility, subjectIdentifier: string): Promise<SubjectFormRecords[]> {
    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);

    const uniqueInstruments: ObjectId[] = await this.formRecordsModel
      .find({ subject }, 'instrument')
      .accessibleBy(ability)
      .distinct('instrument');

    const arr: SubjectFormRecords[] = [];
    for (const instrumentId of uniqueInstruments) {
      const instrument = await this.formsService.findById(instrumentId);
      const records: SubjectFormRecords['records'] = await this.formRecordsModel
        .find({ instrument, subject })
        .accessibleBy(ability)
        .select(['data', 'dateCollected'])
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

  async summary(ability: AppAbility, groupName?: string): Promise<FormInstrumentRecordsSummary> {
    const group = groupName ? await this.groupsService.findByName(groupName, ability) : undefined;
    return {
      count: await this.formRecordsModel.find({ group }).accessibleBy(ability).count()
    };
  }

  async export(ability: AppAbility, groupName?: string): Promise<InstrumentRecordsExport> {
    const group = groupName ? await this.groupsService.findByName(groupName, ability) : undefined;
    const subjects = await this.subjectsService.findAll(ability, groupName);
    const data: InstrumentRecordsExport = [];
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const records = await this.formRecordsModel.find({ kind: 'form', group, subject }, undefined, ['instrument']);
      for (let j = 0; j < records.length; j++) {
        const record = records[j];
        for (const measure of Object.keys(record.data)) {
          data.push({
            subjectId: subject.identifier,
            subjectAge: DateUtils.yearsPassed(subject.dateOfBirth),
            subjectSex: subject.sex,
            instrumentName: record.instrument.name,
            instrumentVersion: record.instrument.version,
            timestamp: record.dateCollected.toISOString(),
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
        return measure.formula.fields.map((field) => data[field] as number).reduce((a, b) => a + b, 0);
    }
  }
}
