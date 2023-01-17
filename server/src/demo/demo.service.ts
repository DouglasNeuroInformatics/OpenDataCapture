import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DatabaseService } from '@/database/database.service';
import { InstrumentDto } from '@/instruments/dto/instrument.dto';
import { InstrumentsService } from '@/instruments/instruments.service';
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

  isDemo(): boolean {
    return this.configService.getOrThrow('NODE_ENV') === 'demo';
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.isDemo()) {
      console.log('Init Demo...');
      await this.databaseService.purgeDb();
      await this.createInstruments();
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
      await this.instrumentsService.create(JSON.parse(instrument) as InstrumentDto);
    }
  }

  private async createUsers(): Promise<void> {
    await this.usersService.create({
      username: 'admin',
      password: 'password',
      role: 'admin'
    });
  }
}
