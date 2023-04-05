import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { AppAbility, FormInstrumentRecord, FormInstrumentRecordsSummary, Group } from '@ddcp/common';
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

  async create(
    { kind, dateCollected, data, instrumentId, groupId, subjectIdentifier }: CreateFormRecordDto,
    ability: AppAbility
  ): Promise<FormInstrumentRecord> {
    const instrument = await this.formsService.findById(instrumentId);
    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);

    let group: Group | undefined;
    if (groupId) {
      group = await this.groupsService.findById(groupId, ability);
      if (!subject.groups.includes(group)) {
        await this.subjectsService.appendGroup(subjectIdentifier, group);
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

  async find(ability: AppAbility, instrumentId?: string, subjectIdentifier?: string): Promise<FormInstrumentRecord[]> {
    const filter: Record<string, any> = {};
    if (instrumentId) {
      filter.instrument = await this.formsService.findById(instrumentId);
    }
    if (subjectIdentifier) {
      filter.subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    }
    return this.formRecordsModel.find(filter).accessibleBy(ability).populate('group');
  }

  async summary(ability: AppAbility): Promise<FormInstrumentRecordsSummary> {
    return {
      count: await this.formRecordsModel.find().accessibleBy(ability).count()
    };
  }
}
