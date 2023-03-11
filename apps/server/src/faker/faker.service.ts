import { Injectable } from '@nestjs/common';

import { faker } from '@faker-js/faker';

import { CreateUserDto } from '@/users/dto/create-user.dto';

faker.seed(123);

@Injectable()
export class FakerService {
  getRandomCreateUserDto(): CreateUserDto {
    return {
      username: faker.internet.userName(),
      password: faker.internet.password()
    };
  }
}
