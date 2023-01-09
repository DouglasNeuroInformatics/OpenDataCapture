import { IsNotEmpty, IsString } from 'class-validator';
import { LoginCredentials } from 'common';

export class LoginCredentialsDto implements LoginCredentials {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
