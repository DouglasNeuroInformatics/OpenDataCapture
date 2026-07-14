import { CryptoService, getModelToken, LoggingService, VirtualizationService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { InstrumentsService } from '../instruments.service';

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let cryptoService: MockedInstance<CryptoService>;
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
    cryptoService = moduleRef.get(CryptoService);
    instrumentModel = moduleRef.get(getModelToken('Instrument'));
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
    expect(instrumentModel).toBeDefined();
  });

  describe('findLatestScalarEditionId', () => {
    const internal = { edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' };

    beforeEach(() => {
      cryptoService.hash.mockImplementation((value: string) => `hash(${value})`);
    });

    it('should return the id of the provided edition, if no later edition exists', async () => {
      instrumentModel.exists.mockResolvedValue(false);
      await expect(instrumentsService.findLatestScalarEditionId({ internal })).resolves.toBe(
        'hash(HAPPINESS_QUESTIONNAIRE-1)'
      );
    });

    it('should return the id of the latest edition, if multiple later editions exist', async () => {
      instrumentModel.exists.mockImplementation(({ id }: { id: string }) => {
        return Promise.resolve(id === 'hash(HAPPINESS_QUESTIONNAIRE-2)' || id === 'hash(HAPPINESS_QUESTIONNAIRE-3)');
      });
      await expect(instrumentsService.findLatestScalarEditionId({ internal })).resolves.toBe(
        'hash(HAPPINESS_QUESTIONNAIRE-3)'
      );
    });
  });
});
