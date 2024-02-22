import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

describe('InstrumentsController', () => {
  let instrumentsController: InstrumentsController;
  let instrumentsService: MockedInstance<InstrumentsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        {
          provide: InstrumentsService,
          useValue: createMock(InstrumentsService)
        }
      ]
    }).compile();
    instrumentsController = moduleRef.get(InstrumentsController);
    instrumentsService = moduleRef.get(InstrumentsService);
  });

  it('should be defined', () => {
    expect(instrumentsController).toBeDefined();
    expect(instrumentsService).toBeDefined();
  });
});
