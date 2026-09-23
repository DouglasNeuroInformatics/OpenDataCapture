import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { ConfigService, LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { RemoteAssignment } from '@opendatacapture/schemas/assignment';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { AssignmentsService } from '@/assignments/assignments.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SetupService } from '@/setup/setup.service';

import { GatewayService } from '../gateway.service';
import { GatewaySynchronizer } from '../gateway.synchronizer';

vi.mock('@douglasneuroinformatics/libcrypto', () => ({
  HybridCrypto: {
    decrypt: vi.fn(),
    deserializePrivateKey: vi.fn()
  }
}));

const CURRENT_EDITION_ID = 'instrument-edition-1';

describe('GatewaySynchronizer', () => {
  let gatewaySynchronizer: GatewaySynchronizer;
  let assignmentsService: MockedInstance<AssignmentsService>;
  let gatewayService: MockedInstance<GatewayService>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let instrumentRecordsService: MockedInstance<InstrumentRecordsService>;
  let sessionsService: MockedInstance<SessionsService>;
  let setupService: MockedInstance<SetupService>;

  const createRemoteAssignment = (id: string): RemoteAssignment =>
    ({
      completedAt: new Date(),
      encryptedData: 'encrypted-data',
      groupId: null,
      id,
      status: 'COMPLETE',
      symmetricKey: 'symmetric-key'
    }) as RemoteAssignment;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GatewaySynchronizer,
        MockFactory.createForService(AssignmentsService),
        MockFactory.createForService(ConfigService),
        MockFactory.createForService(GatewayService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(InstrumentRecordsService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(SetupService)
      ]
    }).compile();
    gatewaySynchronizer = moduleRef.get(GatewaySynchronizer);
    assignmentsService = moduleRef.get(AssignmentsService);
    gatewayService = moduleRef.get(GatewayService);
    instrumentsService = moduleRef.get(InstrumentsService);
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    sessionsService = moduleRef.get(SessionsService);
    setupService = moduleRef.get(SetupService);

    setupService.getState.mockResolvedValue({ isSetup: true });
    assignmentsService.findById.mockImplementation((id: string) =>
      Promise.resolve({
        encryptionKeyPair: { privateKey: 'private-key', publicKey: 'public-key' },
        groupId: null,
        id,
        instrumentId: CURRENT_EDITION_ID,
        subjectId: 'subject-1'
      })
    );
    instrumentsService.findById.mockResolvedValue({
      id: CURRENT_EDITION_ID,
      internal: { edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' },
      kind: 'FORM'
    });
    sessionsService.create.mockResolvedValue({ id: 'session-1' });
    vi.mocked(HybridCrypto).decrypt.mockResolvedValue(JSON.stringify({ score: 1 }));
  });

  describe('sync', () => {
    it('should create a record against the assignment instrument when it passes validation', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      instrumentRecordsService.create.mockResolvedValue({ id: 'record-1' });

      await gatewaySynchronizer.sync();

      expect(instrumentRecordsService.create).toHaveBeenCalledOnce();
      expect(instrumentRecordsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ instrumentId: CURRENT_EDITION_ID })
      );
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledWith('assignment-1');
    });

    it('should not delete the remote assignment when the data fails validation', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      instrumentRecordsService.create.mockRejectedValue(new UnprocessableEntityException('Failed validation'));

      await gatewaySynchronizer.sync();

      expect(instrumentRecordsService.create).toHaveBeenCalledOnce();
      expect(gatewayService.deleteRemoteAssignment).not.toHaveBeenCalled();
      expect(assignmentsService.updateStatusById).not.toHaveBeenCalled();
    });

    it('should delete the orphaned session when an assignment fails', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      instrumentRecordsService.create.mockRejectedValue(new Error('Unexpected'));

      await gatewaySynchronizer.sync();

      expect(sessionsService.deleteById).toHaveBeenCalledWith('session-1');
    });

    it('should continue synchronizing subsequent assignments after one fails', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        createRemoteAssignment('assignment-1'),
        createRemoteAssignment('assignment-2')
      ]);
      instrumentRecordsService.create
        .mockRejectedValueOnce(new Error('Unexpected'))
        .mockResolvedValueOnce({ id: 'record-2' });

      await gatewaySynchronizer.sync();

      expect(instrumentRecordsService.create).toHaveBeenCalledTimes(2);
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledExactlyOnceWith('assignment-2');
      expect(assignmentsService.updateStatusById).toHaveBeenCalledExactlyOnceWith('assignment-2', 'COMPLETE');
    });
  });

  describe('synchronization loop', () => {
    const REFRESH_INTERVAL = 100;
    const SYNC_DURATION = 500;

    let concurrentSyncs: number;
    let loggingService: MockedInstance<LoggingService>;
    let maxConcurrentSyncs: number;
    let sync: MockInstance<GatewaySynchronizer['sync']>;

    beforeEach(async () => {
      vi.useFakeTimers();
      const moduleRef = await Test.createTestingModule({
        providers: [
          GatewaySynchronizer,
          MockFactory.createForService(AssignmentsService),
          { provide: ConfigService, useValue: { get: () => REFRESH_INTERVAL } },
          MockFactory.createForService(GatewayService),
          MockFactory.createForService(InstrumentsService),
          MockFactory.createForService(InstrumentRecordsService),
          MockFactory.createForService(LoggingService),
          MockFactory.createForService(SessionsService),
          MockFactory.createForService(SetupService)
        ]
      }).compile();
      gatewaySynchronizer = moduleRef.get(GatewaySynchronizer);
      loggingService = moduleRef.get(LoggingService);

      concurrentSyncs = 0;
      maxConcurrentSyncs = 0;
      sync = vi.spyOn(gatewaySynchronizer, 'sync').mockImplementation(async () => {
        concurrentSyncs++;
        maxConcurrentSyncs = Math.max(maxConcurrentSyncs, concurrentSyncs);
        await new Promise((resolve) => setTimeout(resolve, SYNC_DURATION));
        concurrentSyncs--;
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should never run two synchronizations at once, so a slow pass cannot accumulate overlapping passes', async () => {
      gatewaySynchronizer.onApplicationBootstrap();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL * 50);

      expect(maxConcurrentSyncs).toBe(1);
      expect(sync.mock.calls.length).toBeGreaterThan(1);
    });

    it('should wait the refresh interval after a pass finishes before starting the next one', async () => {
      gatewaySynchronizer.onApplicationBootstrap();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL + SYNC_DURATION);
      expect(sync).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      expect(sync).toHaveBeenCalledTimes(2);
    });

    it('should keep synchronizing after a pass throws, so one failure does not end the loop', async () => {
      sync.mockRejectedValueOnce(new Error('Unexpected'));
      gatewaySynchronizer.onApplicationBootstrap();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL * 20);

      expect(sync.mock.calls.length).toBeGreaterThan(1);
      expect(maxConcurrentSyncs).toBe(1);
    });

    it('should log the failure rather than leave the rejection unhandled', async () => {
      const cause = new Error('Unexpected');
      sync.mockRejectedValueOnce(cause);
      gatewaySynchronizer.onApplicationBootstrap();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      await gatewaySynchronizer.onApplicationShutdown();

      expect(loggingService.error).toHaveBeenCalledWith(expect.objectContaining({ cause }));
    });

    it('should stop synchronizing once the application shuts down', async () => {
      gatewaySynchronizer.onApplicationBootstrap();
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL + SYNC_DURATION);
      expect(sync).toHaveBeenCalledOnce();

      await gatewaySynchronizer.onApplicationShutdown();
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL * 20);

      expect(sync).toHaveBeenCalledOnce();
    });

    it('should await the in-flight synchronization on shutdown, so no pass outlives the application', async () => {
      gatewaySynchronizer.onApplicationBootstrap();
      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL);
      expect(concurrentSyncs).toBe(1);

      const shutdown = gatewaySynchronizer.onApplicationShutdown();
      await vi.advanceTimersByTimeAsync(SYNC_DURATION);
      await shutdown;

      expect(concurrentSyncs).toBe(0);
      expect(sync).toHaveBeenCalledOnce();
    });
  });
});
