import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() credentials: LoginCredentialsDto): Promise<any> {
    return this.authService.login(credentials);
  }
}
