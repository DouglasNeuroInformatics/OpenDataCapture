import { subject } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import { InjectRepository, type ObjectIdLike, type Repository } from '@douglasneuroinformatics/nestjs/modules';
import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common/exceptions';
import { formInstrumentSchema } from '@open-data-capture/common/instrument';
import type {
  BaseInstrument,
  Instrument,
  InstrumentSource,
  InstrumentSummary
} from '@open-data-capture/common/instrument';
import { evaluateInstrument } from '@open-data-capture/instrument-runtime';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import type { Filter } from 'mongodb';

import type { EntityOperationOptions } from '@/core/types';

import { InstrumentEntity } from './entities/instrument.entity';

import type { CreateInstrumentDto } from './dto/create-instrument.dto';
import type { PopulatedInstrument } from './instruments.types';

@Injectable()
export class InstrumentsService {
  private readonly instrumentTransformer = new InstrumentTransformer();

  constructor(
    @InjectRepository(InstrumentEntity) private readonly instrumentsRepository: Repository<InstrumentEntity>
  ) {}

  async count() {
    return this.instrumentsRepository.count();
  }

  async create({ source }: CreateInstrumentDto): Promise<InstrumentEntity> {
    const { bundle, instance } = await this.parseSource(source, formInstrumentSchema);
    if (await this.instrumentsRepository.exists({ name: instance.name })) {
      throw new ConflictException(`Instrument with name '${instance.name}' already exists!`);
    }
    return this.instrumentsRepository.create({ bundle, source, ...instance });
  }

  async findAvailable(
    query: Filter<BaseInstrument> = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentSummary[]> {
    return this.instrumentsRepository.find(
      {
        $and: [query, ability ? accessibleBy(ability, 'read').Instrument : {}]
      },
      {
        ignoreUndefined: true,
        projection: {
          details: true,
          kind: true,
          language: true,
          name: true,
          tags: true,
          version: true
        }
      }
    );
  }

  async findById<T extends Instrument>(
    id: ObjectIdLike,
    { ability }: EntityOperationOptions = {}
  ): Promise<PopulatedInstrument<T>> {
    const entity = await this.instrumentsRepository.findById(id, {
      projection: { _id: true, bundle: true, source: true }
    });
    if (!entity) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id.toString()}`);
    }
    const instrument: T = evaluateInstrument<T>(entity.bundle);
    if (ability && !ability.can('read', subject('Instrument', instrument))) {
      throw new ForbiddenException(`Insufficient rights to read instrument with ID: ${id.toString()}`);
    }
    return { _id: entity._id, bundle: '', source: '', ...instrument };
  }

  async findSources(
    query: Filter<BaseInstrument>,
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentSource[]> {
    return this.instrumentsRepository.find(
      {
        $and: [query, ability ? accessibleBy(ability, 'read').Instrument : {}]
      },
      {
        ignoreUndefined: true,
        projection: {
          source: true
        }
      }
    );
  }

  /**
   * Attempt to resolve an instance of an instrument from the TypeScript source code.
   * If this fails, then throws an UnprocessableContentException
   */
  private async parseSource<T extends Instrument>(source: string, schema: Zod.ZodType<T>) {
    let bundle: string;
    let instance: unknown;
    try {
      bundle = await this.instrumentTransformer.generateBundle(source);
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
