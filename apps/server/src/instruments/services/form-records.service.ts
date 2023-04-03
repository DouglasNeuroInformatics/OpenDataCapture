import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FormInstrumentData, FormInstrumentRecord, FormInstrumentRecordsSummary } from '@ddcp/common';
import { Model } from 'mongoose';

import { FormInstrumentRecordEntity } from '../entities/form-instrument-record.entity';
import { InstrumentRecordEntity } from '../entities/instrument-record.entity';

import { FormsService } from './forms.service';

import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class FormRecordsService {
  constructor(
    @InjectModel(InstrumentRecordEntity.modelName) private formRecordsModel: Model<FormInstrumentRecordEntity>,
    private readonly formsService: FormsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create<T extends FormInstrumentData>(
    formInstrumentRecord: FormInstrumentRecord<T>
  ): Promise<FormInstrumentRecord> {
    return this.formRecordsModel.create(formInstrumentRecord);
  }

  async find(instrumentName?: string, subjectIdentifier?: string): Promise<FormInstrumentRecord[]> {
    const filter: Record<string, any> = {};
    if (instrumentName) {
      filter.instrument = (await this.formsService.findByName(instrumentName)) as unknown;
    }
    if (subjectIdentifier) {
      filter.subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    }
    const records = await this.formRecordsModel.find(filter).populate('group', 'name').populate('instrument');
    return records;
  }

  async summarize(): Promise<FormInstrumentRecordsSummary> {
    return {
      count: await this.formRecordsModel.count()
    };
  }
}
