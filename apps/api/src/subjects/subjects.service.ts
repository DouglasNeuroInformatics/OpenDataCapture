import { accessibleQuery, InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type { EntityOperationOptions } from '@/core/types';

import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(@InjectModel('Subject') private readonly subjectModel: Model<'Subject'>) {}

  async addGroupForSubject(subjectId: string, groupId: string, { ability }: EntityOperationOptions = {}) {
    return this.subjectModel.update({
      data: {
        groupIds: {
          push: groupId
        }
      },
      where: { ...accessibleQuery(ability, 'update', 'Subject'), id: subjectId }
    });
  }

  async count(where: Prisma.SubjectWhereInput = {}, { ability }: EntityOperationOptions = {}) {
    return this.subjectModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'Subject'), where] }
    });
  }

  async create({ id, ...data }: CreateSubjectDto) {
    if (await this.subjectModel.exists({ id })) {
      throw new ConflictException('A subject with the provided demographic information already exists');
    }
    return this.subjectModel.create({
      data: {
        groupIds: [],
        id,
        ...data
      }
    });
  }

  async createMany(data: CreateSubjectDto[]) {
    //filter out all duplicate ids that are planned to be created

    const seen = new Set();
    const noDuplicateSubjectsList = data.filter((record) => {
      if (!seen.has(record.id)) {
        seen.add(record.id);
        return true;
      }
      return false;
    });

    const subjectIds = noDuplicateSubjectsList.map((record) => record.id);

    //find the list of subject ids that already exist
    const existingSubjects = await this.subjectModel.findMany({
      select: { id: true },
      where: {
        id: { in: subjectIds }
      }
    });

    //create a set of existing ids in the database to filter our to-be-created ids with
    const existingIds = new Set(existingSubjects.map((subj) => subj.id));

    //Filter out records whose IDs already exist
    const subjectsToCreate = noDuplicateSubjectsList.filter((record) => !existingIds.has(record.id));

    //if there are none left to create do not follow through with the command
    if (subjectsToCreate.length < 1) {
      return subjectsToCreate;
    }
    return this.subjectModel.createMany({
      data: subjectsToCreate
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.findById(id);
    return this.subjectModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'Subject')], id: subject.id }
    });
  }

  async find({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    const groupInput = groupId ? { groupIds: { has: groupId } } : {};
    return await this.subjectModel.findMany({
      where: {
        AND: [accessibleQuery(ability, 'read', 'Subject'), groupInput]
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const subject = await this.subjectModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Subject'), { id }] }
    });
    if (!subject) {
      throw new NotFoundException(`Failed to find subject with id: ${id}`);
    }
    return subject;
  }
}
