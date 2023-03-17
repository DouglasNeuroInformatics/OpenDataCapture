import { Command, CommandRunner, Option } from 'nest-commander';

import { UsersService } from '../users.service';

type CommandArgs = [string, string];

interface CommandOptions {
  isAdmin: boolean;
}

@Command({ arguments: '<username> <password>', name: 'create-user', description: 'add a new user to the database' })
export class CreateUserCommand extends CommandRunner {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async run([username, password]: CommandArgs, { isAdmin }: CommandOptions): Promise<void> {
    const user = await this.usersService.create({
      username,
      password,
      defaultPermissionLevel: isAdmin ? 'admin' : 'standard'
    });
    console.log(`Successfully created user: ${user.username}`);
  }

  @Option({ flags: '--admin', name: 'isAdmin', required: false })
  parseIsAdmin(value: string): boolean {
    return Boolean(value);
  }
}
