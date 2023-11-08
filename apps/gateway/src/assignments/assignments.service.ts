import { Injectable } from '@nestjs/common';
import type { Assignment } from '@open-data-capture/common/assignment';

@Injectable()
export class AssignmentsService {
  private assignments: Assignment[] = [];

  addAssignment(assignment: Assignment) {
    this.assignments.push(assignment);
  }
}
