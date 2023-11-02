import { Injectable } from '@nestjs/common';
import { evaluateInstrument } from '@open-data-capture/common/instrument';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { InstrumentTranspiler } from './instrument.transpiler';
import { InstrumentsRepository } from './instruments.repository';

@Injectable()
export class InstrumentsService {
  constructor(
    private readonly instrumentTranspiler: InstrumentTranspiler,
    private readonly instrumentsRepository: InstrumentsRepository
  ) {}

  create({ source }: CreateInstrumentDto) {
    const bundle = this.instrumentTranspiler.transpile(source);
    const instrument = evaluateInstrument(bundle);
    return this.instrumentsRepository.create({ source });
  }
}
