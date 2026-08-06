import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import type { ActiveLanguages } from '@opendatacapture/schemas/core';
import { $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { BrandingConfig, UpdateSetupStateData } from '@opendatacapture/schemas/setup';

@ValidationSchema($UpdateSetupStateData)
export class UpdateSetupStateDto implements UpdateSetupStateData {
  @ApiProperty({ required: false })
  activeLanguages?: ActiveLanguages;

  @ApiProperty({ required: false })
  branding?: BrandingConfig | null;

  @ApiProperty({ required: false })
  defaultAssignmentDurationDays?: null | number;

  @ApiProperty({ required: false })
  isExperimentalFeaturesEnabled?: boolean;

  @ApiProperty({ required: false })
  isRemoteAssignmentsEnabled?: boolean;
}
