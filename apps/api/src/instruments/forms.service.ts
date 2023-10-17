import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Injectable } from '@nestjs/common';
import type { FormInstrument, InstrumentLanguage } from '@open-data-capture/types';
import type { Types } from 'mongoose';

import { InstrumentsRepository } from './instruments.repository';

@Injectable()
export class FormsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async create<TData extends FormDataType = FormDataType, TLanguage extends InstrumentLanguage = InstrumentLanguage>(
    formInstrument: FormInstrument<TData, TLanguage>
  ) {
    return this.instrumentsRepository.create(formInstrument);
  }

  async findAll() {
    return this.instrumentsRepository.findAll();
  }

  async findById(id: Types.ObjectId) {
    return this.instrumentsRepository.findById(id);
  }
}
