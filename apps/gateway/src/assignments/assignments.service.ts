import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { AssignmentBundle } from '@open-data-capture/common/assignment';
import type { Repository } from 'typeorm';

import { AssignmentBundleEntity } from './entities/assignment-bundle.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(AssignmentBundleEntity)
    private readonly assignmentBundlesRepository: Repository<AssignmentBundleEntity>
  ) {}

  async create(assignment: AssignmentBundle) {
    const entity = this.assignmentBundlesRepository.create(assignment);
    return this.assignmentBundlesRepository.save(entity);
  }

  async find() {
    return this.assignmentBundlesRepository.find();
  }
}
