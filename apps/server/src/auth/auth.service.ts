import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from '@/crypto/crypto.service';
import { User } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  /** Validates the provided credentials and returns an access token */
  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.getUser(username);

    const isAuth = await this.cryptoService.comparePassword(password, user.password);
    if (!isAuth) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = await this.signToken({
      username: user.username
    });

    return { accessToken };
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

  private async signToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.getOrThrow<string>('SECRET_KEY')
    });
  }
}
