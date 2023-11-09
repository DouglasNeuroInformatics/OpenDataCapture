// import { accessibleBy } from '@casl/mongoose';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type Assignment,
  type CreateAssignmentBundleData,
  assignmentBundleSchema
} from '@open-data-capture/common/assignment';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';
// import { SubjectsService } from '@/subjects/subjects.service';

import type { EntityService } from '@douglasneuroinformatics/nestjs/core';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService implements Pick<EntityService<Assignment>, 'create'> {
  private readonly gatewayBaseUrl: string;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService // private readonly subjectsService: SubjectsService
  ) {
    this.gatewayBaseUrl = configService.getOrThrow('GATEWAY_URL');
  }

  async create({ expiresAt, instrumentId, subjectIdentifier }: CreateAssignmentDto) {
    const instrument = await this.instrumentsService.findById(instrumentId);
    return this.httpService.post(`${this.gatewayBaseUrl}/assignments`, {
      expiresAt,
      instrumentBundle: instrument.bundle,
      instrumentId: instrument.id as string,
      subjectIdentifier
    } satisfies CreateAssignmentBundleData);
  }

  async find({ subjectIdentifier }: { subjectIdentifier?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const response = await this.httpService.axiosRef.get(`${this.gatewayBaseUrl}/assignments`, {
      params: {
        subjectIdentifier
      }
    });
    const assignmentBundles = await assignmentBundleSchema.array().parseAsync(response.data);
    return assignmentBundles.map(async (bundle) => {
      const instrument = await this.instrumentsService.findById(bundle.instrumentId);
      const assignment = { ...bundle, instrument };
      return !ability || ability.can('read', assignment);
    });
  }
}
