import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { Injectable, InternalServerErrorException, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import type { RemoteAssignment } from '@opendatacapture/schemas/assignment';
import { $Json } from '@opendatacapture/schemas/core';

import { AssignmentsService } from '@/assignments/assignments.service';
import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SetupService } from '@/setup/setup.service';

import { GatewayService } from './gateway.service';

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly logger = new Logger(GatewaySynchronizer.name);
  private readonly refreshInterval: number;

  constructor(
    configurationService: ConfigurationService,
    private readonly assignmentsService: AssignmentsService,
    private readonly gatewayService: GatewayService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly sessionsService: SessionsService,
    private readonly setupService: SetupService
  ) {
    this.refreshInterval = configurationService.get('GATEWAY_REFRESH_INTERVAL');
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), this.refreshInterval);
  }

  private async handleAssignmentComplete(remoteAssignment: RemoteAssignment) {
    if (!remoteAssignment.encryptedData) {
      throw new Error(`Data is undefined for completed remote assignment with id '${remoteAssignment.id}'`);
    }
    const assignment = await this.assignmentsService.findById(remoteAssignment.id);

    const completedAt = remoteAssignment.completedAt;
    const symmetricKey = remoteAssignment.symmetricKey;
    if (!completedAt) {
      this.logger.error(`Field 'completedAt' is null for assignment '${assignment.id}'`);
      return;
    } else if (!symmetricKey) {
      this.logger.error(`Field 'symmetricKey' is null for assignment '${assignment.id}'`);
      return;
    }

    const data = await $Json.parseAsync(
      JSON.parse(
        await HybridCrypto.decrypt({
          cipherText: remoteAssignment.encryptedData,
          privateKey: await HybridCrypto.deserializePrivateKey(assignment.encryptionKeyPair.privateKey),
          symmetricKey
        })
      )
    );

    const session = await this.sessionsService.create({
      date: completedAt,
      groupId: remoteAssignment.groupId ?? null,
      subjectData: {
        id: assignment.subjectId
      },
      type: 'REMOTE'
    });

    const record = await this.instrumentRecordsService.create({
      assignmentId: assignment.id,
      data,
      date: completedAt,
      groupId: assignment.groupId ?? undefined,
      instrumentId: assignment.instrumentId,
      sessionId: session.id,
      subjectId: assignment.subjectId
    });

    this.logger.log(`Created record with ID: ${record.id}`);
    try {
      await this.gatewayService.deleteRemoteAssignment(assignment.id);
    } catch (err) {
      await this.instrumentRecordsService.deleteById(record.id);
      this.logger.log(`Deleted Record with ID: ${record.id}`);
      throw new InternalServerErrorException('Failed to Delete Remote Assignments', {
        cause: err
      });
    }
  }

  private async sync() {
    const setupState = await this.setupService.getState();
    if (!setupState.isSetup) {
      this.logger.log('Will not attempt synchronizing with gateway: app is not setup');
      return;
    }

    this.logger.log('Synchronizing with gateway...');
    let remoteAssignments: RemoteAssignment[];
    try {
      remoteAssignments = await this.gatewayService.fetchRemoteAssignments();
    } catch (err) {
      this.logger.error('Failed to Fetch Remote Assignments', err);
      return;
    }

    for (const assignment of remoteAssignments) {
      if (assignment.status === 'OUTSTANDING') {
        continue;
      } else if (assignment.status === 'COMPLETE') {
        await this.handleAssignmentComplete(assignment);
      } else {
        await this.gatewayService.deleteRemoteAssignment(assignment.id);
      }
      await this.assignmentsService.updateById(assignment.id, {
        status: assignment.status
      });
    }
    this.logger.log('Done synchronizing with gateway');
  }
}
