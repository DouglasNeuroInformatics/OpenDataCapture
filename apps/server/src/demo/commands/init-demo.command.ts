import { BasePermissionLevel } from '@ddcp/common';
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
      groups: [
        {
          name: 'Depression Clinic'
        },
        {
          name: 'Psychosis Clinic'
        }
      ],
      users: [
        {
          username: 'admin',
          password: 'password',
          basePermissionLevel: BasePermissionLevel.Admin,
          isAdmin: true,
          firstName: 'Admin'
        },
        {
          username: 'JohnSmith',
          password: 'password',
          groupNames: ['Depression Clinic', 'Psychosis Clinic'],
          basePermissionLevel: BasePermissionLevel.Standard
        },
        {
          username: 'JaneDoe',
          password: 'password',
          groupNames: ['Depression Clinic'],
          basePermissionLevel: BasePermissionLevel.GroupManager
        }
      ],
      nSubjects: 100
    });
  }
}
