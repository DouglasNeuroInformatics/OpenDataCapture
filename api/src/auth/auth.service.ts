import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthPayload, JwtPayload } from '@ddcp/types';

import { AbilityFactory } from '@/ability/ability.factory.js';
import { CryptoService } from '@/crypto/crypto.service.js';
import { UserDocument } from '@/users/entities/user.entity.js';
import { UsersService } from '@/users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  /** Validates the provided credentials and returns an access token */
  async login(username: string, password: string, ipAddress?: string): Promise<AuthPayload> {
    const user = await this.getUser(username);
    await user.populate('groups', 'name');

    const isAuth = await this.cryptoService.comparePassword(password, user.password);
    if (!isAuth) {
      throw new UnauthorizedException('Invalid password');
    }

    await user.updateOne({
      sessions: [
        ...user.sessions,
        {
          time: Date.now(),
          ipAddress
        }
      ]
    });

    const ability = this.abilityFactory.createForUser(user);

    const payload: JwtPayload = {
      username: user.username,
      permissions: ability.rules,
      firstName: user.firstName,
      lastName: user.lastName,
      groups: user.groups
    };

    const accessToken = await this.signToken(payload);

    return { accessToken };
  }

  /** Wraps UserService.getByUsername with appropriate exception handling */
  private async getUser(username: string): Promise<UserDocument> {
    let user: UserDocument;
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
      expiresIn: '1d',
      secret: this.configService.getOrThrow<string>('SECRET_KEY')
    });
  }
}
