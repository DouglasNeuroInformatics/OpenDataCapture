import { Injectable } from '@nestjs/common';
import type { Assignment } from '@open-data-capture/common/assignment';

@Injectable()
export class AssignmentsService {
  private assignments: Assignment[] = [];

  addAssignments(assignments: Assignment[]) {
    for (const assignment of assignments) {
      this.assignments.push(assignment);
    }
  }

  findAssignments() {
    return this.assignments;
  }
}
