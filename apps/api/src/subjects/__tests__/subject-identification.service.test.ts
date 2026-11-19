import type { Model } from '@douglasneuroinformatics/libnest';
import { getModelToken } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { CustomFieldsDefinitionData } from '@opendatacapture/schemas/subject-identification';
import { beforeEach, describe, expect, it } from 'vitest';

import { SubjectIdentificationService } from '../subject-identification.service';
import { SubjectsService } from '../subjects.service';

const field = (label: string) => ({ label: { en: label }, pattern: '[0-9]+' });

const definitionData: CustomFieldsDefinitionData = {
  fields: [field('Animal ID'), field('Cage')],
  label: { en: 'Animal information' }
};

const storedDefinition = { ...definitionData, iterations: 1000, salt: 'ab'.repeat(32) };

const BUILT_IN_METHODS: ['CUSTOM_ID', 'PERSONAL_INFO'] = ['CUSTOM_ID', 'PERSONAL_INFO'];

const setupState = (customFields: null | typeof storedDefinition = null) => ({
  id: 'setup-1',
  isSetup: true,
  subjectIdentificationSettings: customFields ? { customFields } : null
});

describe('SubjectIdentificationService', () => {
  let service: SubjectIdentificationService;
  let setupStateModel: MockedInstance<Model<'SetupState'>>;
  let subjectsService: MockedInstance<SubjectsService>;

  const savedSettings = () => setupStateModel.update.mock.lastCall?.[0].data.subjectIdentificationSettings.set;

  const savedCustomFields = () => savedSettings().customFields;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubjectIdentificationService,
        MockFactory.createForModelToken(getModelToken('SetupState')),
        MockFactory.createForService(SubjectsService)
      ]
    }).compile();
    service = moduleRef.get(SubjectIdentificationService);
    setupStateModel = moduleRef.get(getModelToken('SetupState'));
    subjectsService = moduleRef.get(SubjectsService);
    subjectsService.hasCustomFieldsSubjects.mockResolvedValue(false);
  });

  describe('getSettings', () => {
    it('should read an instance that never saved settings as having no definition', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce({ subjectIdentificationSettings: null });
      await expect(service.getSettings()).resolves.toStrictEqual({
        customFields: null,
        isCustomFieldsLocked: false,
        offeredMethods: ['CUSTOM_ID', 'PERSONAL_INFO']
      });
    });

    it('should read an instance with no setup state as having no definition', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(null);
      await expect(service.getSettings()).resolves.toMatchObject({ customFields: null });
    });

    it('should offer the built-in methods until an administrator chooses which to offer', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce({ subjectIdentificationSettings: { offeredMethods: [] } });
      await expect(service.getSettings()).resolves.toMatchObject({ offeredMethods: ['CUSTOM_ID', 'PERSONAL_INFO'] });
    });

    it('should return the methods an administrator chose to offer', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce({
        subjectIdentificationSettings: { offeredMethods: ['CUSTOM_FIELDS'] }
      });
      await expect(service.getSettings()).resolves.toMatchObject({ offeredMethods: ['CUSTOM_FIELDS'] });
    });

    it('should return the stored definition, salt included, since the browser derives ids from it', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
      await expect(service.getSettings()).resolves.toMatchObject({ customFields: storedDefinition });
    });

    it('should report the definition locked once any subject has an id derived from it', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
      subjectsService.hasCustomFieldsSubjects.mockResolvedValueOnce(true);
      await expect(service.getSettings()).resolves.toMatchObject({ isCustomFieldsLocked: true });
    });

    it('should report nothing locked while no definition is stored, whatever ids subjects carry', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState());
      subjectsService.hasCustomFieldsSubjects.mockResolvedValue(true);
      await expect(service.getSettings()).resolves.toMatchObject({ isCustomFieldsLocked: false });
    });
  });

  describe('updateSettings', () => {
    it('should refuse to save before the instance is set up', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce({ isSetup: false });
      await expect(
        service.updateSettings({ customFields: definitionData, offeredMethods: BUILT_IN_METHODS })
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('should give a first definition a random 32-byte salt and 600,000 iterations', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState());
      await service.updateSettings({ customFields: definitionData, offeredMethods: BUILT_IN_METHODS });
      expect(savedCustomFields()).toStrictEqual({
        ...definitionData,
        iterations: 600_000,
        salt: expect.stringMatching(/^[0-9a-f]{64}$/)
      });
    });

    it('should give two instances different salts, so their ids are not comparable', async () => {
      setupStateModel.findFirst.mockResolvedValue(setupState());
      await service.updateSettings({ customFields: definitionData, offeredMethods: BUILT_IN_METHODS });
      const first = savedCustomFields().salt;
      await service.updateSettings({ customFields: definitionData, offeredMethods: BUILT_IN_METHODS });
      expect(savedCustomFields().salt).not.toBe(first);
    });

    it('should store the offered methods in one fixed order, whatever order they were sent in', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
      await service.updateSettings({ customFields: definitionData, offeredMethods: ['CUSTOM_FIELDS', 'CUSTOM_ID'] });
      expect(savedSettings().offeredMethods).toStrictEqual(['CUSTOM_ID', 'CUSTOM_FIELDS']);
    });

    it('should keep the stored salt and iteration count when the definition is saved again', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
      await service.updateSettings({
        customFields: { ...definitionData, label: { en: 'Mouse information' } },
        offeredMethods: BUILT_IN_METHODS
      });
      expect(savedCustomFields()).toMatchObject({
        iterations: 1000,
        label: { en: 'Mouse information' },
        salt: 'ab'.repeat(32)
      });
    });

    it('should remove the definition while no subject has been identified with it', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
      await service.updateSettings({ customFields: null, offeredMethods: BUILT_IN_METHODS });
      expect(savedCustomFields()).toBeNull();
    });

    it('should let the fields be added to or removed while no subject has been identified with them', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
      await service.updateSettings({
        customFields: { ...definitionData, fields: [field('Animal ID')] },
        offeredMethods: BUILT_IN_METHODS
      });
      expect(savedCustomFields().fields).toHaveLength(1);
    });

    describe('once a subject has been identified with the fields', () => {
      beforeEach(() => {
        subjectsService.hasCustomFieldsSubjects.mockResolvedValue(true);
      });

      it('should refuse to remove the definition', async () => {
        setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
        await expect(
          service.updateSettings({ customFields: null, offeredMethods: BUILT_IN_METHODS })
        ).rejects.toBeInstanceOf(ConflictException);
        expect(setupStateModel.update).not.toHaveBeenCalled();
      });

      it('should refuse to change the number of fields', async () => {
        setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
        await expect(
          service.updateSettings({
            customFields: { ...definitionData, fields: [field('Animal ID')] },
            offeredMethods: BUILT_IN_METHODS
          })
        ).rejects.toBeInstanceOf(ConflictException);
        expect(setupStateModel.update).not.toHaveBeenCalled();
      });

      it('should still let labels, help text, messages and patterns be corrected, since none of them is hashed', async () => {
        setupStateModel.findFirst.mockResolvedValueOnce(setupState(storedDefinition));
        const corrected = {
          fields: [
            { ...field('Animal identifier'), description: { en: 'On the ear tag' }, pattern: '[0-9]{4}' },
            { ...field('Cage number'), patternErrorMessage: { en: 'Digits only' } }
          ],
          label: { en: 'Mouse' }
        };
        await service.updateSettings({ customFields: corrected, offeredMethods: BUILT_IN_METHODS });
        expect(savedCustomFields()).toStrictEqual({ ...corrected, iterations: 1000, salt: 'ab'.repeat(32) });
      });

      it('should save a first definition despite a cf_ subject no stored definition derived, since that id has none to keep', async () => {
        setupStateModel.findFirst.mockResolvedValueOnce(setupState());
        await service.updateSettings({ customFields: definitionData, offeredMethods: BUILT_IN_METHODS });
        expect(savedCustomFields()).toMatchObject(definitionData);
      });
    });

    it('should return the settings as they now stand', async () => {
      setupStateModel.findFirst.mockResolvedValueOnce(setupState()).mockResolvedValueOnce(setupState(storedDefinition));
      await expect(
        service.updateSettings({ customFields: definitionData, offeredMethods: BUILT_IN_METHODS })
      ).resolves.toMatchObject({
        customFields: storedDefinition
      });
    });
  });
});
