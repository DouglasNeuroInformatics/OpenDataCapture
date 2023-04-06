import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { SubjectDocument, SubjectEntity } from './entities/subject.entity';

import { EntityRepository } from '@/core/abstract/entity.repository';

@Injectable()
export class SubjectsRepository extends EntityRepository<SubjectEntity, SubjectDocument> {
  constructor(
    @InjectModel(SubjectEntity.modelName) subjectModel: Model<SubjectDocument, AccessibleModel<SubjectDocument>>
  ) {
    super(subjectModel);
  }
}
