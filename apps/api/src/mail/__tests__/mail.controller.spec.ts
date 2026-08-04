import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { MailController } from '../mail.controller';
import { MailService } from '../mail.service';

const settings = { config: null, newUserEmailTemplate: { body: {}, subject: {} } };

describe('MailController', () => {
  let mailController: MailController;
  let mailService: MockedInstance<MailService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MailController],
      providers: [MockFactory.createForService(MailService)]
    }).compile();
    mailController = moduleRef.get(MailController);
    mailService = moduleRef.get(MailService);
  });

  it('should be defined', () => {
    expect(mailController).toBeDefined();
  });

  describe('getSettings', () => {
    it('returns the settings from the service', async () => {
      mailService.getSettings.mockResolvedValueOnce(settings);
      await expect(mailController.getSettings()).resolves.toBe(settings);
    });
  });

  describe('test', () => {
    it('forwards the supplied configuration so unsaved settings can be tested', async () => {
      mailService.test.mockResolvedValueOnce({ success: true });
      const data = { recipient: 'p@x.org' };
      await mailController.test(data);
      expect(mailService.test).toHaveBeenCalledWith(data);
    });

    it('returns the failure code unchanged for the client to localize', async () => {
      mailService.test.mockResolvedValueOnce({ error: 'AUTHENTICATION_FAILED', success: false });
      await expect(mailController.test({})).resolves.toMatchObject({ error: 'AUTHENTICATION_FAILED' });
    });
  });

  describe('updateSettings', () => {
    it('forwards the payload to the service', async () => {
      mailService.updateSettings.mockResolvedValueOnce(settings);
      const data = { newUserEmailTemplate: { body: { en: 'Hi' }, subject: { en: 'Hello' } } };
      await mailController.updateSettings(data);
      expect(mailService.updateSettings).toHaveBeenCalledWith(data);
    });
  });
});
