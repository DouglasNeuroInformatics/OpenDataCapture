import { Group } from '../schemas/group.schema';

export class GroupStubs {
  static get myClinic(): Group {
    return {
      name: 'My Clinic'
    };
  }
}
