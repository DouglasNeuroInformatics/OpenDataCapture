import { CryptoService, InjectModel, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { getSeriesInstrumentItems, isScalarInstrument, isSeriesInstrument } from '@opendatacapture/instrument-utils';
import type {
  AnyInstrument,
  AnyScalarInstrument,
  InstrumentKind,
  SeriesInstrument,
  SomeInstrument
} from '@opendatacapture/runtime-core';
import type { WithID } from '@opendatacapture/schemas/core';
import { $AnyInstrument } from '@opendatacapture/schemas/instrument';
import type {
  InstrumentBundleContainer,
  InstrumentInfo,
  ScalarInstrumentBundleContainer
} from '@opendatacapture/schemas/instrument';
import { pick } from 'lodash-es';

import { accessibleQuery } from '@/auth/ability.utils';
import type { AppAbility } from '@/auth/auth.types';
import type { EntityOperationOptions } from '@/core/types';

import { CreateInstrumentDto } from './dto/create-instrument.dto';

type InstrumentVirtualizationContext = {
  __resolveImport: (specifier: string) => string;
  instruments: Map<string, WithID<AnyInstrument>>;
};

type InstrumentQuery<TKind extends InstrumentKind> = {
  kind?: TKind;
  subjectId?: string;
};

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectModel('Group') private readonly groupModel: Model<'Group'>,
    @InjectModel('Instrument') private readonly instrumentModel: Model<'Instrument'>,
    private readonly cryptoService: CryptoService,
    private readonly loggingService: LoggingService,
    private readonly virtualizationService: VirtualizationService<InstrumentVirtualizationContext>
  ) {}

  async count<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    options: EntityOperationOptions = {}
  ): Promise<number> {
    return (await this.find(query, options)).length;
  }

  async create({ bundle }: CreateInstrumentDto): Promise<WithID<AnyInstrument>> {
    const result = await this.virtualizationService.eval(bundle);
    if (result.isErr()) {
      this.loggingService.error(result.error);
      throw new UnprocessableEntityException({
        cause: result.error,
        message: 'Failed to interpret instrument bundle'
      });
    }
    const parseResult = await $AnyInstrument.safeParseAsync(result.value);
    if (!parseResult.success) {
      throw new UnprocessableEntityException({
        issues: parseResult.error.issues,
        message: 'Instrument validation failed'
      });
    }
    const instance = parseResult.data;

    const id = this.generateInstrumentId(instance);
    if (await this.instrumentModel.exists({ id })) {
      throw new ConflictException(`Instrument with ID '${id}' already exists!`);
    }

    if (instance.kind === 'SERIES') {
      const result = await this.validateSeriesInstrument(instance);
      if (!result.success) {
        throw new UnprocessableEntityException(result.message);
      }
    } else if (instance.internal.edition > 1) {
      await this.groupModel.updateMany({
        data: {
          accessibleInstrumentIds: {
            push: [id]
          }
        },
        where: {
          accessibleInstrumentIds: {
            has: this.generateScalarInstrumentId({
              internal: { edition: instance.internal.edition - 1, name: instance.internal.name }
            })
          }
        }
      });
    }

    await this.instrumentModel.create({ data: { bundle, id } });
    return { ...instance, id };
  }

  async find<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<WithID<SomeInstrument<TKind>>[]> {
    const instruments = await this.instrumentModel.findMany({
      where: {
        AND: [
          {
            records: query.subjectId
              ? {
                  some: {
                    subjectId: query.subjectId
                  }
                }
              : undefined
          },
          accessibleQuery(ability, 'read', 'Instrument')
        ]
      }
    });
    const instances = await this.instantiate(instruments);
    if (!query.kind) {
      return instances as WithID<SomeInstrument<TKind>>[];
    }
    return instances.filter((instance) => instance.kind === query.kind) as WithID<SomeInstrument<TKind>>[];
  }

  async findBundleById(id: string, options: EntityOperationOptions = {}): Promise<InstrumentBundleContainer> {
    const instance = await this.findById(id, options);
    if (isScalarInstrument(instance)) {
      return {
        bundle: instance.bundle,
        id: instance.id,
        kind: instance.kind
      };
    } else if (isSeriesInstrument(instance)) {
      return {
        bundle: instance.bundle,
        id: instance.id,
        items: await Promise.all(
          getSeriesInstrumentItems(instance.content).map(async (internal) => {
            const id = this.generateScalarInstrumentId({ internal });
            return (await this.findBundleById(id)) as ScalarInstrumentBundleContainer;
          })
        ),
        kind: 'SERIES'
      };
    }
    throw new InternalServerErrorException(`Unexpected instance kind: ${Reflect.get(instance, 'kind')}`);
  }

  async findById(
    id: string,
    { ability }: EntityOperationOptions = {}
  ): Promise<AnyInstrument & { bundle: string; id: string }> {
    const instrument = await this.instrumentModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Instrument')], id }
    });
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    }
    const instance = await this.getInstrumentInstance(instrument);
    return { bundle: instrument.bundle, ...instance };
  }

  async findInfo<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    options: EntityOperationOptions = {}
  ): Promise<InstrumentInfo[]> {
    const instances = await this.find(query, options);

    const sourceMap = await this.buildInstrumentSourceMap(instances.map((instance) => instance.id));

    const results = new Map<string, InstrumentInfo>();
    for (const instance of instances) {
      const info = pick(instance, [
        '__runtimeVersion',
        'clientDetails',
        'details',
        'id',
        'internal',
        'kind',
        'language',
        'tags'
      ]);
      // Expose the source repo id whenever the instrument came from a repo (so it can be filtered per
      // group). The name may be null for legacy instruments imported before names were stored; the
      // client renders those as "uploaded manually" while still treating them as repo-sourced.
      const source = sourceMap.get(info.id);
      if (source?.sourceRepoId) {
        (info as InstrumentInfo).sourceRepo = {
          id: source.sourceRepoId,
          name: source.sourceRepoName ?? null
        };
      }
      if (!info.internal) {
        results.set(info.id, info);
        continue;
      }
      const currentEntry = results.get(info.internal.name);
      if (!currentEntry || info.internal.edition > currentEntry.internal!.edition) {
        results.set(info.internal.name, info);
      }
    }
    return Array.from(results.values());
  }

  /**
   * Resolve the id of the most recent edition of a scalar instrument. Since the id is derived from
   * the name and edition, successive editions can be probed without instantiating any bundle.
   */
  async findLatestScalarEditionId({ internal: { edition, name } }: Pick<AnyScalarInstrument, 'internal'>) {
    let latestId = this.generateScalarInstrumentId({ internal: { edition, name } });
    let nextEdition = edition + 1;
    while (true) {
      const nextId = this.generateScalarInstrumentId({ internal: { edition: nextEdition, name } });
      if (!(await this.instrumentModel.exists({ id: nextId }))) {
        return latestId;
      }
      latestId = nextId;
      nextEdition++;
    }
  }

  generateInstrumentId(instrument: AnyInstrument) {
    if (isScalarInstrument(instrument)) {
      return this.generateScalarInstrumentId(instrument);
    }
    return this.generateSeriesInstrumentId(instrument);
  }

  generateScalarInstrumentId({ internal: { edition, name } }: Pick<AnyScalarInstrument, 'internal'>) {
    return this.cryptoService.hash(`${name}-${edition}`);
  }

  generateSeriesInstrumentId(instrument: SeriesInstrument) {
    return this.cryptoService.hash(
      getSeriesInstrumentItems(instrument.content)
        .map(({ edition, name }) => `${name}-${edition}`)
        .join('--')
    );
  }

  async getInstrumentInstance(instrument: Pick<InstrumentBundleContainer, 'bundle' | 'id'>) {
    let instance = this.virtualizationService.context.instruments.get(instrument.id);
    if (!instance) {
      const result = await this.virtualizationService.eval(instrument.bundle);
      if (result.isErr()) {
        throw new InternalServerErrorException('Failed to evaluate instrument', {
          cause: result.error
        });
      }
      instance = { ...(result.value as AnyInstrument), id: instrument.id };
      this.virtualizationService.context.instruments.set(instrument.id, instance);
    }
    return instance;
  }

  async list<TKind extends InstrumentKind>(query: InstrumentQuery<TKind> = {}, ability: AppAbility) {
    return this.find(query, { ability }).then((arr) => {
      return arr.map((instrument) => ({
        id: instrument.id,
        internal: instrument.internal,
        title: instrument.details.title
      }));
    });
  }

  /**
   * Map of instrument id -> denormalized repository provenance, for the given instruments that came
   * from a repo. Scoped to the requested ids and selecting only the provenance fields so it never
   * loads full instrument records (notably the large `bundle`).
   */
  private async buildInstrumentSourceMap(
    ids: string[]
  ): Promise<Map<string, { sourceRepoId: string; sourceRepoName: null | string }>> {
    const map = new Map<string, { sourceRepoId: string; sourceRepoName: null | string }>();
    if (ids.length === 0) {
      return map;
    }
    const instruments = await this.instrumentModel.findMany({
      select: { id: true, sourceRepoId: true, sourceRepoName: true },
      where: { id: { in: ids }, sourceRepoId: { not: null } }
    });
    for (const inst of instruments) {
      if (inst.sourceRepoId) {
        map.set(inst.id, { sourceRepoId: inst.sourceRepoId, sourceRepoName: inst.sourceRepoName });
      }
    }
    return map;
  }

  private async instantiate(instruments: Pick<InstrumentBundleContainer, 'bundle' | 'id'>[]) {
    return Promise.all(
      instruments.map((instrument) => {
        return this.getInstrumentInstance(instrument);
      })
    );
  }

  private async validateSeriesInstrument(instrument: SeriesInstrument) {
    const items = getSeriesInstrumentItems(instrument.content);
    if (items.length < 2) {
      return { message: 'Series instrument must include at least two items', success: false };
    }
    for (const internal of items) {
      const id = this.generateScalarInstrumentId({ internal });
      const exists = await this.instrumentModel.exists({ id });
      if (!exists) {
        return {
          message: `Cannot find instrument '${internal.name}' with edition '${internal.edition}'`,
          success: false
        };
      }
    }
    return { success: true };
  }
}

export type { InstrumentVirtualizationContext };
