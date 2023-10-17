import { beforeEach, describe, expect, it } from 'bun:test';

import { type MockedInstance, createMock } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';

import { FormsController } from '../forms.controller';
import { FormsService } from '../forms.service';

describe('FormsController', () => {
  let formsController: FormsController;
  let formsService: MockedInstance<FormsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        {
          provide: FormsService,
          useValue: createMock(FormsService)
        }
      ]
    }).compile();
    formsController = moduleRef.get(FormsController);
    formsService = moduleRef.get(FormsService);
  });

  it('should be defined', () => {
    expect(formsController).toBeDefined();
    expect(formsService).toBeDefined();
  });
});
