import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from './auth.types';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

import { CryptoService } from '@/crypto/crypto.service';
import { User } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  /** Validate the provided credentials and return the JWTs if valid, otherwise throw appropriate HTTP error */
  async login({ username, password }: LoginCredentialsDto): Promise<AuthTokensDto> {
    const user = await this.getUser(username);

    const isAuth = await this.cryptoService.compare(password, user.password);
    if (!isAuth) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = await this.getTokens(user);
    return tokens;
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

  /** Generates the JWTs encoding the username and role */
  private async getTokens({ username }: Pick<User, 'username'>): Promise<AuthTokensDto> {
    const payload: JwtPayload = { username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.configService.getOrThrow<string>('SECRET_KEY')
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '1d',
        secret: this.configService.getOrThrow<string>('SECRET_KEY')
      })
    ]);
    return { accessToken, refreshToken };
  }
}
