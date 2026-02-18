import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { ConfigService, LoggingService } from '@douglasneuroinformatics/libnest';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { OnApplicationBootstrap } from '@nestjs/common';
import type { RemoteAssignment } from '@opendatacapture/schemas/assignment';
import { $Json } from '@opendatacapture/schemas/core';

import { AssignmentsService } from '@/assignments/assignments.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SetupService } from '@/setup/setup.service';

import { GatewayService } from './gateway.service';

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly refreshInterval: number;

  constructor(
    configService: ConfigService,
    private readonly assignmentsService: AssignmentsService,
    private readonly gatewayService: GatewayService,
    private readonly instrumentsService: InstrumentsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly loggingService: LoggingService,
    private readonly sessionsService: SessionsService,
    private readonly setupService: SetupService
  ) {
    this.refreshInterval = configService.get('GATEWAY_REFRESH_INTERVAL');
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), this.refreshInterval);
  }

  private async handleAssignmentComplete(remoteAssignment: RemoteAssignment) {
    if (!remoteAssignment.encryptedData) {
      throw new Error(`Data is undefined for completed remote assignment with id '${remoteAssignment.id}'`);
    }
    const assignment = await this.assignmentsService.findById(remoteAssignment.id);

    if (!remoteAssignment.completedAt) {
      this.loggingService.error(`Field 'completedAt' is null for assignment '${assignment.id}'`);
      return;
    } else if (!remoteAssignment.symmetricKey) {
      this.loggingService.error(`Field 'symmetricKey' is null for assignment '${assignment.id}'`);
      return;
    }

    const instrument = await this.instrumentsService.findById(assignment.instrumentId);

    const session = await this.sessionsService.create({
      date: remoteAssignment.completedAt,
      groupId: remoteAssignment.groupId ?? null,
      subjectData: {
        id: assignment.subjectId
      },
      type: 'REMOTE'
    });

    const cipherTexts: string[] = [];
    const symmetricKeys: string[] = [];

    if (instrument.kind === 'SERIES') {
      if (!(remoteAssignment.encryptedData.startsWith('$') && remoteAssignment.symmetricKey.startsWith('$'))) {
        this.loggingService.error({ remoteAssignment });
        throw new InternalServerErrorException('Malformed remote assignment for series instrument');
      }
      cipherTexts.push(...remoteAssignment.encryptedData.slice(1).split('$'));
      symmetricKeys.push(...remoteAssignment.symmetricKey.slice(1).split('$'));
      if (cipherTexts.length !== instrument.content.length) {
        throw new InternalServerErrorException(
          `Expected length of cypher texts '${cipherTexts.length}' to match length of series instrument content '${symmetricKeys.length}'`
        );
      } else if (symmetricKeys.length !== instrument.content.length) {
        throw new InternalServerErrorException(
          `Expected length of symmetric keys '${cipherTexts.length}' to match length of series instrument content '${symmetricKeys.length}'`
        );
      }
    } else if (remoteAssignment.encryptedData.includes('$') || remoteAssignment.symmetricKey.includes('$')) {
      this.loggingService.error({ remoteAssignment });
      throw new InternalServerErrorException('Malformed remote assignment for scalar instrument');
    } else {
      cipherTexts.push(remoteAssignment.encryptedData);
      symmetricKeys.push(remoteAssignment.symmetricKey);
    }

    const createdRecordIds: string[] = [];
    try {
      for (let i = 0; i < cipherTexts.length; i++) {
        const cipherText = cipherTexts[i]!;
        const symmetricKey = symmetricKeys[i]!;
        const data = await $Json.parseAsync(
          JSON.parse(
            await HybridCrypto.decrypt({
              cipherText: Buffer.from(cipherText, 'base64'),
              privateKey: await HybridCrypto.deserializePrivateKey(assignment.encryptionKeyPair.privateKey),
              symmetricKey: Buffer.from(symmetricKey, 'base64')
            })
          )
        );
        const record = await this.instrumentRecordsService.create({
          assignmentId: assignment.id,
          data,
          date: remoteAssignment.completedAt,
          groupId: assignment.groupId ?? undefined,
          instrumentId:
            instrument.kind === 'SERIES'
              ? this.instrumentsService.generateScalarInstrumentId({ internal: instrument.content[i]! })
              : instrument.id,
          sessionId: session.id,
          subjectId: assignment.subjectId
        });
        this.loggingService.log(`Created record with ID: ${record.id}`);
        createdRecordIds.push(record.id);
      }
      await this.gatewayService.deleteRemoteAssignment(assignment.id);
    } catch (err) {
      this.loggingService.error({
        data: {
          assignment,
          cipherTexts,
          remoteAssignment,
          symmetricKeys
        },
        message: 'Failed to Process Data'
      });
      this.loggingService.error(err);
      for (const id of createdRecordIds) {
        await this.instrumentRecordsService.deleteById(id);
        this.loggingService.log(`Deleted Record with ID: ${id}`);
      }
      throw err;
    }
  }

  private async sync() {
    const setupState = await this.setupService.getState();
    if (!setupState.isSetup) {
      this.loggingService.log('Will not attempt synchronizing with gateway: app is not setup');
      return;
    }

    this.loggingService.log('Synchronizing with gateway...');
    let remoteAssignments: RemoteAssignment[];
    try {
      remoteAssignments = await this.gatewayService.fetchRemoteAssignments();
    } catch (err) {
      this.loggingService.error({
        cause: err,
        error: 'Failed to Fetch Remote Assignments'
      });
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
      await this.assignmentsService.updateStatusById(assignment.id, assignment.status);
    }
    this.loggingService.log('Done synchronizing with gateway');
  }
}
