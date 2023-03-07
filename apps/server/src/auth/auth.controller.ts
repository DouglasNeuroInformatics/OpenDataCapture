import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() credentials: LoginCredentialsDto): Promise<any> {
    return this.authService.login(credentials);
  }
}
