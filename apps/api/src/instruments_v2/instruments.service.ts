import { Injectable } from '@nestjs/common';

import { InstrumentRepository } from './instrument.repository';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentRepository) {}

  create() {
    return;
  }
  
  findAll() {
    return this.instrumentsRepository.findAll();
  }
}
