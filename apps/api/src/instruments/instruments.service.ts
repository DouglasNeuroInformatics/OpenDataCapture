import { accessibleBy } from '@casl/mongoose';
import { Injectable } from '@nestjs/common';

import type { EntityOperationOptions } from '@/core/types';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentsRepository } from './instruments.repository';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  create({ source }: CreateInstrumentDto) {
    return this.instrumentsRepository.create({ source });
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.instrumentsRepository.find();
    }
    return this.instrumentsRepository.find({
      $and: [accessibleBy(ability, 'read').Instrument]
    });
  }
}
