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

  /**
   * Associate each of the given subjects with a group, in one write rather than one per subject.
   *
   * The membership check is part of the query rather than done by the caller: mongodb arrays admit
   * duplicates, so a caller filtering against a list it read earlier would push the same group id
   * twice if a concurrent request associated the subject in between.
   */
  async addGroupForSubjects(subjectIds: string[], groupId: string, { ability }: EntityOperationOptions = {}) {
    return this.subjectModel.updateMany({
      data: { groupIds: { push: groupId } },
      where: {
        AND: [accessibleQuery(ability, 'update', 'Subject')],
        id: { in: subjectIds },
        NOT: { groupIds: { has: groupId } }
      }
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
    // keyed by id so duplicates within the request collapse, keeping the first entry for each
    const requested = new Map<string, CreateSubjectDto>();
    for (const subject of data) {
      if (!requested.has(subject.id)) {
        requested.set(subject.id, subject);
      }
    }

    //find the list of subject ids that already exist
    const existingSubjects = await this.subjectModel.findMany({
      select: { id: true },
      where: {
        AND: [accessibleQuery(ability, 'read', 'Subject')],
        id: { in: Array.from(requested.keys()) }
      }
    });

    //create a set of existing ids in the database to filter our to-be-created ids with
    const existingIds = new Set(existingSubjects.map((subj) => subj.id));

    // The whole entry is kept, not just the id: a subject identified by personal info carries
    // demographics that would otherwise be dropped on creation.
    const subjectsToCreate = Array.from(requested.values()).filter((subject) => !existingIds.has(subject.id));

    //if there are none left to create do not follow through with the command
    if (subjectsToCreate.length < 1) {
      return subjectsToCreate;
    }
    return this.subjectModel.createMany({
      // Named explicitly rather than spread: callers hand this whole Prisma rows, and a spread would
      // carry fields that are not the caller's to set.
      data: subjectsToCreate.map(({ dateOfBirth, firstName, id, lastName, sex }) => ({
        dateOfBirth,
        firstName,
        groupIds: [],
        id,
        lastName,
        sex
      })),
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
      this.prismaClient.instrumentRecord.deleteMany({
        where: {
          subject: {
            id: subject.id
          }
        }
      }),
      this.prismaClient.session.deleteMany({
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

  async find(
    { groupId, hasRecord }: { groupId?: string; hasRecord?: boolean } = {},
    { ability }: EntityOperationOptions = {}
  ) {
    const groupInput = groupId ? { groupIds: { has: groupId } } : {};
    if (hasRecord) {
      return this.subjectModel.findMany({
        where: {
          AND: [
            accessibleQuery(ability, 'read', 'Subject'),
            groupInput,
            { id: { in: await this.querySubjectIdsWithRecords(groupId) } }
          ]
        }
      });
    }
    return this.subjectModel.findMany({
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

  private async querySubjectIdsWithRecords(groupId?: string): Promise<string[]> {
    const records = await this.prismaClient.instrumentRecord.findMany({
      distinct: ['subjectId'],
      select: { subjectId: true },
      where: groupId ? { groupId } : {}
    });
    return records.map((r) => r.subjectId);
  }
}
