import { PartialType } from '@nestjs/swagger';

import { CreateInstrumentDto } from './create-instrument.dto';

export class UpdateInstrumentDto extends PartialType(CreateInstrumentDto) {}
