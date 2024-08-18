import { randomValue } from '@douglasneuroinformatics/libjs';
import { toUpperCase } from '@douglasneuroinformatics/libjs';
import { faker } from '@faker-js/faker';
import { Injectable, Logger } from '@nestjs/common';
import { DEMO_GROUPS, DEMO_USERS } from '@opendatacapture/demo';
import enhancedDemographicsQuestionnaire from '@opendatacapture/instrument-library/forms/enhanced-demographics-questionnaire.js';
import generalConsentForm from '@opendatacapture/instrument-library/forms/general-consent-form.js';
import happinessQuestionnaire from '@opendatacapture/instrument-library/forms/happiness-questionnaire.js';
import patientHealthQuestionnaire9 from '@opendatacapture/instrument-library/forms/patient-health-questionnaire-9.js';
import breakoutTask from '@opendatacapture/instrument-library/interactive/breakout-task.js';
import happinessQuestionnaireWithConsent from '@opendatacapture/instrument-library/series/happiness-questionnaire-with-consent.js';
import type { FormInstrument } from '@opendatacapture/runtime-core';
import { type Json, type Language, type WithID } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { encodeScopedSubjectId, generateSubjectHash } from '@opendatacapture/subject-utils';

import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { PrismaService } from '@/prisma/prisma.service';
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
  private readonly logger = new Logger(DemoService.name);

  constructor(
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly prismaService: PrismaService,
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
      const dbName = await this.prismaService.getDbName();
      this.logger.log(`Initializing demo for database: '${dbName}'`);

      const hq = (await this.instrumentsService.create({ bundle: happinessQuestionnaire })) as WithID<
        FormInstrument<HappinessQuestionnaireData, Language[]>
      >;

      await Promise.all([
        this.instrumentsService.create({ bundle: enhancedDemographicsQuestionnaire }),
        this.instrumentsService.create({ bundle: generalConsentForm }),
        this.instrumentsService.create({ bundle: patientHealthQuestionnaire9 })
      ]);

      this.logger.debug('Done creating forms');

      await this.instrumentsService.create({ bundle: breakoutTask });
      this.logger.debug('Done creating interactive instruments');

      await this.instrumentsService.create({ bundle: happinessQuestionnaireWithConsent });
      this.logger.debug('Done creating series instruments');

      const groups: Group[] = [];
      for (const group of DEMO_GROUPS) {
        groups.push(await this.groupsService.create(group));
      }
      this.logger.debug('Done creating groups');

      for (const user of DEMO_USERS) {
        await this.usersService.create({
          ...user,
          groupIds: user.groupNames.map((name) => groups.find((group) => group.name === name)!.id)
        });
      }
      this.logger.debug('Done creating users');

      let researchId = 1;
      for (let i = 0; i < dummySubjectCount; i++) {
        this.logger.debug(`Creating dummy subject ${i + 1}/${dummySubjectCount}`);
        const group = randomValue(groups)!;
        const subjectIdData = {
          dateOfBirth: faker.date.birthdate(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          sex: toUpperCase(faker.person.sexType())
        };

        let subjectId: string;
        if (group.type === 'CLINICAL') {
          subjectId = await generateSubjectHash(subjectIdData);
        } else {
          subjectId = encodeScopedSubjectId(researchId, { groupName: group.name });
          researchId++;
        }

        const subject = await this.subjectsService.create({
          ...subjectIdData,
          id: subjectId
        });

        const session = await this.sessionsService.create({
          date: new Date(),
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
            date: faker.date.past({ years: 2 }),
            groupId: group.id,
            instrumentId: hq.id,
            sessionId: session.id,
            subjectId: subject.id
          });
        }
        this.logger.debug(`Done creating dummy subject ${i + 1}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(err.cause);
        this.logger.error(err);
      }
      throw err;
    }
  }
}
