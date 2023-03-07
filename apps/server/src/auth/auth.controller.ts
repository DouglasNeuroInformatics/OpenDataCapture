import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@ApiTags('Authentication')
@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Request a JSON Web Token from the server', summary: 'Login' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: LoginCredentialsDto): Promise<AuthTokensDto> {
    return this.authService.login(credentials);
  }
}
