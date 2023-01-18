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

  describe('createForm', () => {
    it('should call instrumentsService.createForm', async () => {
      await instrumentsController.createForm(mockFormInstrumentDto);
      expect(instrumentsService.createForm).toBeCalledWith(mockFormInstrumentDto);
    });
  });
});
