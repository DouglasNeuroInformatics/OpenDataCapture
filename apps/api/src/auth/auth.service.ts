import { CryptoService } from '@douglasneuroinformatics/nestjs/modules';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthPayload, JwtPayload } from '@open-data-capture/types';

import { AbilityFactory } from '@/ability/ability.factory';
import { type UserDocument } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

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

  /** Validates the provided credentials and returns an access token */
  async login(username: string, password: string): Promise<AuthPayload> {
    const user = await this.getUser(username);
    await user.populate('groups', 'name');

    const isAuth = await this.cryptoService.comparePassword(password, user.password);
    if (!isAuth) {
      throw new UnauthorizedException('Invalid password');
    }

    const ability = this.abilityFactory.createForUser(user);

    const payload: JwtPayload = {
      firstName: user.firstName,
      groups: user.groups,
      lastName: user.lastName,
      permissions: ability.rules,
      username: user.username
    };

    const accessToken = await this.signToken(payload);

    return { accessToken };
  }
}
