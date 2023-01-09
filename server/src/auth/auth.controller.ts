import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { JwtPayload } from 'common';

import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { RequestUser } from './decorators/request-user.decorator';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    description: 'Request a JSON Web Token from the server',
    summary: 'Login'
  })
  @ApiOkResponse({
    description: 'Successfully authenticated the user',
    type: AuthTokensDto
  })
  @ApiForbiddenResponse({
    description: 'Failed to authenticate the user'
  })
  @Auth({ isPublic: true })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: LoginCredentialsDto): Promise<AuthTokensDto> {
    return this.authService.login(credentials);
  }

  @ApiOperation({
    description: 'Invalidate refresh token for user. ',
    summary: 'Logout'
  })
  @ApiOkResponse({
    description: 'Successfully invalided refresh token'
  })
  @ApiUnauthorizedResponse({
    description: 'Failed to invalidate refresh token'
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@RequestUser('username') username: string): Promise<void> {
    // console.log(username);
    return this.authService.logout(username);
  }

  @ApiOperation({
    description: 'Request a new access token from the server',
    summary: 'Refresh'
  })
  @ApiOkResponse({
    description: 'Success fully refreshed access token',
    type: AuthTokensDto
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @RequestUser('refreshToken') username: string,
    @RequestUser('refreshToken') refreshToken: string
  ): Promise<AuthTokensDto> {
    return this.authService.refresh(username, refreshToken);
  }
}
