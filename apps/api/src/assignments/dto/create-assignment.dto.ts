import { ApiProperty } from '@nestjs/swagger';
import { type CreateAssignmentData } from '@open-data-capture/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAssignmentDto implements CreateAssignmentData {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  instrumentIdentifier: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subjectIdentifier: string;
}
