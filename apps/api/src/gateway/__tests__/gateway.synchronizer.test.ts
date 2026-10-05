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
  let loggingService: MockedInstance<LoggingService>;
  let sessionsService: MockedInstance<SessionsService>;
  let setupService: MockedInstance<SetupService>;

  const createAssignment = (id: string, groupId: null | string = null) => ({
    encryptionKeyPair: { privateKey: 'private-key', publicKey: 'public-key' },
    groupId,
    id,
    instrumentId: CURRENT_EDITION_ID,
    subjectId: 'subject-1'
  });

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
    loggingService = moduleRef.get(LoggingService);
    sessionsService = moduleRef.get(SessionsService);
    setupService = moduleRef.get(SetupService);

    setupService.getState.mockResolvedValue({ isSetup: true });
    assignmentsService.findById.mockImplementation((id: string) => Promise.resolve(createAssignment(id)));
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

  describe('pass preconditions', () => {
    it('should not contact the gateway before the app is set up', async () => {
      setupService.getState.mockResolvedValue({ isSetup: false });
      await gatewaySynchronizer.sync();
      expect(gatewayService.updateRemoteSetupState).not.toHaveBeenCalled();
      expect(gatewayService.fetchRemoteAssignments).not.toHaveBeenCalled();
    });

    it('should push the active languages to the gateway on every pass', async () => {
      setupService.getState.mockResolvedValue({ activeLanguages: ['en', 'fr'], isSetup: true });
      gatewayService.fetchRemoteAssignments.mockResolvedValue([]);
      await gatewaySynchronizer.sync();
      expect(gatewayService.updateRemoteSetupState).toHaveBeenCalledWith({ activeLanguages: ['en', 'fr'] });
    });

    it('should still synchronize assignments when the setup state cannot be pushed, since the two are independent', async () => {
      gatewayService.updateRemoteSetupState.mockRejectedValue(new Error('Unreachable'));
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), status: 'EXPIRED' }
      ]);
      await gatewaySynchronizer.sync();
      expect(loggingService.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to Update Remote Setup State' })
      );
      expect(assignmentsService.updateStatusById).toHaveBeenCalledWith('assignment-1', 'EXPIRED');
    });

    it('should log and end the pass when the remote assignments cannot be fetched', async () => {
      const cause = new Error('Unreachable');
      gatewayService.fetchRemoteAssignments.mockRejectedValue(cause);
      await expect(gatewaySynchronizer.sync()).resolves.toBeUndefined();
      expect(loggingService.error).toHaveBeenCalledWith({ cause, error: 'Failed to Fetch Remote Assignments' });
    });
  });

  describe('assignment status', () => {
    it('should leave an outstanding assignment untouched, since the subject has yet to complete it', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), status: 'OUTSTANDING' }
      ]);
      await gatewaySynchronizer.sync();
      expect(gatewayService.deleteRemoteAssignment).not.toHaveBeenCalled();
      expect(assignmentsService.updateStatusById).not.toHaveBeenCalled();
    });

    it('should delete a canceled assignment from the gateway and record its status locally', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), status: 'CANCELED' }
      ]);
      await gatewaySynchronizer.sync();
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledWith('assignment-1');
      expect(assignmentsService.updateStatusById).toHaveBeenCalledWith('assignment-1', 'CANCELED');
      expect(sessionsService.create).not.toHaveBeenCalled();
    });
  });

  describe('incomplete submission', () => {
    it('should not mark a completed assignment without data as complete, so it is retried', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), encryptedData: null }
      ]);
      await gatewaySynchronizer.sync();
      expect(assignmentsService.updateStatusById).not.toHaveBeenCalled();
      expect(loggingService.error).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to synchronize remote assignment with ID: assignment-1' })
      );
    });

    it('should create no session for a submission without a completion date', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), completedAt: null }
      ]);
      await gatewaySynchronizer.sync();
      expect(sessionsService.create).not.toHaveBeenCalled();
      expect(loggingService.error).toHaveBeenCalledWith("Field 'completedAt' is null for assignment 'assignment-1'");
    });

    it('should create no session for a submission without a symmetric key', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), symmetricKey: null }
      ]);
      await gatewaySynchronizer.sync();
      expect(sessionsService.create).not.toHaveBeenCalled();
      expect(loggingService.error).toHaveBeenCalledWith("Field 'symmetricKey' is null for assignment 'assignment-1'");
    });
  });

  describe('decryption failure', () => {
    beforeEach(() => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      vi.mocked(HybridCrypto).decrypt.mockRejectedValue(new Error('Bad key'));
    });

    it('should log which instrument failed to decrypt', async () => {
      await gatewaySynchronizer.sync();
      expect(loggingService.error).toHaveBeenCalledWith({
        instrumentId: CURRENT_EDITION_ID,
        message: 'Failed to decrypt data'
      });
    });

    it('should delete the session and keep the remote assignment, so the submission is retried', async () => {
      await gatewaySynchronizer.sync();
      expect(sessionsService.deleteById).toHaveBeenCalledWith('session-1');
      expect(gatewayService.deleteRemoteAssignment).not.toHaveBeenCalled();
    });
  });

  describe('series submission', () => {
    const SERIES_ID = 'series-1';

    beforeEach(() => {
      instrumentsService.findById.mockResolvedValue({
        content: [
          { edition: 1, name: 'ITEM_A' },
          { edition: 2, name: 'ITEM_B' }
        ],
        id: SERIES_ID,
        kind: 'SERIES'
      });
      instrumentsService.generateScalarInstrumentId.mockImplementation(
        ({ internal }: { internal: { edition: number; name: string } }) => `${internal.name}-${internal.edition}`
      );
      instrumentRecordsService.create
        .mockResolvedValueOnce({ id: 'record-1' })
        .mockResolvedValueOnce({ id: 'record-2' });
    });

    const submit = (encryptedData: string, symmetricKey: string) => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), encryptedData, symmetricKey }
      ]);
      return gatewaySynchronizer.sync();
    };

    it('should create one record per submitted item against that item and attribute it to the series', async () => {
      await submit('$first$second', '$key1$key2');
      expect(instrumentRecordsService.create.mock.calls.map(([record]) => record)).toMatchObject([
        { instrumentId: 'ITEM_A-1', seriesInstrumentId: SERIES_ID },
        { instrumentId: 'ITEM_B-2', seriesInstrumentId: SERIES_ID }
      ]);
    });

    it('should accept a series that ended early, with fewer items than the series has', async () => {
      await submit('$first', '$key1');
      expect(instrumentRecordsService.create).toHaveBeenCalledOnce();
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledWith('assignment-1');
    });

    it('should create no session for a submission not shaped as a series', async () => {
      await submit('ciphertext', 'key');
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should create no session when the number of ciphertexts and keys differ', async () => {
      await submit('$first$second', '$key1');
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should delete the records already created when a later item fails, so no partial series remains', async () => {
      instrumentRecordsService.create.mockReset();
      instrumentRecordsService.create
        .mockResolvedValueOnce({ id: 'record-1' })
        .mockRejectedValueOnce(new Error('Invalid'));
      await submit('$first$second', '$key1$key2');
      expect(instrumentRecordsService.deleteById).toHaveBeenCalledExactlyOnceWith('record-1');
      expect(sessionsService.deleteById).toHaveBeenCalledWith('session-1');
    });
  });

  describe('malformed submission', () => {
    it('should create no session for a submission shaped for another kind of instrument, since nothing would delete it', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), encryptedData: '$ciphertext', symmetricKey: '$key' }
      ]);
      await gatewaySynchronizer.sync();
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should create no session for a series submission with more items than the series has', async () => {
      instrumentsService.findById.mockResolvedValue({
        content: [{ edition: 1, name: 'ITEM_A' }],
        id: CURRENT_EDITION_ID,
        kind: 'SERIES'
      });
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), encryptedData: '$first$second', symmetricKey: '$key1$key2' }
      ]);
      await gatewaySynchronizer.sync();
      expect(sessionsService.create).not.toHaveBeenCalled();
    });
  });

  describe('group', () => {
    beforeEach(() => {
      assignmentsService.findById.mockResolvedValue(createAssignment('assignment-1', 'group-stored'));
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), groupId: 'group-other' }
      ]);
      instrumentRecordsService.create.mockResolvedValue({ id: 'record-1' });
    });

    it("should file the session under the stored assignment's group, since creating it enrols the subject there", async () => {
      await gatewaySynchronizer.sync();
      expect(sessionsService.create).toHaveBeenCalledWith(expect.objectContaining({ groupId: 'group-stored' }));
    });

    it('should log an error when the gateway reports another group, since only an altered row can', async () => {
      await gatewaySynchronizer.sync();
      expect(loggingService.error).toHaveBeenCalledWith(expect.stringContaining('group-other'));
    });
  });

  describe('logging', () => {
    const loggedErrors = () => JSON.stringify(loggingService.error.mock.calls);

    it('should not log a submission that fails validation, since a process log has none of the access control a record has', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      vi.mocked(HybridCrypto).decrypt.mockResolvedValue(JSON.stringify({ answer: 'PATIENT-ANSWER' }));
      instrumentRecordsService.create.mockRejectedValue(new UnprocessableEntityException('Failed validation'));

      await gatewaySynchronizer.sync();

      expect(loggingService.error).toHaveBeenCalled();
      expect(loggedErrors()).not.toContain('PATIENT-ANSWER');
    });

    it('should not log decrypted text that is not valid JSON', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      vi.mocked(HybridCrypto).decrypt.mockResolvedValue('{"answer":"PATIENT-ANSWER"');

      await gatewaySynchronizer.sync();

      expect(loggingService.error).toHaveBeenCalled();
      expect(loggedErrors()).not.toContain('PATIENT-ANSWER');
    });

    it('should not log the stored ciphertext and key of a malformed assignment, only its id', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([
        { ...createRemoteAssignment('assignment-1'), encryptedData: '$ciphertext', symmetricKey: '$encapsulated-key' }
      ]);

      await gatewaySynchronizer.sync();

      expect(loggedErrors()).toContain('assignment-1');
      expect(loggedErrors()).not.toContain('encapsulated-key');
    });
  });

  describe('synchronization loop', () => {
    const FIVE_MINUTES = 300_000;
    const REFRESH_INTERVAL = 100;
    const SYNC_DURATION = 500;

    let concurrentSyncs: number;
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

    it('should abandon a pass that has run for five minutes, so a stalled synchronization cannot halt the loop', async () => {
      sync.mockImplementationOnce(() => Promise.withResolvers<void>().promise);
      gatewaySynchronizer.onApplicationBootstrap();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL + FIVE_MINUTES);

      expect(loggingService.error).toHaveBeenCalledWith(expect.objectContaining({ cause: expect.any(Error) }));

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL + SYNC_DURATION);
      expect(sync).toHaveBeenCalledTimes(2);
    });

    it('should not abandon a pass that finishes within five minutes', async () => {
      sync.mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, FIVE_MINUTES - 1));
      });
      gatewaySynchronizer.onApplicationBootstrap();

      await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL + FIVE_MINUTES);

      expect(loggingService.error).not.toHaveBeenCalled();
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
