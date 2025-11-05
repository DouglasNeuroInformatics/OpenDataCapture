import { InjectModel, InjectPrismaClient } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { accessibleQuery } from '@/auth/ability.utils';
import type { RuntimePrismaClient } from '@/core/prisma';
import type { EntityOperationOptions } from '@/core/types';

import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectPrismaClient() private readonly prismaClient: RuntimePrismaClient,
    @InjectModel('Subject') private readonly subjectModel: Model<'Subject'>
  ) {}

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

  async create({
    id,
    ...data
  }: CreateSubjectDto & {
    /** for demo purposes need to set createdAt manually */
    createdAt?: Date;
  }) {
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

  async createMany(data: CreateSubjectDto[], { ability }: EntityOperationOptions = {}) {
    //filter out all duplicate ids that are planned to be created via a set
    const noDuplicatesSet = new Set(
      data.map((record) => {
        return record.id;
      })
    );

    const subjectIds = Array.from(noDuplicatesSet);

    //find the list of subject ids that already exist
    const existingSubjects = await this.subjectModel.findMany({
      select: { id: true },
      where: {
        AND: [accessibleQuery(ability, 'read', 'Subject')],
        id: { in: subjectIds }
      }
    });

    //create a set of existing ids in the database to filter our to-be-created ids with
    const existingIds = new Set(existingSubjects.map((subj) => subj.id));

    //Filter out records whose IDs already exist
    const subjectsToCreateIds = subjectIds.filter((record) => !existingIds.has(record));

    const subjectsToCreate: CreateSubjectDto[] = subjectsToCreateIds.map((record) => {
      return {
        id: record
      };
    });

    //if there are none left to create do not follow through with the command
    if (subjectsToCreate.length < 1) {
      return subjectsToCreate;
    }
    return this.subjectModel.createMany({
      data: subjectsToCreate,
      ...accessibleQuery(ability, 'create', 'Subject')
    });
  }

  async deleteById(id: string, { ability, force }: EntityOperationOptions & { force?: boolean } = {}) {
    const subject = await this.findById(id);
    if (!force) {
      await this.subjectModel.delete({
        where: { AND: [accessibleQuery(ability, 'delete', 'Subject')], id: subject.id }
      });
      return { success: true };
    }
    await this.prismaClient.$transaction([
      this.prismaClient.session.deleteMany({
        where: {
          subject: {
            id: subject.id
          }
        }
      }),
      this.prismaClient.instrumentRecord.deleteMany({
        where: {
          subject: {
            id: subject.id
          }
        }
      }),
      this.prismaClient.subject.deleteMany({
        where: {
          id: subject.id
        }
      })
    ]);
    return { success: true };
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
