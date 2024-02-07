import { Injectable, Logger } from '@nestjs/common';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common/exceptions';
import type { InstrumentKind, InstrumentSummary, SomeInstrument } from '@open-data-capture/common/instrument';
import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';
import { InstrumentTransformer } from '@open-data-capture/instrument-transformer';
import _ from 'lodash';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateInstrumentDto } from './dto/create-instrument.dto';

@Injectable()
export class InstrumentsService {
  private readonly instrumentInterpreter = new InstrumentInterpreter({
    transformBundle: (bundle) => this.instrumentTransformer.transformRuntimeImports(bundle)
  });
  private readonly instrumentTransformer = new InstrumentTransformer();
  private readonly logger = new Logger(InstrumentsService.name);

  constructor(@InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>) {}

  async count(
    filter: NonNullable<Parameters<Model<'Instrument'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ) {
    return this.instrumentModel.count({ where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), filter] } });
  }

  async create<TKind extends InstrumentKind>({ kind, source }: CreateInstrumentDto<TKind>) {
    this.logger.debug('Attempting to parse instrument source...');
    const bundle = await this.parseSource(source);
    this.logger.debug('Done parsing source for instrument');

    return this.createFromBundle({ bundle, source }, { kind });
  }

  async createFromBundle<TKind extends InstrumentKind>(
    { bundle, source }: { bundle: string; source: string },
    options?: { kind?: TKind }
  ) {
    const instance = await this.interpretBundle(bundle, options);

    this.logger.debug(`Checking if instrument '${instance.name}' exists...`);
    if (await this.instrumentModel.exists({ name: instance.name })) {
      throw new ConflictException(`Instrument with name '${instance.name}' already exists!`);
    }

    this.logger.debug(`Instrument '${instance.name}' does not exist`);

    return this.instrumentModel.create({
      data: {
        ..._.omit({ ...instance }, ['content', 'measures', 'validationSchema']),
        bundle,
        details: {
          ...instance.details,
          authors: instance.details.authors ?? []
        },
        source
      }
    });
  }

  async find(query: { kind?: InstrumentKind } = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentModel.findMany({
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), query] }
    });
  }

  async findBundles(query: { kind?: InstrumentKind } = {}, { ability }: EntityOperationOptions = {}) {
    return this.instrumentModel.findMany({
      select: {
        bundle: true,
        id: true
      },
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), query] }
    });
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

  async findSummaries(
    query: { kind?: InstrumentKind } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<InstrumentSummary[]> {
    return this.instrumentModel.findMany({
      select: { details: true, id: true, kind: true, language: true, name: true, tags: true, version: true },
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), query] }
    }) as Promise<InstrumentSummary[]>;
  }

  private async interpretBundle<TKind extends InstrumentKind>(bundle: string, options?: { kind?: TKind }) {
    let instance: SomeInstrument<TKind>;
    try {
      instance = await this.instrumentInterpreter.interpret(bundle, {
        kind: options?.kind,
        validate: true
      });
    } catch (err) {
      throw new UnprocessableEntityException('Failed to interpret instrument bundle', {
        cause: err
      });
    }
    return instance;
  }

  /**
   * Attempt to resolve an instance of an instrument from the TypeScript source code.
   * If this fails, then throws an UnprocessableContentException
   */
  private async parseSource(source: string) {
    let bundle: string;
    try {
      bundle = await this.instrumentTransformer.generateBundle(source);
    } catch (err) {
      throw new UnprocessableEntityException('Failed to parse instrument source', {
        cause: err
      });
    }
    return bundle;
  }
}
