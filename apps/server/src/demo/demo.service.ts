import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { Connection } from 'mongoose';

import { UsersService } from '@/users/users.service';

@Injectable()
export class DemoService {
  private readonly demoDbNames = ['development', 'test'];

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly usersService: UsersService
  ) {}

  async initDemo(): Promise<void> {
    await this.dropDatabase();
  }

  private async dropDatabase(): Promise<void> {
    if (!this.demoDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.dropDatabase();
  }
}
