import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Random, sexOptions } from 'common';

import { DatabaseService } from '@/database/database.service';
import { FormInstrumentDto } from '@/instruments/dto/form-instrument.dto';
import { InstrumentsService } from '@/instruments/instruments.service';
import { FormInstrument } from '@/instruments/schemas/form-instrument.schema';
import { ResourcesService } from '@/resources/resources.service';
import { SubjectsService } from '@/subjects/subjects.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class DemoService implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly instrumentsService: InstrumentsService,
    private readonly resourcesService: ResourcesService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService
  ) {}

  get initDb(): boolean {
    return this.isDemo() || (this.configService.get('INIT_DEMO_DB') ?? false);
  }

  isDemo(): boolean {
    return this.configService.getOrThrow('NODE_ENV') === 'demo';
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.initDb) {
      await this.databaseService.purgeDb();
      await this.createInstruments();
      await this.createSubjects();
      await this.createInstrumentRecords();
      await this.createUsers();
    }
  }

  onApplicationShutdown(): void {
    if (this.isDemo()) {
      console.log('Shutdown demo...');
    }
  }

  private async createInstruments(): Promise<void> {
    const instruments = await this.resourcesService.loadAll('instruments');
    for (const instrument of instruments) {
      await this.instrumentsService.createForm(JSON.parse(instrument) as FormInstrumentDto);
    }
  }

  private async createSubjects(): Promise<void> {
    const maleNames = ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph'];
    const femaleNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        for (const sex of sexOptions) {
          await this.subjectsService.create({
            firstName: sex === 'male' ? maleNames[j] : femaleNames[j],
            lastName: lastNames[i],
            dateOfBirth: Random.birthday(),
            sex: sex
          });
        }
      }
    }
  }

  private async createInstrumentRecords(): Promise<void> {
    const lastYear = new Date().getFullYear() - 1;
    const timepoints = Array.from({ length: 12 }, (_, i) => new Date(lastYear, i));
    const subjects = await this.subjectsService.findAll();

    // Fix type
    const instrument = (await this.instrumentsService.getInstrument(
      'The Brief Psychiatric Rating Scale'
    )) as FormInstrument;

    for (const subject of subjects) {
      for (const timepoint of timepoints) {
        const { firstName, lastName, dateOfBirth } = subject;
        await this.instrumentsService.createRecord(instrument.title, {
          dateCollected: timepoint,
          subjectDemographics: {
            firstName: firstName!,
            lastName: lastName!,
            dateOfBirth
          },
          data: Object.fromEntries(
            instrument.data.map((field) => {
              let subtract = 0;
              if (subject.sex === 'male' && Random.int(0, 5) === 0) {
                subtract = Math.max(0, timepoint.getMonth() - 8);
              }
              return [field.name, Math.ceil(Random.int(1, 7) - subtract)];
            })
          )
        });
      }
    }
  }

  private async createUsers(): Promise<void> {
    await this.usersService.create({
      username: 'admin',
      password: 'password',
      role: 'admin'
    });
    await this.usersService.create({
      username: 'user',
      password: 'password',
      role: 'user'
    });
  }
}
