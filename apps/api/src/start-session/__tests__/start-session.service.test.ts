import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { $StartSessionData } from '@opendatacapture/schemas/session';
import { beforeEach, describe, expect, it } from 'vitest';

import { createAppAbility } from '@/auth/ability.utils';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { StartSessionService } from '../start-session.service';

const ability = createAppAbility([
  { action: 'create', subject: 'Session' },
  { action: 'create', subject: 'InstrumentRecord' }
]);

const sessionDate = new Date('2026-01-01T09:00:00.000Z');

const session = { date: sessionDate, id: 'session-1', subjectId: 'subject-1' };

const details: $StartSessionData = {
  date: sessionDate,
  groupId: 'group-1',
  subjectData: { id: 'subject-1' },
  type: 'IN_PERSON'
};

const answers = { data: { score: 1 }, instrumentId: 'form-1' };

const group = (sessionInstrumentId: null | string) => ({
  id: 'group-1',
  name: 'Group One',
  settings: { sessionInstrumentId }
});

describe('StartSessionService', () => {
  let groupsService: MockedInstance<GroupsService>;
  let instrumentRecordsService: MockedInstance<InstrumentRecordsService>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let sessionsService: MockedInstance<SessionsService>;
  let startSessionService: StartSessionService;
  let subjectsService: MockedInstance<SubjectsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StartSessionService,
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(InstrumentRecordsService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(SubjectsService)
      ]
    }).compile();
    groupsService = moduleRef.get(GroupsService);
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    instrumentsService = moduleRef.get(InstrumentsService);
    sessionsService = moduleRef.get(SessionsService);
    startSessionService = moduleRef.get(StartSessionService);
    subjectsService = moduleRef.get(SubjectsService);
    sessionsService.create.mockResolvedValue(session);
    instrumentsService.findById.mockResolvedValue({ id: 'form-1', kind: 'FORM' });
  });

  describe('in a group requiring no session instrument', () => {
    beforeEach(() => {
      groupsService.findById.mockResolvedValue(group(null));
    });

    it("should create the session within the caller's ability", async () => {
      await expect(startSessionService.start(details, ability)).resolves.toBe(session);
      expect(groupsService.findById).toHaveBeenCalledWith('group-1', { ability });
      expect(sessionsService.create).toHaveBeenCalledWith(details, { ability });
    });

    it('should refuse answers to a session instrument rather than drop them, so a misconfigured client is noticed', async () => {
      await expect(
        startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability)
      ).rejects.toThrow(UnprocessableEntityException);
      expect(sessionsService.create).not.toHaveBeenCalled();
    });
  });

  describe('outside any group', () => {
    it('should create the session without looking up a group', async () => {
      await startSessionService.start({ ...details, groupId: null }, ability);
      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(sessionsService.create).toHaveBeenCalledWith({ ...details, groupId: null }, { ability });
    });

    it('should refuse answers to a session instrument, since no group requires one', async () => {
      await expect(
        startSessionService.start({ ...details, groupId: null, sessionInstrumentAnswers: answers }, ability)
      ).rejects.toThrow(UnprocessableEntityException);
      expect(sessionsService.create).not.toHaveBeenCalled();
    });
  });

  describe('in a group requiring a session instrument', () => {
    beforeEach(() => {
      groupsService.findById.mockResolvedValue(group('form-1'));
    });

    it('should refuse to start a session without the answers', async () => {
      await expect(startSessionService.start(details, ability)).rejects.toThrow(UnprocessableEntityException);
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should refuse answers to any instrument but the one the group requires', async () => {
      await expect(
        startSessionService.start(
          { ...details, sessionInstrumentAnswers: { ...answers, instrumentId: 'form-2' } },
          ability
        )
      ).rejects.toThrow(UnprocessableEntityException);
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should refuse a caller who may not create records, since the session would bring one with it', async () => {
      const sessionOnly = createAppAbility([{ action: 'create', subject: 'Session' }]);
      await expect(
        startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, sessionOnly)
      ).rejects.toThrow(ForbiddenException);
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should refuse a session instrument that is not a form', async () => {
      instrumentsService.findById.mockResolvedValueOnce({ id: 'form-1', kind: 'INTERACTIVE' });
      await expect(
        startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability)
      ).rejects.toThrow(UnprocessableEntityException);
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it('should refuse answers the instrument rejects before creating anything, so no subject is left behind', async () => {
      const rejection = new UnprocessableEntityException('invalid');
      instrumentRecordsService.parseData.mockImplementationOnce(() => {
        throw rejection;
      });
      await expect(startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability)).rejects.toBe(
        rejection
      );
      expect(sessionsService.create).not.toHaveBeenCalled();
    });

    it("should look the instrument up within the caller's ability and the session's group", async () => {
      await startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability);
      expect(instrumentsService.findById).toHaveBeenCalledWith('form-1', { ability }, ['group-1']);
    });

    it('should create the record of the answers in the new session, dated as the session is', async () => {
      await expect(startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability)).resolves.toBe(
        session
      );
      expect(sessionsService.create).toHaveBeenCalledWith(details, { ability });
      expect(instrumentRecordsService.create).toHaveBeenCalledWith(
        {
          data: answers.data,
          date: sessionDate,
          groupId: 'group-1',
          instrumentId: 'form-1',
          sessionId: 'session-1',
          subjectId: 'subject-1'
        },
        { ability }
      );
    });

    it('should delete the session and the subject it created when its record cannot be created, so none is kept', async () => {
      const failure = new Error('write failed');
      subjectsService.exists.mockResolvedValueOnce(false);
      instrumentRecordsService.create.mockRejectedValueOnce(failure);
      await expect(startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability)).rejects.toBe(
        failure
      );
      expect(sessionsService.deleteById).toHaveBeenCalledWith('session-1');
      expect(subjectsService.deleteById).toHaveBeenCalledWith('subject-1');
    });

    it('should keep a subject that existed before the session when its record cannot be created', async () => {
      const failure = new Error('write failed');
      subjectsService.exists.mockResolvedValueOnce(true);
      instrumentRecordsService.create.mockRejectedValueOnce(failure);
      await expect(startSessionService.start({ ...details, sessionInstrumentAnswers: answers }, ability)).rejects.toBe(
        failure
      );
      expect(sessionsService.deleteById).toHaveBeenCalledWith('session-1');
      expect(subjectsService.deleteById).not.toHaveBeenCalled();
    });
  });
});
