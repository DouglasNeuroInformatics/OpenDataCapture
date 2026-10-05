import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { bundle } from '@opendatacapture/instrument-bundler';
import type { SeriesInstrument } from '@opendatacapture/runtime-core';
import type { WithID } from '@opendatacapture/schemas/core';
import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { z } from 'zod/v4';

import { AuditLogger } from '@/audit/audit.logger';
import { AbilityFactory } from '@/auth/ability.factory';
import { accessibleQuery, createAppAbility } from '@/auth/ability.utils';

import { InstrumentsService } from '../instruments.service';

import type { InstrumentVirtualizationContext } from '../instruments.service';

// Avoid bundling a real instrument (esbuild) during unit tests; `createSeries` only needs `create` to be
// called with whatever the bundler produces.
vi.mock('@opendatacapture/instrument-bundler', () => ({
  bundle: vi.fn(() => Promise.resolve('__BUNDLE__'))
}));

// A multilingual series instance as returned by `find`, containing two forms.
const existingSeries: WithID<SeriesInstrument> = {
  __runtimeVersion: 1,
  content: {
    items: [
      { edition: 1, name: 'FORM_A' },
      { edition: 1, name: 'FORM_B' }
    ]
  },
  details: {
    description: { en: 'An existing series', fr: 'Une série existante' },
    license: 'UNLICENSED',
    title: { en: 'Existing Series', fr: 'Série existante' }
  },
  id: 'existing-series-id',
  kind: 'SERIES',
  language: ['en', 'fr'],
  tags: { en: ['Series'], fr: ['Série'] }
};

// A scalar instrument that passes `$AnyInstrument`, so `create` reaches the storage path.
const interactiveInstrument = {
  __runtimeVersion: 1,
  content: { render: () => undefined },
  details: { description: 'A reaction-time task', license: 'UNLICENSED', title: 'Reaction Time' },
  internal: { edition: 1, name: 'REACTION_TIME' },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: null,
  tags: ['Task'],
  validationSchema: z.object({})
} as const;

/** A scalar form instance as `getInstrumentInstance` would evaluate it. */
const formInstance = (name: string, edition: number, id = `hash:${name}-${edition}`) => ({
  __runtimeVersion: 1 as const,
  content: {},
  details: { description: name, license: 'UNLICENSED' as const, title: name },
  id,
  internal: { edition, name },
  kind: 'FORM' as const,
  language: 'en' as const,
  measures: null,
  tags: ['Form'],
  validationSchema: z.object({})
});

/**
 * The `where` fragment `validateSeriesInstrument` builds to restrict a series' items to the instruments
 * the owning group may administer.
 */
const groupItemFilter = ({
  accessibleInstrumentIds = [],
  instrumentRepoIds = []
}: { accessibleInstrumentIds?: string[]; instrumentRepoIds?: string[] } = {}) => ({
  OR: [
    { sourceRepoId: null },
    { sourceRepoId: { isSet: false } },
    { sourceRepoId: { in: instrumentRepoIds } },
    { id: { in: accessibleInstrumentIds } }
  ]
});

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let cryptoService: MockedInstance<CryptoService>;
  let assignmentModel: MockedInstance<Model<'Assignment'>>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let groupModel: MockedInstance<Model<'Group'>>;
  let auditLogger: MockedInstance<AuditLogger>;
  let loggingService: MockedInstance<LoggingService>;
  let virtualizationService: MockedInstance<VirtualizationService<any>>;
  /** The same Map the service memoizes evaluated instances into — see the context assignment below. */
  let instanceCache: InstrumentVirtualizationContext['instruments'];

  beforeEach(async () => {
    vi.mocked(bundle).mockClear();

    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        MockFactory.createForModelToken(getModelToken('Assignment')),
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Instrument')),
        MockFactory.createForModelToken(getModelToken('InstrumentRecord')),
        MockFactory.createForService(AuditLogger),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(VirtualizationService)
      ]
    }).compile();
    instrumentsService = moduleRef.get(InstrumentsService);
    cryptoService = moduleRef.get(CryptoService);
    assignmentModel = moduleRef.get(getModelToken('Assignment'));
    assignmentModel.count.mockResolvedValue(0);
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    groupModel = moduleRef.get(getModelToken('Group'));
    auditLogger = moduleRef.get(AuditLogger);
    loggingService = moduleRef.get(LoggingService);
    // Two lookups hit this: the caller's permission check on the target group, and the item-access
    // check in `validateSeriesInstrument`. The empty arrays mean "no repos assigned, nothing accessible
    // yet", so by default only non-repo instruments may be assembled into a series.
    groupModel.findFirst.mockResolvedValue({
      accessibleInstrumentIds: [],
      id: 'group-1',
      instrumentRepoIds: []
    } as any);
    virtualizationService = moduleRef.get(VirtualizationService);
    // `getInstrumentInstance` reads/writes an instance cache on the virtualization context.
    instanceCache = new Map();
    (virtualizationService as { context: unknown }).context = {
      __resolveImport: vi.fn(),
      instruments: instanceCache
    };
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
    expect(instrumentModel).toBeDefined();
  });

  describe('createSeries', () => {
    it('asks for confirmation when a legacy series has the same forms in the same order', async () => {
      const findSpy = vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create');

      const result = await instrumentsService.createSeries({
        details: { title: 'My New Series' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'FORM_A' },
          { edition: 1, name: 'FORM_B' }
        ],
        language: 'en'
      });

      expect(result).toEqual({
        existingTitle: { en: 'Existing Series', fr: 'Série existante' },
        outcome: 'duplicate'
      });
      expect(findSpy).toHaveBeenNthCalledWith(1, { seriesGroupId: 'group-1' }, {});
      expect(findSpy).toHaveBeenNthCalledWith(2, { kind: 'SERIES', seriesGroupId: 'group-1' }, { ability: undefined });
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('creates a distinct series when the same forms are in a different order', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'reordered-id' } as any);

      const result = await instrumentsService.createSeries({
        details: { title: 'Reordered Series' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'FORM_B' },
          { edition: 1, name: 'FORM_A' }
        ],
        language: 'en'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' }, { seriesGroupId: 'group-1' });
      expect(result).toEqual({ instrumentId: 'reordered-id', outcome: 'created' });
    });

    it('creates the series when the duplicate is explicitly confirmed', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'new-id' } as any);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'My New Series' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'FORM_A' },
          { edition: 1, name: 'FORM_B' }
        ],
        language: 'en'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' }, { seriesGroupId: 'group-1' });
      expect(result).toEqual({ instrumentId: 'new-id', outcome: 'created' });
    });

    it('creates the series directly when no existing series shares its forms', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'fresh-id' } as any);

      const result = await instrumentsService.createSeries({
        details: { title: 'Totally New' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'FORM_C' },
          { edition: 1, name: 'FORM_D' }
        ],
        language: 'en'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' }, { seriesGroupId: 'group-1' });
      expect(result).toEqual({ instrumentId: 'fresh-id', outcome: 'created' });
    });

    it('generates a valid, unilingual series source payload with selected items in order', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'generated-id' } as any);

      await instrumentsService.createSeries({
        clientDetails: { instructions: ['Complete the instruments in order.'] },
        details: { description: 'Optional description', title: 'Generated Series' },
        groupId: 'group-1',
        items: [
          { edition: 2, name: 'FORM_B' },
          { edition: 1, name: 'FORM_A' }
        ],
        language: 'en'
      });

      expect(bundle).toHaveBeenCalledTimes(1);

      const [bundleOptions] = vi.mocked(bundle).mock.calls[0]!;
      expect(bundleOptions.minify).toBe(true);
      expect(bundleOptions.inputs).toHaveLength(1);

      expect(bundleOptions.inputs[0]!.content).toEqual(expect.any(String));
      const source = bundleOptions.inputs[0]!.content as string;
      const match = /^export default (.*);$/.exec(source);
      expect(match).not.toBeNull();

      const definition = JSON.parse(match![1]!);
      expect(definition.kind).toBe('SERIES');
      // The details/instructions/language are stored verbatim in the caller's language — nothing is
      // duplicated across languages or hardcoded.
      expect(definition.language).toBe('en');
      expect(definition.clientDetails).toEqual({ instructions: ['Complete the instruments in order.'] });
      expect(definition.details).toMatchObject({
        description: 'Optional description',
        title: 'Generated Series'
      });
      expect(definition.tags).toEqual(['Series']);
      expect(definition.content.items).toEqual([
        { edition: 2, name: 'FORM_B' },
        { edition: 1, name: 'FORM_A' }
      ]);
    });

    it('runs the generated bundle through create and stores the validated series instrument', async () => {
      const items = [
        { edition: 1, name: 'FORM_A' },
        { edition: 1, name: 'FORM_B' }
      ];
      const instance = {
        __runtimeVersion: 1,
        content: { items },
        details: {
          description: 'Stored Series',
          license: 'UNLICENSED',
          title: 'Stored Series'
        },
        kind: 'SERIES',
        language: 'en',
        tags: ['Series']
      } as const;
      const id = `__V2__hash:${JSON.stringify({
        content: instance.content,
        seriesGroupId: 'group-1',
        title: instance.details.title
      })}`;

      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({ isErr: () => false, value: instance } as any);
      // `exists` guards the generated series id; the items are resolved in a single batched lookup.
      instrumentModel.exists.mockResolvedValue(false);
      instrumentModel.findMany.mockResolvedValue([{ id: 'hash:FORM_A-1' }, { id: 'hash:FORM_B-1' }] as any);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'Stored Series' },
        groupId: 'group-1',
        items,
        language: 'en'
      });

      expect(virtualizationService.eval).toHaveBeenCalledWith('__BUNDLE__');
      expect(instrumentModel.exists).toHaveBeenCalledWith({ id });
      expect(instrumentModel.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: { AND: [groupItemFilter()], id: { in: ['hash:FORM_A-1', 'hash:FORM_B-1'] } }
      });
      expect(instrumentModel.create).toHaveBeenCalledWith({
        data: {
          bundle: '__BUNDLE__',
          groups: { connect: { id: 'group-1' } },
          id,
          seriesGroup: { connect: { id: 'group-1' } }
        }
      });
      expect(result).toEqual({ instrumentId: id, outcome: 'created' });
    });

    // `create` never writes `sourceRepoId`, so on a manually uploaded instrument the key is absent
    // rather than null, and prisma compiles a `null` filter into a comparison that also requires the
    // field to be present. Without the `isSet` branch every uploaded instrument reads as missing, and
    // a group with no assigned repository can assemble no series at all.
    it('should accept an item whose stored record has no sourceRepoId key, not only an explicit null', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: {
          __runtimeVersion: 1,
          content: {
            items: [
              { edition: 1, name: 'FORM_A' },
              { edition: 1, name: 'FORM_B' }
            ]
          },
          details: { description: 'Uploaded Items', license: 'UNLICENSED', title: 'Uploaded Items' },
          kind: 'SERIES',
          language: 'en',
          tags: ['Series']
        }
      } as any);
      instrumentModel.exists.mockResolvedValue(false);
      instrumentModel.findMany.mockResolvedValue([{ id: 'hash:FORM_A-1' }, { id: 'hash:FORM_B-1' }] as any);

      await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'Uploaded Items' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'FORM_A' },
          { edition: 1, name: 'FORM_B' }
        ],
        language: 'en'
      });

      const [{ where }] = instrumentModel.findMany.mock.calls.at(-1)!;
      expect(where.AND[0].OR).toContainEqual({ sourceRepoId: { isSet: false } });
    });

    it('rejects a title that is already used (case-insensitively) by another instrument', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create');

      await expect(
        instrumentsService.createSeries({
          details: { title: 'existing series' },
          groupId: 'group-1',
          items: [
            { edition: 1, name: 'FORM_X' },
            { edition: 1, name: 'FORM_Y' }
          ],
          language: 'en'
        })
      ).rejects.toThrow(ConflictException);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('rejects a title that is blank once trimmed', async () => {
      const createSpy = vi.spyOn(instrumentsService, 'create');

      await expect(
        instrumentsService.createSeries({
          details: { title: '   ' },
          groupId: 'group-1',
          items: [
            { edition: 1, name: 'FORM_X' },
            { edition: 1, name: 'FORM_Y' }
          ],
          language: 'en'
        })
      ).rejects.toThrow(UnprocessableEntityException);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('stores the trimmed title so it matches what was validated', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'created-id' } as any);

      await instrumentsService.createSeries({
        details: { title: '  Padded Series  ' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'FORM_X' },
          { edition: 1, name: 'FORM_Y' }
        ],
        language: 'en'
      });

      const source = vi.mocked(bundle).mock.lastCall?.[0].inputs[0]!.content as string;
      expect(JSON.parse(source.replace(/^export default /, '').replace(/;$/, ''))).toMatchObject({
        details: { title: 'Padded Series' }
      });
    });

    // Items are named by internal name + edition, which the caller controls entirely, so a manager could
    // otherwise name an instrument from a repository their group was never assigned and have the
    // resulting `seriesItems` carry it into the group's accessible list.
    it('refuses an item the group is not entitled to administer', async () => {
      const items = [
        { edition: 1, name: 'FORM_A' },
        { edition: 1, name: 'OFF_LIMITS' }
      ];
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: {
          __runtimeVersion: 1,
          content: { items },
          details: { description: 'S', license: 'UNLICENSED', title: 'S' },
          kind: 'SERIES',
          language: 'en',
          tags: ['Series']
        }
      } as any);
      instrumentModel.exists.mockResolvedValue(false);
      // The restricted lookup resolves only the permitted item; the other exists but is out of reach.
      instrumentModel.findMany.mockResolvedValue([{ id: 'hash:FORM_A-1' }] as any);

      await expect(
        instrumentsService.createSeries({
          confirmDuplicate: true,
          details: { title: 'S' },
          groupId: 'group-1',
          items,
          language: 'en'
        })
      ).rejects.toThrow(UnprocessableEntityException);
      expect(instrumentModel.create).not.toHaveBeenCalled();
    });

    it('admits items from a repo assigned to the group, and ones already accessible to it', async () => {
      groupModel.findFirst.mockResolvedValue({
        accessibleInstrumentIds: ['hash:FORM_A-1'],
        id: 'group-1',
        instrumentRepoIds: ['repo-1']
      } as any);
      const items = [
        { edition: 1, name: 'FORM_A' },
        { edition: 1, name: 'FORM_B' }
      ];
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: {
          __runtimeVersion: 1,
          content: { items },
          details: { description: 'S', license: 'UNLICENSED', title: 'S' },
          kind: 'SERIES',
          language: 'en',
          tags: ['Series']
        }
      } as any);
      instrumentModel.exists.mockResolvedValue(false);
      instrumentModel.findMany.mockResolvedValue([{ id: 'hash:FORM_A-1' }, { id: 'hash:FORM_B-1' }] as any);

      await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'S' },
        groupId: 'group-1',
        items,
        language: 'en'
      });

      expect(instrumentModel.findMany).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          AND: [groupItemFilter({ accessibleInstrumentIds: ['hash:FORM_A-1'], instrumentRepoIds: ['repo-1'] })],
          id: { in: ['hash:FORM_A-1', 'hash:FORM_B-1'] }
        }
      });
      expect(instrumentModel.create).toHaveBeenCalled();
    });

    it('rejects creation for a group the caller cannot manage', async () => {
      groupModel.findFirst.mockResolvedValue(null);

      await expect(
        instrumentsService.createSeries({
          details: { title: 'Inaccessible Group Series' },
          groupId: 'group-2',
          items: [
            { edition: 1, name: 'FORM_A' },
            { edition: 1, name: 'FORM_B' }
          ],
          language: 'en'
        })
      ).rejects.toThrow(NotFoundException);
      expect(instrumentModel.create).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    // The id `create` derives for `existingSeries` when no owning group is supplied, as a repo import
    // does. `seriesGroupId` is undefined, so `JSON.stringify` drops the key entirely.
    const seriesId = `__V2__hash:${JSON.stringify({
      content: existingSeries.content,
      title: existingSeries.details.title
    })}`;

    beforeEach(() => {
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({ isErr: () => false, value: existingSeries } as any);
      instrumentModel.findMany.mockResolvedValue([{ id: 'hash:FORM_A-1' }, { id: 'hash:FORM_B-1' }] as any);
    });

    it('should report a lost insert race as a conflict, so a concurrent import can still recover the id', async () => {
      // The guard passes, then a competing import wins the insert: the driver rejects the duplicate id
      // and the row is present on re-check.
      instrumentModel.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      instrumentModel.create.mockRejectedValueOnce(new Error('Unique constraint failed on the constraint: `_id_`'));

      await expect(instrumentsService.create({ bundle: '__BUNDLE__' })).rejects.toThrowError(
        new ConflictException(`Instrument with ID '${seriesId}' already exists!`)
      );
    });

    it('should rethrow an insert failure that is not a duplicate, so real errors are not masked', async () => {
      instrumentModel.exists.mockResolvedValue(false);
      instrumentModel.create.mockRejectedValueOnce(new Error('connection reset'));

      await expect(instrumentsService.create({ bundle: '__BUNDLE__' })).rejects.toThrowError('connection reset');
    });

    it('should refuse a bundle that cannot be interpreted, so a broken upload is never stored', async () => {
      const cause = { message: 'Unexpected token', name: 'SyntaxError' };
      virtualizationService.eval.mockReturnValue(errAsync(cause));

      await expect(instrumentsService.create({ bundle: '__BUNDLE__' })).rejects.toMatchObject({
        response: { cause, message: 'Failed to interpret instrument bundle' },
        status: 422
      });
      expect(loggingService.error).toHaveBeenCalledWith(cause);
      expect(instrumentModel.create).not.toHaveBeenCalled();
    });

    it('should refuse a bundle whose default export is not an instrument, reporting the validation issues', async () => {
      virtualizationService.eval.mockReturnValue(okAsync({ kind: 'FORM' }));

      const error: unknown = await instrumentsService.create({ bundle: '__BUNDLE__' }).catch((err: unknown) => err);

      expect(error).toBeInstanceOf(UnprocessableEntityException);
      expect((error as UnprocessableEntityException).getResponse()).toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: expect.any(Array) })]),
        message: 'Instrument validation failed'
      });
    });

    it('should refuse an instrument that is already stored before attempting the insert', async () => {
      instrumentModel.exists.mockResolvedValue(true);

      await expect(instrumentsService.create({ bundle: '__BUNDLE__' })).rejects.toThrowError(
        new ConflictException(`Instrument with ID '${seriesId}' already exists!`)
      );
      expect(instrumentModel.create).not.toHaveBeenCalled();
    });

    it('should refuse a series with fewer than two items, since it would orchestrate nothing', async () => {
      virtualizationService.eval.mockReturnValue(
        okAsync({ ...existingSeries, content: { items: [{ edition: 1, name: 'FORM_A' }] } })
      );
      instrumentModel.exists.mockResolvedValue(false);

      await expect(instrumentsService.create({ bundle: '__BUNDLE__' })).rejects.toThrowError(
        new UnprocessableEntityException('Series instrument must include at least two items')
      );
      expect(instrumentModel.create).not.toHaveBeenCalled();
    });

    it('should treat a group with no stored access lists as having none, rather than failing the lookup', async () => {
      instrumentModel.exists.mockResolvedValue(false);
      groupModel.findFirst.mockResolvedValue({ id: 'group-1' } as any);

      await instrumentsService.create({ bundle: '__BUNDLE__' }, { seriesGroupId: 'group-1' });

      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({ where: { AND: [groupItemFilter()] } });
    });

    it('should store a scalar instrument under the hash of its name and edition', async () => {
      virtualizationService.eval.mockReturnValue(okAsync(interactiveInstrument));
      instrumentModel.exists.mockResolvedValue(false);

      const result = await instrumentsService.create({ bundle: '__BUNDLE__' });

      expect(result).toMatchObject({ id: 'hash:REACTION_TIME-1', kind: 'INTERACTIVE' });
      expect(instrumentModel.create).toHaveBeenCalledWith({
        data: { bundle: '__BUNDLE__', groups: undefined, id: 'hash:REACTION_TIME-1', seriesGroup: undefined }
      });
    });

    it('should not grant a first edition to any group, since no group can hold an earlier one', async () => {
      virtualizationService.eval.mockReturnValue(okAsync(interactiveInstrument));
      instrumentModel.exists.mockResolvedValue(false);

      await instrumentsService.create({ bundle: '__BUNDLE__' });

      expect(groupModel.updateMany).not.toHaveBeenCalled();
    });

    it('should grant a new edition to every group holding the previous one, so upgrading keeps access', async () => {
      virtualizationService.eval.mockReturnValue(
        okAsync({ ...interactiveInstrument, internal: { edition: 2, name: 'REACTION_TIME' } })
      );
      instrumentModel.exists.mockResolvedValue(false);

      await instrumentsService.create({ bundle: '__BUNDLE__' });

      expect(groupModel.updateMany).toHaveBeenCalledWith({
        data: { accessibleInstrumentIds: { push: ['hash:REACTION_TIME-2'] } },
        where: { accessibleInstrumentIds: { has: 'hash:REACTION_TIME-1' } }
      });
    });
  });

  describe('generateSeriesInstrumentId', () => {
    it('uses a versioned prefix and includes the title so confirmed duplicate form sets can be distinct', () => {
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => value);

      const first = {
        ...existingSeries,
        details: { ...existingSeries.details, title: 'First Series' }
      };
      const second = {
        ...existingSeries,
        details: { ...existingSeries.details, title: 'Second Series' }
      };

      const firstId = instrumentsService.generateSeriesInstrumentId(first);
      expect(firstId).toMatch(/^__V2__/);
      expect(firstId).not.toBe(instrumentsService.generateSeriesInstrumentId(second));
      expect(cryptoService.hash).toHaveBeenCalledWith(
        JSON.stringify({ content: first.content, title: first.details.title })
      );
    });

    it('includes the owning group so groups can create independent copies of the same series', () => {
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => value);

      expect(instrumentsService.generateSeriesInstrumentId(existingSeries, 'group-1')).not.toBe(
        instrumentsService.generateSeriesInstrumentId(existingSeries, 'group-2')
      );
    });
  });

  describe('find', () => {
    it('keeps shared forms visible while restricting owned series to the user groups', async () => {
      instrumentModel.findMany.mockResolvedValue([]);

      await instrumentsService.find({}, {}, ['group-1']);

      expect(instrumentModel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { records: undefined },
            {
              OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }, { seriesGroupId: { in: ['group-1'] } }]
            },
            {}
          ]
        }
      });
    });

    it('rejects a requested group outside the current user groups', async () => {
      const currentUser = {
        ability: { can: vi.fn(() => false) },
        groups: [{ id: 'group-1' }]
      } as any;

      await expect(instrumentsService.findInfo({}, currentUser, 'group-2')).rejects.toThrow(ForbiddenException);
      expect(instrumentModel.findMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteById', () => {
    it('throws when the instrument does not exist', async () => {
      instrumentModel.findFirst.mockResolvedValue(null);
      await expect(instrumentsService.deleteById('missing')).rejects.toThrow(NotFoundException);
      expect(instrumentModel.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [{}],
          id: 'missing'
        }
      });
    });

    it('refuses to delete a non-series (scalar) instrument', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'scalar' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { internal: { edition: 1, name: 'FORM_A' }, kind: 'FORM' }
      } as any);

      await expect(instrumentsService.deleteById('scalar')).rejects.toThrow(ForbiddenException);
      expect(instrumentModel.delete).not.toHaveBeenCalled();
    });

    it('refuses to delete a series instrument that has already been administered', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'target' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { content: { items: [] }, kind: 'SERIES' }
      } as any);
      // Records collected through a series carry it in seriesInstrumentId (never as their instrumentId).
      instrumentRecordModel.count.mockResolvedValue(3);

      await expect(instrumentsService.deleteById('target')).rejects.toThrow(ForbiddenException);
      expect(instrumentRecordModel.count).toHaveBeenCalledWith({
        where: { OR: [{ instrumentId: 'target' }, { seriesInstrumentId: 'target' }] }
      });
      expect(instrumentModel.delete).not.toHaveBeenCalled();
    });

    it('refuses to delete a series instrument that is still assigned', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'target' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { content: { items: [] }, kind: 'SERIES' }
      } as any);
      // A remote assignment only becomes a record once the gateway synchronizer resolves its
      // instrument, so an assignment with no records yet must still block deletion.
      instrumentRecordModel.count.mockResolvedValue(0);
      assignmentModel.count.mockResolvedValue(1);

      await expect(instrumentsService.deleteById('target')).rejects.toThrow(ForbiddenException);
      expect(assignmentModel.count).toHaveBeenCalledWith({ where: { instrumentId: 'target' } });
      expect(instrumentModel.delete).not.toHaveBeenCalled();
    });

    it('deletes a never-administered series instrument and detaches it from every group', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'target' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { content: { items: [] }, kind: 'SERIES' }
      } as any);
      instrumentRecordModel.count.mockResolvedValue(0);
      groupModel.findMany.mockResolvedValue([{ accessibleInstrumentIds: ['other', 'target'], id: 'g1' }]);

      const result = await instrumentsService.deleteById('target');

      expect(groupModel.update).toHaveBeenCalledWith({
        data: { accessibleInstrumentIds: { set: ['other'] } },
        where: { id: 'g1' }
      });
      expect(instrumentModel.delete).toHaveBeenCalledWith({ where: { id: 'target' } });
      expect(result).toEqual({ id: 'target' });
    });

    it('evicts the deleted instrument from the instance cache', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'target' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { content: { items: [] }, kind: 'SERIES' }
      } as any);
      instrumentRecordModel.count.mockResolvedValue(0);
      groupModel.findMany.mockResolvedValue([]);

      await instrumentsService.deleteById('target');

      // Checking the kind populates the cache, so a delete always leaves an entry behind to clean up.
      expect(instanceCache.has('target')).toBe(false);
    });

    it('does not evict the cached instance when the delete is refused', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'scalar' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { internal: { edition: 1, name: 'FORM_A' }, kind: 'FORM' }
      } as any);

      await expect(instrumentsService.deleteById('scalar')).rejects.toThrow(ForbiddenException);

      expect(instanceCache.has('scalar')).toBe(true);
    });
  });

  describe('findInfo', () => {
    beforeEach(() => {
      const instances = [
        { details: { title: 'Happiness Questionnaire' }, id: 'id-1', internal: { edition: 1, name: 'HQ' } },
        { details: { title: 'Happiness Questionnaire' }, id: 'id-2', internal: { edition: 2, name: 'HQ' } }
      ] as Awaited<ReturnType<InstrumentsService['find']>>;
      vi.spyOn(instrumentsService, 'find').mockResolvedValue(instances);
      instrumentModel.findMany.mockResolvedValue([]);
    });

    it('should return only the latest edition of each instrument by default', async () => {
      const result = await instrumentsService.findInfo();
      expect(result.map((info) => info.id)).toEqual(['id-2']);
    });

    it('should return every edition when allEditions is set', async () => {
      const result = await instrumentsService.findInfo({ allEditions: true });
      expect(result.map((info) => info.id)).toEqual(['id-1', 'id-2']);
    });

    // The client shows a delete affordance only for a series its own group owns, so a series with no
    // owning group (uploaded directly, or created before series became group-owned) must report null
    // rather than being conflated with an owned one.
    it('should report the owning group of each series', async () => {
      const instances: WithID<SeriesInstrument>[] = [
        { ...existingSeries, content: { items: [] }, id: 'owned' },
        { ...existingSeries, content: { items: [] }, id: 'shared' }
      ];
      vi.spyOn(instrumentsService, 'find').mockResolvedValue(instances);
      instrumentModel.findMany.mockResolvedValue([
        { id: 'owned', seriesGroupId: 'group-1', sourceRepoId: null, sourceRepoName: null },
        { id: 'shared', seriesGroupId: null, sourceRepoId: null, sourceRepoName: null }
      ]);

      const result = await instrumentsService.findInfo();

      expect(instrumentModel.findMany).toHaveBeenCalledWith({
        select: {
          archivedAt: true,
          createdAt: true,
          id: true,
          seriesGroupId: true,
          sourceRepoId: true,
          sourceRepoName: true
        },
        where: { id: { in: ['owned', 'shared'] } }
      });
      expect(result).toMatchObject([
        { id: 'owned', seriesGroupId: 'group-1' },
        { id: 'shared', seriesGroupId: null }
      ]);
    });

    it('should report when each series was created, from the record rather than the evaluated instance', async () => {
      const createdAt = new Date('2024-03-01T12:00:00.000Z');
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([
        { ...existingSeries, content: { items: [] }, id: 'series-1' }
      ]);
      instrumentModel.findMany.mockResolvedValue([
        { createdAt, id: 'series-1', seriesGroupId: null, sourceRepoId: null, sourceRepoName: null }
      ]);

      const result = await instrumentsService.findInfo();

      expect(result).toMatchObject([{ createdAt, id: 'series-1' }]);
    });

    it('should report when each scalar instrument was stored, since every kind is tagged with it', async () => {
      const createdAt = new Date('2024-05-02T09:30:00.000Z');
      instrumentModel.findMany.mockResolvedValue([
        { createdAt, id: 'id-2', seriesGroupId: null, sourceRepoId: null, sourceRepoName: null }
      ]);

      const result = await instrumentsService.findInfo();

      expect(result).toMatchObject([{ createdAt, id: 'id-2' }]);
    });

    // Pickers drop an archived series, so it must reach them; records collected with it still need its info.
    it('should report when each series was archived, and null for one still active', async () => {
      const archivedAt = new Date('2024-06-01T00:00:00.000Z');
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([
        { ...existingSeries, content: { items: [] }, id: 'archived' },
        { ...existingSeries, content: { items: [] }, id: 'active' }
      ]);
      instrumentModel.findMany.mockResolvedValue([
        { archivedAt, id: 'archived', seriesGroupId: null, sourceRepoId: null, sourceRepoName: null },
        { archivedAt: null, id: 'active', seriesGroupId: null, sourceRepoId: null, sourceRepoName: null }
      ]);

      const result = await instrumentsService.findInfo();

      expect(result).toMatchObject([
        { archivedAt, id: 'archived' },
        { archivedAt: null, id: 'active' }
      ]);
    });

    // The stored record is read separately from the evaluated instance, so an id present in one and
    // absent from the other must leave the date empty rather than invent one.
    it('should report a null creation date for a series with no stored record', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([
        { ...existingSeries, content: { items: [] }, id: 'series-1' }
      ]);
      instrumentModel.findMany.mockResolvedValue([]);

      const result = await instrumentsService.findInfo();

      expect(result).toMatchObject([{ createdAt: null, id: 'series-1' }]);
    });
  });

  describe('findSeriesOverview', () => {
    const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);
    let find: MockInstance<InstrumentsService['find']>;

    beforeEach(() => {
      find = vi.spyOn(instrumentsService, 'find').mockResolvedValue([
        { ...existingSeries, content: { items: [] }, id: 'owned' },
        { ...existingSeries, content: { items: [] }, id: 'shared' }
      ]);
      instrumentModel.findMany.mockResolvedValue([
        { id: 'owned', seriesGroupId: 'group-1', sourceRepoId: null, sourceRepoName: null },
        { id: 'shared', seriesGroupId: null, sourceRepoId: null, sourceRepoName: null }
      ]);
      groupModel.findMany.mockResolvedValue([{ id: 'group-1', name: 'Depression Clinic' }]);
    });

    it('should list every group series rather than the caller groups, since an administrator belongs to none', async () => {
      await instrumentsService.findSeriesOverview({ ability });
      expect(find).toHaveBeenCalledWith({ kind: 'SERIES' }, { ability }, undefined);
    });

    it('should name the owning group of each series, and none for a series shared by every group', async () => {
      const result = await instrumentsService.findSeriesOverview({ ability });
      expect(result).toMatchObject([
        { id: 'owned', seriesGroup: { id: 'group-1', name: 'Depression Clinic' } },
        { id: 'shared', seriesGroup: null }
      ]);
    });

    it('should look up only the owning groups, within what the caller may read', async () => {
      await instrumentsService.findSeriesOverview({ ability });
      expect(groupModel.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true },
        where: { AND: [accessibleQuery(ability, 'read', 'Group')], id: { in: ['group-1'] } }
      });
    });
  });

  describe('findBundleById', () => {
    const ownedSeriesFilter = (groupIds: string[]) => ({
      OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }, { seriesGroupId: { in: groupIds } }]
    });

    beforeEach(() => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'form' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { internal: { edition: 1, name: 'FORM_A' }, kind: 'FORM' }
      } as any);
    });

    it('should not narrow an administrator to their groups, so they can preview a series any group owns', async () => {
      const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);
      await instrumentsService.findBundleById('form', { ability, groups: [] } as any);
      expect(instrumentModel.findFirst.mock.lastCall?.[0]).toMatchObject({
        where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), {}] }
      });
    });

    it('should still narrow anyone else to the series their own groups own', async () => {
      const ability = createAppAbility([{ action: 'read', subject: 'Instrument' }]);
      await instrumentsService.findBundleById('form', { ability, groups: [{ id: 'group-1' }] } as any);
      expect(instrumentModel.findFirst.mock.lastCall?.[0]).toMatchObject({
        where: { AND: [accessibleQuery(ability, 'read', 'Instrument'), ownedSeriesFilter(['group-1'])] }
      });
    });
  });

  describe('updateSeriesArchive', () => {
    const ability = createAppAbility([{ action: 'manage', subject: 'all' }]);
    const currentUser = { ability, id: 'admin-1' } as any;

    const storeSeries = (stored: { archivedAt: Date | null; seriesGroupId: null | string }) => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'target', ...stored });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { ...existingSeries, id: 'target' }
      } as any);
      instrumentModel.update.mockImplementation(({ data }: any) => Promise.resolve({ id: 'target', ...data }));
    };

    it('should look the series up within what the caller may update', async () => {
      instrumentModel.findFirst.mockResolvedValue(null);
      await expect(instrumentsService.updateSeriesArchive('target', { isArchived: true }, currentUser)).rejects.toThrow(
        NotFoundException
      );
      expect(instrumentModel.findFirst).toHaveBeenCalledWith({
        where: { AND: [accessibleQuery(ability, 'update', 'Instrument')], id: 'target' }
      });
    });

    it('should refuse a scalar instrument, since only series can be archived', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'scalar' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { internal: { edition: 1, name: 'FORM_A' }, kind: 'FORM' }
      } as any);

      await expect(instrumentsService.updateSeriesArchive('scalar', { isArchived: true }, currentUser)).rejects.toThrow(
        ForbiddenException
      );
      expect(instrumentModel.update).not.toHaveBeenCalled();
    });

    it('should stamp when an active series was archived and audit it under its owning group', async () => {
      storeSeries({ archivedAt: null, seriesGroupId: 'group-1' });

      const result = await instrumentsService.updateSeriesArchive('target', { isArchived: true }, currentUser);

      expect(result.archivedAt).toBeInstanceOf(Date);
      expect(auditLogger.log).toHaveBeenCalledWith('ARCHIVE', 'INSTRUMENT', {
        groupId: 'group-1',
        metadata: { instrumentId: 'target', title: 'Existing Series' },
        userId: 'admin-1'
      });
    });

    it('should clear the archive date when unarchiving, and audit a shared series under no group', async () => {
      storeSeries({ archivedAt: new Date('2024-06-01T00:00:00.000Z'), seriesGroupId: null });

      const result = await instrumentsService.updateSeriesArchive('target', { isArchived: false }, currentUser);

      expect(instrumentModel.update).toHaveBeenCalledWith({ data: { archivedAt: null }, where: { id: 'target' } });
      expect(result.archivedAt).toBeNull();
      expect(auditLogger.log).toHaveBeenCalledWith(
        'UNARCHIVE',
        'INSTRUMENT',
        expect.objectContaining({ groupId: null })
      );
    });

    it('should keep the original archive date when archiving again, so the date records when it was retired', async () => {
      const archivedAt = new Date('2024-06-01T00:00:00.000Z');
      storeSeries({ archivedAt, seriesGroupId: 'group-1' });

      const result = await instrumentsService.updateSeriesArchive('target', { isArchived: true }, currentUser);

      expect(result.archivedAt).toBe(archivedAt);
      expect(instrumentModel.update).not.toHaveBeenCalled();
      expect(auditLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    beforeEach(() => {
      instrumentModel.findMany.mockResolvedValue([]);
      instrumentRecordModel.findMany.mockResolvedValue([]);
      vi.spyOn(instrumentsService as any, 'instantiate').mockResolvedValue([]);
    });

    it('should not query records when no subject is given, so the unfiltered listing costs one query', async () => {
      await instrumentsService.find();
      expect(instrumentRecordModel.findMany).not.toHaveBeenCalled();
    });

    // A `records: { some: ... }` relation filter compiles to a $lookup that materialises every
    // record belonging to an instrument, which mongodb aborts past 100 MiB. The subject's own
    // records are queried instead, so the work is bounded by the subject rather than the instrument.
    it('should resolve the subject filter against records rather than joining from instruments', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([{ instrumentId: 'id-1' }, { instrumentId: 'id-2' }] as any);

      await instrumentsService.find({ subjectId: 'subject-1' });

      expect(instrumentRecordModel.findMany).toHaveBeenCalledWith({
        distinct: ['instrumentId'],
        select: { instrumentId: true },
        where: { AND: [{}, { subjectId: 'subject-1' }] }
      });
      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { AND: expect.arrayContaining([{ id: { in: ['id-1', 'id-2'] } }]) }
      });
      expect(JSON.stringify(instrumentModel.findMany.mock.lastCall?.[0])).not.toContain('records');
    });

    it('should constrain the record lookup to what the caller may read, so the filter cannot be resolved from other groups records', async () => {
      // Conditions are what make this meaningful: an unconditional read rule yields `{}`, which is
      // indistinguishable from the ability never having been applied.
      const ability = createAppAbility([
        { action: 'read', conditions: { groupId: { in: ['group-1'] } }, subject: 'InstrumentRecord' },
        { action: 'read', subject: 'Instrument' }
      ]);

      await instrumentsService.find({ subjectId: 'subject-1' }, { ability });

      const [call] = instrumentRecordModel.findMany.mock.lastCall as [{ where: { AND: unknown[] } }];
      expect(call.where.AND[0]).toStrictEqual(accessibleQuery(ability, 'read', 'InstrumentRecord'));
    });

    // Built through the factory rather than by hand: a hand-built ability tends to include a
    // `read InstrumentRecord` rule, and it is the absence of one that breaks. A STANDARD user holds
    // `create` but not `read`, and this route is gated on `read Instrument`, which they do hold.
    it('should resolve for a caller who may read no records, rather than failing the request', async () => {
      const abilityFactory = new AbilityFactory(MockFactory.createMock(LoggingService) as unknown as LoggingService);
      const ability = abilityFactory.createForPayload({
        basePermissionLevel: 'STANDARD',
        groups: [{ id: 'group-1' }],
        id: 'user-1'
      } as any);

      await expect(instrumentsService.find({ subjectId: 'subject-1' }, { ability })).resolves.toStrictEqual([]);

      expect(instrumentRecordModel.findMany).not.toHaveBeenCalled();
      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { AND: expect.arrayContaining([{ id: { in: [] } }]) }
      });
    });

    it('should return nothing when the subject has no records', async () => {
      instrumentRecordModel.findMany.mockResolvedValueOnce([]);

      await instrumentsService.find({ subjectId: 'subject-with-no-records' });

      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: { AND: expect.arrayContaining([{ id: { in: [] } }]) }
      });
    });
  });

  describe('count', () => {
    it('should count the instruments matching the query', async () => {
      const find = vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries, formInstance('FORM_A', 1)]);

      await expect(instrumentsService.count()).resolves.toBe(2);
      expect(find).toHaveBeenCalledWith({}, {});
    });
  });

  describe('find (evaluation)', () => {
    beforeEach(() => {
      instrumentModel.findMany.mockResolvedValue([
        { bundle: 'FORM_BUNDLE', id: 'hash:FORM_A-1' },
        { bundle: 'SERIES_BUNDLE', id: 'series-1' }
      ] as any);
      virtualizationService.eval.mockImplementation((code) =>
        okAsync(code === 'FORM_BUNDLE' ? formInstance('FORM_A', 1) : existingSeries)
      );
    });

    it('should return only instruments of the requested kind', async () => {
      const result = await instrumentsService.find({ kind: 'FORM' });
      expect(result.map(({ id }) => id)).toEqual(['hash:FORM_A-1']);
    });

    it('should tag each evaluated instance with its stored id, whatever id the bundle declares', async () => {
      const result = await instrumentsService.find();
      expect(result.map(({ id }) => id)).toEqual(['hash:FORM_A-1', 'series-1']);
    });

    it('should evaluate a stored bundle once and serve later lookups from the cache', async () => {
      await instrumentsService.find();
      await instrumentsService.find();
      expect(virtualizationService.eval).toHaveBeenCalledTimes(2);
    });

    it('should scope owned series to the named series group in preference to the caller groups', async () => {
      await instrumentsService.find({ seriesGroupId: 'group-2' }, {}, ['group-1']);
      expect(instrumentModel.findMany.mock.lastCall?.[0]).toMatchObject({
        where: {
          AND: [
            {},
            { OR: [{ seriesGroupId: null }, { seriesGroupId: { isSet: false } }, { seriesGroupId: 'group-2' }] },
            {}
          ]
        }
      });
    });

    it('should fail loudly when a stored bundle no longer evaluates, rather than omitting the instrument', async () => {
      const cause = { message: 'boom', name: 'Error' };
      virtualizationService.eval.mockReturnValue(errAsync(cause));

      const error = await instrumentsService.find().catch((err: unknown) => err);

      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error).toMatchObject({ cause, message: 'Failed to evaluate instrument' });
    });
  });

  describe('findBundleById (resolution)', () => {
    beforeEach(() => {
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
    });

    it('should report a missing instrument as not found', async () => {
      instrumentModel.findFirst.mockResolvedValue(null);
      await expect(instrumentsService.findBundleById('missing')).rejects.toThrowError(
        new NotFoundException('Failed to find instrument with ID: missing')
      );
    });

    it('should bundle a series together with the bundle of every item, so it can be administered offline', async () => {
      instrumentModel.findFirst.mockImplementation(({ where }: any) =>
        Promise.resolve({ bundle: `${where.id}:bundle`, id: where.id })
      );
      virtualizationService.eval.mockImplementation((code) =>
        okAsync(code === 'series-1:bundle' ? existingSeries : formInstance('FORM', 1))
      );

      await expect(instrumentsService.findBundleById('series-1')).resolves.toEqual({
        bundle: 'series-1:bundle',
        id: 'series-1',
        items: [
          { bundle: 'hash:FORM_A-1:bundle', id: 'hash:FORM_A-1', kind: 'FORM' },
          { bundle: 'hash:FORM_B-1:bundle', id: 'hash:FORM_B-1', kind: 'FORM' }
        ],
        kind: 'SERIES'
      });
    });

    it('should refuse an instance of an unknown kind, rather than serving a bundle no client can render', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'odd' } as any);
      virtualizationService.eval.mockReturnValue(okAsync({ kind: 'UNKNOWN' }));

      await expect(instrumentsService.findBundleById('odd')).rejects.toThrowError(
        new InternalServerErrorException('Unexpected instance kind: UNKNOWN')
      );
    });
  });

  describe('list', () => {
    let find: MockInstance<InstrumentsService['find']>;

    beforeEach(() => {
      find = vi.spyOn(instrumentsService, 'find').mockResolvedValue([formInstance('FORM_A', 1)]);
    });

    it('should summarize each instrument by id, internal name and title', async () => {
      await expect(instrumentsService.list()).resolves.toEqual([
        { id: 'hash:FORM_A-1', internal: { edition: 1, name: 'FORM_A' }, title: 'FORM_A' }
      ]);
    });

    it('should not narrow the listing to any group when there is no current user', async () => {
      await instrumentsService.list();
      expect(find).toHaveBeenCalledWith({}, { ability: undefined }, undefined);
    });

    it('should narrow the listing to a requested group the current user belongs to', async () => {
      const ability = createAppAbility([{ action: 'read', subject: 'Instrument' }]);
      const currentUser = { ability, groups: [{ id: 'group-1' }, { id: 'group-2' }] } as unknown as RequestUser;

      await instrumentsService.list({ kind: 'FORM' }, currentUser, 'group-2');

      expect(find).toHaveBeenCalledWith({ kind: 'FORM' }, { ability }, ['group-2']);
    });
  });

  describe('findInfo (resolution)', () => {
    it('should not query stored metadata when no instrument matches', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);

      await expect(instrumentsService.findInfo()).resolves.toEqual([]);
      expect(instrumentModel.findMany).not.toHaveBeenCalled();
    });

    it('should report the source repository of an imported instrument, with a null name for a legacy import', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([formInstance('FORM_A', 1), formInstance('FORM_B', 1)]);
      instrumentModel.findMany.mockResolvedValue([
        { id: 'hash:FORM_A-1', sourceRepoId: 'repo-1', sourceRepoName: 'Clinic Repo' },
        { id: 'hash:FORM_B-1', sourceRepoId: 'repo-2', sourceRepoName: null }
      ] as any);

      await expect(instrumentsService.findInfo()).resolves.toMatchObject([
        { id: 'hash:FORM_A-1', sourceRepo: { id: 'repo-1', name: 'Clinic Repo' } },
        { id: 'hash:FORM_B-1', sourceRepo: { id: 'repo-2', name: null } }
      ]);
    });

    it('should keep the latest edition when an earlier edition is listed after it', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([formInstance('FORM_A', 2), formInstance('FORM_A', 1)]);
      instrumentModel.findMany.mockResolvedValue([]);

      const result = await instrumentsService.findInfo();

      expect(result.map(({ id }) => id)).toEqual(['hash:FORM_A-2']);
    });

    it('should resolve the items of a series to the ids of the stored scalar instruments', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([
        formInstance('FORM_A', 1),
        formInstance('FORM_B', 1),
        existingSeries
      ]);
      instrumentModel.findMany.mockResolvedValue([]);

      const result = await instrumentsService.findInfo();

      expect(result.find(({ id }) => id === existingSeries.id)).toMatchObject({
        seriesItems: [{ id: 'hash:FORM_A-1' }, { id: 'hash:FORM_B-1' }]
      });
    });

    it('should log an item that cannot be resolved instead of silently dropping it from the series', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([formInstance('FORM_A', 1), existingSeries]);
      instrumentModel.findMany.mockResolvedValue([]);

      const result = await instrumentsService.findInfo();

      expect(result.find(({ id }) => id === existingSeries.id)).toMatchObject({
        seriesItems: [{ id: 'hash:FORM_A-1' }]
      });
      expect(loggingService.error).toHaveBeenCalledWith({
        message: `Cannot resolve item 'FORM_B' (edition 1) of series instrument '${existingSeries.id}'`,
        seriesInstrumentId: existingSeries.id
      });
    });
  });

  describe('findSeriesOverview (ownership)', () => {
    it('should name no owning group when the caller may not read it', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([{ ...existingSeries, content: { items: [] } }]);
      instrumentModel.findMany.mockResolvedValue([
        { id: existingSeries.id, seriesGroupId: 'hidden-group', sourceRepoId: null, sourceRepoName: null }
      ] as any);
      groupModel.findMany.mockResolvedValue([]);

      await expect(instrumentsService.findSeriesOverview()).resolves.toMatchObject([
        { id: existingSeries.id, seriesGroup: null, seriesGroupId: 'hidden-group' }
      ]);
    });
  });

  describe('createSeries (titles and languages)', () => {
    const items = [
      { edition: 1, name: 'FORM_A' },
      { edition: 1, name: 'FORM_B' }
    ];

    /** The series definition `createSeries` handed to the bundler. */
    const bundledDefinition = () => {
      const source = vi.mocked(bundle).mock.lastCall?.[0].inputs[0]!.content as string;
      return JSON.parse(source.replace(/^export default /, '').replace(/;$/, '')) as { [key: string]: unknown };
    };

    beforeEach(() => {
      vi.spyOn(instrumentsService, 'create').mockResolvedValue({ ...existingSeries, id: 'created-id' });
    });

    it('should tag a multilingual series in each of its languages', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);

      await instrumentsService.createSeries({
        details: { title: { en: 'Series', fr: 'Série' } },
        groupId: 'group-1',
        items,
        language: ['en', 'fr']
      });

      expect(bundledDefinition()).toMatchObject({ tags: { en: ['Series'], fr: ['Série'] } });
    });

    it('should trim every language of a multilingual title before storing it', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);

      await instrumentsService.createSeries({
        details: { title: { en: '  Series ', fr: ' Série  ' } },
        groupId: 'group-1',
        items,
        language: ['en', 'fr']
      });

      expect(bundledDefinition()).toMatchObject({ details: { title: { en: 'Series', fr: 'Série' } } });
    });

    it('should name the language whose title is blank, so the author knows which to fill in', async () => {
      await expect(
        instrumentsService.createSeries({
          details: { title: { en: 'Series', fr: '   ' } },
          groupId: 'group-1',
          items,
          language: ['en', 'fr']
        })
      ).rejects.toThrowError(new UnprocessableEntityException("Instrument title cannot be blank for language 'fr'"));
    });

    it('should not treat a scalar instrument as a duplicate series, whatever its content', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([formInstance('FORM_A', 1)]);

      await expect(
        instrumentsService.createSeries({ details: { title: 'Series' }, groupId: 'group-1', items, language: 'en' })
      ).resolves.toEqual({ instrumentId: 'created-id', outcome: 'created' });
    });
  });

  describe('updateSeriesArchive (audit titles)', () => {
    const currentUser = { ability: createAppAbility([{ action: 'manage', subject: 'all' }]), id: 'admin-1' };

    const archiveSeriesTitled = async (title: unknown) => {
      instrumentModel.findFirst.mockResolvedValue({ archivedAt: null, bundle: '__BUNDLE__', id: 'target' } as any);
      virtualizationService.eval.mockReturnValue(okAsync({ ...existingSeries, details: { title } }));
      instrumentModel.update.mockResolvedValue({ archivedAt: new Date(), id: 'target' } as any);
      await instrumentsService.updateSeriesArchive('target', { isArchived: true }, currentUser as RequestUser);
      return auditLogger.log.mock.lastCall?.[2].metadata;
    };

    it('should record a unilingual title as written', async () => {
      await expect(archiveSeriesTitled('Plain Title')).resolves.toEqual({
        instrumentId: 'target',
        title: 'Plain Title'
      });
    });

    it('should record every language of a title with no English version', async () => {
      await expect(archiveSeriesTitled({ es: 'Serie', fr: 'Série' })).resolves.toEqual({
        instrumentId: 'target',
        title: 'Serie / Série'
      });
    });
  });
});
