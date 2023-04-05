/**
import { HttpServer } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';

import { Request, Response } from 'express';

import { AppModule } from '@/app.module';
import { DemoService } from '@/demo/demo.service';

type AppServer = HttpServer<Request, Response>;

let app: NestExpressApplication;
let demoService: DemoService;
let server: AppServer;

const jwtService = new JwtService({
  secret: process.env['SECRET_KEY'],
  signOptions: { expiresIn: '15m' }
});

const admin = Object.freeze({
  username: 'admin',
  password: 'password',
  get accessToken() {
    return jwtService.sign({ username: this.username });
  }
});

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleFixture.createNestApplication({
    logger: false
  });
  await app.init();

  demoService = moduleFixture.get(DemoService);
  server = app.getHttpServer() as AppServer;
});

beforeEach(async () => {
  await demoService.initDemo();
});

afterAll(async () => {
  await app.close();
});

export { admin, app, server };
*/