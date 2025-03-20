import { accessibleQuery, InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import type { Group } from '@opendatacapture/schemas/group';
import type { CreateSessionData } from '@opendatacapture/schemas/session';
import type { CreateSubjectData } from '@opendatacapture/schemas/subject';
import type { Session, Subject } from '@prisma/client';

import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<'Session'>,
    private readonly groupsService: GroupsService,
    private readonly loggingService: LoggingService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create({ date, groupId, subjectData, type }: CreateSessionData): Promise<Session> {
    this.loggingService.debug({ message: 'Attempting to create session' });
    const subject = await this.resolveSubject(subjectData);

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
        type
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
