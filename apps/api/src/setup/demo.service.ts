import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { randomValue } from '@douglasneuroinformatics/utils';
import { faker } from '@faker-js/faker';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type {
  FormInstrument,
  FormInstrumentFields,
  FormInstrumentStaticField,
  FormInstrumentUnknownField
} from '@open-data-capture/common/instrument';
import type { Subject } from '@open-data-capture/common/subject';
import { demoGroups, demoUsers } from '@open-data-capture/demo';
import { importInstrumentSource } from '@open-data-capture/instruments/macros' with { type: 'macro' }
import mongoose from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { InstrumentRecordsService } from '@/instrument-records/instrument-records.service';
import { InstrumentsService } from '@/instruments/instruments.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';
import { VisitsService } from '@/visits/visits.service';

const BPRS_SOURCE = importInstrumentSource('forms/brief-psychiatric-rating-scale');
const EDQ_SOURCE = importInstrumentSource('forms/enhanced-demographics-questionnaire');
const HQ_SOURCE = importInstrumentSource('forms/happiness-questionnaire');
const MMSE_SOURCE = importInstrumentSource('forms/mini-mental-state-examination');
const MOCA_SOURCE = importInstrumentSource('forms/montreal-cognitive-assessment');

faker.seed(123);

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly groupsService: GroupsService,
    private readonly instrumentRecordsService: InstrumentRecordsService,
    private readonly instrumentsService: InstrumentsService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
    private readonly visitsService: VisitsService
  ) {}

  async init(): Promise<void> {
    this.logger.log(`Initializing demo for database: '${this.connection.name}'`);

    const forms = await this.createForms();
    await this.createGroups();
    await this.createUsers();

    for (let i = 0; i < 100; i++) {
      const group = await this.groupsService.findByName(randomValue(demoGroups).name);
      const subject = await this.createSubject();
      await this.visitsService.create({
        date: new Date(),
        groupId: group._id.toString(),
        subjectIdData: subject as Required<typeof subject>
      })
      for (const form of forms) {
        for (let i = 0; i < 10; i++) {
          const data = this.createFormRecordData(
            form,
            form.name === 'EnhancedDemographicsQuestionnaire'
              ? {
                  customValues: {
                    postalCode: 'A1A-1A1'
                  }
                }
              : undefined
          );
          await this.instrumentRecordsService.create({
            data,
            date: faker.date.past({ years: 2 }),
            groupId: group.id as string,
            instrumentId: form.id!,
            subjectIdentifier: subject.identifier
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

  private async createForms() {
    return [
      await this.instrumentsService.create({ source: BPRS_SOURCE }),
      await this.instrumentsService.create({ source: EDQ_SOURCE }),
      await this.instrumentsService.create({ source: HQ_SOURCE }),
      await this.instrumentsService.create({ source: MMSE_SOURCE }),
      await this.instrumentsService.create({ source: MOCA_SOURCE })
    ] as unknown as FormInstrument[];
  }

  private async createGroups(): Promise<void> {
    for (const group of demoGroups) {
      await this.groupsService.create(group);
    }
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
      await this.usersService.create(user);
    }
  }
}
