import { HttpStatus } from '@nestjs/common';

import request from 'supertest';

import { mockAdmin, mockAdminPlainTextPassword, mockUser } from '@/users/test/stubs/user.stubs';

console.log('about to access TestSetup...');

const { app, db, spec, server } = TestSetup;

beforeAll(async () => {
  await db.collection('users').insertMany(structuredClone([mockAdmin, mockUser]));
});

afterAll(async () => {
  if (db.name !== 'testing') {
    throw new Error(`Unexpected database name ${db.name}`);
  }
  await db.dropDatabase();
});

Object.entries(spec.paths).forEach(([path, fields]) => {
  console.log(path, fields.description);
});

for (let i = 0; i < 5; i++) {
  describe(i.toString(), () => {
    it('should be defined', () => {
      expect(i).toBeDefined();
    });
  });
}

/*




sayHello();
*/
/*

test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3]
])('.add(%i, %i)', (a, b, expected) => {
  expect(a + b).toBe(expected);
});

describe.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 1, 3]
])('.add(%i, %i)', (a, b, expected) => {
  test(`returns ${expected}`, () => {
    expect(a + b).toBe(expected);
  });

  test(`returned value not be greater than ${expected}`, () => {
    expect(a + b).not.toBeGreaterThan(expected);
  });

  test(`returned value not be less than ${expected}`, () => {
    expect(a + b).not.toBeLessThan(expected);
  });
});

describe('App (e2e) {Supertest}', () => {
  describe('auth', () => {
    describe('POST /auth/login', () => {
      describe('admin requests authentication with valid credentials', () => {
        let response: any;
        beforeAll(async () => {
          response = await request(server).post('/auth/login').send({
            username: mockAdmin.username,
            password: mockAdminPlainTextPassword
          });
        });

        it('should return status code 200', () => {
          console.log(apiSpec);
          expect(response.status).toBe(HttpStatus.OK);
        });

        it('should provide an access and refresh token', () => {
          expect(response.body).toMatchObject(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String)
            })
          );
        });
      });

      describe('admin requests authentication with extra whitespace in password', () => {
        let response: any;
        beforeAll(async () => {
          response = await request(server)
            .post('/auth/login')
            .send({
              username: mockAdmin.username,
              password: mockAdminPlainTextPassword + ' '
            });
        });

        it('should return status code 401', () => {
          expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });
      });
    });

    describe('POST /auth/logout', () => undefined);
    describe('POST /auth/refresh', () => undefined);
  });
});
*/
