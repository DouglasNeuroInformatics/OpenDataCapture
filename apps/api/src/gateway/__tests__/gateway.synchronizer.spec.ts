import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { ConfigService, LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { RemoteAssignment } from '@opendatacapture/schemas/assignment';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
const LATEST_EDITION_ID = 'instrument-edition-2';

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
    instrumentsService.findLatestScalarEditionId.mockResolvedValue(CURRENT_EDITION_ID);
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
      expect(instrumentsService.findLatestScalarEditionId).not.toHaveBeenCalled();
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledWith('assignment-1');
    });

    it('should retry against the latest edition when the data fails validation', async () => {
      gatewayService.fetchRemoteAssignments.mockResolvedValue([createRemoteAssignment('assignment-1')]);
      instrumentsService.findLatestScalarEditionId.mockResolvedValue(LATEST_EDITION_ID);
      instrumentRecordsService.create
        .mockRejectedValueOnce(new UnprocessableEntityException('Data received for record does not pass validation'))
        .mockResolvedValueOnce({ id: 'record-1' });

      await gatewaySynchronizer.sync();

      expect(instrumentRecordsService.create).toHaveBeenCalledTimes(2);
      expect(instrumentRecordsService.create).toHaveBeenLastCalledWith(
        expect.objectContaining({ instrumentId: LATEST_EDITION_ID })
      );
      expect(instrumentRecordsService.deleteById).not.toHaveBeenCalled();
      expect(gatewayService.deleteRemoteAssignment).toHaveBeenCalledWith('assignment-1');
    });

    it('should not retry when the data fails validation and there is no newer edition', async () => {
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
});
