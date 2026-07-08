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
    virtualizationService = moduleRef.get(VirtualizationService);
    // `getInstrumentInstance` reads/writes an instance cache on the virtualization context.
    (virtualizationService as { context: unknown }).context = { __resolveImport: vi.fn(), instruments: new Map() };
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
    expect(instrumentModel).toBeDefined();
  });

  describe('createSeries', () => {
    it('asks for confirmation (without creating) when another series already has the same forms', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create');

      // Same two forms as `existingSeries` but in a different order and under a different name.
      const result = await instrumentsService.createSeries({
        details: { title: 'My New Series' },
        items: [
          { edition: 1, name: 'FORM_B' },
          { edition: 1, name: 'FORM_A' }
        ],
        language: 'en'
      });

      expect(result).toEqual({
        existingTitle: { en: 'Existing Series', fr: 'Série existante' },
        outcome: 'duplicate'
      });
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('creates the series when the duplicate is explicitly confirmed', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'new-id' } as any);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'My New Series' },
        items: [
          { edition: 1, name: 'FORM_A' },
          { edition: 1, name: 'FORM_B' }
        ],
        language: 'en'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' });
      expect(result).toEqual({ instrumentId: 'new-id', outcome: 'created' });
    });

    it('creates the series directly when no existing series shares its forms', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'fresh-id' } as any);

      const result = await instrumentsService.createSeries({
        details: { title: 'Totally New' },
        items: [
          { edition: 1, name: 'FORM_C' },
          { edition: 1, name: 'FORM_D' }
        ],
        language: 'en'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' });
      expect(result).toEqual({ instrumentId: 'fresh-id', outcome: 'created' });
    });

    it('generates a valid, unilingual series source payload with selected items in order', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'generated-id' } as any);

      await instrumentsService.createSeries({
        clientDetails: { instructions: ['Complete the instruments in order.'] },
        details: { description: 'Optional description', title: 'Generated Series' },
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
      const id = `hash:${JSON.stringify({ content: instance.content, title: instance.details.title })}`;

      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({ isErr: () => false, value: instance } as any);
      instrumentModel.exists.mockResolvedValueOnce(false).mockResolvedValue(true);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        details: { title: 'Stored Series' },
        items,
        language: 'en'
      });

      expect(virtualizationService.eval).toHaveBeenCalledWith('__BUNDLE__');
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(1, { id });
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(2, { id: 'hash:FORM_A-1' });
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(3, { id: 'hash:FORM_B-1' });
      expect(instrumentModel.create).toHaveBeenCalledWith({ data: { bundle: '__BUNDLE__', id } });
      expect(result).toEqual({ instrumentId: id, outcome: 'created' });
    });

    it('rejects a title that is already used (case-insensitively) by another instrument', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create');

      await expect(
        instrumentsService.createSeries({
          details: { title: 'existing series' },
          items: [
            { edition: 1, name: 'FORM_X' },
            { edition: 1, name: 'FORM_Y' }
          ],
          language: 'en'
        })
      ).rejects.toThrow(ConflictException);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('generateSeriesInstrumentId', () => {
    it('includes the series title so confirmed duplicate form sets can be distinct', () => {
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => value);

      const first = {
        ...existingSeries,
        details: { ...existingSeries.details, title: 'First Series' }
      };
      const second = {
        ...existingSeries,
        details: { ...existingSeries.details, title: 'Second Series' }
      };

      expect(instrumentsService.generateSeriesInstrumentId(first)).not.toBe(
        instrumentsService.generateSeriesInstrumentId(second)
      );
      expect(cryptoService.hash).toHaveBeenCalledWith(
        JSON.stringify({ content: first.content, title: first.details.title })
      );
    });
  });

  describe('deleteById', () => {
    it('throws when the instrument does not exist', async () => {
      instrumentModel.findFirst.mockResolvedValue(null);
      await expect(instrumentsService.deleteById('missing')).rejects.toThrow(NotFoundException);
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

    it('deletes a series instrument and detaches it from every group', async () => {
      instrumentModel.findFirst.mockResolvedValue({ bundle: '__BUNDLE__', id: 'target' });
      virtualizationService.eval.mockResolvedValue({
        isErr: () => false,
        value: { content: { items: [] }, kind: 'SERIES' }
      } as any);
      groupModel.findMany.mockResolvedValue([{ accessibleInstrumentIds: ['other', 'target'], id: 'g1' }]);

      const result = await instrumentsService.deleteById('target');

      expect(groupModel.update).toHaveBeenCalledWith({
        data: { accessibleInstrumentIds: { set: ['other'] } },
        where: { id: 'g1' }
      });
      expect(instrumentModel.delete).toHaveBeenCalledWith({ where: { id: 'target' } });
      expect(result).toEqual({ id: 'target' });
      // Series instruments never have records of their own, so record counts are irrelevant here.
      expect(instrumentRecordModel.count).not.toHaveBeenCalled();
    });
  });
});
