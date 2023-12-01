import { Injectable, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@open-data-capture/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
