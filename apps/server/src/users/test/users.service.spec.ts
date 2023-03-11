import { GroupsService } from '@/groups/groups.service';
import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users.repository';
import { UsersService } from '../users.service';

const MockUsersRepository = createMock<UsersRepository>({
  exists: () => Promise.resolve(false)
});

const MockGroupsService = createMock<GroupsService>();

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: MockUsersRepository
        },
        {
          provide: GroupsService,
          useValue: MockGroupsService
        }
      ]
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });
});
