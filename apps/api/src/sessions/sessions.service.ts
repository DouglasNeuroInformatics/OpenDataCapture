import { InjectModel, InjectPrismaClient, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Group } from '@opendatacapture/schemas/group';
import type { CreateSessionData, SessionType } from '@opendatacapture/schemas/session';
import type { CreateSubjectData } from '@opendatacapture/schemas/subject';
import type { Prisma, Session, Subject, User } from '@prisma/client';
import { ObjectId } from 'mongodb';

import { accessibleQuery } from '@/auth/ability.utils';
import type { RuntimePrismaClient } from '@/core/prisma';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';

type CreateManySessionsData = {
  entries: { date: Date; subjectData: CreateSubjectData }[];
  groupId: null | string;
  type: SessionType;
  username?: null | string;
};

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
    const [session] = await this.createMany({
      entries: [{ date, subjectData }],
      groupId,
      type,
      username
    });
    return session!;
  }

  /**
   * Create one session per entry, in a fixed number of queries rather than a fixed number per entry.
   *
   * Returned in the same order as `entries`, so a caller can pair each session with the input that
   * produced it without a second lookup.
   */
  async createMany({ entries, groupId, type, username }: CreateManySessionsData): Promise<Session[]> {
    if (entries.length === 0) {
      return [];
    }
    this.loggingService.debug({ message: `Attempting to create ${entries.length} session(s)` });

    const subjects = await this.resolveSubjects(entries.map((entry) => entry.subjectData));

    const user: null | Omit<User, 'hashedPassword'> = username
      ? await this.prismaClient.user.findFirst({ where: { username } })
      : null;

    const group: Group | null = groupId ? await this.groupsService.findById(groupId) : null;
    if (group) {
      // Associate in one write rather than one per subject, and only for those not already members.
      const unassociated = subjects.filter((subject) => !subject.groupIds.includes(group.id));
      if (unassociated.length > 0) {
        await this.prismaClient.subject.updateMany({
          data: { groupIds: { push: group.id } },
          where: { id: { in: unassociated.map((subject) => subject.id) } }
        });
      }
    }

    // Generated up front so the sessions can be read back in the order they were requested;
    // createMany does not return the documents it inserted.
    const ids = entries.map(() => new ObjectId().toHexString());

    await this.sessionModel.createMany({
      data: entries.map((entry, index) => ({
        date: entry.date,
        // Set whenever a group was supplied. Previously this was populated only when the subject was
        // not already a member, so every visit after a subject's first produced a session with no
        // groupId -- invisible to a group manager, whose Session rule is { groupId: { in: [...] } },
        // and uncounted by any group-scoped query.
        groupId: group?.id ?? null,
        id: ids[index]!,
        subjectId: entry.subjectData.id,
        type,
        userId: user?.id ?? null
      }))
    });

    const created = await this.sessionModel.findMany({
      include: { subject: true },
      where: { id: { in: ids } }
    });
    const byId = new Map(created.map((session) => [session.id, session]));
    return ids.map((id) => byId.get(id)!);
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

  async findAllIncludeUsernames(groupId?: string, { ability }: EntityOperationOptions = {}) {
    const sessionsWithUsers = await this.sessionModel.findMany({
      include: {
        subject: true,
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
    if (sessionsWithUsers.length < 1) {
      throw new NotFoundException(`Failed to find users`);
    }
    return sessionsWithUsers;
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

  /** Get each subject if they exist, otherwise create them, in two queries regardless of count. */
  private async resolveSubjects(subjectData: CreateSubjectData[]): Promise<Subject[]> {
    const ids = Array.from(new Set(subjectData.map((subject) => subject.id)));
    await this.subjectsService.createMany(subjectData);
    return this.prismaClient.subject.findMany({ where: { id: { in: ids } } });
  }
}
