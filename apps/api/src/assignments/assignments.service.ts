import crypto from 'crypto';

import { accessibleBy } from '@casl/mongoose';
import { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Assignment } from '@open-data-capture/common/assignment';

import type { EntityOperationOptions } from '@/core/types';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { AssignmentsRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { GatewayService } from './gateway.service';

@Injectable()
export class AssignmentsService implements EntityService<Assignment> {
  private readonly gatewayBaseUrl: string;

  constructor(
    configService: ConfigService,
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly gatewayService: GatewayService,
    private readonly instrumentsService: InstrumentsService,
    private readonly subjectsService: SubjectsService
  ) {
    this.gatewayBaseUrl = configService.getOrThrow('GATEWAY_URL');
  }

  async create({ expiresAt, instrumentId, subjectIdentifier }: CreateAssignmentDto) {
    const instrument = await this.instrumentsService.findById(instrumentId);
    const subject = await this.subjectsService.findById(subjectIdentifier);
    const assignment = await this.assignmentsRepository.create({
      assignedAt: new Date(),
      expiresAt,
      instrument,
      status: 'OUTSTANDING',
      subject,
      url: new URL(crypto.randomUUID(), this.gatewayBaseUrl).toString()
    });
    await this.gatewayService.create(assignment);
    return assignment;
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

  async find({ subjectIdentifier }: { subjectIdentifier?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const subject = subjectIdentifier ? await this.subjectsService.findById(subjectIdentifier) : undefined;
    return this.assignmentsRepository.find({
      $and: [{ subject }, ability ? accessibleBy(ability, 'read').Assignment : {}]
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const assignment = await this.assignmentsRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    } else if (ability && !ability.can('read', assignment)) {
      throw new ForbiddenException(`Insufficient rights to read assignment with ID: ${id}`);
    }
    return assignment;
  }

  async getSummary(
    { subjectIdentifier }: { subjectIdentifier?: string } = {},
    { ability }: EntityOperationOptions = {}
  ) {
    const subject = subjectIdentifier ? await this.subjectsService.findById(subjectIdentifier) : undefined;
    return this.assignmentsRepository.find(
      {
        $and: [{ subject }, ability ? accessibleBy(ability, 'read').Assignment : {}]
      },
      {
        populate: {
          path: 'instrument',
          select: '-content -measures -validationSchema'
        }
      }
    );
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
