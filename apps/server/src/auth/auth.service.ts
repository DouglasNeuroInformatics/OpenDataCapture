import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import bcrypt from 'bcrypt';

import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

import { User } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  /** Validate the provided credentials and return the JWTs if valid, otherwise throw appropriate HTTP error */
  async login({ username, password }: LoginCredentialsDto): Promise<AuthTokensDto> {
    const user = await this.getUser(username);
    await this.validatePassword(user, password);
    return Promise.resolve({ accessToken: '', refreshToken: '' });
  }

  /** Wraps UserService.getByUsername with appropriate exception handling */
  private async getUser(username: string): Promise<User> {
    let user: User;
    try {
      user = await this.usersService.findByUsername(username);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid username');
      }
      throw new InternalServerErrorException('Internal Server Error', {
        cause: error instanceof Error ? error : undefined
      });
    }
    return user;
  }

  /** Throws if the provided plain-text password does not correspond to the hash in the db */
  private async validatePassword(user: User, password: string): Promise<void> {
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      throw new UnauthorizedException('Invalid password');
    }
  }
}
