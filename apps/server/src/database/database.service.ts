import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { Connection } from 'mongoose';

import { FakerService } from '@/faker/faker.service';

@Injectable()
export class DatabaseService {
  private purgeableDbNames = ['development', 'test'];

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly fakerService: FakerService
  ) {}

  getDbHandle(): Connection {
    return this.connection;
  }

  async dropDatabase(): Promise<boolean> {
    if (!this.purgeableDbNames.includes(this.connection.name)) {
      throw new Error(`Unexpected database name: ${this.connection.name}`);
    }
    return this.connection.db.dropDatabase();
  }

  /** Purge the current database and  */
  async initDemoDb(): Promise<void> {
    await this.dropDatabase();
    console.log(this.fakerService.getRandomCreateUserDto());
  }
}
