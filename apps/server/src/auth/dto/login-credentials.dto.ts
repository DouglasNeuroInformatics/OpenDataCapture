import { ApiProperty } from '@nestjs/swagger';

export class LoginCredentialsDto {
  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: 'password' })
  password: string;
}
