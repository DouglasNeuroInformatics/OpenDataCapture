import type { EntityService } from '@douglasneuroinformatics/nestjs/core';
import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import type { CreateVisitData, Visit } from '@open-data-capture/types';

import type { SubjectDocument } from '@/subjects/entities/subject.entity';
import { SubjectsService } from '@/subjects/subjects.service';

import { VisitsRepository } from './visits.repository';

@Injectable()
export class VisitsService implements Pick<EntityService<Visit>, 'create'> {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly visitsRepository: VisitsRepository
  ) {}
  async create({ date, subjectIdData }: CreateVisitData) {
    let subject: SubjectDocument;
    try {
      subject = await this.subjectsService.findByLookup(subjectIdData);
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        throw new InternalServerErrorException('Unexpected Error', { cause: err });
      }
      subject = await this.subjectsService.create(subjectIdData);
    }
    return this.visitsRepository.create({ date, subject });
  }
}
