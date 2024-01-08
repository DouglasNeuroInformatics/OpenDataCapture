import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $AssignmentStatus } from '@open-data-capture/common/assignment';
import { isAxiosError } from 'axios';
import { z } from 'zod';

import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';

// Temporary schema for the data returned by the proof of concept
const $RemoteAssignment = z.object({
  assignedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  id: z.coerce.string(),
  instrumentId: z.string(),
  record: z
    .object({
      assignmentId: z.string(),
      completedAt: z.coerce.date(),
      data: z.any(),
      id: z.coerce.string()
    })
    .nullish(),
  status: $AssignmentStatus,
  subjectIdentifier: z.string()
});

type RemoteAssignment = z.infer<typeof $RemoteAssignment>;

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly config: {
    baseUrl: string;
    refreshInterval: number;
  };
  private readonly logger = new Logger(GatewaySynchronizer.name);

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly instrumentRecordsService: InstrumentRecordsService
  ) {
    this.config = {
      baseUrl: configService.getOrThrow('GATEWAY_BASE_URL'),
      refreshInterval: parseInt(configService.getOrThrow('GATEWAY_REFRESH_INTERVAL'))
    };
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), this.config.refreshInterval);
  }

  private async sync() {
    let remoteAssignments: RemoteAssignment[];
    try {
      const response = await this.httpService.axiosRef.get(`${this.config.baseUrl}/api/assignments`);
      remoteAssignments = await $RemoteAssignment.array().parseAsync(response.data);
    } catch (err) {
      if (isAxiosError(err)) {
        this.logger.warn(err.code);
      } else {
        this.logger.error(err);
      }
      return;
    }

    for (const assignment of remoteAssignments) {
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
        date: assignment.record.completedAt,
        instrumentId: assignment.instrumentId,
        subjectIdentifier: assignment.subjectIdentifier
      });
      this.logger.log(`Created record with ID: ${record.id}`);
    }
  }
}
