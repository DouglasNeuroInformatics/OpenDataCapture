import { CryptoService } from '@douglasneuroinformatics/libnest/modules';
import { type MockedInstance, MockFactory } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Model } from '@/prisma/prisma.types';
import { getModelToken } from '@/prisma/prisma.utils';
import { VirtualizationService } from '@/virtualization/virtualization.service';

import { InstrumentsService } from '../instruments.service';

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;
  let instrumentModel: MockedInstance<Model<'Instrument'>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        MockFactory.createForModelToken(getModelToken('Instrument')),
        MockFactory.createForService(CryptoService),
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
});
