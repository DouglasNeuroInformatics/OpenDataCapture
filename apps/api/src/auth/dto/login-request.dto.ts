/* eslint-disable perfectionist/sort-classes */
/* eslint-disable perfectionist/sort-objects */

import { ValidationSchema } from '@douglasneuroinformatics/nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import type { LoginCredentials } from '@open-data-capture/types';
import { z } from 'zod';

@ValidationSchema(
  z.object({
    username: z.string(),
    password: z.string()
  })
)
export class LoginRequestDto implements LoginCredentials {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
