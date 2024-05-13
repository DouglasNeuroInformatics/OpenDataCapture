import crypto from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { HybridCrypto } from '@opendatacapture/crypto';
import type { Assignment, UpdateAssignmentData } from '@opendatacapture/schemas/assignment';

import { accessibleQuery } from '@/ability/ability.utils';
import { ConfigurationService } from '@/configuration/configuration.service';
import type { EntityOperationOptions } from '@/core/types';
import { GatewayService } from '@/gateway/gateway.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  private readonly assignmentBaseUrl: string;

  constructor(
    @InjectModel('Assignment') private readonly assignmentModel: Model<'Assignment'>,
    configurationService: ConfigurationService,
    private readonly gatewayService: GatewayService
  ) {
    if (configurationService.get('NODE_ENV') === 'production') {
      const siteAddress = configurationService.get('GATEWAY_SITE_ADDRESS');
      this.assignmentBaseUrl = siteAddress.origin;
    } else {
      const gatewayPort = configurationService.get('GATEWAY_DEV_SERVER_PORT');
      this.assignmentBaseUrl = `http://localhost:${gatewayPort}`;
    }
  }

  async create({ expiresAt, groupId, instrumentId, subjectId }: CreateAssignmentDto): Promise<Assignment> {
    const { privateKey, publicKey } = await HybridCrypto.generateKeyPair();
    const id = crypto.randomUUID();
    const assignment = await this.assignmentModel.create({
      data: {
        encryptionKeyPair: {
          privateKey: Buffer.from(await HybridCrypto.serializePrivateKey(privateKey)),
          publicKey: Buffer.from(await HybridCrypto.serializePublicKey(publicKey))
        },
        expiresAt,
        group: groupId
          ? {
              connect: {
                id: groupId
              }
            }
          : undefined,
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
        url: `${this.assignmentBaseUrl}/assignments/${id}`
      }
    });
    try {
      await this.gatewayService.createRemoteAssignment(assignment, publicKey);
    } catch (err) {
      await this.assignmentModel.delete({ where: { id } });
      throw err;
    }
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

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const assignment = await this.assignmentModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Assignment')], id }
    });
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    }
    return assignment;
  }

  async updateById(id: string, data: UpdateAssignmentData, { ability }: EntityOperationOptions = {}) {
    return this.assignmentModel.update({
      data,
      where: { AND: [accessibleQuery(ability, 'update', 'Assignment')], id }
    });
  }
}
