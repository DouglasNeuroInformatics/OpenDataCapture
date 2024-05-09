import { Injectable, Logger } from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import type { SubjectModel } from '@opendatacapture/prisma-client/api';
import type { Group } from '@opendatacapture/schemas/group';
import type { CreateSessionData, Session } from '@opendatacapture/schemas/session';
import type { CreateSubjectData } from '@opendatacapture/schemas/subject';

import { GroupsService } from '@/groups/groups.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import type { Model } from '@/prisma/prisma.types';
import { SubjectsService } from '@/subjects/subjects.service';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<'Session'>,
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async create({ date, groupId, subjectData, type }: CreateSessionData): Promise<Session> {
    this.logger.debug({ message: 'Attempting to create session' });
    const subject = await this.resolveSubject(subjectData);

    // If the subject is not yet associated with the group, check it exists then append it
    let group: Group | null = null;
    if (groupId && !subject.groupIds.includes(groupId)) {
      group = await this.groupsService.findById(groupId);
      await this.subjectsService.updateById(subject.id, { groupIds: { push: group.id } });
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

  /** Get the subject if they exist, otherwise create them */
  private async resolveSubject(subjectData: CreateSubjectData) {
    this.logger.debug({ message: 'Attempting to resolve subject', subjectData });
    let subject: SubjectModel;
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
