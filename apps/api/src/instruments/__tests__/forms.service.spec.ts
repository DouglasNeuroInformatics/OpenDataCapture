import { beforeEach, describe, expect, it } from 'bun:test';

import { createMock } from '@douglasneuroinformatics/nestjs/testing';
import { Test } from '@nestjs/testing';

import { InstrumentRepository } from '../repositories/instrument.repository';
import { FormsService } from '../services/forms.service';

describe('FormsService', () => {
  let formsService: FormsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FormsService,
        {
          provide: InstrumentRepository,
          useValue: createMock<InstrumentRepository>
        }
      ]
    }).compile();
    formsService = moduleRef.get(FormsService);
  });

  it('should be defined', () => {
    expect(formsService).toBeDefined();
  });
});
