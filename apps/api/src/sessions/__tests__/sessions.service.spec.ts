import { getModelToken, LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RuntimePrismaClient } from '@/core/prisma';
import { GroupsService } from '@/groups/groups.service';
import { SubjectsService } from '@/subjects/subjects.service';

import { SessionsService } from '../sessions.service';

describe('SessionsService', () => {
  let sessionsService: SessionsService;
  let sessionModel: MockedInstance<Model<'Session'>>;
  let groupsService: MockedInstance<GroupsService>;
  let subjectsService: MockedInstance<SubjectsService>;
  let prismaClient: MockedInstance<RuntimePrismaClient> & { [key: string]: any };

  const entry = (id: string) => ({ date: new Date(), subjectData: { id } });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionsService,
        MockFactory.createForModelToken(getModelToken('Session')),
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(SubjectsService),
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: {
            user: { findFirst: vi.fn() }
          }
        }
      ]
    }).compile();

    sessionsService = moduleRef.get(SessionsService);
    sessionModel = moduleRef.get(getModelToken('Session'));
    groupsService = moduleRef.get(GroupsService);
    subjectsService = moduleRef.get(SubjectsService);
    prismaClient = moduleRef.get(PRISMA_CLIENT_TOKEN);

    subjectsService.createMany.mockResolvedValue([] as any);
    subjectsService.addGroupForSubjects.mockResolvedValue({ count: 0 } as any);
    subjectsService.findByIds.mockResolvedValue([{ groupIds: [], id: 'subject-1' }] as any);
    prismaClient.user.findFirst.mockResolvedValue(null);
    sessionModel.createMany.mockResolvedValue({ count: 1 } as any);
    sessionModel.findMany.mockImplementation(({ where }: any) =>
      Promise.resolve(where.id.in.map((id: string) => ({ id })))
    );
  });

  describe('createMany', () => {
    it('should not touch the database when there are no entries', async () => {
      await expect(sessionsService.createMany({ entries: [], groupId: null, type: 'RETROSPECTIVE' })).resolves.toEqual(
        []
      );
      expect(sessionModel.createMany).not.toHaveBeenCalled();
    });

    // A session whose groupId is unset is invisible to a group manager, whose Session rule is
    // { groupId: { in: [...] } }, and uncounted by every group-scoped query.
    it('should set the groupId on a session for a subject that is already a member of the group', async () => {
      subjectsService.findByIds.mockResolvedValueOnce([{ groupIds: ['group-1'], id: 'subject-1' }] as any);
      groupsService.findById.mockResolvedValueOnce({ id: 'group-1' } as any);

      await sessionsService.createMany({
        entries: [entry('subject-1')],
        groupId: 'group-1',
        type: 'RETROSPECTIVE'
      });

      expect(sessionModel.createMany.mock.lastCall?.[0]).toMatchObject({ data: [{ groupId: 'group-1' }] });
    });

    it('should associate the batch with the group in a single write', async () => {
      subjectsService.findByIds.mockResolvedValueOnce([
        { groupIds: ['group-1'], id: 'subject-1' },
        { groupIds: [], id: 'subject-2' }
      ] as any);
      groupsService.findById.mockResolvedValueOnce({ id: 'group-1' } as any);

      await sessionsService.createMany({
        entries: [entry('subject-1'), entry('subject-2')],
        groupId: 'group-1',
        type: 'RETROSPECTIVE'
      });

      // Every subject is handed over; which of them actually need the write is decided by the query
      // `SubjectsService` builds, not by a membership list read here.
      expect(subjectsService.addGroupForSubjects).toHaveBeenCalledExactlyOnceWith(
        ['subject-1', 'subject-2'],
        'group-1'
      );
    });

    it('should not associate anything when no group was supplied', async () => {
      await sessionsService.createMany({ entries: [entry('subject-1')], groupId: null, type: 'RETROSPECTIVE' });

      expect(groupsService.findById).not.toHaveBeenCalled();
      expect(subjectsService.addGroupForSubjects).not.toHaveBeenCalled();
    });

    it('should return the sessions in the order the entries were given, so callers can pair by index', async () => {
      subjectsService.findByIds.mockResolvedValueOnce([
        { groupIds: [], id: 'subject-a' },
        { groupIds: [], id: 'subject-b' }
      ] as any);
      // The read-back is a findMany, which is free to return documents in any order.
      sessionModel.findMany.mockImplementationOnce(({ where }: any) =>
        Promise.resolve([...where.id.in].reverse().map((id: string) => ({ id })))
      );

      const sessions = await sessionsService.createMany({
        entries: [entry('subject-a'), entry('subject-b')],
        groupId: null,
        type: 'RETROSPECTIVE'
      });

      const [call] = sessionModel.createMany.mock.lastCall as [{ data: { id: string; subjectId: string }[] }];
      expect(sessions.map((session) => session.id)).toStrictEqual(call.data.map((session) => session.id));
      expect(call.data.map((session) => session.subjectId)).toStrictEqual(['subject-a', 'subject-b']);
    });

    it('should create every session in one call rather than one call per entry', async () => {
      const entries = Array.from({ length: 20 }, (_, i) => entry(`subject-${i}`));
      subjectsService.findByIds.mockResolvedValueOnce(
        entries.map((_, i) => ({ groupIds: [], id: `subject-${i}` })) as any
      );

      await sessionsService.createMany({ entries, groupId: null, type: 'RETROSPECTIVE' });

      expect(sessionModel.createMany).toHaveBeenCalledOnce();
      expect(sessionModel.createMany.mock.lastCall?.[0].data).toHaveLength(20);
    });

    it('should resolve the user once for the whole batch and stamp it on every session', async () => {
      const entries = [entry('subject-a'), entry('subject-b')];
      subjectsService.findByIds.mockResolvedValueOnce([
        { groupIds: [], id: 'subject-a' },
        { groupIds: [], id: 'subject-b' }
      ] as any);
      prismaClient.user.findFirst.mockResolvedValueOnce({ id: 'user-1', username: 'someone' });

      await sessionsService.createMany({ entries, groupId: null, type: 'RETROSPECTIVE', username: 'someone' });

      expect(prismaClient.user.findFirst).toHaveBeenCalledOnce();
      expect(sessionModel.createMany.mock.lastCall?.[0]).toMatchObject({
        data: [{ userId: 'user-1' }, { userId: 'user-1' }]
      });
    });
  });

  describe('create', () => {
    it('should return the single session created for the entry', async () => {
      groupsService.findById.mockResolvedValueOnce({ id: 'group-1' } as any);

      const session = await sessionsService.create({
        date: new Date(),
        groupId: 'group-1',
        subjectData: { id: 'subject-1' },
        type: 'IN_PERSON'
      });

      expect(sessionModel.createMany.mock.lastCall?.[0]).toMatchObject({
        data: [{ groupId: 'group-1', subjectId: 'subject-1', type: 'IN_PERSON' }]
      });
      expect(session.id).toBe(sessionModel.createMany.mock.lastCall?.[0].data[0].id);
    });
  });
});
