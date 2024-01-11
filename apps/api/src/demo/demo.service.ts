import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { randomValue } from '@douglasneuroinformatics/utils';
import { faker } from '@faker-js/faker';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { type Json, toUpperCase } from '@open-data-capture/common/core';
import type { Group } from '@open-data-capture/common/group';
import type {
  FormInstrument,
  FormInstrumentFields,
  FormInstrumentStaticField,
  FormInstrumentUnknownField
} from '@open-data-capture/common/instrument';
import type { Subject, SubjectIdentificationData } from '@open-data-capture/common/subject';
import { DEMO_GROUPS, DEMO_USERS } from '@open-data-capture/demo';
import { BPRS_SOURCE, EDQ_SOURCE, HQ_SOURCE, MMSE_SOURCE, MOCA_SOURCE } from '@open-data-capture/instruments';

import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';
import { VisitsService } from '@/visits/visits.service';

faker.seed(123);

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly prismaService: PrismaService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
    private readonly visitsService: VisitsService
  ) {}

  async init(): Promise<void> {
    const dbName = await this.prismaService.getDbName();
    this.logger.log(`Initializing demo for database: '${dbName}'`);

    const forms = await Promise.all([
      this.instrumentsService.create({ kind: 'FORM', source: BPRS_SOURCE }),
      this.instrumentsService.create({ kind: 'FORM', source: EDQ_SOURCE }),
      this.instrumentsService.create({ kind: 'FORM', source: HQ_SOURCE }),
      this.instrumentsService.create({ kind: 'FORM', source: MMSE_SOURCE }),
      this.instrumentsService.create({ kind: 'FORM', source: MOCA_SOURCE })
    ]);

    const groups: Group[] = [];
    for (const group of DEMO_GROUPS) {
      groups.push(await this.groupsService.create(group));
    }

    for (const user of DEMO_USERS) {
      await this.usersService.create({
        ...user,
        groupIds: user.groupNames.map((name) => groups.find((group) => group.name === name)!.id)
      });
    }

    for (let i = 0; i < 100; i++) {
      const group = randomValue(groups);
      const subject = await this.createSubject();
      await this.visitsService.create({
        date: new Date(),
        groupId: group.id,
        subjectIdData: subject
      });
      for (const form of forms) {
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
            instrumentId: form.id!,
            subjectId: subject.id
          });
        }
      }
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
      }, form.content[0]!.fields) as FormInstrumentFields<TData>;
    }

    const data: Partial<TData> = {};
    for (const fieldName in fields) {
      const field = fields[fieldName] as FormInstrumentUnknownField<TData>;
      const customValue = options?.customValues?.[fieldName];
      if (customValue) {
        data[fieldName] = customValue;
        continue;
      } else if (field.kind === 'dynamic') {
        const staticField = field.render(null);
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
      case 'array':
        throw new NotImplementedException();
      case 'binary':
        return faker.datatype.boolean();
      case 'date':
        return faker.date.past({ years: 1 }).toISOString();
      case 'numeric':
        return faker.number.int({ max: field.max, min: field.min });
      case 'options':
        return typeof field.options.en === 'string'
          ? randomValue(Object.keys(field.options))
          : randomValue(Object.keys(field.options.en));
      case 'text':
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
