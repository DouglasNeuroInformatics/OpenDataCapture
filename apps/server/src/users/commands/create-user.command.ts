import { Command, CommandRunner, Option } from 'nest-commander';

import { UserKind } from '../enums/user-kind.enum';
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
      kind: isAdmin ? UserKind.Admin : UserKind.Standard
    });
    console.log(`Successfully created user: ${user.username}`);
  }

  @Option({ flags: '--admin', name: 'isAdmin', required: false })
  parseIsAdmin(value: string): boolean {
    return Boolean(value);
  }
}
