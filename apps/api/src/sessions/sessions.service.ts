import { InjectModel, InjectPrismaClient, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { Group } from '@opendatacapture/schemas/group';
import type { CreateSessionData } from '@opendatacapture/schemas/session';
import type { CreateSubjectData } from '@opendatacapture/schemas/subject';
import type { Prisma, Session, Subject, User } from '@prisma/client';

import { accessibleQuery } from '@/auth/ability.utils';
import type { RuntimePrismaClient } from '@/core/prisma';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectPrismaClient() private readonly prismaClient: RuntimePrismaClient,
    @InjectModel('Session') private readonly sessionModel: Model<'Session'>,
    private readonly groupsService: GroupsService,
    private readonly loggingService: LoggingService,
    private readonly subjectsService: SubjectsService
  ) {}

  async count(where: Prisma.SessionWhereInput = {}, { ability }: EntityOperationOptions = {}) {
    return this.sessionModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'Session'), where] }
    });
  }

  async create({ date, groupId, subjectData, type, username }: CreateSessionData): Promise<Session> {
    this.loggingService.debug({ message: 'Attempting to create session' });
    const subject = await this.resolveSubject(subjectData);

    let user: null | Omit<User, 'hashedPassword'> = null;

    if (username) {
      user = await this.prismaClient.user.findFirst({
        where: {
          username: username
        }
      });
    }

    // If the subject is not yet associated with the group, check it exists then append it
    let group: Group | null = null;
    if (groupId && !subject.groupIds.includes(groupId)) {
      group = await this.groupsService.findById(groupId);
      await this.subjectsService.addGroupForSubject(subject.id, group.id);
    }

    const { id } = await this.sessionModel.create({
      data: {
        date,
        group: group
          ? {
              connect: { id: group.id }
            }
          : undefined,
        subject: {
          connect: { id: subject.id }
        },
        type,
        user: user
          ? {
              connect: { id: user.id }
            }
          : undefined
      }
    });

    return (await this.sessionModel.findUnique({
      include: {
        subject: true
      },
      where: { id }
    }))!;
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.sessionModel.delete({
      where: { AND: [accessibleQuery(ability, 'delete', 'Session')], id }
    });
  }

  async deleteByIds(ids: string[], { ability }: EntityOperationOptions = {}) {
    return this.sessionModel.deleteMany({
      where: {
        AND: [accessibleQuery(ability, 'delete', 'Session')],
        id: {
          in: ids
        }
      }
    });
  }

  async findAllIncludeUsernames(groupId: string, { ability }: EntityOperationOptions = {}) {
    return this.sessionModel.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      where: {
        AND: [accessibleQuery(ability, 'read', 'Session'), { groupId }]
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const session = await this.sessionModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Session')], id }
    });
    if (!session) {
      throw new NotFoundException(`Failed to find session with ID: ${id}`);
    }
    return session;
  }

  /** Get the subject if they exist, otherwise create them */
  private async resolveSubject(subjectData: CreateSubjectData) {
    this.loggingService.debug({ message: 'Attempting to resolve subject', subjectData });
    let subject: Subject;
    try {
      subject = await this.subjectsService.findById(subjectData.id);
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        throw new InternalServerErrorException('Unexpected Error', { cause: err });
      }
      subject = await this.subjectsService.create(subjectData);
    }
    return subject;
  }
}
