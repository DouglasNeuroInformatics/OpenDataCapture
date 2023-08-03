import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module.js';

describe('/auth', () => {
  let app: NestExpressApplication;

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication({
      logger: false
    });
    await app.init();
  });

  it('should be defined', () => {
    assert(typeof app === 'object');
  });
});
