import { Injectable } from '@nestjs/common';
import type { AssignmentBundle } from '@open-data-capture/common/assignment';

@Injectable()
export class AssignmentsService {
  private assignments: AssignmentBundle[] = [];

  create(assignment: AssignmentBundle) {
    this.assignments.push(assignment);
  }

  find() {
    return this.assignments;
  }
}
