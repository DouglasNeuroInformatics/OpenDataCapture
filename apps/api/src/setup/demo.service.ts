import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { createMongoAbility } from '@casl/ability';
import { type FormInstrumentData } from '@douglasneuroinformatics/form-types';
import { randomValue } from '@douglasneuroinformatics/utils';
import { faker } from '@faker-js/faker';
import { demoGroups, demoUsers } from '@open-data-capture/demo';
import * as instruments from '@open-data-capture/instruments';
import type { AppAbility, FormInstrument } from '@open-data-capture/types';
import mongoose from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { FormRecordsService } from '@/instruments/services/form-records.service';
import { FormsService } from '@/instruments/services/forms.service';
import { CreateSubjectDto } from '@/subjects/dto/create-subject.dto';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

faker.seed(123);

@Injectable()
export class DemoService {
  private readonly ability = createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }]);
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly groupsService: GroupsService,
    private readonly subjectsService: SubjectsService,
    private readonly formsService: FormsService,
    private readonly formRecordsService: FormRecordsService,
    private readonly usersService: UsersService
  ) {}

  async init(): Promise<void> {
    this.logger.verbose(`Initializing demo for database: '${this.connection.name}'`);

    for (const group of demoGroups) {
      await this.groupsService.create(group);
    }

    for (const user of demoUsers) {
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
      const group = await this.groupsService.findByName(randomValue(demoGroups).name, this.ability);
      await this.createFormRecords(happinessQuestionnaires[0]!, group.name, createSubjectDto);
      await this.createFormRecords(miniMentalStateExaminations[0]!, group.name, createSubjectDto);
      await this.createFormRecords(montrealCognitiveAssessments[0]!, group.name, createSubjectDto);
      await this.createFormRecords(enhancedDemographicsQuestionnaires[0]!, group.name, createSubjectDto, {
        customValues: {
          postalCode: 'A1A-1A1'
        }
      });
    }
  }

  private getCreateSubjectDto(): CreateSubjectDto {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.birthdate().toISOString(),
      sex: faker.person.sexType()
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
        const field = fields[fieldName]!;
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
            data[fieldName] = faker.date.past({ years: 1 }).toISOString();
            break;
          case 'numeric':
            data[fieldName] = faker.number.int({ min: field.min, max: field.max });
            break;
          case 'options':
            data[fieldName] = randomValue(Object.keys(field.options));
            break;
          case 'text':
            data[fieldName] = faker.lorem.sentence();
            break;
        }
      }

      instrument;

      const record = {
        kind: 'form',
        time: faker.date.recent({ days: i * 30 + 5, refDate: new Date() }).getTime(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        instrumentName: instrument.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        instrumentVersion: instrument.version,
        groupName: groupName,
        subjectInfo: subjectInfo,
        data: data
      } as const;
      await this.formRecordsService.create(record, this.ability);
    }
  }
}
