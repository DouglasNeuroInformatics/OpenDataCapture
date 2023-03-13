import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@/app.module';
import { DemoService } from '@/demo/demo.service';
import { JwtService } from '@nestjs/jwt';

let app: NestExpressApplication;
let demoService: DemoService;
let server: any;

const jwtService = new JwtService({
  secret: process.env['SECRET_KEY'],
  signOptions: { expiresIn: '15m' }
});

const admin = Object.freeze({
  username: 'admin',
  password: 'Password123',
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
  server = app.getHttpServer();
});

beforeEach(async () => {
  await demoService.initDemo({ defaultAdmin: admin });
});

afterAll(async () => {
  await app.close();
});

export { admin, app, server };
