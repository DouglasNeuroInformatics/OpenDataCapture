import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';

import { CreateGroupDto } from '@/groups/dto/create-group.dto';
import { GroupsService } from '@/groups/groups.service';
import { Sex } from '@ddcp/common';
import { SubjectsService } from '@/subjects/subjects.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';

faker.seed(123);

export interface InitDemoOptions {
  groups: CreateGroupDto[];
  users: CreateUserDto[];
  nSubjects: number;
}

@Injectable()
export class DemoService {
  private readonly demoDbNames = ['development', 'test'];
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly subjectsService: SubjectsService
  ) {}

  async initDemo({ groups, users, nSubjects }: InitDemoOptions): Promise<void> {
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
  }

  private async dropDatabase(): Promise<void> {
    this.logger.verbose('Dropping previous database...');
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }

  /*



  private async createDemoGroups(groupNames: string[]): Promise<void> {
    for (const name of groupNames) {
      await this.groupsService.create({ name });
    }
  }


  private async createDemoGroupsWithUsers(n: { groups: number; users: number }): Promise<void> {
    for (let i = 0; i < n.groups; i++) {
      const name = faker.company.name();
      await this.groupsService.create({ name });
      for (let j = 0; j < n.users; j++) {
        await this.usersService.create({
          username: faker.internet.userName(),
          password: faker.internet.password(),
          groupNames: [name]
        });
      }
    }
  }
  */
}
