import type { Assignment, AssignmentStatus } from '@open-data-capture/types';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentDto implements Pick<Assignment, 'status' | 'timeExpires'> {
  @IsString()
  @IsOptional()
  status: AssignmentStatus;

  @IsNumber()
  @IsOptional()
  timeExpires: number;
}
