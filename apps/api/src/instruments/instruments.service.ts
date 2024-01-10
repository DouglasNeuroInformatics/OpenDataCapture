import { Injectable } from '@nestjs/common';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import type { Instrument, InstrumentKind, InstrumentSummary } from '@open-data-capture/common/instrument';
import { evaluateInstrument } from '@open-data-capture/common/instrument';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateInstrumentDto } from './dto/create-instrument.dto';

@Injectable()
export class InstrumentsService {
  private readonly instrumentTransformer = new InstrumentTransformer();

  constructor(@InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>) {}

  async count(
    filter: NonNullable<Parameters<Model<'Instrument'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ) {
    return this.instrumentModel.count({ where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), filter] } });
  }

  async create<TKind extends InstrumentKind>({ kind, source }: CreateInstrumentDto<TKind>) {
    const { bundle, instance } = await this.parseSource(source, { kind });
    if (await this.instrumentModel.exists({ name: instance.name })) {
      throw new ConflictException(`Instrument with name '${instance.name}' already exists!`);
    }

    return this.instrumentModel.create({
      data: {
        bundle,
        source,
        ...instance
      }
    });
  }

  async find(query: { kind?: InstrumentKind } = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentModel.findMany({
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), query] }
    });
  }

  async findAvailable(
    query: { kind?: InstrumentKind } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentSummary[]> {
    return this.instrumentModel.findMany({
      select: { details: true, id: true, kind: true, language: true, name: true, tags: true, version: true },
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), query, { kind: 'FORM' }] }
    }) as Promise<InstrumentSummary[]>;
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const instrument = await this.instrumentModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument')], id }
    });
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    }
    return instrument;
  }

  async findSources(query: { kind?: InstrumentKind } = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentModel.findMany({
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), query] }
    });
  }

  /**
   * Attempt to resolve an instance of an instrument from the TypeScript source code.
   * If this fails, then throws an UnprocessableContentException
   */
  private async parseSource<TKind extends InstrumentKind>(source: string, options?: { kind?: TKind }) {
    let bundle: string;
    let instance: Extract<Instrument, { kind: TKind }>;
    try {
      bundle = await this.instrumentTransformer.generateBundle(source);
      instance = await evaluateInstrument(bundle, {
        kind: options?.kind,
        validate: true
      });
    } catch (err) {
      throw new UnprocessableEntityException('Failed to parse instrument', {
        cause: err
      });
    }
    return { bundle, instance };
  }
}
