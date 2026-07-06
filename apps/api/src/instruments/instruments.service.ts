import { CryptoService, InjectModel, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { bundle } from '@opendatacapture/instrument-bundler';
import { getSeriesInstrumentItems, isScalarInstrument, isSeriesInstrument } from '@opendatacapture/instrument-utils';
import type {
  AnyInstrument,
  AnyScalarInstrument,
  InstrumentKind,
  ScalarInstrumentInternal,
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
import { CreateSeriesInstrumentDto } from './dto/create-series-instrument.dto';

type InstrumentVirtualizationContext = {
  __resolveImport: (specifier: string) => string;
  instruments: Map<string, WithID<AnyInstrument>>;
};

/**
 * Returned by `createSeries` instead of creating an instrument when a series with the same set of forms
 * already exists and the caller has not confirmed they want a duplicate.
 */
type SeriesDuplicateConfirmation = {
  existingTitle: string;
  requiresConfirmation: true;
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
    @InjectModel('InstrumentRecord') private readonly instrumentRecordModel: Model<'InstrumentRecord'>,
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

  /**
   * Assemble a new series instrument from existing scalar instruments. The title must be unique among
   * instruments the caller can see; the series bundle is generated server-side and run through the same
   * validation/creation path as any other instrument.
   *
   * If another series already contains the exact same set of forms (regardless of order or name) and the
   * caller has not opted to proceed, no instrument is created — instead a confirmation prompt is returned
   * naming the existing series, so the client can ask the user whether they really want a duplicate.
   */
  async createSeries(
    { confirmDuplicate, description, instructions, items, title }: CreateSeriesInstrumentDto,
    options: EntityOperationOptions = {}
  ): Promise<SeriesDuplicateConfirmation | WithID<AnyInstrument>> {
    const trimmedTitle = title.trim();
    if (await this.isInstrumentTitleTaken(trimmedTitle, options)) {
      throw new ConflictException(`An instrument named '${trimmedTitle}' already exists`);
    }
    if (!confirmDuplicate) {
      const existingTitle = await this.findSeriesTitleWithSameForms(items, options);
      if (existingTitle !== null) {
        return { existingTitle, requiresConfirmation: true };
      }
    }
    const source = this.generateSeriesInstrumentSource({
      description: description?.trim(),
      instructions: instructions?.trim(),
      items,
      title: trimmedTitle
    });
    const generatedBundle = await bundle({ inputs: [{ content: source, name: 'index.ts' }], minify: true });
    return this.create({ bundle: generatedBundle });
  }

  /**
   * Delete an instrument the caller is permitted to remove, but only when no records have been collected
   * with it (so historical data is never orphaned). Also detaches it from any group that exposes it.
   */
  async deleteById(id: string, { ability }: EntityOperationOptions = {}): Promise<{ id: string }> {
    const instrument = await this.instrumentModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'delete', 'Instrument')], id }
    });
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    }
    const recordCount = await this.instrumentRecordModel.count({ where: { instrumentId: id } });
    if (recordCount > 0) {
      throw new ForbiddenException(
        `Cannot delete instrument: ${recordCount} record(s) have already been collected with it`
      );
    }
    // Mongo does not cascade scalar-list relations, so pull the id from every group that exposes it
    // before removing the instrument itself.
    const groups = await this.groupModel.findMany({
      select: { accessibleInstrumentIds: true, id: true },
      where: { accessibleInstrumentIds: { has: id } }
    });
    await Promise.all(
      groups.map((group) =>
        this.groupModel.update({
          data: { accessibleInstrumentIds: { set: group.accessibleInstrumentIds.filter((value) => value !== id) } },
          where: { id: group.id }
        })
      )
    );
    await this.instrumentModel.delete({ where: { id } });
    return { id };
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
    const scalarInstrumentIds = new Map(
      instances.flatMap((instance) => {
        if (!isScalarInstrument(instance) || !instance.internal) {
          return [];
        }
        return [[`${instance.internal.name}:${instance.internal.edition}`, instance.id] as const];
      })
    );

    const results = new Map<string, InstrumentInfo>();
    for (const instance of instances) {
      const info: InstrumentInfo = pick(instance, [
        '__runtimeVersion',
        'clientDetails',
        'details',
        'id',
        'internal',
        'kind',
        'language',
        'tags'
      ]);
      if (isSeriesInstrument(instance)) {
        info.seriesItems = getSeriesInstrumentItems(instance.content)
          .map(({ edition, name }) => scalarInstrumentIds.get(`${name}:${edition}`))
          .filter((id): id is string => typeof id === 'string')
          .map((id) => ({ id }));
      }
      // Expose the source repo id whenever the instrument came from a repo (so it can be filtered per
      // group). The name may be null for legacy instruments imported before names were stored; the
      // client renders those as "uploaded manually" while still treating them as repo-sourced.
      const source = sourceMap.get(info.id);
      if (source?.sourceRepoId) {
        (info).sourceRepo = {
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
      JSON.stringify({
        content: instrument.content,
        title: instrument.details.title
      })
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

  /**
   * The title of an existing series instrument that contains the exact same set of forms as `items`
   * (regardless of order), or `null` when none exists. Used to warn before creating a redundant series.
   */
  private async findSeriesTitleWithSameForms(
    items: ScalarInstrumentInternal[],
    { ability }: EntityOperationOptions = {}
  ): Promise<null | string> {
    const targetKey = this.getFormSetKey(items);
    const seriesInstances = await this.find({ kind: 'SERIES' }, { ability });
    for (const series of seriesInstances) {
      if (!isSeriesInstrument(series)) {
        continue;
      }
      if (this.getFormSetKey(getSeriesInstrumentItems(series.content)) === targetKey) {
        const value = series.details.title;
        return typeof value === 'string' ? value : (Object.values(value)[0] ?? null);
      }
    }
    return null;
  }

  /**
   * Generate the TypeScript source for an on-the-fly series instrument. The definition is plain
   * JSON-serializable data, so it is emitted as a single default export with no runtime imports.
   */
  private generateSeriesInstrumentSource({
    description,
    instructions,
    items,
    title
  }: {
    description?: string;
    instructions?: string;
    items: ScalarInstrumentInternal[];
    title: string;
  }): string {
    const text = description && description.length > 0 ? description : title;
    const definition = {
      __runtimeVersion: 1,
      ...(instructions && instructions.length > 0
        ? { clientDetails: { instructions: { en: [instructions], fr: [instructions] } } }
        : {}),
      content: {
        items: items.map(({ edition, name }) => ({ edition, name }))
      },
      details: {
        description: { en: text, fr: text },
        license: 'UNLICENSED',
        title: { en: title, fr: title }
      },
      kind: 'SERIES',
      language: ['en', 'fr'],
      tags: { en: ['Series'], fr: ['Série'] }
    };
    return `export default ${JSON.stringify(definition)};`;
  }

  /**
   * A stable, order-independent key identifying the set of forms in a series. Two series with the same
   * forms produce the same key even if the forms were added in a different order.
   */
  private getFormSetKey(items: ScalarInstrumentInternal[]): string {
    return items
      .map(({ edition, name }) => `${name}-${edition}`)
      .sort()
      .join('--');
  }

  private async instantiate(instruments: Pick<InstrumentBundleContainer, 'bundle' | 'id'>[]) {
    return Promise.all(
      instruments.map((instrument) => {
        return this.getInstrumentInstance(instrument);
      })
    );
  }

  /**
   * Whether an instrument visible to the caller already uses the given title (case-insensitive). Used to
   * enforce that newly-created series instruments have a unique, recognizable name.
   */
  private async isInstrumentTitleTaken(title: string, { ability }: EntityOperationOptions = {}): Promise<boolean> {
    const normalized = title.trim().toLowerCase();
    const instances = await this.find({}, { ability });
    return instances.some((instance) => {
      const value = instance.details.title;
      const titles = typeof value === 'string' ? [value] : Object.values(value);
      return titles.some((candidate) => typeof candidate === 'string' && candidate.trim().toLowerCase() === normalized);
    });
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

export type { InstrumentVirtualizationContext, SeriesDuplicateConfirmation };
