import { Injectable, NotFoundException } from '@nestjs/common';

import { InstrumentKind } from '@ddcp/common';

import { CreateFormDto } from '../dto/create-form.dto';
import { InstrumentsRepository } from '../repositories/instruments.repository';

@Injectable()
export class FormInstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  create(createFormDto: CreateFormDto): Promise<any> {
    return this.instrumentsRepository.create(createFormDto);
  }

  findAll(): Promise<any[]> {
    return this.instrumentsRepository.find();
  }

  async findById(id: string): Promise<any> {
    const result = await this.instrumentsRepository.findById(id);
    if (!result || result.kind !== InstrumentKind.Form) {
      throw new NotFoundException(`Failed to find form with id: ${id}`);
    }
    return result;
  }

  remove(id: string): Promise<any> {
    return this.instrumentsRepository.findOneAndDelete({ id });
  }
}
