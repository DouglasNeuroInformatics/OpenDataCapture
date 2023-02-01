import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Subject, SubjectDocument } from './schemas/subject.schema';

import { EntityRepository } from '@/abstract/entity.repository';

@Injectable()
export class SubjectsRepository extends EntityRepository<Subject, SubjectDocument> {
  constructor(@InjectModel(Subject.name) subjectModel: Model<SubjectDocument>) {
    super(subjectModel);
  }
}
