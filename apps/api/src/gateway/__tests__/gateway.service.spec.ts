import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '@/instruments/instruments.service';
import { SetupService } from '@/setup/setup.service';

import { createGatewayHttpOptions } from '../gateway.module';
import { GatewayService } from '../gateway.service';

vi.mock('@douglasneuroinformatics/libcrypto', () => ({
  HybridCrypto: {
    serializePublicKey: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
  }
}));

describe('createGatewayHttpOptions', () => {
  // Every assertion GatewayService makes about a status depends on the response reaching it at all,
  // which only happens because axios is told to resolve rather than reject on a non-2xx.
  it('should resolve every status, so the gateway’s own answer reaches the service', () => {
    const configService = { get: vi.fn().mockReturnValue('development'), getOrThrow: vi.fn() };
    const { validateStatus } = createGatewayHttpOptions(configService as never);
    expect(validateStatus?.(401)).toBe(true);
    expect(validateStatus?.(500)).toBe(true);
  });
});

describe('GatewayService', () => {
  let gatewayService: GatewayService;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let setupService: MockedInstance<SetupService>;
  let axiosRef: { delete: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

  const assignment = { id: 'assignment-1', instrumentId: 'instrument-1' } as Assignment;
  const publicKey = {} as CryptoKey;

  beforeEach(async () => {
    axiosRef = { delete: vi.fn(), get: vi.fn(), post: vi.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        GatewayService,
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(SetupService),
        { provide: HttpService, useValue: { axiosRef } }
      ]
    }).compile();
    gatewayService = moduleRef.get(GatewayService);
    instrumentsService = moduleRef.get(InstrumentsService);
    setupService = moduleRef.get(SetupService);

    instrumentsService.findBundleById.mockResolvedValue({ bundle: '', id: 'instrument-1', kind: 'FORM' });
    setupService.getState.mockResolvedValue({ activeLanguages: ['en', 'fr'] });
  });

  describe('createRemoteAssignment', () => {
    it('should return the parsed body when the gateway creates the assignment', async () => {
      axiosRef.post.mockResolvedValue({ data: { success: true }, status: 201, statusText: 'Created' });
      await expect(gatewayService.createRemoteAssignment(assignment, publicKey)).resolves.toStrictEqual({
        success: true
      });
    });

    // A rejected API key is the gateway answering, not the request failing: without this the raw
    // AxiosError escapes as a bare 500 that names neither the gateway nor the status it returned.
    it('should throw a bad gateway exception naming the status when the gateway rejects the api key', async () => {
      axiosRef.post.mockResolvedValue({
        data: { message: 'Unauthorized' },
        status: 401,
        statusText: 'Unauthorized'
      });
      await expect(gatewayService.createRemoteAssignment(assignment, publicKey)).rejects.toThrow(BadGatewayException);
      await expect(gatewayService.createRemoteAssignment(assignment, publicKey)).rejects.toThrow(/401/);
    });

    it('should throw a service unavailable exception when the gateway cannot be reached', async () => {
      axiosRef.post.mockRejectedValue(new Error('connect ECONNREFUSED'));
      await expect(gatewayService.createRemoteAssignment(assignment, publicKey)).rejects.toThrow(
        ServiceUnavailableException
      );
    });
  });

  describe('deleteRemoteAssignment', () => {
    it('should throw a bad gateway exception when the gateway refuses the delete', async () => {
      axiosRef.delete.mockResolvedValue({ data: { message: 'Not Found' }, status: 404, statusText: 'Not Found' });
      await expect(gatewayService.deleteRemoteAssignment('assignment-1')).rejects.toThrow(BadGatewayException);
    });
  });

  describe('fetchRemoteAssignments', () => {
    it('should throw a bad gateway exception when the gateway refuses the request', async () => {
      axiosRef.get.mockResolvedValue({ data: { message: 'Unauthorized' }, status: 401, statusText: 'Unauthorized' });
      await expect(gatewayService.fetchRemoteAssignments()).rejects.toThrow(BadGatewayException);
    });
  });

  describe('healthcheck', () => {
    // The route exists to report an unhealthy gateway, so an unreachable one must be reportable
    // rather than throwing — otherwise "down" is indistinguishable from "broken".
    it('should report a failure result rather than throwing when the gateway cannot be reached', async () => {
      axiosRef.get.mockRejectedValue(new Error('connect ECONNREFUSED'));
      await expect(gatewayService.healthcheck()).resolves.toMatchObject({ ok: false, status: 503 });
    });

    it('should report a failure result carrying the status the gateway returned', async () => {
      axiosRef.get.mockResolvedValue({ data: {}, status: 502, statusText: 'Bad Gateway' });
      await expect(gatewayService.healthcheck()).resolves.toStrictEqual({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway'
      });
    });
  });
});
