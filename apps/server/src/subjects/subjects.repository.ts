import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { SubjectDocument, SubjectEntity } from './entities/subject.entity.js';

import { EntityRepository } from '@/core/abstract/entity.repository.js';

@Injectable()
export class SubjectsRepository extends EntityRepository<SubjectEntity, SubjectDocument> {
  constructor(
    @InjectModel(SubjectEntity.modelName) subjectModel: Model<SubjectDocument, AccessibleModel<SubjectDocument>>
  ) {
    super(subjectModel);
  }
}
