import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $InitAppOptions } from '@opendatacapture/schemas/setup';
import type { CreateAdminData, InitAppOptions } from '@opendatacapture/schemas/setup';

@ValidationSchema($InitAppOptions)
export class InitAppDto implements InitAppOptions {
  @ApiProperty()
  admin: CreateAdminData;

  @ApiProperty()
  dummySubjectCount?: number;

  @ApiProperty()
  enableExperimentalFeatures: boolean;

  @ApiProperty()
  initDemo: boolean;

  @ApiProperty()
  recordsPerSubject?: number;
}
