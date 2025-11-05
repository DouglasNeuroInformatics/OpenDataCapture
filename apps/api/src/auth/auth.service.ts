import { CryptoService } from '@douglasneuroinformatics/libnest';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { $LoginCredentials, TokenPayload } from '@opendatacapture/schemas/auth';
import type { Group, User } from '@prisma/client';

import { UsersService } from '@/users/users.service';

import { AbilityFactory } from './ability.factory';

@Injectable()
export class AuthService {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async login(credentials: $LoginCredentials): Promise<{ accessToken: string }> {
    let user: User & {
      groups: Group[];
    };
    try {
      user = await this.usersService.findByUsername(credentials.username, { includeHashedPassword: true });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid Credentials');
      }
      throw err;
    }
    const isCorrectPassword = await this.cryptoService.comparePassword(credentials.password, user.hashedPassword);
    if (isCorrectPassword !== true) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const tokenPayload: Omit<TokenPayload, 'permissions'> = {
      additionalPermissions: user.additionalPermissions,
      basePermissionLevel: user.basePermissionLevel,
      firstName: user.firstName,
      groups: user.groups,
      lastName: user.lastName,
      username: user.username
    };

    const ability = this.abilityFactory.createForPayload(tokenPayload);

    return {
      accessToken: await this.jwtService.signAsync(
        {
          ...tokenPayload,
          permissions: ability.rules
        },
        {
          expiresIn: '1h'
        }
      )
    };
  }
}
