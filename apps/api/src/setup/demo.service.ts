import { faker } from '@faker-js/faker';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { demoGroups, demoUsers } from '@open-data-capture/demo';
import * as instruments from '@open-data-capture/instruments';
import type { Subject } from '@open-data-capture/types';
import mongoose from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { FormsService } from '@/instruments/forms.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

faker.seed(123);

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService,
    private readonly formsService: FormsService,
    private readonly usersService: UsersService
  ) {}

  async init(): Promise<void> {
    this.logger.log(`Initializing demo for database: '${this.connection.name}'`);

    await this.createForms();
    await this.createGroups();
    await this.createUsers();

    for (let i = 0; i < 100; i++) {
      await this.createSubject();
    }
  }

  // private async createFormRecords(): Promise<void> {
  //   for (let i = 0; i < 100; i++) {
  //     const group = await this.groupsService.findByName(randomValue(demoGroups).name, this.ability);
  //     await this.createFormRecords(happinessQuestionnaires[0]!, group.name, createSubjectDto);
  //     await this.createFormRecords(miniMentalStateExaminations[0]!, group.name, createSubjectDto);
  //     await this.createFormRecords(montrealCognitiveAssessments[0]!, group.name, createSubjectDto);
  //     await this.createFormRecords(enhancedDemographicsQuestionnaires[0]!, group.name, createSubjectDto, {
  //       customValues: {
  //         postalCode: 'A1A-1A1'
  //       }
  //     });
  //   }
  // }

  // /** Create form records for translated instruments */
  // private async createFormRecords<T extends FormDataType = FormDataType>(
  //   instrument: FormInstrument<T>,
  //   groupName: string,
  //   subjectInfo: CreateSubjectDto,
  //   options?: {
  //     customValues?: {
  //       [K in keyof T]?: T[K];
  //     };
  //   }
  // ) {
  //   for (let i = 0; i < 5; i++) {
  //     const fields = this.formsService.getFields(instrument);
  //     const data: FormDataType = {};
  //     for (const fieldName in fields) {
  //       const field = fields[fieldName]!;
  //       const customValue = options?.customValues?.[fieldName];
  //       if (customValue) {
  //         data[fieldName] = customValue;
  //         continue;
  //       }
  //       if (typeof field === 'function') {
  //         throw new NotImplementedException();
  //       }
  //       switch (field.kind) {
  //         case 'array':
  //           throw new NotImplementedException();
  //         case 'binary':
  //           data[fieldName] = faker.datatype.boolean();
  //           break;
  //         case 'date':
  //           data[fieldName] = faker.date.past({ years: 1 }).toISOString();
  //           break;
  //         case 'numeric':
  //           data[fieldName] = faker.number.int({ max: field.max, min: field.min });
  //           break;
  //         case 'options':
  //           data[fieldName] = randomValue(Object.keys(field.options));
  //           break;
  //         case 'text':
  //           data[fieldName] = faker.lorem.sentence();
  //           break;
  //       }
  //     }

  //     instrument;

  //     const record = {
  //       data: data,
  //       groupName: groupName,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  //       instrumentName: instrument.name,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  //       instrumentVersion: instrument.version,
  //       kind: 'form',
  //       subjectInfo: subjectInfo,
  //       time: faker.date.recent({ days: i * 30 + 5, refDate: new Date() }).getTime()
  //     } as const;
  //     await this.formRecordsService.create(record, this.ability);
  //   }
  // }

  private async createForms(): Promise<void> {
    await this.formsService.create(instruments.briefPsychiatricRatingScale);
    await this.formsService.create(instruments.enhancedDemographicsQuestionnaire);
    await this.formsService.create(instruments.happinessQuestionnaire);
    await this.formsService.create(instruments.miniMentalStateExamination);
    await this.formsService.create(instruments.montrealCognitiveAssessment);
  }

  private async createGroups(): Promise<void> {
    for (const group of demoGroups) {
      await this.groupsService.create(group);
    }
  }

  private async createSubject(): Promise<Subject> {
    return this.subjectsService.create({
      dateOfBirth: faker.date.birthdate(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      sex: faker.person.sexType()
    });
  }

  private async createUsers(): Promise<void> {
    for (const user of demoUsers) {
      await this.usersService.create(user, { validateAbility: false });
    }
  }
}
