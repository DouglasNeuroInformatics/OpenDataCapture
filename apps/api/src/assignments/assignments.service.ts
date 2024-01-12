import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Assignment, CreateAssignmentRelayData } from '@open-data-capture/common/assignment';
import { $Assignment, $CreateAssignmentResponseBody } from '@open-data-capture/common/assignment';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService implements Pick<EntityService<Assignment>, 'create'> {
  private readonly gatewayBaseUrl: string;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService
  ) {
    this.gatewayBaseUrl = configService.get('GATEWAY_BASE_URL');
  }

  async create({ expiresAt, instrumentId, subjectId }: CreateAssignmentDto) {
    const instrument = await this.instrumentsService.findById(instrumentId);
    const response = await this.httpService.axiosRef.post(`${this.gatewayBaseUrl}/api/assignments`, {
      expiresAt,
      instrumentBundle: instrument.bundle,
      instrumentId: instrument.id,
      subjectId
    } satisfies CreateAssignmentRelayData);
    return $CreateAssignmentResponseBody.parseAsync(response.data);
  }

  async find({ subjectId }: { subjectId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const response = await this.httpService.axiosRef.get(`${this.gatewayBaseUrl}/api/assignments`, {
      params: {
        subjectId
      }
    });
    const assignments = await $Assignment.array().parseAsync(response.data);
    if (!ability) {
      return assignments;
    }
    return assignments.filter((assignment) => ability.can('read', assignment));
  }
}
