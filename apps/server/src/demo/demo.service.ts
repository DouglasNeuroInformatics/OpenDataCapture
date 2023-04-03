import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { BasePermissionLevel, FormInstrument, Random } from '@ddcp/common';
import {
  BriefPsychiatricRatingScaleData,
  HappinessQuestionnaireData,
  briefPsychiatricRatingScale,
  enhancedDemographicsQuestionnaireEn,
  enhancedDemographicsQuestionnaireFr,
  happinessQuestionnaire
} from '@ddcp/instruments';
import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';

import { CreateGroupDto } from '@/groups/dto/create-group.dto';
import { GroupsService } from '@/groups/groups.service';
import { FormRecordsService } from '@/instruments/services/form-records.service';
import { FormsService } from '@/instruments/services/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';

faker.seed(123);

export interface InitDemoOptions {
  groups: CreateGroupDto[];
  users: CreateUserDto[];
  nSubjects: number;
}

export const defaultDemoOptions = {
  groups: [
    {
      name: 'Depression Clinic'
    },
    {
      name: 'Psychosis Clinic'
    }
  ],
  users: [
    {
      username: 'admin',
      password: 'password',
      basePermissionLevel: BasePermissionLevel.Admin,
      isAdmin: true,
      firstName: 'Admin'
    },
    {
      username: 'JohnSmith',
      password: 'password',
      groupNames: ['Depression Clinic', 'Psychosis Clinic'],
      basePermissionLevel: BasePermissionLevel.Standard
    },
    {
      username: 'JaneDoe',
      password: 'password',
      groupNames: ['Depression Clinic'],
      basePermissionLevel: BasePermissionLevel.GroupManager
    }
  ],
  nSubjects: 100
};

@Injectable()
export class DemoService {
  private readonly demoDbNames = ['development', 'test'];
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
    private readonly formsService: FormsService,
    private readonly formRecordsService: FormRecordsService
  ) {}

  async initDemo({ groups, users, nSubjects }: InitDemoOptions = defaultDemoOptions): Promise<void> {
    this.logger.verbose(`Initializing demo database: '${this.connection.name}'`);
    await this.dropDatabase();

    for (const group of groups) {
      await this.groupsService.create(group);
    }
    for (const user of users) {
      await this.usersService.create(user);
    }
    const bprs = (await this.formsService.create(
      briefPsychiatricRatingScale
    )) as FormInstrument<BriefPsychiatricRatingScaleData>;
    const hq = (await this.formsService.create(happinessQuestionnaire)) as FormInstrument<HappinessQuestionnaireData>;
    await this.formsService.create(enhancedDemographicsQuestionnaireEn);
    await this.formsService.create(enhancedDemographicsQuestionnaireFr);

    for (let i = 0; i < nSubjects; i++) {
      const subject = await this.subjectsService.create({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.birthdate().toISOString(),
        sex: faker.name.sexType()
      });

      const group = await this.groupsService.findOne(Random.value(groups).name);

      for (let j = 0; j < 3; j++) {
        await this.formRecordsService.create({
          kind: 'form',
          dateCollected: faker.date.recent(365),
          instrument: hq,
          group: group,
          subject: subject,
          data: {
            overallHappiness: Random.int(0, 11)
          }
        });
      }

      const fields = Array.isArray(bprs.content) ? bprs.content.map((g) => g.fields).flat() : bprs.content;

      Object.fromEntries(Object.keys(fields).map((field) => [field, '']));
      for (let j = 0; j < 3; j++) {
        await this.formRecordsService.create({
          kind: 'form',
          dateCollected: faker.date.recent(365),
          instrument: bprs,
          group: group,
          subject: subject,
          data: Object.fromEntries(
            Object.keys(fields).map((field) => [field, Random.int(0, 7)])
          ) as BriefPsychiatricRatingScaleData
        });
      }
    }
  }

  private async dropDatabase(): Promise<void> {
    this.logger.verbose('Dropping previous database...');
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }
}
