import { ConfigService, getModelToken, LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { CreateAdminData } from '@opendatacapture/schemas/setup';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { DemoService } from '@/demo/demo.service';
import { InstrumentReposService } from '@/instrument-repos/instrument-repos.service';
import { UsersService } from '@/users/users.service';

import { SetupService } from '../setup.service';

const admin: CreateAdminData = { firstName: 'Ada', lastName: 'Admin', password: 'Password123!', username: 'admin' };

describe('SetupService', () => {
  let configService: MockedInstance<ConfigService>;
  let demoService: MockedInstance<DemoService>;
  let instrumentReposService: MockedInstance<InstrumentReposService>;
  let loggingService: MockedInstance<LoggingService>;
  let prismaClient: { $runCommandRaw: Mock };
  let usersService: MockedInstance<UsersService>;
  let setupService: SetupService;
  let setupStateModel: MockedInstance<Model<'SetupState'>>;

  /** Answer `ConfigService.get` per key, as the real service does from the environment. */
  const stubConfig = (env: { GATEWAY_ENABLED?: boolean; NODE_ENV?: string }) => {
    configService.get.mockImplementation((key: string) => env[key as keyof typeof env]);
  };

  beforeEach(async () => {
    prismaClient = { $runCommandRaw: vi.fn().mockResolvedValue({ ok: 1 }) };
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
        { provide: PRISMA_CLIENT_TOKEN, useValue: prismaClient }
      ]
    }).compile();
    setupService = moduleRef.get(SetupService);
    setupStateModel = moduleRef.get(getModelToken('SetupState'));
    configService = moduleRef.get<MockedInstance<ConfigService>>(ConfigService);
    configService.get.mockReturnValue(false);
    demoService = moduleRef.get(DemoService);
    instrumentReposService = moduleRef.get(InstrumentReposService);
    loggingService = moduleRef.get(LoggingService);
    usersService = moduleRef.get(UsersService);
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

  describe('isBulkRemoteAssignmentsEnabled', () => {
    it('should persist isBulkRemoteAssignmentsEnabled', async () => {
      configService.get.mockReturnValue(true);
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ isBulkRemoteAssignmentsEnabled: true });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { isBulkRemoteAssignmentsEnabled: true },
        where: { id: 'setup-1' }
      });
    });

    it('should refuse to enable it without the gateway, which is what serves an assignment', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await expect(setupService.updateState({ isBulkRemoteAssignmentsEnabled: true })).rejects.toThrow(
        ForbiddenException
      );
      expect(setupStateModel.update).not.toHaveBeenCalled();
    });

    it('should allow disabling it without the gateway, so an instance is never stuck with it on', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ isBulkRemoteAssignmentsEnabled: false });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { isBulkRemoteAssignmentsEnabled: false }
      });
    });

    it('should return true when saved as true', async () => {
      configService.get.mockReturnValue(true);
      setupStateModel.findFirst.mockResolvedValue({
        isBulkRemoteAssignmentsEnabled: true,
        isDemo: false,
        isSetup: true
      });
      await expect(setupService.getState()).resolves.toMatchObject({ isBulkRemoteAssignmentsEnabled: true });
    });

    it('should default to true when the field is absent, so a new instance has it enabled', async () => {
      configService.get.mockReturnValue(true);
      setupStateModel.findFirst.mockResolvedValue({ isDemo: false, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ isBulkRemoteAssignmentsEnabled: true });
    });

    it('should return false when explicitly disabled', async () => {
      configService.get.mockReturnValue(true);
      setupStateModel.findFirst.mockResolvedValue({
        isBulkRemoteAssignmentsEnabled: false,
        isDemo: false,
        isSetup: true
      });
      await expect(setupService.getState()).resolves.toMatchObject({ isBulkRemoteAssignmentsEnabled: false });
    });

    it('should report it disabled without the gateway, even for a document saved while there was one', async () => {
      setupStateModel.findFirst.mockResolvedValue({
        isBulkRemoteAssignmentsEnabled: true,
        isDemo: false,
        isSetup: true
      });
      await expect(setupService.getState()).resolves.toMatchObject({ isBulkRemoteAssignmentsEnabled: false });
    });
  });

  describe('activeLanguages', () => {
    it('should persist the languages an admin selected', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ activeLanguages: ['en', 'es'] });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { activeLanguages: ['en', 'es'] },
        where: { id: 'setup-1' }
      });
    });

    it('should return the saved languages', async () => {
      setupStateModel.findFirst.mockResolvedValue({ activeLanguages: ['es'], isDemo: false, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ activeLanguages: ['es'] });
    });

    it('should fall back to the default for a document saved before the setting existed', async () => {
      setupStateModel.findFirst.mockResolvedValue({ activeLanguages: [], isDemo: false, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ activeLanguages: ['en', 'fr'] });
    });

    it('should fall back to the default for an instance with no setup document at all', async () => {
      setupStateModel.findFirst.mockResolvedValue(null);
      await expect(setupService.getState()).resolves.toMatchObject({ activeLanguages: ['en', 'fr'] });
    });
  });

  describe('createAdmin', () => {
    it('should create the user as an administrator belonging to no group', async () => {
      await setupService.createAdmin(admin);
      expect(usersService.create).toHaveBeenCalledWith({ ...admin, basePermissionLevel: 'ADMIN', groupIds: [] });
    });
  });

  describe('delete', () => {
    it('should drop the database when running under test', async () => {
      stubConfig({ NODE_ENV: 'test' });
      await setupService.delete();
      expect(prismaClient.$runCommandRaw).toHaveBeenCalledWith({ dropDatabase: 1 });
    });

    it('should refuse outside of test, so no deployment can be wiped through the api', async () => {
      stubConfig({ NODE_ENV: 'production' });
      await expect(setupService.delete()).rejects.toThrow(ForbiddenException);
      expect(prismaClient.$runCommandRaw).not.toHaveBeenCalled();
    });

    it('should fail loudly when mongodb does not acknowledge the drop', async () => {
      stubConfig({ NODE_ENV: 'test' });
      prismaClient.$runCommandRaw.mockResolvedValue({ ok: 0 });
      await expect(setupService.delete()).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail loudly when mongodb returns something other than a command result', async () => {
      stubConfig({ NODE_ENV: 'test' });
      prismaClient.$runCommandRaw.mockResolvedValue(null);
      await expect(setupService.delete()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('initApp', () => {
    const options = { admin, enableExperimentalFeatures: false, initDemo: false };

    it('should refuse to initialize an instance that is already set up', async () => {
      stubConfig({ NODE_ENV: 'production' });
      setupStateModel.findFirst.mockResolvedValue({ isSetup: true });

      await expect(setupService.initApp(options)).rejects.toThrow(ForbiddenException);
      expect(prismaClient.$runCommandRaw).not.toHaveBeenCalled();
    });

    it('should allow reinitializing an instance that is already set up during development', async () => {
      stubConfig({ NODE_ENV: 'development' });
      setupStateModel.findFirst.mockResolvedValue({ isSetup: true });

      await expect(setupService.initApp(options)).resolves.toEqual({ success: true });
    });

    it('should start from an empty database with only the administrator and the setup state', async () => {
      stubConfig({ NODE_ENV: 'test' });
      setupStateModel.findFirst.mockResolvedValue(null);

      await setupService.initApp({ ...options, enableExperimentalFeatures: true });

      expect(prismaClient.$runCommandRaw).toHaveBeenCalledWith({ dropDatabase: 1 });
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ basePermissionLevel: 'ADMIN' }));
      expect(demoService.init).not.toHaveBeenCalled();
      expect(setupStateModel.create).toHaveBeenCalledWith({
        data: { isDemo: false, isExperimentalFeaturesEnabled: true, isSetup: true }
      });
    });

    it('should seed demo data with the requested volume', async () => {
      stubConfig({ NODE_ENV: 'test' });
      setupStateModel.findFirst.mockResolvedValue(null);

      await setupService.initApp({ ...options, dummySubjectCount: 10, initDemo: true, recordsPerSubject: 3 });

      expect(demoService.init).toHaveBeenCalledWith({ dummySubjectCount: 10, recordsPerSubject: 3 });
      expect(setupStateModel.create.mock.lastCall?.[0]).toMatchObject({ data: { isDemo: true } });
    });

    it('should seed no dummy subjects or records when the demo volume is omitted', async () => {
      stubConfig({ NODE_ENV: 'test' });
      setupStateModel.findFirst.mockResolvedValue(null);

      await setupService.initApp({ ...options, initDemo: true });

      expect(demoService.init).toHaveBeenCalledWith({ dummySubjectCount: 0, recordsPerSubject: 0 });
    });

    it('should not import the default instrument repository under test, which must not reach GitHub', async () => {
      stubConfig({ NODE_ENV: 'test' });
      setupStateModel.findFirst.mockResolvedValue(null);

      await setupService.initApp(options);

      expect(instrumentReposService.create).not.toHaveBeenCalled();
    });

    it('should import the default instrument repository on a real installation', async () => {
      stubConfig({ NODE_ENV: 'production' });
      setupStateModel.findFirst.mockResolvedValue(null);

      await setupService.initApp(options);

      expect(instrumentReposService.create).toHaveBeenCalledWith({
        url: 'https://github.com/DouglasNeuroInformatics/ODC_Instruments'
      });
      expect(loggingService.log).toHaveBeenCalledWith(
        expect.stringContaining('Imported default instrument repository')
      );
    });

    it('should still complete setup when the default repository cannot be imported, logging why', async () => {
      stubConfig({ NODE_ENV: 'production' });
      setupStateModel.findFirst.mockResolvedValue(null);
      instrumentReposService.create.mockRejectedValue(new Error('network unreachable'));

      await expect(setupService.initApp(options)).resolves.toEqual({ success: true });
      expect(loggingService.error).toHaveBeenCalledWith(
        'Failed to import default instrument repository: Error: network unreachable'
      );
    });
  });

  describe('updateState (preconditions and branding)', () => {
    it('should refuse to update an instance that has not been set up', async () => {
      setupStateModel.findFirst.mockResolvedValue(null);
      await expect(setupService.updateState({ isExperimentalFeaturesEnabled: true })).rejects.toThrow(
        ServiceUnavailableException
      );
      expect(setupStateModel.update).not.toHaveBeenCalled();
    });

    it('should fill in empty resource links and section order, so a partial branding config reads back whole', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ branding: { instanceName: { en: 'Clinic' } } });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { branding: { set: { instanceName: { en: 'Clinic' }, resourceLinks: [], sectionsOrder: [] } } }
      });
    });

    it('should clear the branding when it is set to null', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ branding: null });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({ data: { branding: { set: null } } });
    });

    it('should leave the branding untouched when it is omitted', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: 'setup-1', isSetup: true });
      await setupService.updateState({ isExperimentalFeaturesEnabled: true });
      expect(setupStateModel.update.mock.lastCall?.[0].data).not.toHaveProperty('branding');
    });
  });

  describe('getState (branding)', () => {
    it('should return a stored branding config that is valid', async () => {
      setupStateModel.findFirst.mockResolvedValue({ branding: { instanceName: { en: 'Clinic' } }, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ branding: { instanceName: { en: 'Clinic' } } });
    });

    // The route is public and feeds the login page, so a corrupt document must not break it.
    it('should report no branding rather than fail when the stored config no longer validates', async () => {
      setupStateModel.findFirst.mockResolvedValue({ branding: { loginTheme: 'not-a-theme' }, isSetup: true });
      await expect(setupService.getState()).resolves.toMatchObject({ branding: null });
    });
  });
});
