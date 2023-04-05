import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { AppAbility, FormInstrumentData, FormInstrumentRecord, FormInstrumentRecordsSummary } from '@ddcp/common';
import { Model } from 'mongoose';

import { FormInstrumentRecordEntity } from '../entities/form-instrument-record.entity';
import { InstrumentRecordEntity } from '../entities/instrument-record.entity';

import { FormsService } from './forms.service';

import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class FormRecordsService {
  constructor(
    @InjectModel(InstrumentRecordEntity.modelName)
    private readonly formRecordsModel: Model<FormInstrumentRecordEntity, AccessibleModel<FormInstrumentRecordEntity>>,
    private readonly formsService: FormsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create<T extends FormInstrumentData>(
    formInstrumentRecord: FormInstrumentRecord<T>
  ): Promise<FormInstrumentRecord> {
    return this.formRecordsModel.create(formInstrumentRecord);
  }

  async find(
    ability: AppAbility,
    instrumentName?: string,
    subjectIdentifier?: string
  ): Promise<FormInstrumentRecord[]> {
    const filter: Record<string, any> = {};
    if (instrumentName) {
      filter.instrument = (await this.formsService.findByName(instrumentName)) as unknown;
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
