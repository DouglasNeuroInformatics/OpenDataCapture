import { Test } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';
import { mockFormInstrumentDto } from './stubs/instrument.stubs';

describe('InstrumentsController', () => {
  let instrumentsController: InstrumentsController;
  let instrumentsService: InstrumentsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        {
          provide: InstrumentsService,
          useValue: createMock<InstrumentsService>()
        }
      ]
    }).compile();

    instrumentsController = moduleRef.get(InstrumentsController);
    instrumentsService = moduleRef.get(InstrumentsService);
  });

  describe('create', () => {
    it('should call instrumentsService.create', async () => {
      await instrumentsController.create(mockFormInstrumentDto);
      expect(instrumentsService.create).toBeCalled();
    });
  });
});
