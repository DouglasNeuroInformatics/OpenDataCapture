// import { accessibleBy } from '@casl/mongoose';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Assignment, AssignmentBundle, CreateAssignmentBundleData } from '@open-data-capture/common/assignment';
import { assignmentBundleSchema } from '@open-data-capture/common/assignment';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';
// import { SubjectsService } from '@/subjects/subjects.service';

import { subject } from '@casl/ability';
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
    this.gatewayBaseUrl = configService.getOrThrow('GATEWAY_BASE_URL');
  }

  async create({ expiresAt, instrumentId, subjectIdentifier }: CreateAssignmentDto): Promise<AssignmentBundle> {
    const instrument = await this.instrumentsService.findById(instrumentId);
    const dto: CreateAssignmentBundleData = {
      expiresAt,
      instrumentBundle: instrument.bundle,
      instrumentId: instrument.id as string,
      subjectIdentifier
    };
    const response = await this.httpService.axiosRef.post(`${this.gatewayBaseUrl}/api/assignments`, dto);
    return assignmentBundleSchema.parseAsync(response.data);
  }

  async find({ subjectIdentifier }: { subjectIdentifier?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const response = await this.httpService.axiosRef.get(`${this.gatewayBaseUrl}/api/assignments`, {
      params: {
        subjectIdentifier
      }
    });
    const assignmentBundles = await assignmentBundleSchema.array().parseAsync(response.data);
    const assignments: Assignment[] = [];
    for (const bundle of assignmentBundles) {
      const instrument = await this.instrumentsService.findById(bundle.instrumentId);
      const assignment = subject('Assignment', { ...bundle, instrument });
      if (ability && !ability.can('read', assignment)) {
        continue;
      }
      assignments.push(assignment);
    }
    return assignments;
  }
}
