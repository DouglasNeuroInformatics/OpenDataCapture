import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FormInstrumentData, FormInstrumentRecord } from '@ddcp/common';
import { Model } from 'mongoose';

import { FormInstrumentRecordEntity } from '../entities/form-instrument-record.entity';
import { InstrumentRecordEntity } from '../entities/instrument-record.entity';

import { FormInstrumentsService } from './form-instruments.service';

import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class InstrumentRecordsService {
  constructor(
    @InjectModel(InstrumentRecordEntity.modelName) private formRecordsModel: Model<FormInstrumentRecordEntity>,
    private readonly formInstrumentsService: FormInstrumentsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async createFormRecord<T extends FormInstrumentData>(
    formInstrumentRecord: FormInstrumentRecord<T>
  ): Promise<FormInstrumentRecord> {
    return this.formRecordsModel.create(formInstrumentRecord);
  }

  async getInstrumentRecords(instrumentName?: string, subjectIdentifier?: string): Promise<FormInstrumentRecord[]> {
    const filter: Record<string, any> = {};
    if (instrumentName) {
      filter.instrument = (await this.formInstrumentsService.findByName(instrumentName)) as unknown;
    }
    if (subjectIdentifier) {
      filter.subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    }
    const records = await this.formRecordsModel.find(filter).populate('group', 'name').populate('instrument');
    return records;
  }
}
