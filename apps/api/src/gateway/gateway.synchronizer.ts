import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import type { RemoteAssignment } from '@open-data-capture/common/assignment';

import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';

import { GatewayService } from './gateway.service';

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly logger = new Logger(GatewaySynchronizer.name);
  private readonly refreshInterval: number;

  constructor(
    configurationService: ConfigurationService,
    private readonly gatewayService: GatewayService,
    private readonly instrumentRecordsService: InstrumentRecordsService
  ) {
    this.refreshInterval = configurationService.get('GATEWAY_REFRESH_INTERVAL');
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), this.refreshInterval);
  }

  private async sync() {
    this.logger.verbose('Synchronizing with gateway...');
    let remoteAssignments: RemoteAssignment[];
    try {
      remoteAssignments = await this.gatewayService.fetchRemoteAssignments();
    } catch (err) {
      this.logger.error(err);
      return;
    }

    this.logger.log(remoteAssignments);
    return Promise.resolve(undefined);

    // let assignments: Assignment[];
    // try {
    //   assignments = await this.assignmentsService.find();
    // } catch (err) {
    //   if (isAxiosError(err)) {
    //     this.logger.warn(err.code);
    //   } else {
    //     this.logger.error(err);
    //   }
    //   return;
    // }

    // for (const assignment of assignments) {
    //   if (assignment.status !== 'COMPLETE' || !assignment.data) {
    //     continue;
    //   }

    //   const isExisting = await this.instrumentRecordsService.exists({ assignmentId: assignment.id });
    //   if (isExisting) {
    //     continue;
    //   }
    //   const record = await this.instrumentRecordsService.create({
    //     assignmentId: assignment.id,
    //     data: assignment.data,
    //     date: assignment.completedAt!,
    //     instrumentId: assignment.instrumentId,
    //     subjectId: assignment.subjectId
    //   });
    //   this.logger.log(`Created record with ID: ${record.id}`);

    //   await this.assignmentsService.deleteById(assignment.id);
    // }
  }
}
