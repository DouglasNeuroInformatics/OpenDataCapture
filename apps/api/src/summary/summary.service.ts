import { Injectable } from '@nestjs/common';
import type { Summary } from '@open-data-capture/types';

import { FormsService } from '@/instruments/forms.service';

@Injectable()
export class SummaryService {
  constructor(private readonly formsService: FormsService) {}

  async getSummary(): Promise<Summary> {
    console.log(await this.formsService.findAll())
    return {
      counts: {
        instruments: await this.formsService.count()
      }
    };
  }
}
