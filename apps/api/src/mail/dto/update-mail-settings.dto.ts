import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty } from '@nestjs/swagger';
import { $UpdateMailSettingsData } from '@opendatacapture/schemas/mail';
import type { MailTemplate, UpdateMailConfigData, UpdateMailSettingsData } from '@opendatacapture/schemas/mail';

@ValidationSchema($UpdateMailSettingsData)
export class UpdateMailSettingsDto implements UpdateMailSettingsData {
  @ApiProperty({ required: false })
  config?: UpdateMailConfigData;

  @ApiProperty({ required: false })
  newUserEmailTemplate?: MailTemplate;
}
