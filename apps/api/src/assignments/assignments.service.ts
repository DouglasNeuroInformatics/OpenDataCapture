import { accessibleBy } from '@casl/mongoose';
import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Assignment, AssignmentSummary } from '@open-data-capture/common/assignment';

import type { EntityOperationOptions } from '@/core/types';
import { FormsService } from '@/instruments/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { AssignmentsRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService implements EntityService<Assignment> {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly formsService: FormsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create({ expiresAt, instrumentId, subjectIdentifier }: CreateAssignmentDto) {
    const instrument = await this.formsService.findById(instrumentId);
    const subject = await this.subjectsService.findById(subjectIdentifier);
    return this.assignmentsRepository.create({
      assignedAt: new Date(),
      expiresAt,
      instrument,
      status: 'OUTSTANDING',
      subject
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (ability && ability.can('delete', assignment)) {
      throw new ForbiddenException(`Insufficient rights to delete assignment with ID: ${id}`);
    }
    return (await this.assignmentsRepository.deleteById(id))!;
  }

  async findAll({ ability }: EntityOperationOptions = {}) {
    if (!ability) {
      return this.assignmentsRepository.find();
    }
    return this.assignmentsRepository.find(accessibleBy(ability, 'read').Assignment);
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (ability && !ability.can('delete', assignment)) {
      throw new ForbiddenException(`Insufficient rights to read assignment with ID: ${id}`);
    }
    return assignment;
  }

  async getSummary({ ability }: EntityOperationOptions = {}): Promise<AssignmentSummary[]> {
    return this.assignmentsRepository.find(ability ? accessibleBy(ability, 'read').Assignment : {}, {
      populate: {
        path: 'instrument',
        select: '-content -measures -validationSchema'
      }
    });
  }

  async updateById(id: string, update: UpdateAssignmentDto, { ability }: EntityOperationOptions = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (ability && !ability.can('update', assignment)) {
      throw new ForbiddenException(`Insufficient rights to update assignment with ID: ${id}`);
    }
    return (await this.assignmentsRepository.updateById(id, update))!;
  }
}
