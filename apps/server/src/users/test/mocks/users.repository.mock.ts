import { createMock } from '@golevelup/ts-jest';

import { UsersRepository } from '@/users/users.repository';

export const MockUsersRepository = createMock<UsersRepository>();
