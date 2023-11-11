import { HttpService } from '@nestjs/axios';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { assignmentStatusSchema } from '@open-data-capture/common/assignment';
import { formDataTypeSchema } from '@open-data-capture/common/instrument';
import { z } from 'zod';

// Temporary schema for the data returned by the proof of concept
const itemSchema = z.object({
  assignedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  id: z.coerce.string(),
  instrumentId: z.string(),
  record: z.object({
    assignmentId: z.string(),
    completedAt: z.coerce.date(),
    data: formDataTypeSchema,
    id: z.coerce.string()
  }),
  status: assignmentStatusSchema,
  subjectIdentifier: z.string()
});

@Injectable()
export class GatewaySynchronizer implements OnApplicationBootstrap {
  private readonly gatewayBaseUrl: string;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService
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
    result.data;
  }
}
