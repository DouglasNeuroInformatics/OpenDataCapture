import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@opendatacapture/prisma-client/api';

import { accessibleQuery } from '@/ability/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model, ModelUpdateData } from '@/prisma/prisma.types';

import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(@InjectModel('Subject') private readonly subjectModel: Model<'Subject'>) {}

  async count(where: Prisma.SubjectModelWhereInput = {}, { ability }: EntityOperationOptions = {}) {
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

  async updateById(id: string, data: ModelUpdateData<'Subject'>, { ability }: EntityOperationOptions = {}) {
    return this.subjectModel.update({
      data,
      where: { id, ...accessibleQuery(ability, 'update', 'Subject') }
    });
  }
}
