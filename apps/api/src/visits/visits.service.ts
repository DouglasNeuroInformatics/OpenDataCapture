import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import type { SubjectIdentificationData } from '@open-data-capture/common/subject';
import type { CreateVisitData, Visit } from '@open-data-capture/common/visit';

import { GroupsService } from '@/groups/groups.service';
import type { SubjectDocument } from '@/subjects/entities/subject.entity';
import { SubjectsService } from '@/subjects/subjects.service';

import { VisitsRepository } from './visits.repository';

@Injectable()
export class VisitsService implements Pick<EntityService<Visit>, 'create'> {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService,
    private readonly visitsRepository: VisitsRepository
  ) {}
  async create({ date, groupId, subjectIdData }: CreateVisitData) {
    const group = groupId ? await this.groupsService.findById(groupId) : undefined;
    const subject = await this.resolveSubject(subjectIdData);
    return this.visitsRepository.create({ date, group, subject });
  }

  /** Get the subject if they exist, otherwise create them */
  private async resolveSubject(subjectIdData: SubjectIdentificationData) {
    let subject: SubjectDocument;
    try {
      subject = await this.subjectsService.findByLookup(subjectIdData);
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        throw new InternalServerErrorException('Unexpected Error', { cause: err });
      }
      subject = await this.subjectsService.create(subjectIdData);
    }
    return subject;
  }
}
