import { randomValue, toUpperCase } from '@douglasneuroinformatics/libjs';
import { InjectPrismaClient, LoggingService } from '@douglasneuroinformatics/libnest';
import { faker } from '@faker-js/faker';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DEMO_GROUPS, DEMO_USERS } from '@opendatacapture/demo';
import enhancedDemographicsQuestionnaire from '@opendatacapture/instrument-library/forms/DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE.js';
import generalConsentForm from '@opendatacapture/instrument-library/forms/DNP_GENERAL_CONSENT_FORM.js';
import happinessQuestionnaire from '@opendatacapture/instrument-library/forms/DNP_HAPPINESS_QUESTIONNAIRE.js';
import breakoutTask from '@opendatacapture/instrument-library/interactive/DNP_BREAKOUT_TASK.js';
import happinessQuestionnaireWithConsent from '@opendatacapture/instrument-library/series/DNP_HAPPINESS_QUESTIONNAIRE_WITH_CONSENT.js';
import type { FormInstrument } from '@opendatacapture/runtime-core';
import type { Json, Language, WithID } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';

import type { RuntimePrismaClient } from '@/core/prisma';
import { $MongoStats } from '@/core/schemas/mongo-stats.schema';
import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

type HappinessQuestionnaireData = {
  isSatisfiedOverall: boolean;
  personalLifeSatisfaction: number;
  professionalLifeSatisfaction: number;
  reasonNotSatisfied?: string;
};

faker.seed(123);

@Injectable()
export class DemoService {
  constructor(
    @InjectPrismaClient() private readonly prismaClient: RuntimePrismaClient,
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly loggingService: LoggingService,
    private readonly sessionsService: SessionsService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService
  ) {}

  async init({
    dummySubjectCount,
    recordsPerSubject
  }: {
    dummySubjectCount: number;
    recordsPerSubject: number;
  }): Promise<void> {
    try {
      const dbName = await this.getDbName();
      this.loggingService.log(`Initializing demo for database: '${dbName}'`);

      const hq = (await this.instrumentsService.create({ bundle: happinessQuestionnaire })) as WithID<
        FormInstrument<HappinessQuestionnaireData, Language[]>
      >;

      await Promise.all([
        this.instrumentsService.create({ bundle: enhancedDemographicsQuestionnaire }),
        this.instrumentsService.create({ bundle: generalConsentForm })
      ]);

      this.loggingService.debug('Done creating forms');

      await this.instrumentsService.create({ bundle: breakoutTask });
      this.loggingService.debug('Done creating interactive instruments');

      await this.instrumentsService.create({ bundle: happinessQuestionnaireWithConsent });
      this.loggingService.debug('Done creating series instruments');

      const groups: (Group & { dummyIdPrefix?: string })[] = [];
      for (const group of DEMO_GROUPS) {
        const { dummyIdPrefix, ...createGroupData } = group;
        const groupModel = await this.groupsService.create(createGroupData);
        groups.push({ ...groupModel, dummyIdPrefix });
      }
      this.loggingService.debug('Done creating groups');

      for (const user of DEMO_USERS) {
        await this.usersService.create({
          ...user,
          groupIds: user.groupNames.map((name) => groups.find((group) => group.name === name)!.id)
        });
      }
      this.loggingService.debug('Done creating users');

      let researchId = 1;
      for (let i = 0; i < dummySubjectCount; i++) {
        this.loggingService.debug(`Creating dummy subject ${i + 1}/${dummySubjectCount}`);
        const group = randomValue(groups)._unsafeUnwrap();
        const subjectIdData = {
          dateOfBirth: faker.date.birthdate(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          sex: toUpperCase(faker.person.sexType())
        };

        let subjectId: string;
        if (group.settings.defaultIdentificationMethod === 'PERSONAL_INFO') {
          subjectId = await generateSubjectHash(subjectIdData);
        } else {
          subjectId = encodeScopedSubjectId((group.dummyIdPrefix ?? '') + researchId, { groupName: group.name });
          researchId++;
        }

        const date = faker.date.past({ years: 1 });

        const subject = await this.subjectsService.create({
          createdAt: date,
          ...subjectIdData,
          id: subjectId
        });

        const session = await this.sessionsService.create({
          date,
          groupId: group.id,
          subjectData: subject,
          type: 'IN_PERSON'
        });

        for (let i = 0; i < recordsPerSubject; i++) {
          const isSatisfiedOverall = faker.datatype.boolean();
          const [min, max] = isSatisfiedOverall ? [5, 10] : [1, 5];
          const data: HappinessQuestionnaireData = {
            isSatisfiedOverall,
            personalLifeSatisfaction: faker.number.int({ max, min }),
            professionalLifeSatisfaction: faker.number.int({ max, min })
          };
          if (!isSatisfiedOverall) {
            data.reasonNotSatisfied = faker.lorem.sentence();
          }
          await this.instrumentRecordsService.create({
            data: data as Json,
            date,
            groupId: group.id,
            instrumentId: hq.id,
            sessionId: session.id,
            subjectId: subject.id
          });
        }
        this.loggingService.debug(`Done creating dummy subject ${i + 1}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        this.loggingService.error(err.cause);
        this.loggingService.error(err);
      }
      throw err;
    }
  }

  private async getDbName(): Promise<string> {
    const { db } = await this.getDbStats();
    return db;
  }

  private async getDbStats(): Promise<$MongoStats> {
    const commandOutput = await this.prismaClient.$runCommandRaw({ dbStats: 1 });
    const result = await $MongoStats.safeParseAsync(commandOutput);
    if (!result.success) {
      throw new InternalServerErrorException('Raw mongodb command returned unexpected value', {
        cause: result.error
      });
    }
    return result.data;
  }
}
