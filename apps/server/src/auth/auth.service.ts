import { Injectable, Logger } from '@nestjs/common';

import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  login(credentials: LoginCredentialsDto): Promise<AuthTokensDto> {
    return Promise.resolve({ accessToken: '', refreshToken: '' });
  }
}
