import { ConfigService, getModelToken, LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DemoService } from '@/demo/demo.service';
import { InstrumentReposService } from '@/instrument-repos/instrument-repos.service';
import { UsersService } from '@/users/users.service';

import { SetupService } from '../setup.service';

describe('SetupService', () => {
  let setupService: SetupService;
  let setupStateModel: MockedInstance<Model<'SetupState'>>;

  beforeEach(async () => {
    vi.stubGlobal('__RELEASE__', { buildTime: 0, type: 'test', version: '0.0.0' });
    const moduleRef = await Test.createTestingModule({
      providers: [
        SetupService,
        MockFactory.createForModelToken(getModelToken('SetupState')),
        MockFactory.createForService(ConfigService),
        MockFactory.createForService(DemoService),
        MockFactory.createForService(InstrumentReposService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(UsersService),
        { provide: PRISMA_CLIENT_TOKEN, useValue: {} }
      ]
    }).compile();
    setupService = moduleRef.get(SetupService);
    setupStateModel = moduleRef.get(getModelToken('SetupState'));
    moduleRef.get<MockedInstance<ConfigService>>(ConfigService).get.mockReturnValue(false);
  });

  describe('updateState', () => {
    it('should persist defaultAssignmentDurationDays', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ defaultAssignmentDurationDays: 45 });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { defaultAssignmentDurationDays: 45 },
        where: { id: 'setup-1' }
      });
    });
  });

  describe('getState', () => {
    it('should return the saved defaultAssignmentDurationDays', async () => {
      setupStateModel.findFirst.mockResolvedValue({ defaultAssignmentDurationDays: 45, isDemo: false, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ defaultAssignmentDurationDays: 45 });
    });

    it('should return null when unset', async () => {
      setupStateModel.findFirst.mockResolvedValue({ isDemo: false, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ defaultAssignmentDurationDays: null });
    });
  });
});
