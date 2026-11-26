import { ApiOperation, CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { $LoginCredentials, INTERACTIVE_SIGN_IN_HEADER } from '@opendatacapture/schemas/auth';
import type { AuthPayload } from '@opendatacapture/schemas/auth';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';
import { ThrottleLoginRequest } from '@/core/decorators/throttle-login-request.decorator.js';
import { ThrottleRefreshRequest } from '@/core/decorators/throttle-refresh-request.decorator.js';

import { AuthService } from './auth.service.js';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('create-instrument-token')
  @HttpCode(HttpStatus.OK)
  @RouteAccess({ action: 'manage', subject: 'Instrument' })
  @ThrottleLoginRequest()
  async getCreateInstrumentToken(@CurrentUser() currentUser: RequestUser): Promise<AuthPayload> {
    return this.authService.getCreateInstrumentToken(currentUser);
  }

  @ApiOperation({
    description: `The token lasts one hour. Sent with the header \`${INTERACTIVE_SIGN_IN_HEADER}: true\`, as the web app does, it instead lasts the instance's idle limit and has to be renewed through \`POST /auth/refresh\` while its holder is working.`,
    summary: 'Login'
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @RouteAccess('public')
  @ThrottleLoginRequest()
  async login(
    @Body() credentials: $LoginCredentials,
    // Optional rather than `string | undefined`, which reflects as `Object` and documents as `{}`.
    @Headers(INTERACTIVE_SIGN_IN_HEADER) interactiveSignInHeader?: string
  ): Promise<AuthPayload> {
    return this.authService.login(credentials, { isInteractive: interactiveSignInHeader === 'true' });
  }

  @ApiOperation({
    description:
      'Exchanges a login token that has not expired for a new one, with permissions read afresh. Refused once the absolute limit has passed since the password was entered, or once the account has been disabled, archived or given a new password.',
    summary: 'Refresh Access Token'
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  // Any login token. Which of them may be renewed is not a permission, so the service decides it.
  @RouteAccess([])
  @ThrottleRefreshRequest()
  async refresh(@CurrentUser() currentUser: RequestUser): Promise<AuthPayload> {
    return this.authService.refresh(currentUser);
  }
}
