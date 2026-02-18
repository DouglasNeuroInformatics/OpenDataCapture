import { CryptoService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { $LoginCredentials, TokenPayload } from '@opendatacapture/schemas/auth';
import type { Group, User } from '@prisma/client';

import { AuditLogger } from '@/audit/audit.logger';
import { UsersService } from '@/users/users.service';

import { AbilityFactory } from './ability.factory';

@Injectable()
export class AuthService {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly auditLogger: AuditLogger,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async getCreateInstrumentToken(currentUser: RequestUser) {
    if (!currentUser.ability.can('create', 'Instrument')) {
      throw new ForbiddenException();
    }

    const limitedAbility = this.abilityFactory.createForPermissions([{ action: 'create', subject: 'Instrument' }]);

    return {
      accessToken: await this.jwtService.signAsync({ permissions: limitedAbility.rules }, { expiresIn: '1h' })
    };
  }

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
      id: user.id,
      lastName: user.lastName,
      username: user.username
    };

    const ability = this.abilityFactory.createForPayload(tokenPayload);

    const accessToken = await this.jwtService.signAsync(
      { ...tokenPayload, permissions: ability.rules },
      { expiresIn: '1h' }
    );

    await this.auditLogger.log('LOGIN', 'USER', {
      groupId: null,
      userId: user.id
    });

    return { accessToken };
  }
}
