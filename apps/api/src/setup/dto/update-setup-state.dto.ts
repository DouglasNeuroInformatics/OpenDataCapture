import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateSetupStateData } from '@opendatacapture/schemas/setup';
import type { BrandingConfig, UpdateSetupStateData } from '@opendatacapture/schemas/setup';

@ValidationSchema($UpdateSetupStateData)
export class UpdateSetupStateDto implements UpdateSetupStateData {
  @ApiProperty({ required: false })
  activeLanguages?: string[];

  @ApiProperty({ required: false })
  branding?: BrandingConfig | null;

  @ApiProperty({ required: false })
  isExperimentalFeaturesEnabled?: boolean;
}
