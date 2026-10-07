import { LoggingService, PRISMA_CLIENT_TOKEN } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { faker } from '@faker-js/faker';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DEMO_GROUPS, DEMO_USERS } from '@opendatacapture/demo';
import type { $CreateGroupData } from '@opendatacapture/schemas/group';
import { $Sex } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

import { DemoService } from '../demo.service';

// Each bundle stands in as its own name, so a test can tell which instrument was registered.
vi.mock('@opendatacapture/instrument-library/file/ARBITRARY_SINGLE_FILE.js', () => ({
  default: 'ARBITRARY_SINGLE_FILE'
}));
vi.mock('@opendatacapture/instrument-library/file/MRI_SCAN_SESSION.js', () => ({ default: 'MRI_SCAN_SESSION' }));
vi.mock('@opendatacapture/instrument-library/forms/DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE.js', () => ({
  default: 'DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE'
}));
vi.mock('@opendatacapture/instrument-library/forms/DNP_GENERAL_CONSENT_FORM.js', () => ({
  default: 'DNP_GENERAL_CONSENT_FORM'
}));
vi.mock('@opendatacapture/instrument-library/forms/DNP_HAPPINESS_QUESTIONNAIRE.js', () => ({
  default: 'DNP_HAPPINESS_QUESTIONNAIRE'
}));
vi.mock('@opendatacapture/instrument-library/interactive/DNP_BREAKOUT_TASK.js', () => ({
  default: 'DNP_BREAKOUT_TASK'
}));
vi.mock('@opendatacapture/instrument-library/series/DNP_HAPPINESS_QUESTIONNAIRE_REPEATED.js', () => ({
  default: 'DNP_HAPPINESS_QUESTIONNAIRE_REPEATED'
}));
vi.mock('@opendatacapture/instrument-library/series/DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT.js', () => ({
  default: 'DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT'
}));

const DB_STATS = { collections: 0, db: 'data-capture-test', objects: 0 };

/** `randomValue` picks from the created groups with `Math.random`; these pin it to the first or last. */
const FIRST_GROUP = 0;
const LAST_GROUP = 0.99;

describe('DemoService', () => {
  let demoService: DemoService;
  let prismaClient: { $runCommandRaw: ReturnType<typeof vi.fn> };
  let groupsService: MockedInstance<GroupsService>;
  let instrumentRecordsService: MockedInstance<InstrumentRecordsService>;
  let instrumentsService: MockedInstance<InstrumentsService>;
  let loggingService: MockedInstance<LoggingService>;
  let sessionsService: MockedInstance<SessionsService>;
  let subjectsService: MockedInstance<SubjectsService>;
  let usersService: MockedInstance<UsersService>;

  /** Groups come back as created, falling back to personal-info identification like a real group. */
  const createGroupsIdentifiedBy = (method?: 'CUSTOM_ID') => {
    groupsService.create.mockImplementation((data: $CreateGroupData) =>
      Promise.resolve({
        ...data,
        id: `${data.name}-id`,
        settings: {
          defaultIdentificationMethod: method ?? data.settings?.defaultIdentificationMethod ?? 'PERSONAL_INFO'
        }
      })
    );
  };

  const subjectIds = () => subjectsService.create.mock.calls.map(([subject]) => subject.id);

  beforeEach(async () => {
    prismaClient = { $runCommandRaw: vi.fn().mockResolvedValue(DB_STATS) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        DemoService,
        MockFactory.createForService(GroupsService),
        MockFactory.createForService(InstrumentRecordsService),
        MockFactory.createForService(InstrumentsService),
        MockFactory.createForService(LoggingService),
        MockFactory.createForService(SessionsService),
        MockFactory.createForService(SubjectsService),
        MockFactory.createForService(UsersService),
        { provide: PRISMA_CLIENT_TOKEN, useValue: prismaClient }
      ]
    }).compile();
    demoService = moduleRef.get(DemoService);
    groupsService = moduleRef.get(GroupsService);
    instrumentRecordsService = moduleRef.get(InstrumentRecordsService);
    instrumentsService = moduleRef.get(InstrumentsService);
    loggingService = moduleRef.get(LoggingService);
    sessionsService = moduleRef.get(SessionsService);
    subjectsService = moduleRef.get(SubjectsService);
    usersService = moduleRef.get(UsersService);

    instrumentsService.create.mockResolvedValue({ id: 'happiness-questionnaire-id' });
    createGroupsIdentifiedBy();
    subjectsService.create.mockImplementation((data) => Promise.resolve(data));
    sessionsService.create.mockResolvedValue({ id: 'session-1' });
    vi.spyOn(Math, 'random').mockReturnValue(FIRST_GROUP);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register every demo instrument, so each kind of instrument can be explored', async () => {
    await demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 });
    expect(instrumentsService.create.mock.calls.map(([{ bundle }]) => bundle).toSorted()).toStrictEqual([
      'ARBITRARY_SINGLE_FILE',
      'DNP_BREAKOUT_TASK',
      'DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE',
      'DNP_GENERAL_CONSENT_FORM',
      'DNP_HAPPINESS_QUESTIONNAIRE',
      'DNP_HAPPINESS_QUESTIONNAIRE_REPEATED',
      'DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT',
      'MRI_SCAN_SESSION'
    ]);
  });

  it('should create every demo group without its dummy id prefix, which is not part of a group', async () => {
    await demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 });
    expect(groupsService.create.mock.calls.map(([group]) => group)).toStrictEqual(
      DEMO_GROUPS.map(({ dummyIdPrefix: _dummyIdPrefix, ...group }) => group)
    );
  });

  it('should add each demo user to the groups named for them', async () => {
    await demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 });
    expect(usersService.create.mock.calls.map(([user]) => [user.username, user.groupIds])).toStrictEqual(
      DEMO_USERS.map(({ groupNames, username }) => [username, groupNames.map((name) => `${name}-id`)])
    );
  });

  it('should name the database it initializes in the log, so an operator can see where the demo was seeded', async () => {
    await demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 });
    expect(loggingService.log).toHaveBeenCalledWith("Initializing demo for database: 'data-capture-test'");
  });

  it('should identify a dummy subject in a personal-info group by the hash of their personal information', async () => {
    await demoService.init({ dummySubjectCount: 1, recordsPerSubject: 0 });
    const [subject] = subjectsService.create.mock.lastCall ?? [];
    const { dateOfBirth, firstName, lastName, sex } = subject;
    expect(subject.id).toBe(await generateSubjectHash({ dateOfBirth, firstName, lastName, sex }));
  });

  it('should draw dummy subjects from every sex the subject schema accepts and no other', async () => {
    await demoService.init({ dummySubjectCount: 20, recordsPerSubject: 0 });
    const sexes = subjectsService.create.mock.calls.map(([subject]) => subject.sex);
    expect(new Set(sexes)).toStrictEqual(new Set($Sex.options));
  });

  it('should number dummy subjects in a custom-id group in sequence under the group prefix', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(LAST_GROUP);
    await demoService.init({ dummySubjectCount: 2, recordsPerSubject: 0 });
    expect(subjectIds()).toStrictEqual([
      encodeScopedSubjectId('ex_1', { groupName: 'Psychosis Lab' }),
      encodeScopedSubjectId('ex_2', { groupName: 'Psychosis Lab' })
    ]);
  });

  it('should number dummy subjects without a prefix in a custom-id group that defines none', async () => {
    createGroupsIdentifiedBy('CUSTOM_ID');
    await demoService.init({ dummySubjectCount: 1, recordsPerSubject: 0 });
    expect(subjectIds()).toStrictEqual([encodeScopedSubjectId('1', { groupName: 'Depression Clinic' })]);
  });

  it('should open an in-person session for each dummy subject in its group', async () => {
    await demoService.init({ dummySubjectCount: 1, recordsPerSubject: 0 });
    expect(sessionsService.create.mock.lastCall?.[0]).toMatchObject({
      groupId: 'Depression Clinic-id',
      subjectData: subjectsService.create.mock.lastCall?.[0],
      type: 'IN_PERSON'
    });
  });

  it('should record the requested number of happiness questionnaires for each subject in its session', async () => {
    await demoService.init({ dummySubjectCount: 2, recordsPerSubject: 3 });
    expect(instrumentRecordsService.create).toHaveBeenCalledTimes(6);
    expect(instrumentRecordsService.create.mock.lastCall?.[0]).toMatchObject({
      groupId: 'Depression Clinic-id',
      instrumentId: 'happiness-questionnaire-id',
      sessionId: 'session-1'
    });
  });

  it('should rate a satisfied respondent highly and record no reason for dissatisfaction', async () => {
    vi.spyOn(faker.datatype, 'boolean').mockReturnValue(true);
    await demoService.init({ dummySubjectCount: 1, recordsPerSubject: 1 });
    const { data } = instrumentRecordsService.create.mock.lastCall?.[0] ?? {};
    expect(data).not.toHaveProperty('reasonNotSatisfied');
    expect(Math.min(data.personalLifeSatisfaction, data.professionalLifeSatisfaction)).toBeGreaterThanOrEqual(5);
  });

  it('should rate a dissatisfied respondent low and record their reason', async () => {
    vi.spyOn(faker.datatype, 'boolean').mockReturnValue(false);
    await demoService.init({ dummySubjectCount: 1, recordsPerSubject: 1 });
    const { data } = instrumentRecordsService.create.mock.lastCall?.[0] ?? {};
    expect(data.reasonNotSatisfied).toEqual(expect.any(String));
    expect(Math.max(data.personalLifeSatisfaction, data.professionalLifeSatisfaction)).toBeLessThanOrEqual(5);
  });

  it('should refuse to seed anything when the database reports unexpected stats', async () => {
    prismaClient.$runCommandRaw.mockResolvedValueOnce({ ok: 1 });
    await expect(demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 })).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
    expect(instrumentsService.create).not.toHaveBeenCalled();
  });

  it('should log a failure and its cause before rethrowing it, so a failed seed can be diagnosed', async () => {
    const failure = new Error('bundle rejected', { cause: 'invalid bundle' });
    instrumentsService.create.mockRejectedValueOnce(failure);
    await expect(demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 })).rejects.toBe(failure);
    expect(loggingService.error.mock.calls).toStrictEqual([['invalid bundle'], [failure]]);
  });

  it('should rethrow a thrown value that is not an error without logging it', async () => {
    instrumentsService.create.mockRejectedValueOnce('bundle rejected');
    await expect(demoService.init({ dummySubjectCount: 0, recordsPerSubject: 0 })).rejects.toBe('bundle rejected');
    expect(loggingService.error).not.toHaveBeenCalled();
  });
});
