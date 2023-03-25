import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { BasePermissionLevel } from '@ddcp/common';
import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { UsersService } from '@/users/users.service';

faker.seed(123);

export interface InitDemoOptions {
  defaultAdmin: {
    username: string;
    password: string;
  };
}

@Injectable()
export class DemoService {
  private readonly demoDbNames = ['development', 'test'];
  private readonly logger = new Logger(DemoService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService
  ) {}

  async initDemo(options: InitDemoOptions): Promise<void> {
    this.logger.verbose(`Initializing demo database: '${this.connection.name}'`);
    await this.dropDatabase();
    await this.createDemoAdmin(options.defaultAdmin);
    // await this.createDemoGroupsWithUsers({ groups: 2, users: 2 });
  }

  private async dropDatabase(): Promise<void> {
    this.logger.verbose('Dropping previous database...');
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }

  private async createDemoAdmin({ username, password }: { username: string; password: string }): Promise<void> {
    this.logger.verbose(`Creating default admin user '${username}' with password '${password}'...`);
    await this.usersService.create({ username, password, basePermissionLevel: BasePermissionLevel.Admin });
  }

  /*

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
