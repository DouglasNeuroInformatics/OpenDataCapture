import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { AccessibleModel } from '@casl/mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { type AssignmentDocument, AssignmentEntity } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(AssignmentEntity.modelName)
    private readonly assignmentModel: Model<AssignmentDocument, AccessibleModel<AssignmentDocument>>
  ) {}

  create({ instrumentIdentifier }: CreateAssignmentDto) {
    return this.assignmentModel.create({
      status: 'OUTSTANDING',
      timeAssigned: Date.now(),
      timeExpires: Date.now() + 1000000,
      title: instrumentIdentifier
    });
  }

  findAll() {
    return this.assignmentModel.find();
  }
}
