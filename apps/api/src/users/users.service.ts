import { CryptoService, InjectModel } from '@douglasneuroinformatics/libnest';
import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import { estimatePasswordStrength } from '@douglasneuroinformatics/libpasswd';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { $SelfUpdateUserData } from '@opendatacapture/schemas/user';
import type { PasswordErrorCode } from '@opendatacapture/schemas/user';
import { pwnedPassword } from 'hibp';

import { accessibleQuery } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GroupsService } from '@/groups/groups.service';

import { CreateUserDto } from './dto/create-user.dto';

import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<'User'>,
    private readonly cryptoService: CryptoService,
    private readonly groupsService: GroupsService
  ) {}

  async checkUsernameExists(username: string, { ability }: EntityOperationOptions = {}): Promise<{ success: boolean }> {
    const user = await this.userModel.findFirst({
      include: { groups: true },
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'read', 'User'), { username }] }
    });
    if (!user) {
      return { success: false };
    }
    return { success: true };
  }

  async count(
    filter: NonNullable<Parameters<Model<'User'>['count']>[0]>['where'] = {},
    { ability }: EntityOperationOptions = {}
  ) {
    return this.userModel.count({
      where: { AND: [accessibleQuery(ability, 'read', 'User'), filter] }
    });
  }

  /** Adds a new user to the database with default permissions, verifying the provided groups exist */
  async create(
    {
      basePermissionLevel,
      dateOfBirth,
      disabled,
      email,
      firstName,
      groupIds,
      lastName,
      password,
      phoneNumber,
      sex,
      username
    }: CreateUserDto,
    options?: EntityOperationOptions
  ) {
    if (await this.userModel.exists({ username })) {
      throw new ConflictException(`User with username '${username}' already exists!`);
    }

    await this.validatePassword(password, username);

    // Check that all group exist and are accessible to the user
    for (const id of groupIds) {
      const group = await this.groupsService.findById(id, options);
      if (!group) {
        throw new NotFoundException(`Failed to resolve group with ID: ${id}`);
      }
    }

    const hashedPassword = await this.cryptoService.hashPassword(password);

    return this.userModel.create({
      data: {
        additionalPermissions: [],
        basePermissionLevel,
        dateOfBirth,
        disabled,
        email,
        firstName,
        groups: {
          connect: groupIds.map((id) => ({ id }))
        },
        hashedPassword,
        lastName,
        phoneNumber,
        sex,
        username: username
      },
      omit: {
        hashedPassword: true
      }
    });
  }

  async deleteById(id: string, { ability }: EntityOperationOptions = {}) {
    return this.userModel.delete({
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'delete', 'User')], id }
    });
  }

  /** Delete the user with the provided username, otherwise throws */
  async deleteByUsername(username: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.findByUsername(username);
    return this.userModel.delete({
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'delete', 'User')], id: user.id }
    });
  }

  async find({ groupId }: { groupId?: string } = {}, { ability }: EntityOperationOptions = {}) {
    return this.userModel.findMany({
      omit: {
        hashedPassword: true
      },
      where: {
        AND: [accessibleQuery(ability, 'read', 'User'), { groupIds: groupId ? { has: groupId } : undefined }]
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const user = await this.userModel.findFirst({
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'read', 'User')], id }
    });
    if (!user) {
      throw new NotFoundException(`Failed to find user with ID: ${id}`);
    }
    return user;
  }

  async findByUsername(
    username: string,
    { ability, includeHashedPassword }: EntityOperationOptions & { includeHashedPassword?: boolean } = {}
  ) {
    const user = await this.userModel.findFirst({
      include: { groups: true },
      omit: {
        hashedPassword: !includeHashedPassword
      },
      where: { AND: [accessibleQuery(ability, 'read', 'User'), { username }] }
    });
    if (!user) {
      throw new NotFoundException(`Failed to find user with username: ${username}`);
    }
    return user;
  }

  async updateById(
    id: string,
    { groupIds, password, ...data }: UpdateUserDto,
    { ability }: EntityOperationOptions = {}
  ) {
    let hashedPassword: string | undefined;
    if (password) {
      const username = data.username ?? (await this.findById(id, { ability })).username;
      await this.validatePassword(password, username);
      hashedPassword = await this.cryptoService.hashPassword(password);
    }
    return this.userModel.update({
      data: {
        ...data,
        groups: {
          set: groupIds?.map((id) => ({ id }))
        },
        hashedPassword
      },
      omit: {
        hashedPassword: true
      },
      where: { AND: [accessibleQuery(ability, 'update', 'User')], id }
    });
  }

  async updateSelfById(id: string, { password, ...data }: $SelfUpdateUserData, currentUser: RequestUser) {
    if (id !== currentUser.id) {
      throw new ForbiddenException();
    }

    if (password) {
      await this.validatePassword(password, currentUser.username);
    }

    const { dateOfBirth, email, firstName, lastName, phoneNumber, sex } = data;

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await this.cryptoService.hashPassword(password);
    }

    return this.userModel.update({
      data: {
        dateOfBirth,
        email,
        firstName,
        hashedPassword,
        lastName,
        phoneNumber,
        sex
      },
      omit: {
        hashedPassword: true
      },
      where: { id }
    });
  }

  /**
   * Build a `BadRequestException` whose response body carries a machine-readable `code`
   * (in addition to a fallback English `message`) so the web client can localize it.
   */
  private passwordError(code: PasswordErrorCode, message: string): BadRequestException {
    return new BadRequestException({ code, error: 'Bad Request', message, statusCode: 400 });
  }

  /**
   * Enforce the password policy whenever a password is set or changed. Throws a
   * `BadRequestException` if the password is too weak, matches the username, or has
   * appeared in a known data breach. The breach check fails open: if the Have I Been
   * Pwned API is unreachable (e.g. an air-gapped deployment), the password is allowed.
   */
  private async validatePassword(password: string, username: string): Promise<void> {
    if (!estimatePasswordStrength(password).success) {
      throw this.passwordError('INSUFFICIENT_PASSWORD_STRENGTH', 'Insufficient password strength');
    }
    if (password.toLowerCase() === username.toLowerCase()) {
      throw this.passwordError('PASSWORD_MATCHES_USERNAME', 'Password must not be the same as the username');
    }
    let breachCount: number;
    try {
      breachCount = await pwnedPassword(password);
    } catch (err) {
      this.logger.warn('Failed to check password against the Have I Been Pwned API, allowing password', err);
      return;
    }
    if (breachCount > 0) {
      throw this.passwordError(
        'PASSWORD_IN_DATA_BREACH',
        'Password has appeared in a known data breach and cannot be used'
      );
    }
  }
}
