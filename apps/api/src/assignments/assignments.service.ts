import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { UpdateAssignmentDto } from './dto/update-assignment.dto';
import type { AccessibleModel } from '@casl/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';

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
    const form = (await this.formsService.findByIdentifier(instrumentIdentifier))[0];
    const subject = await this.subjectsService.findByIdentifier(subjectIdentifier);
    if (!form) {
      throw new NotFoundException(`Failed to find form with identifier: ${instrumentIdentifier}`);
    }
    return this.assignmentModel.create({
      instrument: form,
      status: 'OUTSTANDING',
      subject,
      timeAssigned: Date.now(),
      timeExpires: Date.now() + 1000000
    });
  }

  findAll() {
    return this.assignmentModel.find().populate('instrument');
  }

  async updateById(id: Types.ObjectId, updateGroupDto: UpdateAssignmentDto): Promise<AssignmentDocument> {
    const result = await this.assignmentModel.findByIdAndUpdate(id, updateGroupDto);
    if (!result) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id.toString()}`);
    }
    return result;
  }
}
