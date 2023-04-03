import { Injectable, NotFoundException } from '@nestjs/common';

import { FormInstrument, FormInstrumentData, FormSummary } from '@ddcp/common';

import { InstrumentsRepository } from '../repositories/instruments.repository';

@Injectable()
export class FormInstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  create<T extends FormInstrumentData>(formInstrument: FormInstrument<T>): Promise<any> {
    return this.instrumentsRepository.create(formInstrument);
  }

  findAll(): Promise<any[]> {
    return this.instrumentsRepository.find({ kind: 'form' });
  }

  async getAvailable(): Promise<FormSummary[]> {
    return this.instrumentsRepository.find({ kind: 'form' }).select('name tags version details').lean();
  }

  async findById(id: string): Promise<any> {
    const result = await this.instrumentsRepository.findById(id);
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with id: ${id}`);
    }
    return result;
  }

  async findByName(name: string): Promise<any> {
    const result = await this.instrumentsRepository.findOne({ name });
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with name: ${name}`);
    }
    return result;
  }

  remove(id: string): Promise<any> {
    return this.instrumentsRepository.findOneAndDelete({ id });
  }
}
