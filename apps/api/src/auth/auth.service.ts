import { CryptoService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { $LoginCredentials, TokenPayload } from '@opendatacapture/schemas/auth';
import type { Group, PermissionSet, User } from '@prisma/client';

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

  // Scoped to `manage` rather than `create` because that is what `POST /instruments` requires. A
  // narrower token would buy nothing: an uploaded bundle is evaluated server-side, so whoever may
  // create an instrument can already run code here.
  async getCreateInstrumentToken(currentUser: RequestUser) {
    if (!currentUser.ability.can('manage', 'Instrument')) {
      throw new ForbiddenException();
    }

    const limitedAbility = this.abilityFactory.createForPermissions([{ action: 'manage', subject: 'Instrument' }]);

    return {
      accessToken: await this.jwtService.signAsync(
        { kind: 'instrument', permissions: limitedAbility.rules },
        { expiresIn: '1h' }
      )
    };
  }

  async login(credentials: $LoginCredentials): Promise<{ accessToken: string }> {
    let user: User & {
      groups: Group[];
      permissionSet: null | PermissionSet;
    };
    try {
      user = await this.usersService.findByUsername(credentials.username, { includeHashedPassword: true });
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid Credentials');
      }
      throw err;
    }

    // Account status is checked only once the password is proven, so a wrong guess cannot reveal
    // whether a username exists or has been archived.
    const isCorrectPassword = await this.cryptoService.comparePassword(credentials.password, user.hashedPassword);
    if (isCorrectPassword !== true) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (user.archivedAt) {
      throw new ForbiddenException('Account Archived');
    }
    if (user.disabled) {
      throw new ForbiddenException('Account Disabled');
    }

    // An archived group grants its members nothing: every group rule `createForPayload` writes,
    // including a permission set's, is derived from `groups`. A grant confined to a group is accepted
    // only for one the user belongs to, so filtering it against the same list drops the grants
    // confined to an archived group.
    const activeGroups = user.groups.filter((group) => !group.archivedAt);
    const activeGroupIds = new Set(activeGroups.map((group) => group.id));

    const tokenPayload: Omit<TokenPayload, 'permissions'> = {
      additionalPermissions: user.additionalPermissions.filter(
        ({ groupId }) => groupId === null || activeGroupIds.has(groupId)
      ),
      basePermissionLevel: user.basePermissionLevel,
      firstName: user.firstName,
      groups: activeGroups,
      id: user.id,
      kind: 'login',
      lastName: user.lastName,
      mustResetPassword: user.mustResetPassword ?? false,
      username: user.username
    };

    // The set's rules are resolved here rather than carried on the payload: what they grant is signed
    // into `permissions` below, so the token grows only as much as equivalent custom grants would.
    const ability = this.abilityFactory.createForPayload(tokenPayload, user.permissionSet?.rules ?? []);

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
