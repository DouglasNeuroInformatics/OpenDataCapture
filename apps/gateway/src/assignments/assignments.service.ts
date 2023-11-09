import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { CreateAssignmentBundleData } from '@open-data-capture/common/assignment';
import type { Repository } from 'typeorm';

import { AssignmentBundleEntity } from './entities/assignment-bundle.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(AssignmentBundleEntity)
    private readonly assignmentBundlesRepository: Repository<AssignmentBundleEntity>
  ) {}

  async create(data: CreateAssignmentBundleData) {
    const entity = this.assignmentBundlesRepository.create({
      ...data,
      assignedAt: new Date(),
      status: 'OUTSTANDING',
      url: 'https://google.com'
    });
    return this.assignmentBundlesRepository.save(entity);
  }

  async find() {
    return this.assignmentBundlesRepository.find();
  }
}
