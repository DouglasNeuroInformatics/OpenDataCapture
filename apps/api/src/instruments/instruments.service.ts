import { accessibleBy } from '@casl/mongoose';
import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common/exceptions';
import type { BaseInstrument, InstrumentSummary } from '@open-data-capture/common/instrument';
import { baseInstrumentSchema, evaluateInstrument } from '@open-data-capture/common/instrument';
import type { FilterQuery } from 'mongoose';

import type { EntityOperationOptions } from '@/core/types';

import { MutateInstrumentDto } from './dto/mutate-instrument.dto';
import { InstrumentsRepository } from './instruments.repository';
import { generateBundle } from './instruments.utils';

@Injectable()
export class InstrumentsService {
  constructor(private readonly instrumentsRepository: InstrumentsRepository) {}

  async count(filter: FilterQuery<BaseInstrument> = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentsRepository.count({
      $and: [filter, ability ? accessibleBy(ability, 'read').Instrument : {}]
    });
  }

  async create({ source }: MutateInstrumentDto) {
    const { instance } = await this.parseSource(source, baseInstrumentSchema);
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

  /**
   * Attempt to resolve an instance of an instrument from the TypeScript source code.
   * If this fails, then throws an UnprocessableContentException
   */
  private async parseSource<T extends BaseInstrument>(source: string, schema: Zod.ZodType<T>) {
    let bundle: string;
    let instance: unknown;
    try {
      bundle = generateBundle(source);
      instance = evaluateInstrument(bundle);
    } catch (err) {
      throw new UnprocessableEntityException('Failed to parse instrument', {
        cause: err
      });
    }
    const result = await schema.safeParseAsync(instance);
    if (!result.success) {
      throw new UnprocessableEntityException(
        'Successfully parsed instrument, but resolved object does not conform to expected format',
        {
          cause: result.error
        }
      );
    }
    return { bundle, instance: result.data };
  }
}
