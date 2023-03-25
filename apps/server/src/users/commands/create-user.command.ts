import { BasePermissionLevel } from '@ddcp/common';
import { Command, CommandRunner, Option } from 'nest-commander';

import { UsersService } from '../users.service';

type CommandArgs = [string, string];

interface CommandOptions {
  basePermissionLevel?: BasePermissionLevel;
  firstName?: string;
  lastName?: string;
}

@Command({ arguments: '<username> <password>', name: 'create-user', description: 'add a new user to the database' })
export class CreateUserCommand extends CommandRunner {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async run([username, password]: CommandArgs, options: CommandOptions): Promise<void> {
    const user = await this.usersService.create({
      username,
      password,
      ...options
    });
    console.log(`Successfully created user: ${user.username}`);
  }

  @Option({
    flags: '--basePermissionLevel <string>',
    required: false,
    choices: Object.values(BasePermissionLevel)
  })
  parseBasePermissionLevel(value?: unknown): BasePermissionLevel | undefined {
    if (value === undefined || Object.values(BasePermissionLevel).includes(value as BasePermissionLevel)) {
      return value as BasePermissionLevel | undefined;
    }
    throw new Error('Invalid option: ' + value);
  }

  @Option({ flags: '--firstName <string>', required: false })
  parseFirstName(value?: string): string | undefined {
    return value;
  }

  @Option({ flags: '--lastName <string>', required: false })
  parseLastName(value?: string): string | undefined {
    return value;
  }
}
