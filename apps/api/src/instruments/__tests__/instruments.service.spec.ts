import { beforeEach, describe, expect, it } from 'bun:test';

import { createMock } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';

import { InstrumentsRepository } from '../instruments.repository';
import { InstrumentsService } from '../instruments.service';

describe('InstrumentsService', () => {
  let instrumentsService: InstrumentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        {
          provide: InstrumentsRepository,
          useValue: createMock<InstrumentsRepository>
        }
      ]
    }).compile();
    instrumentsService = moduleRef.get(InstrumentsService);
  });

  it('should be defined', () => {
    expect(instrumentsService).toBeDefined();
  });
});
