import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { bundle } from '@opendatacapture/instrument-bundler';
import type { SeriesInstrument } from '@opendatacapture/runtime-core';
import type { WithID } from '@opendatacapture/schemas/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '../instruments.service';

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

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let cryptoService: MockedInstance<CryptoService>;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;
  let instrumentRecordModel: MockedInstance<Model<'InstrumentRecord'>>;
  let groupModel: MockedInstance<Model<'Group'>>;
  let virtualizationService: MockedInstance<VirtualizationService<any>>;

  beforeEach(async () => {
    vi.mocked(bundle).mockClear();

    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
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
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
    instrumentRecordModel = moduleRef.get(getModelToken('InstrumentRecord'));
    groupModel = moduleRef.get(getModelToken('Group'));
    groupModel.findFirst.mockResolvedValue({ id: 'group-1' } as any);
    virtualizationService = moduleRef.get(VirtualizationService);
    // `getInstrumentInstance` reads/writes an instance cache on the virtualization context.
    (virtualizationService as { context: unknown }).context = { __resolveImport: vi.fn(), instruments: new Map() };
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
      instrumentModel.exists.mockResolvedValueOnce(false).mockResolvedValue(true);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'Stored Series' },
        groupId: 'group-1',
        items,
        language: 'en'
      });

      expect(virtualizationService.eval).toHaveBeenCalledWith('__BUNDLE__');
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(1, { id });
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(2, { id: 'hash:FORM_A-1' });
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(3, { id: 'hash:FORM_B-1' });
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
  });
});
