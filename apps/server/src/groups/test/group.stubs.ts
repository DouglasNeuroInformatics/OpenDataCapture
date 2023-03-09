import { Group } from '../entities/group.entity';

export class GroupStubs {
  static get myClinic(): Group {
    return {
      name: 'My Clinic'
    };
  }
}
