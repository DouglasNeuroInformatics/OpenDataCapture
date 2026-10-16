import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SetupController } from '../setup.controller';
import { SetupService } from '../setup.service';

describe('SetupController', () => {
  let setupController: SetupController;
  let setupService: MockedInstance<SetupService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SetupController],
      providers: [MockFactory.createForService(SetupService)]
    }).compile();
    setupController = moduleRef.get(SetupController);
    setupService = moduleRef.get(SetupService);
  });

  it('should delegate deleting the instance to the service, which refuses outside of test', async () => {
    setupService.delete.mockResolvedValue(undefined);
    await setupController.delete();
    expect(setupService.delete).toHaveBeenCalledOnce();
  });

  it('should return the current setup state', async () => {
    const state = { isDemo: false, isSetup: true };
    setupService.getState.mockResolvedValue(state);
    await expect(setupController.getState()).resolves.toBe(state);
  });

  it('should initialize the instance with the submitted options', async () => {
    const options = {
      admin: { firstName: 'Ada', lastName: 'Admin', password: 'Password123!', username: 'admin' },
      enableExperimentalFeatures: false,
      initDemo: false
    };
    setupService.initApp.mockResolvedValue({ success: true });

    await expect(setupController.initApp(options)).resolves.toEqual({ success: true });
    expect(setupService.initApp).toHaveBeenCalledWith(options);
  });

  it('should update the setup state and return the state that results', async () => {
    const updated = { isExperimentalFeaturesEnabled: true };
    setupService.updateState.mockResolvedValue(updated);

    await expect(setupController.updateState({ isExperimentalFeaturesEnabled: true })).resolves.toBe(updated);
    expect(setupService.updateState).toHaveBeenCalledWith({ isExperimentalFeaturesEnabled: true });
  });
});
