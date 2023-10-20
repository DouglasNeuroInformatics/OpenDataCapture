import { Injectable } from '@nestjs/common';
import type { Summary } from '@open-data-capture/types';

@Injectable()
export class SummaryService {
  getSummary(): Summary {
    return {};
  }
}
