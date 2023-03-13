import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { UsersService } from '@/users/users.service';

faker.seed(123);

@Injectable()
export class DemoService {
  private readonly demoDbNames = ['development', 'test'];

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService
  ) {}

  async initDemo(): Promise<void> {
    await this.dropDatabase();
    await this.createDemoAdmin();
    await this.createDemoGroupsWithUsers({ groups: 2, users: 2 });
  }

  private async dropDatabase(): Promise<void> {
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }

  private async createDemoAdmin(username = 'admin', password = 'password'): Promise<void> {
    await this.usersService.create({ username, password, isAdmin: true });
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
}
