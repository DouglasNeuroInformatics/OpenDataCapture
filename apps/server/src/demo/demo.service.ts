import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { BasePermissionLevel, Sex } from '@ddcp/common';
import { briefPsychiatricRatingScale, happinessQuestionnaire } from '@ddcp/instruments';
import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';

import { CreateGroupDto } from '@/groups/dto/create-group.dto';
import { GroupsService } from '@/groups/groups.service';
import { FormInstrumentsService } from '@/instruments/services/form-instruments.service';
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
    private readonly formInstrumentsService: FormInstrumentsService
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
    for (let i = 0; i < nSubjects; i++) {
      await this.subjectsService.create({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        dateOfBirth: faker.date.birthdate().toISOString(),
        sex: faker.name.sexType() === 'female' ? Sex.Female : Sex.Male
      });
    }
    await this.formInstrumentsService.create(briefPsychiatricRatingScale);
    await this.formInstrumentsService.create(happinessQuestionnaire);
  }

  private async dropDatabase(): Promise<void> {
    this.logger.verbose('Dropping previous database...');
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }
}
