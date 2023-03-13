import { Command, CommandRunner } from 'nest-commander';

import { DemoService } from '../demo.service';

@Command({
  name: 'init-demo',
  description: 'initialize a demo database'
})
export class InitDemoCommand extends CommandRunner {
  constructor(private readonly demoService: DemoService) {
    super();
  }

  run(): Promise<void> {
    return this.demoService.initDemo({
      defaultAdmin: {
        username: 'admin',
        password: 'password'
      }
    });
  }
}
