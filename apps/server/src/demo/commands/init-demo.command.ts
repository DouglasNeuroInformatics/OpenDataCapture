import { Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { createMongoAbility } from '@casl/ability';
import {
  AppAbility,
  BasePermissionLevel,
  FormInstrument,
  FormInstrumentData,
  Random
} from '@douglasneuroinformatics/common';
import * as instruments from '@douglasneuroinformatics/instruments';
import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';
import { Command, CommandRunner } from 'nest-commander';

import { CreateGroupDto } from '@/groups/dto/create-group.dto';
import { GroupsService } from '@/groups/groups.service';
import { FormRecordsService } from '@/instruments/services/form-records.service';
import { FormsService } from '@/instruments/services/forms.service';
import { CreateSubjectDto } from '@/subjects/dto/create-subject.dto';
import { SubjectsService } from '@/subjects/subjects.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';

faker.seed(123);

const DEMO_GROUPS: CreateGroupDto[] = [
  {
    name: 'Depression Clinic'
  },
  {
    name: 'Psychosis Clinic'
  }
];

const DEMO_USERS: CreateUserDto[] = [
  {
    username: 'admin',
    password: 'password',
    basePermissionLevel: BasePermissionLevel.Admin,
    isAdmin: true,
    firstName: 'Admin'
  },
  {
    username: 'JohnSmith',
    password: 'Douglas123',
    groupNames: ['Depression Clinic'],
    basePermissionLevel: BasePermissionLevel.GroupManager,
    firstName: 'John',
    lastName: 'Smith'
  },
  {
    username: 'JaneDoe',
    password: 'Douglas123',
    groupNames: ['Psychosis Clinic', 'Depression Clinic'],
    basePermissionLevel: BasePermissionLevel.GroupManager,
    firstName: 'Jane',
    lastName: 'Doe'
  },
  {
    username: 'FrançoisBouchard',
    password: 'Douglas123',
    groupNames: ['Psychosis Clinic'],
    basePermissionLevel: BasePermissionLevel.Standard,
    firstName: 'François',
    lastName: 'Bouchard'
  }
];

@Command({
  name: 'init-demo',
  description: 'initialize a demo database'
})
export class InitDemoCommand extends CommandRunner {
  private readonly ability = createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }]);
  private readonly demoDbNames = ['development', 'demo', 'test', 'production'];
  private readonly logger = new Logger(InitDemoCommand.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService,
    private readonly formsService: FormsService,
    private readonly formRecordsService: FormRecordsService
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.verbose(`Initializing demo database: '${this.connection.name}'`);
    await this.dropDatabase();

    for (const group of DEMO_GROUPS) {
      await this.groupsService.create(group);
    }
    for (const user of DEMO_USERS) {
      await this.usersService.create(user, this.ability);
    }

    const happinessQuestionnaires = await this.formsService.createTranslatedForms(instruments.happinessQuestionnaire);
    const miniMentalStateExaminations = await this.formsService.createTranslatedForms(
      instruments.miniMentalStateExamination
    );
    const montrealCognitiveAssessments = await this.formsService.createTranslatedForms(
      instruments.montrealCognitiveAssessment
    );
    const enhancedDemographicsQuestionnaires = await this.formsService.createTranslatedForms(
      instruments.enhancedDemographicsQuestionnaire
    );

    for (let i = 0; i < 100; i++) {
      const createSubjectDto = this.getCreateSubjectDto();
      await this.subjectsService.create(createSubjectDto);
      const group = await this.groupsService.findByName(Random.value(DEMO_GROUPS).name, this.ability);
      await this.createFormRecords(happinessQuestionnaires[0], group.name, createSubjectDto);
      await this.createFormRecords(miniMentalStateExaminations[0], group.name, createSubjectDto);
      await this.createFormRecords(montrealCognitiveAssessments[0], group.name, createSubjectDto);
      await this.createFormRecords(enhancedDemographicsQuestionnaires[0], group.name, createSubjectDto, {
        customValues: {
          postalCode: 'A1A-1A1'
        }
      });
    }
  }

  private async dropDatabase(): Promise<void> {
    this.logger.verbose('Dropping previous database...');
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }

  private getCreateSubjectDto(): CreateSubjectDto {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      dateOfBirth: faker.date.birthdate().toISOString(),
      sex: faker.name.sexType()
    };
  }

  /** Create form records for translated instruments */
  private async createFormRecords<T extends FormInstrumentData = FormInstrumentData>(
    instrument: FormInstrument<T>,
    groupName: string,
    subjectInfo: CreateSubjectDto,
    options?: {
      customValues?: {
        [K in keyof T]?: T[K];
      };
    }
  ): Promise<any> {
    for (let i = 0; i < 5; i++) {
      const fields = this.formsService.getFields(instrument);
      const data: FormInstrumentData = {};
      for (const fieldName in fields) {
        const field = fields[fieldName];
        const customValue = options?.customValues?.[fieldName];
        if (customValue) {
          data[fieldName] = customValue;
          continue;
        }
        switch (field.kind) {
          case 'array':
            throw new Error('Not supported');
          case 'binary':
            data[fieldName] = faker.datatype.boolean();
            break;
          case 'date':
            data[fieldName] = faker.datatype.datetime().toISOString();
            break;
          case 'numeric':
            data[fieldName] = faker.datatype.number({ min: field.min, max: field.max, precision: 1 });
            break;
          case 'options':
            data[fieldName] = Random.value(Object.keys(field.options));
            break;
          case 'text':
            data[fieldName] = faker.lorem.sentence();
            break;
        }
      }

      const record = {
        kind: 'form',
        dateCollected: faker.date.recent(i * 30 + 5).toISOString(),
        instrumentName: instrument.name,
        instrumentVersion: instrument.version,
        groupName: groupName,
        subjectInfo: subjectInfo,
        data: data
      } as const;
      await this.formRecordsService.create(record, this.ability);
    }
  }
}
