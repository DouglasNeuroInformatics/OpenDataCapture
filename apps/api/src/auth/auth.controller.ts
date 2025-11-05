import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { $LoginCredentials } from '@opendatacapture/schemas/auth';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';

import { AuthService } from './auth.service.js';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @RouteAccess('public')
  async login(@Body() credentials: $LoginCredentials): Promise<{ accessToken: string }> {
    return this.authService.login(credentials);
  }
}
