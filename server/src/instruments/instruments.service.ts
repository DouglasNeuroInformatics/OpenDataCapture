import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { InstrumentDto } from './dto/instrument.dto';
import { Instrument, InstrumentDocument } from './schemas/instrument.schema';

@Injectable()
export class InstrumentsService {
  constructor(@InjectModel(Instrument.name) private instrumentModel: Model<InstrumentDocument>) {}

  create(dto: InstrumentDto): Promise<Instrument> {
    return this.instrumentModel.create(dto);
  }

  getAll(): Promise<Instrument[]> {
    return this.instrumentModel.find({}).exec();
  }

  async getById(id : string): Promise<Instrument> {
    const instrument = await this.instrumentModel.findById(id);
    if (!instrument) {
      throw new NotFoundException();
    }
    return instrument;
  }
}
