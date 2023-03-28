import { Injectable } from '@nestjs/common';

import { CreateFormDto } from '../dto/create-form.dto';
import { InstrumentsRepository } from '../repositories/instruments.repository';

@Injectable()
export class FormInstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  create(createFormDto: CreateFormDto): Promise<any> {
    return this.instrumentsRepository.create(createFormDto);
  }
}
