import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { bundle } from '@opendatacapture/instrument-bundler';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '../instruments.service';

// Avoid bundling a real instrument (esbuild) during unit tests; `createSeries` only needs `create` to be
// called with whatever the bundler produces.
vi.mock('@opendatacapture/instrument-bundler', () => ({
  bundle: vi.fn(() => Promise.resolve('__BUNDLE__'))
}));

// A multilingual series instance as returned by `find`, containing two forms.
const existingSeries = {
  __runtimeVersion: 1,
  content: {
    items: [
      { edition: 1, name: 'FORM_A' },
      { edition: 1, name: 'FORM_B' }
    ]
  },
  details: { title: { en: 'Existing Series', fr: 'Série existante' } },
  id: 'existing-series-id',
  kind: 'SERIES',
  language: ['en', 'fr']
} as any;

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
        items: [
          { edition: 1, name: 'FORM_B' },
          { edition: 1, name: 'FORM_A' }
        ],
        title: 'My New Series'
      });

      expect(result).toEqual({ existingTitle: 'Existing Series', requiresConfirmation: true });
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('creates the series when the duplicate is explicitly confirmed', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'new-id' } as any);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        items: [
          { edition: 1, name: 'FORM_A' },
          { edition: 1, name: 'FORM_B' }
        ],
        title: 'My New Series'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' });
      expect(result).toEqual({ id: 'new-id' });
    });

    it('creates the series directly when no existing series shares its forms', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'fresh-id' } as any);

      const result = await instrumentsService.createSeries({
        items: [
          { edition: 1, name: 'FORM_C' },
          { edition: 1, name: 'FORM_D' }
        ],
        title: 'Totally New'
      });

      expect(createSpy).toHaveBeenCalledWith({ bundle: '__BUNDLE__' });
      expect(result).toEqual({ id: 'fresh-id' });
    });

    it('generates a valid series source payload with selected items in order', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(instrumentsService, 'create').mockResolvedValue({ id: 'generated-id' } as any);

      await instrumentsService.createSeries({
        description: 'Optional description',
        instructions: 'Complete the instruments in order.',
        items: [
          { edition: 2, name: 'FORM_B' },
          { edition: 1, name: 'FORM_A' }
        ],
        title: 'Generated Series'
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
      expect(definition.clientDetails).toEqual({
        instructions: { en: ['Complete the instruments in order.'], fr: ['Complete the instruments in order.'] }
      });
      expect(definition.details).toMatchObject({
        description: { en: 'Optional description', fr: 'Optional description' },
        title: { en: 'Generated Series', fr: 'Generated Series' }
      });
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
          description: { en: 'Stored Series', fr: 'Stored Series' },
          license: 'UNLICENSED',
          title: { en: 'Stored Series', fr: 'Stored Series' }
        },
        kind: 'SERIES',
        language: ['en', 'fr'],
        tags: { en: ['Series'], fr: ['Série'] }
      } as const;
      const id = `hash:${JSON.stringify({ content: instance.content, title: instance.details.title })}`;

      vi.spyOn(instrumentsService, 'find').mockResolvedValue([]);
      vi.spyOn(cryptoService, 'hash').mockImplementation((value) => `hash:${value}`);
      virtualizationService.eval.mockResolvedValue({ isErr: () => false, value: instance } as any);
      instrumentModel.exists.mockResolvedValueOnce(false).mockResolvedValue(true);

      const result = await instrumentsService.createSeries({
        confirmDuplicate: true,
        items,
        title: 'Stored Series'
      });

      expect(virtualizationService.eval).toHaveBeenCalledWith('__BUNDLE__');
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(1, { id });
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(2, { id: 'hash:FORM_A-1' });
      expect(instrumentModel.exists).toHaveBeenNthCalledWith(3, { id: 'hash:FORM_B-1' });
      expect(instrumentModel.create).toHaveBeenCalledWith({ data: { bundle: '__BUNDLE__', id } });
      expect(result).toEqual({ ...instance, id });
    });

    it('rejects a title that is already used (case-insensitively) by another instrument', async () => {
      vi.spyOn(instrumentsService, 'find').mockResolvedValue([existingSeries]);
      const createSpy = vi.spyOn(instrumentsService, 'create');

      await expect(
        instrumentsService.createSeries({
          items: [
            { edition: 1, name: 'FORM_X' },
            { edition: 1, name: 'FORM_Y' }
          ],
          title: 'existing series'
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
        details: { title: 'First Series' }
      };
      const second = {
        ...existingSeries,
        details: { title: 'Second Series' }
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

    it('refuses to delete an instrument that has collected records', async () => {
      instrumentModel.findFirst.mockResolvedValue({ id: 'has-records' });
      instrumentRecordModel.count.mockResolvedValue(3);

      await expect(instrumentsService.deleteById('has-records')).rejects.toThrow(ForbiddenException);
      expect(instrumentModel.delete).not.toHaveBeenCalled();
    });

    it('deletes the instrument and detaches it from every group when it has no records', async () => {
      instrumentModel.findFirst.mockResolvedValue({ id: 'target' });
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
