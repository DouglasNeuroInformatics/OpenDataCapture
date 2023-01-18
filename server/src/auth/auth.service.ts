import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';
import { JwtPayload } from 'common';

import { AuthTokensDto } from './dto/auth-tokens.dto';

import { User } from '@/users/schemas/user.schema';

import { LoginCredentialsDto } from './dto/login-credentials.dto';

import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async login({ username, password }: LoginCredentialsDto): Promise<AuthTokensDto> {
    const user = await this.getUser(username);

    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      throw new ForbiddenException('Invalid login credentials')
    }

    const tokens = await this.getTokens(user);
    await this.updateUserRefreshToken(user.username, tokens.refreshToken);
    return tokens;
  }

  async logout(username: string): Promise<void> {
    const user = await this.getUser(username);
    if (!user.refreshToken) {
      throw new ForbiddenException('User is already logged out');
    }
    await this.usersService.updateUser(username, { refreshToken: undefined }); // change to null later
  }

  async refresh(username: string, refreshToken?: string): Promise<AuthTokensDto> {
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token is undefined');
    }
    const user = await this.getUser(username);
    if (!user.refreshToken) {
      throw new ForbiddenException('User does not possess valid refresh token');
    }
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new ForbiddenException('Failed to validate provided refresh token');
    }
    const tokens = await this.getTokens(user);
    await this.updateUserRefreshToken(user.username, tokens.refreshToken);
    return tokens;
  }

  private async getUser(username: string): Promise<User> {
    let user: User;
    try {
      user = await this.usersService.findUser(username);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException('Failed to find user');
      }
      throw new InternalServerErrorException('Internal Server Error', {
        cause: error instanceof Error ? error : undefined
      });
    }
    return user;
  }

  private async getTokens(user: User): Promise<AuthTokensDto> {
    const payload: JwtPayload = {
      username: user.username,
      role: user.role
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.getOrThrow<string>('SECRET_KEY')
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.getOrThrow<string>('SECRET_KEY')
      })
    ]);
    return { accessToken, refreshToken };
  }

  private async updateUserRefreshToken(username: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);
    await this.usersService.updateUser(username, {
      refreshToken: hashedRefreshToken
    });
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    return bcrypt.hash(refreshToken, await bcrypt.genSalt());
  }
}
