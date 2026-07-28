import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { $UpdateUserData } from '@opendatacapture/schemas/user';
import type { UpdateUserData } from '@opendatacapture/schemas/user';

import { CreateUserDto } from './create-user.dto';

/** Contact details are redeclared because `$UpdateUserData` widens them to null, so an update can clear one. */
@ValidationSchema($UpdateUserData)
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email', 'phoneNumber'] as const)) {
  @ApiProperty({ description: 'Email, or null to clear the one on record' })
  email?: UpdateUserData['email'];

  @ApiProperty({ description: 'Phone Number, or null to clear the one on record' })
  phoneNumber?: UpdateUserData['phoneNumber'];
}
