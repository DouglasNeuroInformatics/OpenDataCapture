import { Injectable, InternalServerErrorException, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import type { RemoteAssignment } from '@open-data-capture/common/assignment';

import { AssignmentsService } from '@/assignments/assignments.service';
import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';

import { GatewayService } from './gateway.service';

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly logger = new Logger(GatewaySynchronizer.name);
  private readonly refreshInterval: number;

  constructor(
    configurationService: ConfigurationService,
    private readonly assignmentsService: AssignmentsService,
    private readonly gatewayService: GatewayService,
    private readonly instrumentRecordsService: InstrumentRecordsService
  ) {
    this.refreshInterval = configurationService.get('GATEWAY_REFRESH_INTERVAL');
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), this.refreshInterval);
  }

  private async handleAssignmentComplete(assignment: RemoteAssignment) {
    if (!assignment.data) {
      throw new Error(`Data is undefined for completed assignment with id '${assignment.id}'`);
    }
    const record = await this.instrumentRecordsService.create({
      assignmentId: assignment.id,
      data: assignment.data,
      date: assignment.completedAt!,
      instrumentId: assignment.instrumentId,
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
        this.handleAssignmentComplete(assignment);
      } else {
        this.gatewayService.deleteRemoteAssignment(assignment.id);
      }
      await this.assignmentsService.updateById(assignment.id, {
        status: assignment.status
      });
    }
    this.logger.log('Done synchronizing with gateway');
  }
}
