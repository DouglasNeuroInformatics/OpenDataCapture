import type { webcrypto } from 'node:crypto';

import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Assignment } from '@opendatacapture/schemas/assignment';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentsService } from '@/instruments/instruments.service';

import { GatewayService } from '../gateway.service';

const createAssignment = (id: string, instrumentId: string): Assignment => ({
  completedAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: new Date('2027-01-01T00:00:00Z'),
  groupId: 'group-1',
  id,
  instrumentId,
  status: 'OUTSTANDING',
  subjectId: 'subject-1',
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  url: `https://gateway.example.org/assignments/${id}`
});

const response = (status: number, data: unknown = {}) => ({ data, status, statusText: `Status ${status}` });

describe('GatewayService', () => {
  let gatewayService: GatewayService;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let loggingService: MockedInstance<LoggingService>;
  let publicKey: webcrypto.CryptoKey;
  let serializedPublicKey: number[];

  const axiosRef = { delete: vi.fn(), get: vi.fn(), post: vi.fn(), put: vi.fn() };

  beforeAll(async () => {
    ({ publicKey } = await HybridCrypto.generateKeyPair());
    serializedPublicKey = Array.from(await HybridCrypto.serializePublicKey(publicKey));
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        GatewayService,
        { provide: HttpService, useValue: { axiosRef } },
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(LoggingService)
      ]
    }).compile();
    gatewayService = moduleRef.get(GatewayService);
    instrumentsService = moduleRef.get(InstrumentsService);
    loggingService = moduleRef.get(LoggingService);
    instrumentsService.findBundleById.mockImplementation((id: string) => Promise.resolve({ bundle: `bundle-${id}` }));
  });

  describe('createRemoteAssignment', () => {
    it('should send the assignment with its instrument bundle and serialized public key', async () => {
      axiosRef.post.mockResolvedValueOnce(response(201, { success: true }));
      await gatewayService.createRemoteAssignment(createAssignment('assignment-1', 'instrument-1'), publicKey);
      expect(axiosRef.post).toHaveBeenCalledWith(
        '/api/assignments',
        expect.objectContaining({
          id: 'assignment-1',
          instrumentContainer: { bundle: 'bundle-instrument-1' },
          publicKey: serializedPublicKey
        })
      );
    });

    it('should return the parsed response body of the gateway', async () => {
      axiosRef.post.mockResolvedValueOnce(response(201, { extra: 'ignored', success: true }));
      await expect(
        gatewayService.createRemoteAssignment(createAssignment('assignment-1', 'instrument-1'), publicKey)
      ).resolves.toEqual({ success: true });
    });

    it('should throw a bad gateway error when the gateway does not report the assignment as created', async () => {
      axiosRef.post.mockResolvedValueOnce(response(200, { success: true }));
      await expect(
        gatewayService.createRemoteAssignment(createAssignment('assignment-1', 'instrument-1'), publicKey)
      ).rejects.toBeInstanceOf(BadGatewayException);
    });
  });

  describe('createRemoteAssignments', () => {
    const entries = () => [
      { assignment: createAssignment('assignment-1', 'instrument-1'), publicKey },
      { assignment: createAssignment('assignment-2', 'instrument-1'), publicKey },
      { assignment: createAssignment('assignment-3', 'instrument-2'), publicKey }
    ];

    it('should fetch each distinct instrument bundle once, so a shared bundle is not re-read per subject', async () => {
      axiosRef.post.mockResolvedValueOnce(response(201, { success: true }));
      await gatewayService.createRemoteAssignments(entries());
      expect(instrumentsService.findBundleById.mock.calls).toEqual([['instrument-1'], ['instrument-2']]);
    });

    it('should send every assignment and each distinct bundle in a single request', async () => {
      axiosRef.post.mockResolvedValueOnce(response(201, { success: true }));
      await gatewayService.createRemoteAssignments(entries());
      expect(axiosRef.post).toHaveBeenCalledExactlyOnceWith('/api/assignments/bulk', {
        assignments: entries().map(({ assignment }) => ({ ...assignment, publicKey: serializedPublicKey })),
        instruments: [
          { instrumentContainer: { bundle: 'bundle-instrument-1' }, instrumentId: 'instrument-1' },
          { instrumentContainer: { bundle: 'bundle-instrument-2' }, instrumentId: 'instrument-2' }
        ]
      });
    });

    it('should return the parsed response body of the gateway', async () => {
      axiosRef.post.mockResolvedValueOnce(response(201, { success: true }));
      await expect(gatewayService.createRemoteAssignments(entries())).resolves.toEqual({ success: true });
    });

    it('should throw a bad gateway error when the gateway does not report the batch as created', async () => {
      axiosRef.post.mockResolvedValueOnce(response(500));
      await expect(gatewayService.createRemoteAssignments(entries())).rejects.toBeInstanceOf(BadGatewayException);
    });
  });

  describe('deleteRemoteAssignment', () => {
    it('should delete the assignment with the provided id from the gateway', async () => {
      axiosRef.delete.mockResolvedValueOnce(response(200, { success: true }));
      await expect(gatewayService.deleteRemoteAssignment('assignment-1')).resolves.toEqual({ success: true });
      expect(axiosRef.delete).toHaveBeenCalledWith('/api/assignments/assignment-1');
    });

    it('should throw a bad gateway error when the gateway does not confirm the deletion', async () => {
      axiosRef.delete.mockResolvedValueOnce(response(404));
      await expect(gatewayService.deleteRemoteAssignment('assignment-1')).rejects.toBeInstanceOf(BadGatewayException);
    });
  });

  describe('fetchRemoteAssignments', () => {
    const remoteAssignment = {
      completedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      encryptedData: null,
      expiresAt: '2027-01-01T00:00:00.000Z',
      groupId: 'group-1',
      id: 'assignment-1',
      status: 'OUTSTANDING',
      subjectId: 'subject-1',
      symmetricKey: null,
      url: 'https://gateway.example.org/assignments/assignment-1'
    };

    it('should request every remote assignment from the gateway', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, []));
      await gatewayService.fetchRemoteAssignments();
      expect(axiosRef.get).toHaveBeenCalledWith('/api/assignments');
    });

    it('should return the remote assignments with their dates parsed', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, [remoteAssignment]));
      await expect(gatewayService.fetchRemoteAssignments()).resolves.toEqual([
        expect.objectContaining({ createdAt: new Date('2026-01-01T00:00:00.000Z'), id: 'assignment-1' })
      ]);
    });

    it('should return no assignments when the gateway sends a malformed payload, so one bad row cannot crash a sync', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, [{ ...remoteAssignment, status: 'UNKNOWN' }]));
      await expect(gatewayService.fetchRemoteAssignments()).resolves.toEqual([]);
    });

    it('should log a malformed payload rather than discard it silently', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, { unexpected: true }));
      await gatewayService.fetchRemoteAssignments();
      expect(loggingService.error).toHaveBeenCalledWith(expect.objectContaining({ data: { unexpected: true } }));
    });

    it('should throw a bad gateway error when the gateway responds with an unexpected status', async () => {
      axiosRef.get.mockResolvedValueOnce(response(503));
      await expect(gatewayService.fetchRemoteAssignments()).rejects.toBeInstanceOf(BadGatewayException);
    });
  });

  describe('healthcheck', () => {
    const healthyResult = {
      ok: true,
      release: { buildTime: 0, type: 'production', version: '1.0.0' },
      status: 200,
      uptime: 42
    };

    it('should return the result reported by a healthy gateway', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, healthyResult));
      await expect(gatewayService.healthcheck()).resolves.toEqual(healthyResult);
      expect(axiosRef.get).toHaveBeenCalledWith('/api/healthcheck');
    });

    it('should report the status of a gateway that responds with an error instead of throwing', async () => {
      axiosRef.get.mockResolvedValueOnce(response(503));
      await expect(gatewayService.healthcheck()).resolves.toEqual({
        ok: false,
        status: 503,
        statusText: 'Status 503'
      });
    });

    it('should report a malformed healthcheck payload as an internal server error', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, { ok: true }));
      await expect(gatewayService.healthcheck()).resolves.toEqual({
        ok: false,
        status: 500,
        statusText: 'Healthcheck data received from gateway do not match expected structure'
      });
    });

    it('should log a malformed healthcheck payload', async () => {
      axiosRef.get.mockResolvedValueOnce(response(200, { ok: true }));
      await gatewayService.healthcheck();
      expect(loggingService.error).toHaveBeenCalledWith(expect.objectContaining({ data: { ok: true } }));
    });
  });

  describe('updateRemoteSetupState', () => {
    it('should replace the setup state held by the gateway', async () => {
      axiosRef.put.mockResolvedValueOnce(response(204));
      await gatewayService.updateRemoteSetupState({ activeLanguages: ['en', 'fr'] });
      expect(axiosRef.put).toHaveBeenCalledWith('/api/setup-state', { activeLanguages: ['en', 'fr'] });
    });

    it('should throw when the gateway does not acknowledge the update', async () => {
      axiosRef.put.mockResolvedValueOnce(response(400));
      await expect(gatewayService.updateRemoteSetupState({ activeLanguages: ['en'] })).rejects.toBeInstanceOf(
        InternalServerErrorException
      );
    });
  });
});
