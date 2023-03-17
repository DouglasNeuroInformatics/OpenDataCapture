import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

import { MockUsersService } from './mocks/users.service.mock';

describe('AuthController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: MockUsersService
        }
      ]
    }).compile();

    usersController = module.get(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });
});
