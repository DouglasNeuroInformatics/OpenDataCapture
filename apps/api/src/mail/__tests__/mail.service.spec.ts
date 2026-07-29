import { getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { UpdateMailConfigData } from '@opendatacapture/schemas/mail';
import { createTransport } from 'nodemailer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { MailService } from '../mail.service';

vi.mock('nodemailer', () => ({ createTransport: vi.fn() }));

const validConfig: UpdateMailConfigData = {
  enabled: true,
  encryption: 'starttls',
  host: 'smtp.example.org',
  password: 'secret',
  port: 587,
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  username: 'user'
};

const newUserArgs = {
  email: 'u@x.org',
  firstName: 'Jane',
  group: 'G',
  lastName: 'Doe',
  url: 'https://x',
  username: 'jdoe'
};

describe('MailService', () => {
  let mailService: MailService;
  let setupStateModel: MockedInstance<Model<'SetupState'>>;
  let transporter: { sendMail: Mock; verify: Mock };

  beforeEach(async () => {
    // `createTransport` is a module-level mock, so its call history outlives the testing module.
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        MailService,
        MockFactory.createForModelToken(getModelToken('SetupState')),
        MockFactory.createForService(LoggingService)
      ]
    }).compile();
    setupStateModel = moduleRef.get(getModelToken('SetupState'));
    mailService = moduleRef.get(MailService);
    transporter = { sendMail: vi.fn().mockResolvedValue({}), verify: vi.fn().mockResolvedValue(true) };
    (createTransport as Mock).mockReturnValue(transporter);
  });

  describe('getSettings', () => {
    it('strips the password and exposes a has-flag', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const settings = await mailService.getSettings();
      expect(settings.config).toMatchObject({ hasPassword: true, host: 'smtp.example.org' });
      expect(settings.config).not.toHaveProperty('password');
    });

    it('returns null config and a default template when nothing is stored', async () => {
      setupStateModel.findFirst.mockResolvedValue(null);
      const settings = await mailService.getSettings();
      expect(settings.config).toBeNull();
      expect(settings.newUserEmailTemplate.subject).toBeTruthy();
    });
  });

  describe('isEnabled', () => {
    it('is true when a stored configuration is switched on', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      expect(await mailService.isEnabled()).toBe(true);
    });

    it('is false when disabled', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: { ...validConfig, enabled: false } });
      expect(await mailService.isEnabled()).toBe(false);
    });

    it('is false when nothing is stored', async () => {
      setupStateModel.findFirst.mockResolvedValue(null);
      expect(await mailService.isEnabled()).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('throws before setup is complete', async () => {
      setupStateModel.findFirst.mockResolvedValue({ isSetup: false });
      await expect(mailService.updateSettings({ config: { ...validConfig } })).rejects.toBeInstanceOf(
        ServiceUnavailableException
      );
    });

    it('keeps the stored password when the update omits it for the same server', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: '1', isSetup: true, mailConfig: validConfig });
      await mailService.updateSettings({ config: { ...validConfig, password: undefined } });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { mailConfig: { set: { password: 'secret' } } }
      });
    });

    // Inheriting across servers would let the stored secret be aimed at a host the admin chose;
    // blanking it instead would silently break a working configuration on an unrelated edit.
    it('refuses to save a different host without a password rather than inheriting or blanking it', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: '1', isSetup: true, mailConfig: validConfig });
      await expect(
        mailService.updateSettings({
          config: { ...validConfig, host: 'smtp.attacker.example', password: undefined }
        })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(setupStateModel.update).not.toHaveBeenCalled();
    });

    it('keeps the stored password when only a non-server field changes', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: '1', isSetup: true, mailConfig: validConfig });
      await mailService.updateSettings({
        config: { ...validConfig, password: undefined, senderName: 'New Name' }
      });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { mailConfig: { set: { password: 'secret', senderName: 'New Name' } } }
      });
    });
  });

  describe('test', () => {
    it('returns success when the connection verifies', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      expect(await mailService.test({})).toEqual({ success: true });
      expect(transporter.verify).toHaveBeenCalled();
    });

    it('returns a friendly error when verification fails', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      transporter.verify.mockRejectedValueOnce({ code: 'EAUTH' });
      const result = await mailService.test({});
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/authentication failed/i);
    });

    it('delivers a message when a recipient is supplied', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.test({ recipient: 'p@x.org' });
      expect(result).toEqual({ success: true });
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    // Otherwise the stored credential could be read back off an SMTP AUTH to a chosen host.
    it('refuses to connect to a different host without being given that host’s password', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.test({
        config: { ...validConfig, host: 'smtp.attacker.example', password: undefined }
      });
      expect(result.success).toBe(false);
      expect(createTransport).not.toHaveBeenCalled();
    });

    it('reports when mail has not been configured', async () => {
      setupStateModel.findFirst.mockResolvedValue(null);
      expect(await mailService.test({})).toMatchObject({ success: false });
    });
  });

  describe('sendNewUserEmail', () => {
    it('is DISABLED (with a copy-pasteable message) when mail is off', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: { ...validConfig, enabled: false } });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('DISABLED');
      expect(result.message).toContain('Jane');
    });

    it('is NO_RECIPIENT when enabled but the user has no email', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendNewUserEmail({ ...newUserArgs, email: null });
      expect(result.status).toBe('NO_RECIPIENT');
    });

    it('is SENT when delivery succeeds', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('SENT');
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    it('never includes a password in the rendered message', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.message).not.toMatch(/password:/i);
      expect(result.message).not.toMatch(/\{\{password\}\}/);
    });

    it('renders the French content when language is fr', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendNewUserEmail({ ...newUserArgs, language: 'fr' });
      expect(result.status).toBe('SENT');
      expect(result.message).toContain('Bonjour');
    });

    it('is FAILED with a friendly error when delivery throws', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      transporter.sendMail.mockRejectedValueOnce({ code: 'ECONNREFUSED' });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('FAILED');
      expect(result.error).toMatch(/refused/i);
    });
  });

  describe('sendAssignmentEmail', () => {
    it('substitutes url/expiresAt and sends when enabled', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendAssignmentEmail({
        body: 'Link: {{url}} (expires {{expiresAt}})',
        expiresAt: '2026-01-01',
        recipient: 'p@x.org',
        subject: 'Assignment',
        url: 'https://assign'
      });
      expect(result.status).toBe('SENT');
      expect(result.message).toBe('Link: https://assign (expires 2026-01-01)');
    });

    it('appends the link when the template body omits {{url}}', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendAssignmentEmail({
        body: 'Please complete your assignment.',
        expiresAt: '2026-01-01',
        recipient: 'p@x.org',
        subject: 'Assignment',
        url: 'https://assign/xyz'
      });
      expect(result.status).toBe('SENT');
      expect(result.message).toContain('https://assign/xyz');
    });
  });
});
