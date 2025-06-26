import { AuthModule, getModelToken } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import { Module } from '@nestjs/common';
import { $LoginCredentials } from '@opendatacapture/schemas/auth';

@Module({
  imports: [
    AuthModule.forRootAsync({
      inject: [getModelToken('User')],
      useFactory: (userModel: Model<'User'>) => {
        return {
          defineAbility: (ability, payload, metadata) => {
            const groupIds = payload.groups.map((group) => group.id);
            switch (payload.basePermissionLevel) {
              case 'ADMIN':
                ability.can('manage', 'all');
                break;
              case 'GROUP_MANAGER':
                ability.can('manage', 'Assignment', { groupId: { in: groupIds } });
                ability.can('manage', 'Group', { id: { in: groupIds } });
                ability.can('read', 'Instrument');
                ability.can('create', 'InstrumentRecord');
                ability.can('read', 'InstrumentRecord', { groupId: { in: groupIds } });
                ability.can('create', 'Session');
                ability.can('read', 'Session', { groupId: { in: groupIds } });
                ability.can('create', 'Subject');
                ability.can('read', 'Subject', { groupIds: { hasSome: groupIds } });
                ability.can('read', 'User', { groupIds: { hasSome: groupIds } });
                break;
              case 'STANDARD':
                ability.can('read', 'Group', { id: { in: groupIds } });
                ability.can('read', 'Instrument');
                ability.can('create', 'InstrumentRecord');
                ability.can('read', 'Session', { groupId: { in: groupIds } });
                ability.can('create', 'Session');
                ability.can('create', 'Subject');
                ability.can('read', 'Subject', { groupIds: { hasSome: groupIds } });
                break;
            }
            metadata.additionalPermissions?.forEach(({ action, subject }) => {
              ability.can(action, subject);
            });
          },
          schemas: {
            loginCredentials: $LoginCredentials
          },
          userQuery: async ({ username }) => {
            const user = await userModel.findFirst({
              include: { groups: true },
              where: { username }
            });
            if (!user) {
              return null;
            }
            return {
              hashedPassword: user.hashedPassword,
              metadata: {
                additionalPermissions: user.additionalPermissions
              },
              tokenPayload: {
                basePermissionLevel: user.basePermissionLevel,
                firstName: user.firstName,
                groups: user.groups,
                lastName: user.lastName,
                username: user.username
              }
            };
          }
        };
      }
    })
  ]
})
export class ConfiguredAuthModule {}
