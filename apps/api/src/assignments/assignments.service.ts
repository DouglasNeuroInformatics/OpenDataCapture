import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Assignment } from '@open-data-capture/types';

import { AbilityService } from '@/ability/ability.service';
import { FormsService } from '@/instruments/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { AssignmentsRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService implements EntityService<Assignment> {
  constructor(
    private readonly abilityService: AbilityService,
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly formsService: FormsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create({ instrumentId, subjectId }: CreateAssignmentDto) {
    const instrument = await this.formsService.findById(instrumentId);
    const subject = await this.subjectsService.findById(subjectId);
    return this.assignmentsRepository.create({
      instrument,
      status: 'OUTSTANDING',
      subject,
      timeAssigned: Date.now(),
      timeExpires: Date.now() + 604800000 // 1 week,
    });
  }

  async deleteById(id: string, { validateAbility = true } = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('delete', assignment)) {
      throw new ForbiddenException(`Insufficient rights to delete assignment with ID: ${id}`);
    }
    return (await this.assignmentsRepository.deleteById(id))!;
  }

  async findAll({ validateAbility = true } = {}) {
    if (!validateAbility) {
      return this.assignmentsRepository.find();
    }
    return this.assignmentsRepository.find(this.abilityService.accessibleQuery('read'));
  }

  async findById(id: string, { validateAbility = true } = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('delete', assignment)) {
      throw new ForbiddenException(`Insufficient rights to read assignment with ID: ${id}`);
    }
    return assignment;
  }

  async updateById(id: string, update: UpdateAssignmentDto, { validateAbility = true } = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (validateAbility && !this.abilityService.can('update', assignment)) {
      throw new ForbiddenException(`Insufficient rights to update assignment with ID: ${id}`);
    }
    return (await this.assignmentsRepository.updateById(id, update))!;
  }
}
