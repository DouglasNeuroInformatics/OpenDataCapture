import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { AppAbility } from '@ddcp/common/auth';
import { Group } from '@ddcp/common/groups';
import { FormInstrumentRecord, FormInstrumentRecordsSummary, InstrumentRecordsExport } from '@ddcp/common/instruments';
import { DateUtils } from '@ddcp/common/utils';
import { Model } from 'mongoose';

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

  async find(
    ability: AppAbility,
    instrumentName?: string,
    subjectIdentifier?: string
  ): Promise<FormInstrumentRecord[]> {
    const filter: Record<string, any> = {};
    if (instrumentName) {
      filter.instrument = await this.formsService.findByName(instrumentName);
    }
    if (subjectIdentifier) {
      filter.subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    }
    return this.formRecordsModel.find(filter).accessibleBy(ability).populate('group instrument');
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
}
