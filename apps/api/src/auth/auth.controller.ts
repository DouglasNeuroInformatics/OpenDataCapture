import { CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { $LoginCredentials } from '@opendatacapture/schemas/auth';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';

import { AuthService } from './auth.service.js';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('create-instrument-token')
  @HttpCode(HttpStatus.OK)
  @RouteAccess({ action: 'create', subject: 'Instrument' })
  async getCreateInstrumentToken(@CurrentUser() currentUser: RequestUser): Promise<{ accessToken: string }> {
    return this.authService.getCreateInstrumentToken(currentUser);
  }

  @ApiOperation({ summary: 'Login' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @RouteAccess('public')
  async login(@Body() credentials: $LoginCredentials): Promise<{ accessToken: string }> {
    return this.authService.login(credentials);
  }
}
