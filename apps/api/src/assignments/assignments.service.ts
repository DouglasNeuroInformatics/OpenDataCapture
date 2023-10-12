import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { AccessibleModel } from '@casl/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { FormsService } from '@/instruments/services/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { type AssignmentDocument, AssignmentEntity } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(AssignmentEntity.modelName)
    private readonly assignmentModel: Model<AssignmentDocument, AccessibleModel<AssignmentDocument>>,
    private readonly formsService: FormsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create({ instrumentIdentifier, subjectIdentifier }: CreateAssignmentDto) {
    const form = await this.formsService.findByIdentifier(instrumentIdentifier);
    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    if (!form[0]) {
      throw new NotFoundException(`Failed to find form with identifier: ${instrumentIdentifier}`);
    }
    return this.assignmentModel.create({
      status: 'OUTSTANDING',
      subject,
      timeAssigned: Date.now(),
      timeExpires: Date.now() + 1000000,
      title: form[0].details.title
    });
  }

  findAll() {
    return this.assignmentModel.find();
  }
}
