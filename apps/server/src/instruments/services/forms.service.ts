import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { FormInstrument, FormInstrumentData, FormInstrumentSummary } from '@ddcp/common';
import { Model } from 'mongoose';

import { FormInstrumentEntity } from '../entities/form-instrument.entity';
import { InstrumentEntity } from '../entities/instrument.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(InstrumentEntity.modelName)
    private readonly formModel: Model<FormInstrumentEntity, AccessibleModel<FormInstrumentEntity>>
  ) {}

  create<T extends FormInstrumentData>(formInstrument: FormInstrument<T>): Promise<FormInstrument> {
    return this.formModel.create(formInstrument);
  }

  findAll(): Promise<FormInstrument[]> {
    return this.formModel.find({ kind: 'form' });
  }

  async getAvailable(): Promise<FormInstrumentSummary[]> {
    return this.formModel.find({ kind: 'form' }).select('name tags version details').lean();
  }

  async findById(id: string): Promise<FormInstrument> {
    const result = await this.formModel.findById(id);
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with id: ${id}`);
    }
    return result;
  }

  async findByName(name: string): Promise<FormInstrument> {
    const result = await this.formModel.findOne({ name });
    if (!result || result.kind !== 'form') {
      throw new NotFoundException(`Failed to find form with name: ${name}`);
    }
    return result;
  }

  async remove(id: string): Promise<FormInstrument> {
    const result = await this.formModel.findByIdAndDelete(id, { new: true });
    if (!result) {
      throw new NotFoundException(`Failed to find form with id: ${id}`);
    }
    return result;
  }
}
