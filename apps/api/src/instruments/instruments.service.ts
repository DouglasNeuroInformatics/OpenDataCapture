import { CryptoService, InjectModel, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
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
  ClientInstrumentDetails,
  InstrumentKind,
  InstrumentLanguage,
  InstrumentUIOption,
  Language,
  ScalarInstrumentInternal,
  SeriesInstrument,
  SomeInstrument
} from '@opendatacapture/runtime-core';
import type { WithID } from '@opendatacapture/schemas/core';
import { $AnyInstrument } from '@opendatacapture/schemas/instrument';
import type {
  $CreateSeriesInstrumentData,
  CreateSeriesInstrumentResult,
  InstrumentBundleContainer,
  InstrumentInfo,
  ScalarInstrumentBundleContainer,
  ScalarInstrumentInfo,
  SeriesInstrumentInfo
} from '@opendatacapture/schemas/instrument';
import { pick } from 'lodash-es';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';

import { CreateInstrumentDto } from './dto/create-instrument.dto';

/** The localized "series" tag applied to every generated series instrument. */
const seriesTag = (language: Language): string => (language === 'fr' ? 'Série' : 'Series');
const SERIES_INSTRUMENT_ID_PREFIX = '__V2__';

type InstrumentVirtualizationContext = {
  __resolveImport: (specifier: string) => string;
  instruments: Map<string, WithID<AnyInstrument>>;
};

type InstrumentQuery<TKind extends InstrumentKind> = {
  kind?: TKind;
  seriesGroupId?: string;
  subjectId?: string;
};

type InstrumentInfoQuery<TKind extends InstrumentKind> = InstrumentQuery<TKind> & {
  /** whether to include every edition of instruments sharing the same internal name, rather than only the latest (default false) */
  allEditions?: boolean;
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

  async create(
    { bundle }: CreateInstrumentDto,
    { seriesGroupId }: { seriesGroupId?: string } = {}
  ): Promise<WithID<AnyInstrument>> {
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

    const id = this.generateInstrumentId(instance, seriesGroupId);
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

    await this.instrumentModel.create({
      data: {
        bundle,
        groups: seriesGroupId ? { connect: { id: seriesGroupId } } : undefined,
        id,
        seriesGroup: seriesGroupId ? { connect: { id: seriesGroupId } } : undefined
      }
    });
    return { ...instance, id };
  }

  /**
   * Assemble a new series instrument from existing scalar instruments. The title must be unique among
   * every instrument visible to the target group; the series bundle is generated server-side and run
   * through the same validation/creation path as any other instrument.
   *
   * If another series already contains the exact same ordered sequence of items (regardless of name) and the
   * caller has not opted to proceed, no instrument is created — instead a `duplicate` result is returned
   * with the existing series' title, so the client can ask the user whether they really want a duplicate.
   */
  async createSeries(
    { clientDetails, confirmDuplicate, details, groupId, items, language }: $CreateSeriesInstrumentData,
    currentUser?: RequestUser
  ): Promise<CreateSeriesInstrumentResult> {
    const options = { ability: currentUser?.ability };
    const group = await this.groupModel.findFirst({
      select: { id: true },
      where: { AND: [accessibleQuery(options.ability, 'update', 'Group')], id: groupId }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${groupId}`);
    }
    if (await this.isInstrumentTitleTaken(details.title, groupId, options)) {
      throw new ConflictException('An instrument with the same title already exists');
    }
    if (!confirmDuplicate) {
      const existingTitle = await this.findSeriesTitleWithSameItems(items, groupId, options);
      if (existingTitle !== null) {
        return { existingTitle, outcome: 'duplicate' };
      }
    }
    const source = this.generateSeriesInstrumentSource({ clientDetails, details, items, language });
    const generatedBundle = await bundle({ inputs: [{ content: source, name: 'index.ts' }], minify: true });
    const created = await this.create({ bundle: generatedBundle }, { seriesGroupId: groupId });
    return { instrumentId: created.id, outcome: 'created' };
  }

  /**
   * Delete a series instrument the caller is permitted to remove, detaching it from any group that
   * exposes it. Only series instruments may be deleted: they are on-the-fly bundles of other
   * instruments and never have records of their own (records belong to their constituent members).
   * Scalar instruments are shared platform assets and are never removed through this path.
   */
  async deleteById(id: string, currentUser?: RequestUser): Promise<{ id: string }> {
    const instrument = await this.instrumentModel.findFirst({
      where: {
        AND: [accessibleQuery(currentUser?.ability, 'delete', 'Instrument')],
        id
      }
    });
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    }
    const instance = await this.getInstrumentInstance(instrument);
    if (!isSeriesInstrument(instance)) {
      throw new ForbiddenException('Only series instruments can be deleted');
    }
    // A series that has been administered must never be deleted, so its collected data stays
    // interpretable. Records collected through a series are stored under the scalar items'
    // instrumentId with the orchestrating series preserved in seriesInstrumentId, so count on both.
    const recordCount = await this.instrumentRecordModel.count({
      where: { OR: [{ instrumentId: id }, { seriesInstrumentId: id }] }
    });
    if (recordCount > 0) {
      throw new ForbiddenException(
        `Cannot delete series instrument: ${recordCount} record(s) have already been collected with it`
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
    { ability }: EntityOperationOptions = {},
    groupIds?: string[]
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
          query.seriesGroupId
            ? {
                OR: [
                  { seriesGroupId: null },
                  { seriesGroupId: { isSet: false } },
                  { seriesGroupId: query.seriesGroupId }
                ]
              }
            : groupIds
              ? {
                  OR: [
                    { seriesGroupId: null },
                    { seriesGroupId: { isSet: false } },
                    { seriesGroupId: { in: groupIds } }
                  ]
                }
              : {},
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

  async findBundleById(
    id: string,
    currentUser?: RequestUser,
    requestedGroupId?: string
  ): Promise<InstrumentBundleContainer> {
    const groupIds = currentUser ? this.resolveGroupIds(currentUser, requestedGroupId) : undefined;
    const instance = await this.findById(id, { ability: currentUser?.ability }, groupIds);
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
            return (await this.findBundleById(id, currentUser, requestedGroupId)) as ScalarInstrumentBundleContainer;
          })
        ),
        kind: 'SERIES'
      };
    }
    throw new InternalServerErrorException(`Unexpected instance kind: ${Reflect.get(instance, 'kind')}`);
  }

  async findById(
    id: string,
    { ability }: EntityOperationOptions = {},
    groupIds?: string[]
  ): Promise<AnyInstrument & { bundle: string; id: string }> {
    const instrument = await this.instrumentModel.findFirst({
      where: {
        AND: [
          accessibleQuery(ability, 'read', 'Instrument'),
          groupIds
            ? {
                OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }, { seriesGroupId: { in: groupIds } }]
              }
            : {}
        ],
        id
      }
    });
    if (!instrument) {
      throw new NotFoundException(`Failed to find instrument with ID: ${id}`);
    }
    const instance = await this.getInstrumentInstance(instrument);
    return { bundle: instrument.bundle, ...instance };
  }

  async findInfo<TKind extends InstrumentKind>(
    { allEditions = false, ...query }: InstrumentInfoQuery<TKind> = {},
    currentUser?: RequestUser,
    requestedGroupId?: string
  ): Promise<InstrumentInfo[]> {
    const options = { ability: currentUser?.ability };
    const groupIds = currentUser ? this.resolveGroupIds(currentUser, requestedGroupId) : undefined;
    const instances = await this.find(query, options, groupIds);

    const sourceMap = await this.buildInstrumentSourceMap(instances.map((instance) => instance.id));
    // Series resolve their `seriesItems` against the scalar instruments they reference. A `kind` filter can
    // exclude those scalars from `instances`, so when the result set contains series we build the lookup
    // from the full instrument set instead — otherwise a series' items would resolve to nothing.
    const scalarSource =
      query.kind && instances.some(isSeriesInstrument) ? await this.find({}, options, groupIds) : instances;
    const scalarInstrumentIds = new Map(
      scalarSource.flatMap((instance) =>
        isScalarInstrument(instance) && instance.internal
          ? [[`${instance.internal.name}:${instance.internal.edition}`, instance.id] as const]
          : []
      )
    );

    const results = new Map<string, InstrumentInfo>();
    for (const instance of instances) {
      const base = pick(instance, ['__runtimeVersion', 'clientDetails', 'details', 'id', 'language', 'tags']);
      // Expose the source repo id whenever the instrument came from a repo (so it can be filtered per
      // group). The name may be null for legacy instruments imported before names were stored; the
      // client still treats those as repo-sourced via their id.
      const source = sourceMap.get(instance.id);
      const sourceRepo = source?.sourceRepoId ? { id: source.sourceRepoId, name: source.sourceRepoName ?? null } : null;

      if (isSeriesInstrument(instance)) {
        const info: SeriesInstrumentInfo = {
          ...base,
          kind: 'SERIES',
          seriesItems: getSeriesInstrumentItems(instance.content)
            .map(({ edition, name }) => scalarInstrumentIds.get(`${name}:${edition}`))
            .filter((id): id is string => typeof id === 'string')
            .map((id) => ({ id })),
          sourceRepo
        };
        results.set(info.id, info);
        continue;
      }

      const info: ScalarInstrumentInfo = {
        ...base,
        internal: instance.internal,
        kind: instance.kind,
        sourceRepo
      };
      if (allEditions) {
        results.set(info.id, info);
      } else {
        const currentEntry = results.get(info.internal.name);
        if (!currentEntry || !('internal' in currentEntry) || info.internal.edition > currentEntry.internal.edition) {
          results.set(info.internal.name, info);
        }
      }
    }
    return Array.from(results.values());
  }

  generateInstrumentId(instrument: AnyInstrument, seriesGroupId?: string) {
    if (isScalarInstrument(instrument)) {
      return this.generateScalarInstrumentId(instrument);
    }
    return this.generateSeriesInstrumentId(instrument, seriesGroupId);
  }

  generateScalarInstrumentId({ internal: { edition, name } }: Pick<AnyScalarInstrument, 'internal'>) {
    return this.cryptoService.hash(`${name}-${edition}`);
  }

  generateSeriesInstrumentId(instrument: SeriesInstrument, seriesGroupId?: string) {
    return `${SERIES_INSTRUMENT_ID_PREFIX}${this.cryptoService.hash(
      JSON.stringify({
        content: instrument.content,
        seriesGroupId,
        title: instrument.details.title
      })
    )}`;
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

  async list<TKind extends InstrumentKind>(
    query: InstrumentQuery<TKind> = {},
    currentUser?: RequestUser,
    requestedGroupId?: string
  ) {
    const groupIds = currentUser ? this.resolveGroupIds(currentUser, requestedGroupId) : undefined;
    return this.find(query, { ability: currentUser?.ability }, groupIds).then((arr) => {
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

  /** The localized `tags` for a series, matching the shape (unilingual vs multilingual) of `language`. */
  private buildSeriesTags(language: InstrumentLanguage): InstrumentUIOption<InstrumentLanguage, string[]> {
    if (typeof language === 'string') {
      return [seriesTag(language)];
    }
    return Object.fromEntries(language.map((lang) => [lang, [seriesTag(lang)]])) as InstrumentUIOption<
      InstrumentLanguage,
      string[]
    >;
  }

  /**
   * The title of an existing series instrument that contains the exact same ordered sequence of items as
   * `items`, or `null` when none exists. Used to warn before creating a redundant series.
   * The title is returned in its stored (possibly multilingual) form so the client can localize it.
   */
  private async findSeriesTitleWithSameItems(
    items: ScalarInstrumentInternal[],
    seriesGroupId: string,
    { ability }: EntityOperationOptions = {}
  ): Promise<NonNullable<ClientInstrumentDetails['title']> | null> {
    const targetKey = this.getSeriesItemSequenceKey(items);
    const seriesInstances = await this.find({ kind: 'SERIES', seriesGroupId }, { ability });
    for (const series of seriesInstances) {
      if (!isSeriesInstrument(series)) {
        continue;
      }
      if (this.getSeriesItemSequenceKey(getSeriesInstrumentItems(series.content)) === targetKey) {
        return series.details.title;
      }
    }
    return null;
  }

  /**
   * Generate the TypeScript source for an on-the-fly series instrument. The definition is plain
   * JSON-serializable data, so it is emitted as a single default export with no runtime imports. The
   * multilingual details/instructions and the language(s) are taken verbatim from the caller — nothing
   * is hardcoded — so the series is stored exactly as it was authored.
   */
  private generateSeriesInstrumentSource({
    clientDetails,
    details,
    items,
    language
  }: Pick<$CreateSeriesInstrumentData, 'clientDetails' | 'details' | 'items' | 'language'>): string {
    // A series is a `SeriesInstrument` minus the server-computed `id`; typing it explicitly keeps this
    // in sync with the schema so a change to the instrument shape fails to compile here.
    const definition: Omit<SeriesInstrument, 'id'> = {
      __runtimeVersion: 1,
      ...(clientDetails?.instructions ? { clientDetails: { instructions: clientDetails.instructions } } : {}),
      content: {
        items: items.map(({ edition, name }) => ({ edition, name }))
      },
      details: {
        description: details.description ?? details.title,
        license: 'UNLICENSED',
        title: details.title
      },
      kind: 'SERIES',
      language,
      tags: this.buildSeriesTags(language)
    };
    return `export default ${JSON.stringify(definition)};`;
  }

  /**
   * A stable key identifying the ordered sequence of scalar instruments in a series.
   */
  private getSeriesItemSequenceKey(items: ScalarInstrumentInternal[]): string {
    return JSON.stringify(items.map(({ edition, name }) => ({ edition, name })));
  }

  private async instantiate(instruments: Pick<InstrumentBundleContainer, 'bundle' | 'id'>[]) {
    return Promise.all(
      instruments.map((instrument) => {
        return this.getInstrumentInstance(instrument);
      })
    );
  }

  /**
   * Whether an instrument visible to the target group already uses the given title (case-insensitive,
   * across every language it is defined in). Used to enforce that newly-created series have a unique,
   * recognizable name within their group.
   */
  private async isInstrumentTitleTaken(
    title: NonNullable<ClientInstrumentDetails['title']>,
    seriesGroupId: string,
    options: EntityOperationOptions
  ): Promise<boolean> {
    const normalize = (value: string) => value.trim().toLowerCase();
    const candidates = new Set(this.titleValues(title).map(normalize));
    const instances = await this.find({ seriesGroupId }, options);
    return instances.some((instance) =>
      this.titleValues(instance.details.title).some((value) => candidates.has(normalize(value)))
    );
  }

  private resolveGroupIds(currentUser: RequestUser, requestedGroupId?: string): string[] {
    if (!requestedGroupId) {
      return currentUser.groups.map(({ id }) => id);
    }
    if (!currentUser.ability.can('manage', 'all') && !currentUser.groups.some(({ id }) => id === requestedGroupId)) {
      throw new ForbiddenException(`Cannot access instruments for group with ID: ${requestedGroupId}`);
    }
    return [requestedGroupId];
  }

  /** The individual language values of a (possibly multilingual) title. */
  private titleValues(title: InstrumentUIOption<InstrumentLanguage, string>): string[] {
    return typeof title === 'string' ? [title] : Object.values(title);
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
