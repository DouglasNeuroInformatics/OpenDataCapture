import { Injectable } from '@nestjs/common';

import { InstrumentRepository } from '../repositories/instrument.repository';

import type { CreateFormInstrumentDto } from '../dto/create-form-instrument.dto';

@Injectable()
export class FormsService {
  constructor(private readonly instrumentsRepository: InstrumentRepository) {}

  async create(createFormInstrumentDto: CreateFormInstrumentDto) {
    return this.instrumentsRepository.create(createFormInstrumentDto);
  }

  findAll() {
    return this.instrumentsRepository.findAll();
  }
}
