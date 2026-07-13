import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

    await instrumentsController.findInfo(currentUser, 'group-1');

    expect(instrumentsService.findInfo).toHaveBeenCalledWith(
      { kind: undefined, subjectId: undefined },
      currentUser,
      'group-1'
    );
  });
});
