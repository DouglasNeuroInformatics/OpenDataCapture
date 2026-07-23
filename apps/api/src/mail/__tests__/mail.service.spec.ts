import { getModelToken, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { UpdateMailConfigData } from '@opendatacapture/schemas/mail';
import { createTransport } from 'nodemailer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { MailService } from '../mail.service';

vi.mock('nodemailer', () => ({ createTransport: vi.fn() }));

const validConfig: UpdateMailConfigData = {
  apiKey: '',
  awsAccessKeyId: '',
  awsRegion: '',
  domain: '',
  enabled: true,
  encryption: 'starttls',
  host: 'smtp.example.org',
  password: 'secret',
  port: 587,
  provider: 'mailgun',
  region: 'us',
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  transport: 'smtp',
  username: 'user'
};

const mailgunConfig: UpdateMailConfigData = {
  apiKey: 'key-123',
  awsAccessKeyId: '',
  awsRegion: '',
  domain: 'mg.example.org',
  enabled: true,
  encryption: 'starttls',
  host: '',
  password: '',
  port: 587,
  provider: 'mailgun',
  region: 'us',
  senderAddress: 'noreply@example.org',
  senderName: 'ODC',
  transport: 'http',
  username: ''
};

const sesConfig: UpdateMailConfigData = {
  ...mailgunConfig,
  apiKey: 'aws-secret',
  awsAccessKeyId: 'AKIAEXAMPLE',
  awsRegion: 'us-east-1',
  domain: '',
  provider: 'ses'
};

const postmarkConfig: UpdateMailConfigData = {
  ...mailgunConfig,
  apiKey: 'postmark-token',
  domain: '',
  provider: 'postmark'
};

const newUserArgs = {
  email: 'u@x.org',
  firstName: 'Jane',
  group: 'G',
  lastName: 'Doe',
  password: 'pw',
  url: 'https://x',
  username: 'jdoe'
};

/** A minimal `fetch` Response stand-in exposing only what the service reads. */
const httpResponse = (status: number) => ({ ok: status >= 200 && status < 300, status });

describe('MailService', () => {
  let mailService: MailService;
  let setupStateModel: MockedInstance<Model<'SetupState'>>;
  let transporter: { sendMail: Mock; verify: Mock };
  let fetchMock: Mock;

  beforeEach(async () => {
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
    fetchMock = vi.fn().mockResolvedValue(httpResponse(200));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getSettings', () => {
    it('strips secrets and exposes has-flags', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: { ...validConfig, apiKey: 'k' } });
      const settings = await mailService.getSettings();
      expect(settings.config).toMatchObject({ hasApiKey: true, hasPassword: true, host: 'smtp.example.org' });
      expect(settings.config).not.toHaveProperty('password');
      expect(settings.config).not.toHaveProperty('apiKey');
    });

    it('exposes the transport and provider fields', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: mailgunConfig });
      const settings = await mailService.getSettings();
      expect(settings.config).toMatchObject({
        domain: 'mg.example.org',
        provider: 'mailgun',
        region: 'us',
        transport: 'http'
      });
    });

    it('returns null config and a default template when nothing is stored', async () => {
      setupStateModel.findFirst.mockResolvedValue(null);
      const settings = await mailService.getSettings();
      expect(settings.config).toBeNull();
      expect(settings.newUserEmailTemplate.subject).toBeTruthy();
    });
  });

  describe('isEnabled', () => {
    it('is true when enabled and a host is set (smtp)', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      expect(await mailService.isEnabled()).toBe(true);
    });

    it('is false when disabled', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: { ...validConfig, enabled: false } });
      expect(await mailService.isEnabled()).toBe(false);
    });

    it('is true for http when the api key and mailgun domain are set', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: mailgunConfig });
      expect(await mailService.isEnabled()).toBe(true);
    });

    it('is false for a mailgun config missing its sending domain', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: { ...mailgunConfig, domain: '' } });
      expect(await mailService.isEnabled()).toBe(false);
    });

    it('is true for an SES config with a key, access key ID, and region', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: sesConfig });
      expect(await mailService.isEnabled()).toBe(true);
    });

    it('is false for an SES config missing its region', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: { ...sesConfig, awsRegion: '' } });
      expect(await mailService.isEnabled()).toBe(false);
    });

    it('is true for a Postmark config with only a token', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: postmarkConfig });
      expect(await mailService.isEnabled()).toBe(true);
    });
  });

  describe('updateSettings', () => {
    it('throws before setup is complete', async () => {
      setupStateModel.findFirst.mockResolvedValue({ isSetup: false });
      await expect(mailService.updateSettings({ config: { ...validConfig } })).rejects.toBeInstanceOf(
        ServiceUnavailableException
      );
    });

    it('keeps the stored password when the update omits it', async () => {
      setupStateModel.findFirst.mockResolvedValue({ id: '1', isSetup: true, mailConfig: validConfig });
      await mailService.updateSettings({ config: { ...validConfig, password: undefined } });
      expect(setupStateModel.update.mock.lastCall?.[0]).toMatchObject({
        data: { mailConfig: { set: { password: 'secret' } } }
      });
    });
  });

  describe('test', () => {
    it('returns success when the smtp connection verifies', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      expect(await mailService.test({})).toEqual({ success: true });
      expect(transporter.verify).toHaveBeenCalled();
    });

    it('returns a friendly error when smtp verification fails', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      transporter.verify.mockRejectedValueOnce({ code: 'EAUTH' });
      const result = await mailService.test({});
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/authentication failed/i);
    });

    it('verifies an http config against the provider and can send a test message', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: mailgunConfig });
      const result = await mailService.test({ recipient: 'p@x.org' });
      expect(result).toEqual({ success: true });
      // First call verifies the domain, second delivers the message.
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0]?.[0]).toContain('api.mailgun.net/v3/domains/mg.example.org');
      expect(fetchMock.mock.calls[1]?.[0]).toContain('/v3/mg.example.org/messages');
      expect(transporter.verify).not.toHaveBeenCalled();
    });

    it('maps an http auth failure to a friendly error', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: mailgunConfig });
      fetchMock.mockResolvedValueOnce(httpResponse(401));
      const result = await mailService.test({});
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/authentication failed/i);
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

    it('is SENT over smtp when delivery succeeds', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('SENT');
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    it('renders the French content when language is fr', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      const result = await mailService.sendNewUserEmail({ ...newUserArgs, language: 'fr' });
      expect(result.status).toBe('SENT');
      expect(result.message).toContain('Bonjour');
    });

    it('is SENT over the http provider when delivery succeeds', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: mailgunConfig });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('SENT');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]?.[0]).toContain('/v3/mg.example.org/messages');
      expect(transporter.sendMail).not.toHaveBeenCalled();
    });

    it('is FAILED with a friendly error when smtp delivery throws', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: validConfig });
      transporter.sendMail.mockRejectedValueOnce({ code: 'ECONNREFUSED' });
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('FAILED');
      expect(result.error).toMatch(/refused/i);
    });

    it('is FAILED with a friendly error when the http provider rejects the request', async () => {
      setupStateModel.findFirst.mockResolvedValue({ mailConfig: mailgunConfig });
      fetchMock.mockResolvedValueOnce(httpResponse(401));
      const result = await mailService.sendNewUserEmail(newUserArgs);
      expect(result.status).toBe('FAILED');
      expect(result.error).toMatch(/authentication failed/i);
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
