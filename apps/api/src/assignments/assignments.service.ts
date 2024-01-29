import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { Assignment, UpdateAssignmentData } from '@open-data-capture/common/assignment';

import { accessibleQuery } from '@/ability/ability.utils';
import { ConfigurationService } from '@/configuration/configuration.service';
import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  private readonly gatewayBaseUrl: string;

  constructor(
    configurationService: ConfigurationService,
    @InjectModel('Assignment') private readonly assignmentModel: Model<'Assignment'>
  ) {
    this.gatewayBaseUrl = configurationService.get('GATEWAY_BASE_URL');
  }

  async create({ expiresAt, instrumentId, subjectId }: CreateAssignmentDto): Promise<Assignment> {
    const id = crypto.randomUUID();
    const assignment = await this.assignmentModel.create({
      data: {
        expiresAt,
        id,
        instrument: {
          connect: {
            id: instrumentId
          }
        },
        status: 'OUTSTANDING',
        subject: {
          connect: {
            id: subjectId
          }
        },
        url: `${this.gatewayBaseUrl}/assignments/${id}`
      }
    });
    return assignment;
  }

  async find(
    { subjectId }: { subjectId?: string } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<Assignment[]> {
    return this.assignmentModel.findMany({
      where: {
        AND: [accessibleQuery(ability, 'read', 'Assignment'), { subjectId }]
      }
    });
  }

  async updateById(id: string, data: UpdateAssignmentData, { ability }: EntityOperationOptions = {}) {
    return this.assignmentModel.update({
      data,
      where: { AND: [accessibleQuery(ability, 'update', 'Assignment')], id }
    });
  }
}
