import { InjectRepository, type Repository } from '@douglasneuroinformatics/nestjs/modules';
import { Injectable } from '@nestjs/common';

import { InstrumentSourceEntity } from './entities/instrument-source.entity';

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(InstrumentSourceEntity) private readonly sourceRepository: Repository<InstrumentSourceEntity>
  ) {}

  async create(entity: InstrumentSourceEntity): Promise<InstrumentSourceEntity> {
    return this.sourceRepository.create(entity);
  }
}
