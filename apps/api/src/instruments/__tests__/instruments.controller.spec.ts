import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY } from '@/core/decorators/accepts-instrument-token.decorator';

import { InstrumentsController } from '../instruments.controller';
import { InstrumentsService } from '../instruments.service';

describe('InstrumentsController', () => {
  let instrumentsController: InstrumentsController;
  let instrumentsService: MockedInstance<InstrumentsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [MockFactory.createForService(InstrumentsService)]
    }).compile();
    instrumentsController = moduleRef.get(InstrumentsController);
    instrumentsService = moduleRef.get(InstrumentsService);
  });

  it('should be defined', () => {
    expect(instrumentsController).toBeDefined();
    expect(instrumentsService).toBeDefined();
  });

  it('scopes instrument info to the requested current group', async () => {
    const ability = { can: vi.fn(() => false) };
    const currentUser = { ability, groups: [{ id: 'group-1' }, { id: 'group-2' }] } as any;
    instrumentsService.findInfo.mockResolvedValue([]);

    await instrumentsController.findInfo(currentUser, undefined, 'group-1');

    expect(instrumentsService.findInfo).toHaveBeenCalledWith(
      { kind: undefined, subjectId: undefined },
      currentUser,
      'group-1'
    );
  });

  it('should accept an instrument token on create and no other handler, so the minted token can only upload', () => {
    const handlerNames = Object.getOwnPropertyNames(InstrumentsController.prototype).filter(
      (name) => name !== 'constructor'
    );
    const accepting = handlerNames.filter((name) =>
      new Reflector().get<true | undefined>(
        ACCEPTS_INSTRUMENT_TOKEN_METADATA_KEY,
        Object.getOwnPropertyDescriptor(InstrumentsController.prototype, name)!.value
      )
    );
    expect(accepting).toEqual(['create']);
  });
});
