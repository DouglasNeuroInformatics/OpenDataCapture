import { Injectable } from '@nestjs/common';
import type { Types } from 'mongoose';

import { InstrumentRepository } from '../repositories/instrument.repository';

import type { CreateFormInstrumentDto } from '../dto/create-form-instrument.dto';

@Injectable()
export class FormsService {
  constructor(private readonly instrumentsRepository: InstrumentRepository) {}

  async create(createFormInstrumentDto: CreateFormInstrumentDto) {
    return this.instrumentsRepository.create(createFormInstrumentDto);
  }

  async findAll() {
    return this.instrumentsRepository.findAll();
  }

  async findById(id: Types.ObjectId) {
    return this.instrumentsRepository.findById(id);
  }
}
