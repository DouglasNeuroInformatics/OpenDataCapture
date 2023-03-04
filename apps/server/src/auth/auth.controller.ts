import { Body, Controller, Post, VERSION_NEUTRAL } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Controller({ path: 'auth', version: VERSION_NEUTRAL })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() credentials: LoginCredentialsDto): Promise<any> {
    return this.authService.login(credentials);
  }
}
