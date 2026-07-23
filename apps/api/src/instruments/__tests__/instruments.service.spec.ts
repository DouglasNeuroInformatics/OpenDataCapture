import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { bundle } from '@opendatacapture/instrument-bundler';
import type { SeriesInstrument } from '@opendatacapture/runtime-core';
import type { WithID } from '@opendatacapture/schemas/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

/**
 * The `where` fragment `validateSeriesInstrument` builds to restrict a series' items to the instruments
 * the owning group may administer.
 */
const groupItemFilter = ({
  accessibleInstrumentIds = [],
  instrumentRepoIds = []
}: { accessibleInstrumentIds?: string[]; instrumentRepoIds?: string[] } = {}) => ({
  OR: [{ sourceRepoId: null }, { sourceRepoId: { in: instrumentRepoIds } }, { id: { in: accessibleInstrumentIds } }]
});

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let cryptoService: MockedInstance<CryptoService>;
  let assignmentModel: MockedInstance<Model<'Assignment'>>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let groupModel: MockedInstance<Model<'Group'>>;
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
        select: { id: true, seriesGroupId: true, sourceRepoId: true, sourceRepoName: true },
        where: { id: { in: ['owned', 'shared'] } }
      });
      expect(result).toMatchObject([
        { id: 'owned', seriesGroupId: 'group-1' },
        { id: 'shared', seriesGroupId: null }
      ]);
    });
  });
});
