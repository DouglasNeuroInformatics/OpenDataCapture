import { BasePermissionLevel } from '@ddcp/common';
import { Command, CommandRunner, Option } from 'nest-commander';

import { UsersService } from '../users.service';

type CommandArgs = [string, string];

interface CommandOptions {
  basePermissionLevel: BasePermissionLevel;
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

  @Option({ flags: '-p', name: 'basePermissionLevel', required: false, choices: Object.values(BasePermissionLevel) })
  parseBasePermissionLevel(value: BasePermissionLevel): BasePermissionLevel {
    return value;
  }
}
