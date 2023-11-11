import { HttpService } from '@nestjs/axios';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { assignmentStatusSchema } from '@open-data-capture/common/assignment';
import { formDataTypeSchema } from '@open-data-capture/common/instrument';
import { z } from 'zod';

import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';

// Temporary schema for the data returned by the proof of concept
const itemSchema = z.object({
  assignedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  id: z.coerce.string(),
  instrumentId: z.string(),
  record: z
    .object({
      assignmentId: z.string(),
      completedAt: z.coerce.date(),
      data: formDataTypeSchema,
      id: z.coerce.string()
    })
    .nullish(),
  status: assignmentStatusSchema,
  subjectIdentifier: z.string()
});

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly gatewayBaseUrl: string;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly instrumentRecordsService: InstrumentRecordsService
  ) {
    this.gatewayBaseUrl = configService.getOrThrow('GATEWAY_BASE_URL');
  }

  onApplicationBootstrap() {
    setInterval(() => void this.sync(), 1000);
  }

  private async sync() {
    const response = await this.httpService.axiosRef.get(`${this.gatewayBaseUrl}/api/assignments`);
    const result = await itemSchema.array().safeParseAsync(response.data);
    if (!result.success) {
      console.error(result.error.issues);
      return;
    }
    for (const assignment of result.data) {
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
      console.log(`Created record with ID: ${record.id}`);
    }
  }
}
