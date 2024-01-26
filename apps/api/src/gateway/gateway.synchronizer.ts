import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { $Assignment, type Assignment } from '@open-data-capture/common/assignment';
import { isAxiosError } from 'axios';

import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly config: {
    baseUrl: string;
    refreshInterval: number;
  };
  private readonly logger = new Logger(GatewaySynchronizer.name);

  constructor(
    configurationService: ConfigurationService,
    private readonly httpService: HttpService,
    private readonly instrumentRecordsService: InstrumentRecordsService
  ) {
    this.config = {
      baseUrl: configurationService.get('GATEWAY_BASE_URL'),
      refreshInterval: configurationService.get('GATEWAY_REFRESH_INTERVAL')
    };
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), this.config.refreshInterval);
  }

  private async sync() {
    let assignments: Assignment[];
    try {
      const response = await this.httpService.axiosRef.get(`${this.config.baseUrl}/api/assignments`);
      assignments = await $Assignment.array().parseAsync(response.data);
    } catch (err) {
      if (isAxiosError(err)) {
        this.logger.warn(err.code);
      } else {
        this.logger.error(err);
      }
      return;
    }

    for (const assignment of assignments) {
      if (assignment.status !== 'COMPLETE' || !assignment.record?.data) {
        continue;
      }
      const isExisting = await this.instrumentRecordsService.exists({ assignmentId: assignment.id });
      if (isExisting) {
        continue;
      }
      const record = await this.instrumentRecordsService.create({
        assignmentId: assignment.id,
        data: assignment.record.data,
        date: assignment.record.completedAt!,
        instrumentId: assignment.instrumentId,
        subjectId: assignment.subjectId
      });
      this.logger.log(`Created record with ID: ${record.id}`);
    }
  }
}
