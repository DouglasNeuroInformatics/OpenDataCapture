import { ValidationSchema } from '@douglasneuroinformatics/libnest/core';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { UpdateSetupStateData } from '@opendatacapture/schemas/setup';

@ValidationSchema($UpdateSetupStateData)
export class UpdateSetupStateDto implements UpdateSetupStateData {
  @ApiProperty()
  isExperimentalFeaturesEnabled?: boolean;
}
