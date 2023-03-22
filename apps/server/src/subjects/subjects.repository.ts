import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AccessibleModel } from '@casl/mongoose';
import { Model } from 'mongoose';

import { Subject, SubjectDocument } from './schemas/subject.schema';

import { EntityRepository } from '@/core/abstract/entity.repository';

@Injectable()
export class SubjectsRepository extends EntityRepository<Subject, SubjectDocument> {
  constructor(@InjectModel(Subject.name) subjectModel: Model<SubjectDocument, AccessibleModel<SubjectDocument>>) {
    super(subjectModel);
  }
}
