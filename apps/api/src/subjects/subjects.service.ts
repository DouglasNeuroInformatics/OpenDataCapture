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
