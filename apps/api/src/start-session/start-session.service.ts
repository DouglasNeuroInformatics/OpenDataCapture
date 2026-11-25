import { ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import type { $StartSessionData } from '@opendatacapture/schemas/session';
import type { Session } from '@prisma/client';

import type { AppAbility } from '@/auth/auth.types';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';

/**
 * A session started over HTTP, which is where a group's session instrument is required. The gateway
 * synchronizer, CSV upload and the demo seeder create sessions through `SessionsService` directly, so
 * none of them is asked for one.
 */
@Injectable()
export class StartSessionService {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly sessionsService: SessionsService,
    private readonly subjectsService: SubjectsService
  ) {}

  async start({ sessionInstrumentAnswers, ...data }: $StartSessionData, ability: AppAbility): Promise<Session> {
    const group = data.groupId ? await this.groupsService.findById(data.groupId, { ability }) : null;
    const sessionInstrumentId = group?.settings.sessionInstrumentId;
    if (!group || !sessionInstrumentId) {
      if (sessionInstrumentAnswers) {
        throw new UnprocessableEntityException(
          "Answers to a session instrument were sent, but the session's group requires no session instrument"
        );
      }
      return this.sessionsService.create(data, { ability });
    }
    if (sessionInstrumentAnswers?.instrumentId !== sessionInstrumentId) {
      throw new UnprocessableEntityException(
        `Group '${group.name}' requires its session instrument '${sessionInstrumentId}' to be completed to start a session`
      );
    }
    if (!ability.can('create', 'InstrumentRecord')) {
      throw new ForbiddenException(
        `Starting a session in group '${group.name}' creates a record of its session instrument, which requires permission to create instrument records`
      );
    }

    // Refused before anything is written, so answers the instrument rejects create no subject either.
    const instrument = await this.instrumentsService.findById(sessionInstrumentId, { ability }, [group.id]);
    if (instrument.kind !== 'FORM') {
      throw new UnprocessableEntityException(`Session instrument '${sessionInstrumentId}' is not a form`);
    }
    this.instrumentRecordsService.parseData(instrument, sessionInstrumentAnswers.data);

    const isNewSubject = !(await this.subjectsService.exists(data.subjectData.id));
    const session = await this.sessionsService.create(data, { ability });
    try {
      await this.instrumentRecordsService.create(
        {
          data: sessionInstrumentAnswers.data,
          date: session.date,
          groupId: group.id,
          instrumentId: sessionInstrumentId,
          sessionId: session.id,
          subjectId: session.subjectId
        },
        { ability }
      );
    } catch (err) {
      // Unscoped, as `SessionsService.createMany` rolls back: the caller may create sessions and
      // subjects without being allowed to delete them, and these were created by this request a moment ago.
      await this.sessionsService.deleteById(session.id);
      if (isNewSubject) {
        await this.subjectsService.deleteById(session.subjectId);
      }
      throw err;
    }
    return session;
  }
}
