import { ValidationSchema } from '@douglasneuroinformatics/libnest';
import { $CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';
import type { CreateInstrumentRepoData } from '@opendatacapture/schemas/instrument-repo';

@ValidationSchema($CreateInstrumentRepoData)
export class CreateInstrumentRepoDto implements CreateInstrumentRepoData {
  accessToken?: string;
  url: string;
}
