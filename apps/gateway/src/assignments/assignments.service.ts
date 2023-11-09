import crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { CreateAssignmentBundleData } from '@open-data-capture/common/assignment';
import type { Repository } from 'typeorm';

import { AssignmentBundleEntity } from './entities/assignment-bundle.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(AssignmentBundleEntity)
    private readonly assignmentBundlesRepository: Repository<AssignmentBundleEntity>,
    private readonly configService: ConfigService
  ) {}

  async create({ expiresAt, instrumentBundle, instrumentId, subjectIdentifier }: CreateAssignmentBundleData) {
    const baseUrl: string = this.configService.getOrThrow('GATEWAY_URL');
    const id = crypto.randomUUID();
    const entity = this.assignmentBundlesRepository.create({
      assignedAt: new Date(),
      expiresAt,
      id,
      instrumentBundle,
      instrumentId,
      status: 'OUTSTANDING',
      subjectIdentifier,
      url: `${baseUrl}/${id}`
    });
    return this.assignmentBundlesRepository.save(entity);
  }

  async find({ subjectIdentifier }: { subjectIdentifier?: string } = {}) {
    return this.assignmentBundlesRepository.find({
      where: {
        subjectIdentifier
      }
    });
  }
}
