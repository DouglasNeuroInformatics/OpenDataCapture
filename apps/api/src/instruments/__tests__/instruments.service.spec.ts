import { beforeEach, describe, expect, it } from 'bun:test';

import { getRepositoryToken } from '@douglasneuroinformatics/nestjs/modules';
import { DatabaseRepository } from '@douglasneuroinformatics/nestjs/modules';
import { createMock } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';

import { InstrumentEntity } from '../entities/instrument.entity';
import { InstrumentsService } from '../instruments.service';

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        {
          provide: getRepositoryToken(InstrumentEntity),
          useValue: createMock(DatabaseRepository(InstrumentEntity))
        }
      ]
    }).compile();
    instrumentsService = moduleRef.get(InstrumentsService);
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
  });
});
