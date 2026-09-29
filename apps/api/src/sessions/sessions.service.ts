import { InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { Group } from '@opendatacapture/schemas/group';
import type { CreateSessionData } from '@opendatacapture/schemas/session';
import type { Prisma, Session } from '@prisma/client';
import { ObjectId } from 'mongodb';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

/** The batched form of `CreateSessionData`: what varies per session, and what the batch shares. */
type CreateManySessionsData = Pick<CreateSessionData, 'groupId' | 'type' | 'username'> & {
  entries: Pick<CreateSessionData, 'date' | 'subjectData'>[];
};

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<'Session'>,
    private readonly groupsService: GroupsService,
    private readonly loggingService: LoggingService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService
  ) {}

  async count(where: Prisma.SessionWhereInput = {}, { ability }: EntityOperationOptions = {}) {
    return this.sessionModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'Session'), where] }
    });
  }

  async create(
    { date, groupId, subjectData, type, username }: CreateSessionData,
    options?: EntityOperationOptions
  ): Promise<Session> {
    const [session] = await this.createMany(
      {
        entries: [{ date, subjectData }],
        groupId,
        type,
        username
      },
      options
    );
    return session!;
  }

  /**
   * Create one session per entry, in a fixed number of queries rather than a fixed number per entry.
   *
   * Returned in the same order as `entries`, so a caller can pair each session with the input that
   * produced it without a second lookup.
   */
  async createMany(
    { entries, groupId, type, username }: CreateManySessionsData,
    { ability }: EntityOperationOptions = {}
  ): Promise<Session[]> {
    if (entries.length === 0) {
      return [];
    }
    this.loggingService.debug({ message: `Attempting to create ${entries.length} session(s)` });

    const user = username ? await this.usersService.findByUsername(username, { ability }) : null;
    const group: Group | null = groupId ? await this.groupsService.findById(groupId, { ability }) : null;

    // The subject writes are left unscoped. A caller's `read Subject` rule covers only its own
    // groups, so a scoped existence check would miss a subject from another group and try to create
    // it again, and a STANDARD caller holds no `update Subject` rule for the group association.
    await this.subjectsService.createMany(entries.map((entry) => entry.subjectData));
    if (group) {
      await this.subjectsService.addGroupForSubjects(
        Array.from(new Set(entries.map((entry) => entry.subjectData.id))),
        group.id
      );
    }

    // Generated up front so the sessions can be read back in the order they were requested;
    // createMany does not return the documents it inserted.
    const ids = entries.map(() => new ObjectId().toHexString());

    await this.sessionModel.createMany({
      data: entries.map((entry, index) => ({
        date: entry.date,
        groupId: group?.id ?? null,
        id: ids[index]!,
        subjectId: entry.subjectData.id,
        type,
        userId: user?.id ?? null
      }))
    });

    // The caller never receives these sessions if the read-back fails, so it cannot roll them back.
    try {
      return await this.readBackInOrder(ids);
    } catch (err) {
      await this.deleteByIds(ids);
      throw err;
    }
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

  private async readBackInOrder(ids: string[]) {
    const created = await this.sessionModel.findMany({
      include: { subject: true },
      where: { id: { in: ids } }
    });
    const byId = new Map(created.map((session) => [session.id, session]));
    return ids.map((id) => {
      const session = byId.get(id);
      if (!session) {
        throw new InternalServerErrorException(`Failed to read back created session with id: ${id}`);
      }
      return session;
    });
  }
}
