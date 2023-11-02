import { accessibleBy } from '@casl/mongoose';
import { Injectable } from '@nestjs/common';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common/exceptions';
import type { BaseInstrument, InstrumentSummary } from '@open-data-capture/common/instrument';
import type { FilterQuery } from 'mongoose';

import type { EntityOperationOptions } from '@/core/types';

import { MutateInstrumentDto } from './dto/mutate-instrument.dto';
import { InstrumentsRepository } from './instruments.repository';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async count(filter: FilterQuery<BaseInstrument> = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentsRepository.count({
      $and: [filter, ability ? accessibleBy(ability, 'read').Instrument : {}]
    });
  }

  async create({ instance, source }: MutateInstrumentDto) {
    if (await this.instrumentsRepository.exists({ name: instance.name })) {
      throw new ConflictException(`Instrument with name '${instance.name}' already exists!`);
    }
    return this.instrumentsRepository.createFromSource(source);
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const instrument = await this.instrumentsRepository.findById(id);
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    } else if (ability && !ability.can('delete', instrument)) {
      throw new ForbiddenException(`Insufficient rights to delete instrument with ID: ${id}`);
    }
    return (await this.instrumentsRepository.deleteById(id))!;
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.instrumentsRepository.find();
    }
    return this.instrumentsRepository.find({
      $and: [accessibleBy(ability, 'read').Instrument]
    });
  }

  async findAvailable({ ability }: EntityOperationOptions = {}): Promise<InstrumentSummary[]> {
    return this.instrumentsRepository.find(ability ? accessibleBy(ability, 'read').Instrument : {}, {
      projection: {
        details: true,
        kind: true,
        language: true,
        name: true,
        tags: true,
        version: true
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const instrument = await this.instrumentsRepository.findById(id);
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    } else if (ability && !ability.can('delete', instrument)) {
      throw new ForbiddenException(`Insufficient rights to read instrument with ID: ${id}`);
    }
    return instrument;
  }

  async updateById(id: string, { source }: MutateInstrumentDto, { ability }: EntityOperationOptions = {}) {
    const instrument = await this.instrumentsRepository.findById(id);
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    } else if (ability && !ability.can('update', instrument)) {
      throw new ForbiddenException(`Insufficient rights to update instrument with ID: ${id}`);
    }
    return (await this.instrumentsRepository.updateById(id, { source }))!;
  }
}
