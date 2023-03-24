import { Injectable } from '@nestjs/common';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentsRepository } from './instruments.repository';
import { Instrument } from './entities/instrument.entity';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  create(createInstrumentDto: CreateInstrumentDto): Promise<Instrument> {
    return this.instrumentsRepository.create(createInstrumentDto);
  }

  findAll(): Promise<Instrument[]> {
    return this.instrumentsRepository.find();
  }
}
