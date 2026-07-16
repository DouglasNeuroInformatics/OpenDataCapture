import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '../instruments.service';

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        MockFactory.createForModelToken(getModelToken('Group')),
        MockFactory.createForModelToken(getModelToken('Instrument')),
        MockFactory.createForService(CryptoService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(VirtualizationService)
      ]
    }).compile();
    instrumentsService = moduleRef.get(InstrumentsService);
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
    expect(instrumentModel).toBeDefined();
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
  });
});
