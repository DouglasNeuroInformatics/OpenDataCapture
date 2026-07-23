import { CurrentUser } from '@douglasneuroinformatics/libnest';
import type { RequestUser } from '@douglasneuroinformatics/libnest';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { MailLanguage } from '@opendatacapture/schemas/mail';
import { $SelfUpdateUserData } from '@opendatacapture/schemas/user';

import type { AppAbility } from '@/auth/auth.types';
import { RouteAccess } from '@/core/decorators/route-access.decorator';
import { GroupsService } from '@/groups/groups.service';
import { MailService } from '@/mail/mail.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller({ path: 'users' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
    private readonly mailService: MailService
  ) {}

  @ApiOperation({ summary: 'Get User by Username' })
  @Get('/check-username/:username')
  @RouteAccess({ action: 'read', subject: 'User' })
  checkUsernameExists(@Param('username') username: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.checkUsernameExists(username, { ability });
  }

  @ApiOperation({ summary: 'Create User' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'User' })
  async create(
    @Body() user: CreateUserDto,
    @CurrentUser('ability') ability: AppAbility,
    @Headers('origin') origin?: string,
    @Query('language') language?: MailLanguage
  ) {
    const created = await this.usersService.create(user, { ability });
    // Attempt to send the welcome email. The result is always returned (even when
    // mail is disabled or the user has no email) so the client can fall back to a
    // copy-pasteable message; the client ignores it entirely when mail is off.
    const welcomeEmail = await this.mailService.sendNewUserEmail({
      email: user.email,
      firstName: user.firstName,
      group: await this.resolveGroupNames(user.groupIds, ability),
      language: language === 'fr' ? 'fr' : 'en',
      lastName: user.lastName,
      password: user.password,
      url: origin ? `${origin}/auth/login` : '',
      username: user.username
    });
    return { ...created, welcomeEmail };
  }

  @ApiOperation({ summary: 'Delete User' })
  @Delete(':id')
  @RouteAccess({ action: 'delete', subject: 'User' })
  deleteById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.deleteById(id, { ability });
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'User' })
  find(@CurrentUser('ability') ability: AppAbility, @Query('groupId') groupId?: string) {
    return this.usersService.find({ groupId }, { ability });
  }

  @ApiOperation({ summary: 'Get User' })
  @Get(':id')
  @RouteAccess({ action: 'read', subject: 'User' })
  findById(@Param('id') id: string, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.findById(id, { ability });
  }

  @ApiOperation({ summary: 'Update User' })
  @Patch(':id')
  @RouteAccess({ action: 'update', subject: 'User' })
  updateById(@Param('id') id: string, @Body() update: UpdateUserDto, @CurrentUser('ability') ability: AppAbility) {
    return this.usersService.updateById(id, update, { ability });
  }

  @ApiOperation({ summary: 'Self Update User' })
  @Patch('/self-update/:id')
  // This is an exception to our regular API pattern. It is handled in the user service.
  @RouteAccess({ action: 'read', subject: 'User' })
  updateSelfById(
    @Param('id') id: string,
    @Body() update: $SelfUpdateUserData,
    @CurrentUser() currentUser: RequestUser
  ) {
    return this.usersService.updateSelfById(id, update, currentUser);
  }

  /** Resolve accessible group names for the welcome-email `{{group}}` variable. */
  private async resolveGroupNames(groupIds: string[], ability: AppAbility): Promise<string> {
    if (!groupIds.length) {
      return '';
    }
    const groups = await Promise.all(
      groupIds.map((id) => this.groupsService.findById(id, { ability }).catch(() => null))
    );
    return groups
      .filter((group): group is NonNullable<typeof group> => group !== null)
      .map((group) => group.name)
      .join(', ');
  }
}
