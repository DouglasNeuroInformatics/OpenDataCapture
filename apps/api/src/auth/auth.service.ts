import { ConfigService, CryptoService } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { $LoginCredentials, AuthPayload, TokenPayload, TokenRenewal } from '@opendatacapture/schemas/auth';
import type { Group, PermissionSet, User } from '@prisma/client';

import { AuditLogger } from '@/audit/audit.logger';
import { UsersService } from '@/users/users.service';

import { AbilityFactory } from './ability.factory';

const MINUTE = 60_000;

const HOUR = 60 * MINUTE;

type TokenHolder = Pick<
  User,
  | 'additionalPermissions'
  | 'basePermissionLevel'
  | 'firstName'
  | 'id'
  | 'lastName'
  | 'mustResetPassword'
  | 'tokenGenerationId'
  | 'username'
> & {
  groups: Group[];
  permissionSet: null | PermissionSet;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly auditLogger: AuditLogger,
    private readonly configService: ConfigService,
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
        // Cut short where the sign-in that mints it ends, or a login token renewed up to that moment
        // could still run code here for an hour past it. The end is worked out again rather than read
        // off the token, as `refresh` does, so a limit lowered since the token was signed applies.
        {
          expiresIn: this.lifetimeInSeconds(
            HOUR,
            currentUser.renewal ? this.signInEnd(currentUser.renewal.authenticatedAt) : Infinity,
            Date.now()
          )
        }
      )
    };
  }

  async login(
    credentials: $LoginCredentials,
    { isInteractive }: Pick<TokenRenewal, 'isInteractive'>
  ): Promise<AuthPayload> {
    let user: Awaited<ReturnType<UsersService['findByUsername']>>;
    try {
      user = await this.usersService.findByUsername(credentials.username, { includeSignInFields: true });
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

    this.assertAccountActive(user);

    const now = Date.now();
    const accessToken = await this.signLoginToken(user, { authenticatedAt: now, isInteractive }, now);

    await this.auditLogger.log('LOGIN', 'USER', {
      groupId: null,
      userId: user.id
    });

    return { accessToken };
  }

  async refresh(currentUser: RequestUser): Promise<AuthPayload> {
    // A token signed before renewal existed has no record of when its password was entered. Taking
    // its `iat` instead would restart the absolute limit at every renewal.
    const { renewal } = currentUser;
    if (!renewal) {
      throw new UnauthorizedException('Token Not Renewable');
    }

    let user: Awaited<ReturnType<UsersService['findTokenHolder']>>;
    try {
      user = await this.usersService.findTokenHolder(currentUser.id);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new UnauthorizedException('Token Not Renewable');
      }
      throw err;
    }

    // Ahead of the generation check, which both of these states also fail, so that the holder is told why.
    this.assertAccountActive(user);

    const now = Date.now();
    if (user.tokenGenerationId !== renewal.generationId || now >= this.signInEnd(renewal.authenticatedAt)) {
      throw new UnauthorizedException('Token Not Renewable');
    }

    return { accessToken: await this.signLoginToken(user, renewal, now) };
  }

  private assertAccountActive(user: Pick<User, 'archivedAt' | 'disabled'>): void {
    if (user.archivedAt) {
      throw new ForbiddenException('Account Archived');
    }
    if (user.disabled) {
      throw new ForbiddenException('Account Disabled');
    }
  }

  /** Whole seconds a token signed at `now` lives: its usual lifetime, cut short where its sign-in ends first. */
  private lifetimeInSeconds(lifetime: number, signInEnd: number, now: number): number {
    return Math.floor(Math.max(0, Math.min(lifetime, signInEnd - now)) / 1000);
  }

  private signInEnd(authenticatedAt: number): number {
    return authenticatedAt + this.configService.get('AUTH_ABSOLUTE_TIMEOUT_HOURS') * HOUR;
  }

  /** The one place a login token is built, so a renewed token cannot differ from one signed at login. */
  private async signLoginToken(
    user: TokenHolder,
    { authenticatedAt, isInteractive }: Pick<TokenRenewal, 'authenticatedAt' | 'isInteractive'>,
    now: number
  ): Promise<string> {
    // An archived group grants its members nothing: every group rule `createForPayload` writes,
    // including a permission set's, is derived from `groups`. A grant confined to a group is accepted
    // only for one the user belongs to, so filtering it against the same list drops the grants
    // confined to an archived group.
    const activeGroups = user.groups.filter((group) => !group.archivedAt);
    const activeGroupIds = new Set(activeGroups.map((group) => group.id));

    const endsAt = this.signInEnd(authenticatedAt);

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
      renewal: { authenticatedAt, endsAt, generationId: user.tokenGenerationId, isInteractive },
      username: user.username
    };

    // The set's rules are resolved here rather than carried on the payload: what they grant is signed
    // into `permissions` below, so the token grows only as much as equivalent custom grants would.
    const ability = this.abilityFactory.createForPayload(tokenPayload, user.permissionSet?.rules ?? []);

    const lifetime = isInteractive ? this.configService.get('AUTH_IDLE_TIMEOUT_MINUTES') * MINUTE : HOUR;

    return this.jwtService.signAsync(
      { ...tokenPayload, permissions: ability.rules },
      { expiresIn: this.lifetimeInSeconds(lifetime, endsAt, now) }
    );
  }
}
