import { randomValue } from '@douglasneuroinformatics/libjs';
import { toUpperCase } from '@douglasneuroinformatics/libjs';
import type { FormDataType } from '@douglasneuroinformatics/libui-form-types';
import { faker } from '@faker-js/faker';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { DEMO_GROUPS, DEMO_USERS } from '@opendatacapture/demo';
import briefPsychiatricRatingScale from '@opendatacapture/instrument-library/forms/brief-psychiatric-rating-scale.js';
import enhancedDemographicsQuestionnaire from '@opendatacapture/instrument-library/forms/enhanced-demographics-questionnaire.js';
import happinessQuestionnaire from '@opendatacapture/instrument-library/forms/happiness-questionnaire.js';
import miniMentalStateExamination from '@opendatacapture/instrument-library/forms/mini-mental-state-examination.js';
import montrealCognitiveAssessment from '@opendatacapture/instrument-library/forms/montreal-cognitive-assessment.js';
import emotionRecognitionTask from '@opendatacapture/instrument-library/interactive/emotion-recognition-task.js';
import matrixReasoningTask from '@opendatacapture/instrument-library/interactive/matrix-reasoning-task.js';
import { type Json } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import type {
  FormInstrument,
  FormInstrumentFields,
  FormInstrumentStaticField,
  FormInstrumentUnknownField
} from '@opendatacapture/schemas/instrument';
import type { Subject, SubjectIdentificationData } from '@opendatacapture/schemas/subject';

import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SessionsService } from '@/sessions/sessions.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

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

  async init({ dummySubjectCount }: { dummySubjectCount: number }): Promise<void> {
    try {
      const dbName = await this.prismaService.getDbName();
      this.logger.log(`Initializing demo for database: '${dbName}'`);

      const forms = await Promise.all([
        this.instrumentsService.createFromBundle(briefPsychiatricRatingScale),
        this.instrumentsService.createFromBundle(enhancedDemographicsQuestionnaire),
        this.instrumentsService.createFromBundle(happinessQuestionnaire),
        this.instrumentsService.createFromBundle(miniMentalStateExamination),
        this.instrumentsService.createFromBundle(montrealCognitiveAssessment)
      ]);

      this.logger.debug('Done creating forms');

      await this.instrumentsService.createFromBundle(emotionRecognitionTask);
      await this.instrumentsService.createFromBundle(matrixReasoningTask);
      this.logger.debug('Done creating interactive instruments');

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

      for (let i = 0; i < dummySubjectCount; i++) {
        this.logger.debug(`Creating dummy subject ${i + 1}/${dummySubjectCount}`);
        const group = randomValue(groups);
        const subject = await this.createSubject();
        await this.sessionsService.create({
          date: new Date(),
          groupId: group.id,
          subjectIdData: subject,
          type: 'IN_PERSON'
        });
        for (const form of forms) {
          this.logger.debug(`Creating dummy records for form ${form.name}`);
          for (let i = 0; i < 10; i++) {
            const data = this.createFormRecordData(
              await form.toInstance({ kind: 'FORM' }),
              form.name === 'EnhancedDemographicsQuestionnaire'
                ? {
                    customValues: {
                      postalCode: 'A1A-1A1'
                    }
                  }
                : undefined
            );
            await this.instrumentRecordsService.create({
              data: data as Json,
              date: faker.date.past({ years: 2 }),
              groupId: group.id,
              instrumentId: form.id,
              subjectId: subject.id
            });
          }
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

  private createFormRecordData<TData extends FormDataType>(
    form: FormInstrument<TData>,
    options?: {
      customValues?: {
        [K in keyof TData]?: TData[K];
      };
    }
  ) {
    let fields: FormInstrumentFields<TData>;
    if (!Array.isArray(form.content)) {
      fields = form.content;
    } else {
      fields = form.content.reduce((prev, current) => {
        return { ...prev, ...current.fields };
      }, form.content[0].fields) as FormInstrumentFields<TData>;
    }

    const data: Partial<TData> = {};
    for (const fieldName in fields) {
      const field = fields[fieldName] as FormInstrumentUnknownField<TData>;
      const customValue = options?.customValues?.[fieldName];
      if (customValue) {
        data[fieldName] = customValue;
        continue;
      } else if (field.kind === 'dynamic') {
        const staticField = field.render({});
        if (!staticField) {
          continue;
        }
        data[fieldName] = this.createMockStaticFieldValue(staticField) as TData[typeof fieldName];
      } else {
        data[fieldName] = this.createMockStaticFieldValue(field) as TData[typeof fieldName];
      }
    }
    return data as TData;
  }

  private createMockStaticFieldValue(field: FormInstrumentStaticField) {
    switch (field.kind) {
      case 'record-array':
        throw new NotImplementedException();
      case 'number-record':
        throw new NotImplementedException();
      case 'boolean':
        return faker.datatype.boolean();
      case 'date':
        return faker.date.past({ years: 1 }).toISOString();
      case 'number':
        switch (field.variant) {
          case 'radio':
            throw new NotImplementedException();
          case 'select':
            throw new NotImplementedException();
          default:
            return faker.number.int({ max: field.max ?? 0, min: field.min });
        }
      case 'set':
        return typeof field.options.en === 'string'
          ? randomValue(Object.keys(field.options))
          : randomValue(Object.keys(field.options.en));
      case 'string':
        return faker.lorem.sentence();
    }
  }

  private async createSubject() {
    return this.subjectsService.create({
      dateOfBirth: faker.date.birthdate(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      sex: toUpperCase(faker.person.sexType())
    }) as Promise<Subject & SubjectIdentificationData>;
  }
}
